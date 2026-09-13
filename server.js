'use strict';

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(ROOT, 'uploads');
const RATE_FILE = path.join(DATA_DIR, 'rate-sheet.json');
const UPLOAD_FILE = path.join(UPLOAD_DIR, 'manifest.json');
const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = process.env.ADMIN_KEY || 'kas-admin-2026';
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_KEY) {
  console.error('ADMIN_KEY is required in production. Set it as an environment variable.');
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (_) { return fallback; }
}
function writeJsonAtomic(file, value) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

const rateData = readJson(RATE_FILE, { branches: {}, seasons: [], policy: {} });
let uploads = readJson(UPLOAD_FILE, { version: 1, rooms: {} });

function allRooms() {
  const out = [];
  Object.entries(rateData.branches || {}).forEach(([hotelId, branch]) => {
    (branch.sheetRooms || []).forEach(room => out.push({
      key: hotelId + ':' + room.stt,
      hotelId,
      stt: room.stt,
      ez: room.ez,
      name: room.name,
      address: branch.address,
      rates: {
        jul_sep: room.jul_sep,
        oct: room.oct,
        nov_jan: room.nov_jan
      }
    }));
  });
  return out;
}

const roomIndex = new Map(allRooms().map(r => [r.key, r]));

function auth(req, res, next) {
  if (req.get('x-admin-key') !== ADMIN_KEY) return res.status(401).json({ error: 'Sai mã quản trị.' });
  next();
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const key = String(req.body.roomKey || '');
    const room = roomIndex.get(key);
    if (!room) return cb(new Error('Phòng không hợp lệ.'));
    const dir = path.join(UPLOAD_DIR, room.hotelId, String(room.stt));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + safeExt);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter(req, file, cb) {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ nhận JPG, PNG hoặc WEBP.'));
  }
});

const app = express();
app.use(function(req, res, next) {
  if (/^\/(?:server\.js|package(?:\.json|-lock\.json)?|\.env(?:\..*)?)$/.test(req.path)) return res.sendStatus(404);
  if (req.path === '/uploads/manifest.json') return res.sendStatus(404);
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(ROOT, { extensions: ['html'] }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1h' }));

function publicCatalog() {
  const branches = Object.entries(rateData.branches || {}).map(([hotelId, b]) => ({
    hotelId,
    address: b.address,
    gid: b.gid || null,
    rooms: (b.sheetRooms || []).map(r => {
      const key = hotelId + ':' + r.stt;
      return {
        key,
        stt: r.stt,
        ez: r.ez,
        name: r.name,
        rates: { jul_sep: r.jul_sep, oct: r.oct, nov_jan: r.nov_jan },
        images: (uploads.rooms[key] || []).map(x => ({ id: x.id, url: x.url, name: x.originalName }))
      };
    })
  }));
  return { generatedAt: rateData.generatedAt, source: rateData.source, policy: rateData.policy, seasons: rateData.seasons, branches };
}

app.get('/api/catalog', (req, res) => res.json(publicCatalog()));
app.get('/api/admin/status', auth, (req, res) => res.json({ ok: true, admin: true, publicPath: '/reference.html' }));

app.post('/api/admin/upload', auth, (req, res) => {
  upload.array('images', 10)(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    const key = String(req.body.roomKey || '');
    const room = roomIndex.get(key);
    if (!room) {
      (req.files || []).forEach(f => { try { fs.unlinkSync(f.path); } catch (_) {} });
      return res.status(400).json({ error: 'Hạng phòng không hợp lệ.' });
    }
    if (!uploads.rooms[key]) uploads.rooms[key] = [];
    (req.files || []).forEach(file => {
      uploads.rooms[key].push({
        id: crypto.randomUUID(),
        originalName: file.originalname,
        filename: file.filename,
        url: '/uploads/' + room.hotelId + '/' + room.stt + '/' + file.filename,
        uploadedAt: new Date().toISOString()
      });
    });
    writeJsonAtomic(UPLOAD_FILE, uploads);
    res.json({ ok: true, roomKey: key, added: (req.files || []).length, images: uploads.rooms[key] });
  });
});

app.delete('/api/admin/upload/:id', auth, (req, res) => {
  let found = null;
  Object.entries(uploads.rooms).some(([key, arr]) => {
    const idx = arr.findIndex(x => x.id === req.params.id);
    if (idx < 0) return false;
    found = { key, idx, item: arr[idx] };
    return true;
  });
  if (!found) return res.status(404).json({ error: 'Không tìm thấy ảnh.' });
  const rel = found.item.url.replace(/^\/uploads\//, '');
  const file = path.join(UPLOAD_DIR, rel);
  try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (_) {}
  uploads.rooms[found.key].splice(found.idx, 1);
  writeJsonAtomic(UPLOAD_FILE, uploads);
  res.json({ ok: true });
});

app.get('/health', (req, res) => res.json({ ok: true, service: 'KAS Hotel Collection', time: new Date().toISOString() }));

app.get('/reference', (req, res) => res.sendFile(path.join(ROOT, 'reference.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(ROOT, 'admin.html')));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('KAS server running on http://localhost:' + PORT);
  console.log('Public reference: http://localhost:' + PORT + '/reference');
  console.log('Admin upload:     http://localhost:' + PORT + '/admin');
});
