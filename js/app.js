/* ==========================================================================
   KAS — APP SHELL  (header, footer, drawer, gallery, scroll FX)
   ========================================================================== */
(function (global) {
  'use strict';
  var U = global.U, D = global.KAS_DATA;

  /* ---------------- logo ---------------- */
  function logoMark(color) {
    return '<svg class="logo__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">' +
      '<path d="M20 2.5l15.5 9v17L20 37.5 4.5 28.5v-17L20 2.5z" stroke="' + color + '" stroke-width="1.1"/>' +
      '<path d="M20 8l10 5.8v11.4L20 31l-10-5.8V13.8L20 8z" stroke="' + color + '" stroke-width=".8" opacity=".55"/>' +
      '<path d="M16 14v12M16 20l7-6M16 20l7 6" stroke="' + color + '" stroke-width="1.3" stroke-linecap="round"/>' +
      '</svg>';
  }
  function logo(dark, href) {
    var c = dark ? '#C2A25C' : '#C2A25C';
    return '<a class="logo" href="' + (href || 'index.html') + '" aria-label="KAS Hotel Collection — home">' +
      logoMark(c) +
      '<span class="logo__tx"><span class="logo__name"' + (dark ? '' : ' style="color:var(--tx)"') + '>KAS</span>' +
      '<span class="logo__sub">Hotel Collection</span></span></a>';
  }

  var NAV = [
    { t: 'Destinations', h: 'hotels.html' },
    { t: 'Hotels',       h: 'hotels.html' },
    { t: 'Experiences',  h: 'hotels.html#experiences' },
    { t: 'Offers',       h: 'hotels.html' },
    { t: 'My KAS',       h: 'manage-booking.html' },
    { t: 'About KAS',    h: 'index.html#about' },
    { t: 'Support',      h: 'manage-booking.html' }
  ];

  /* ---------------- header ---------------- */
  function renderHeader(opts) {
    opts = opts || {};
    var host = U.$('#hdr'); if (!host) return;
    var active = opts.active || '';
    host.className = 'hdr' + (opts.floating ? ' hdr--float' : '');
    host.innerHTML =
      '<div class="container hdr__in">' +
        logo(true) +
        '<nav class="nav" aria-label="Main">' +
          NAV.map(function (n) {
            return '<a href="' + n.h + '"' + (n.t.toLowerCase() === active ? ' class="is-active"' : '') + '>' + n.t + '</a>';
          }).join('') +
        '</nav>' +
        '<div class="hdr__right">' +
          global.Contact.headerBlock() +
          '<button class="lang" type="button">' + U.icon('globe', 15) + ' EN ' + U.icon('chevD', 12) + '</button>' +
          '<a class="btn btn--gold btn--sm" href="manage-booking.html">Sign in / Join</a>' +
          '<button class="burger" type="button" aria-label="Open menu">' + U.icon('menu', 22) + '</button>' +
        '</div>' +
      '</div>';

    U.$('.burger', host).addEventListener('click', openDrawer);
    U.$('.lang', host).addEventListener('click', function () {
      U.toast('Language switching is not part of this demo.');
    });

    if (opts.floating) {
      var onScroll = function () {
        host.classList.toggle('hdr--solid', window.scrollY > 40);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    buildDrawer(active);
  }

  function buildDrawer(active) {
    if (U.$('#drawer')) return;
    var d = U.el('div', { id: 'drawer', class: 'drawer' });
    d.innerHTML =
      '<div class="drawer__hd">' + logo(true) +
        '<button type="button" aria-label="Close menu">' + U.icon('x', 22) + '</button></div>' +
      '<nav>' + NAV.map(function (n) {
        return '<a href="' + n.h + '"' + (n.t.toLowerCase() === active ? ' class="is-active"' : '') + '>' +
          n.t + U.icon('chevR', 14) + '</a>';
      }).join('') + '</nav>' +
      '<div class="drawer__ft">' +
        '<a class="btn btn--gold btn--block" href="hotels.html">Find your stay</a>' +
        '<a class="btn btn--ghost-lt btn--block" href="manage-booking.html">Manage booking</a>' +
        '<div style="display:flex;flex-direction:column;gap:4px;margin-top:10px;align-items:center">' +
          global.Contact.phoneLink('inverse') +
          global.Contact.zaloLink('inverse') +
          global.Contact.whatsappLink('inverse') +
        '</div>' +
      '</div>';
    document.body.appendChild(d);
    U.$('.drawer__hd button', d).addEventListener('click', closeDrawer);
    d.addEventListener('click', function (e) { if (e.target === d) closeDrawer(); });
  }
  function openDrawer() { var d = U.$('#drawer'); if (d) { d.classList.add('open'); document.body.style.overflow = 'hidden'; } }
  function closeDrawer() { var d = U.$('#drawer'); if (d) { d.classList.remove('open'); document.body.style.overflow = ''; } }

  /* ---------------- footer ---------------- */
  var FOOT_COLS = [
    { h: 'Destinations', l: [['All locations','hotels.html'],['District 1','hotels.html'],['Ben Thanh','hotels.html'],['Nguyen Thai Binh','hotels.html'],['Le Thanh Ton','hotels.html']] },
    { h: 'Hotels',       l: [['KAS Milestone Premium','hotel-detail.html?hotel=hotel-04'],['KAS Dilly Luxury','hotel-detail.html?hotel=hotel-08'],['KAS Sonata Luxury','hotel-detail.html?hotel=hotel-06'],['KAS Passion Boutique','hotel-detail.html?hotel=hotel-01'],['View all 8 properties','hotels.html']] },
    { h: 'Experiences',  l: [['Dining','hotels.html'],['Rooftop bars','hotels.html'],['Wellness & spa','hotels.html'],['Local experiences','hotels.html'],['Airport transfer','hotels.html']] },
    { h: 'Support',      l: [['FAQ','manage-booking.html'],['Booking information','manage-booking.html'],['Cancellation policy','manage-booking.html'],['Payment methods','manage-booking.html'],['Contact us','manage-booking.html']] },
    { h: 'My KAS',       l: [['My bookings','manage-booking.html'],['Manage booking','manage-booking.html'],['Member benefits','manage-booking.html'],['Sign in / Join','manage-booking.html']] },
    { h: '__CONTACT__',  l: [] }
  ];

  function renderFooter() {
    var host = U.$('#ftr'); if (!host) return;
    var CT = D.config.contact;
    host.className = 'ftr';
    host.innerHTML =
      '<div class="container">' +
        '<div class="ftr__strip">' +
          ct('help','Need assistance?','We\'re here to help ' + CT.hours + '.') +
          ctLink('phone','Call us', CT.displayPhone, CT.tel, false) +
          ctLink('chat','Chat on Zalo','Quick support', CT.zalo, true) +
          ctLink('chat','WhatsApp','Message us', CT.whatsapp, true) +
        '</div>' +
        '<div class="ftr__main">' +
          '<div class="ftr__brand">' + logo(false) +
            '<p>A legacy of Vietnamese hospitality. Eight hotels in District 1. One heartfelt promise.</p>' +
            '<div class="social">' +
              ['fb','ig','yt','tiktok'].map(function (s) {
                return '<a href="#" aria-label="' + s + '" onclick="return false">' + U.icon(s, 15) + '</a>';
              }).join('') +
            '</div></div>' +
          FOOT_COLS.map(function (c) {
            if (c.h === '__CONTACT__') {
              return '<div class="ftr__col">' + global.Contact.footerBlock() + '</div>';
            }
            return '<div class="ftr__col"><h5>' + c.h + '</h5>' +
              c.l.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + '</a>'; }).join('') + '</div>';
          }).join('') +
          '<div class="ftr__col ftr__news"><h5>Stay in the know</h5>' +
            '<p style="font-size:.82rem;color:var(--tx-2);margin:0">Exclusive offers and updates, delivered to you.</p>' +
            '<form class="news" id="newsForm">' +
              '<input type="email" placeholder="Your email address" aria-label="Email address" required>' +
              '<button type="submit" aria-label="Subscribe">' + U.icon('arrR', 15) + '</button>' +
            '</form></div>' +
        '</div>' +
        '<div class="ftr__btm">' +
          '<span>© 2026 KAS Hotel Collection. All rights reserved. · Demo booking platform.</span>' +
          '<span class="ftr__legal"><a href="#" onclick="return false">Privacy Policy</a>' +
          '<a href="#" onclick="return false">Terms &amp; Conditions</a></span>' +
        '</div>' +
      '</div>';

    var f = U.$('#newsForm');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      U.toast('Thank you — you are on the list.');
      f.reset();
    });

    function ct(ic, a, b) {
      return '<div class="ftr__ct">' + U.icon(ic, 20) + '<div><b>' + a + '</b><span>' + b + '</span></div></div>';
    }
    function ctLink(ic, a, b, href, ext) {
      return '<a class="ftr__ct" href="' + href + '"' +
        (ext ? ' target="_blank" rel="noopener"' : '') + '>' + U.icon(ic, 20) +
        '<div><b>' + a + '</b><span>' + U.esc(b) + '</span></div></a>';
    }
  }

  /* ---------------- chat + back to top ---------------- */
  function renderFloat() {
    // One floating contact widget for the whole site: Call / Zalo / WhatsApp.
    global.Contact.floatingWidget();
    if (!U.$('.totop')) {
      var t = U.el('button', { class: 'totop noprint', type: 'button', 'aria-label': 'Back to top' }, U.icon('arrU', 17));
      t.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
      document.body.appendChild(t);
      window.addEventListener('scroll', function () {
        t.classList.toggle('show', window.scrollY > 520);
      }, { passive: true });
    }
  }

  /* ---------------- scroll reveal ---------------- */
  function reveal() {
    var els = U.$$('.fade-up');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- mini carousel (cards) ---------------- */
  function miniCarousel(root) {
    var imgs = U.$$('img', root), dots = U.$$('.mini__dots i', root), i = 0;
    if (imgs.length < 2) {
      var nv = U.$$('.mini__nav', root); nv.forEach(function (n) { n.style.display = 'none'; });
      var dd = U.$('.mini__dots', root); if (dd) dd.style.display = 'none';
      return;
    }
    function go(n) {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    }
    var p = U.$('.mini__nav--prev', root), n2 = U.$('.mini__nav--next', root);
    if (p) p.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(i - 1); });
    if (n2) n2.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(i + 1); });
    // touch swipe
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    }, { passive: true });
  }
  function miniHTML(images, alt) {
    var list = (images || []).slice(0, 6);
    if (!list.length) return '<div class="imgfall"><span>Image unavailable from source</span></div>';
    return '<div class="mini">' +
      list.map(function (s, i) {
        return U.img(s, alt, i === 0 ? 'is-on' : '');
      }).join('') +
      (list.length > 1 ?
        '<button class="mini__nav mini__nav--prev" type="button" aria-label="Previous photo">' + U.icon('chevL', 15) + '</button>' +
        '<button class="mini__nav mini__nav--next" type="button" aria-label="Next photo">' + U.icon('chevR', 15) + '</button>' +
        '<div class="mini__dots">' + list.map(function (_, i) { return '<i class="' + (i === 0 ? 'is-on' : '') + '"></i>'; }).join('') + '</div>'
        : '') +
      '</div>';
  }

  /* ---------------- full gallery + lightbox ---------------- */
  /**
   * @param {Element} host
   * @param {string[]} images
   * @param {string} alt
   * @param {Object} [opts] {ownCount, ownLabel, siblingLabel}
   *        When `ownCount` is given the gallery is two-tier: the first
   *        `ownCount` photos belong to the selected room type, the rest are
   *        other rooms at the same property. A caption states which tier the
   *        visible photo is from, so the two are never silently conflated.
   */
  function gallery(host, images, alt, opts) {
    if (!host) return;
    opts = opts || {};
    var list = (images || []).filter(Boolean);
    if (!list.length) { host.innerHTML = '<div class="gal__main"><div class="imgfall"><span>Image unavailable from source</span></div></div>'; return; }
    var i = 0, MAXT = 6;

    host.innerHTML =
      '<div class="gal__main">' + U.img(list[0], alt, '', false) +
        (list.length > 1 ?
          '<button class="gal__nav gal__nav--prev" type="button" aria-label="Previous photo">' + U.icon('chevL', 18) + '</button>' +
          '<button class="gal__nav gal__nav--next" type="button" aria-label="Next photo">' + U.icon('chevR', 18) + '</button>' : '') +
        '<span class="gal__count">1 / ' + list.length + '</span>' +
        (opts.ownCount != null ? '<span class="gal__tier" id="galTier"></span>' : '') +
      '</div>' +
      '<div class="gal__thumbs">' +
        list.slice(0, MAXT).map(function (s, k) {
          var more = (k === MAXT - 1 && list.length > MAXT);
          var sib = (opts.ownCount != null && k >= opts.ownCount);
          return '<button class="gal__t' + (k === 0 ? ' is-active' : '') + (sib ? ' gal__t--sib' : '') +
            '" type="button" data-i="' + k + '" aria-label="Photo ' + (k + 1) + '">' +
            U.img(s, alt, '', true, false) + (more ? '<span class="gal__more">+' + (list.length - MAXT + 1) + '<br>View all</span>' : '') + '</button>';
        }).join('') +
      '</div>';

    var main = U.$('.gal__main img', host),
        cnt  = U.$('.gal__count', host),
        tier = U.$('#galTier', host),
        ths  = U.$$('.gal__t', host);

    function show(n) {
      i = (n + list.length) % list.length;
      if (main) { main.src = list[i]; main.style.display = ''; }
      var fb = U.$('.gal__main .imgfall', host); if (fb) fb.remove();
      if (cnt) cnt.textContent = (i + 1) + ' / ' + list.length;
      if (tier) {
        var isOwn = i < opts.ownCount;
        tier.textContent = isOwn
          ? (opts.ownLabel || 'This room type')
          : (opts.siblingLabel || 'Another room at this property');
        tier.classList.toggle('gal__tier--sib', !isOwn);
      }
      ths.forEach(function (t, k) { t.classList.toggle('is-active', k === i); });
    }
    if (tier) show(0);
    var pv = U.$('.gal__nav--prev', host), nx = U.$('.gal__nav--next', host);
    if (pv) pv.addEventListener('click', function () { show(i - 1); });
    if (nx) nx.addEventListener('click', function () { show(i + 1); });
    ths.forEach(function (t) {
      t.addEventListener('click', function () {
        var k = +t.dataset.i;
        if (U.$('.gal__more', t)) openLightbox(list, k, alt); else show(k);
      });
    });
    var mainBox = U.$('.gal__main', host);
    if (mainBox) mainBox.addEventListener('click', function (e) {
      if (e.target.closest('.gal__nav')) return;
      openLightbox(list, i, alt);
    });
    // swipe
    var x0 = null;
    if (mainBox) {
      mainBox.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      mainBox.addEventListener('touchend', function (e) {
        if (x0 == null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
        x0 = null;
      }, { passive: true });
    }
    // keyboard
    document.addEventListener('keydown', function (e) {
      if (U.$('.lb.open')) return;
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
    return { show: show };
  }

  function openLightbox(list, start, alt) {
    var lb = U.$('.lb');
    if (!lb) {
      lb = U.el('div', { class: 'lb' });
      lb.innerHTML =
        '<button class="lb__x" type="button" aria-label="Close">' + U.icon('x', 24) + '</button>' +
        '<button class="lb__nav lb__nav--prev" type="button" aria-label="Previous">' + U.icon('chevL', 30) + '</button>' +
        '<img alt=""><button class="lb__nav lb__nav--next" type="button" aria-label="Next">' + U.icon('chevR', 30) + '</button>' +
        '<div class="lb__cap"></div>';
      document.body.appendChild(lb);
    }
    var im = U.$('img', lb), cap = U.$('.lb__cap', lb), i = start || 0;
    function show(n) {
      i = (n + list.length) % list.length;
      im.src = list[i];
      cap.textContent = (alt || '') + '  ·  ' + (i + 1) + ' / ' + list.length;
    }
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';

    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; document.removeEventListener('keydown', key); }
    function key(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    }
    U.$('.lb__x', lb).onclick = close;
    U.$('.lb__nav--prev', lb).onclick = function () { show(i - 1); };
    U.$('.lb__nav--next', lb).onclick = function () { show(i + 1); };
    lb.onclick = function (e) { if (e.target === lb) close(); };
    document.addEventListener('keydown', key);

    var x0 = null;
    im.ontouchstart = function (e) { x0 = e.touches[0].clientX; };
    im.ontouchend = function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    };
  }

  /* ---------------- stepper ---------------- */
  var STEPS = [
    { t: 'Search',           s: 'Dates & guests' },
    { t: 'Select Room',      s: 'Choose your stay' },
    { t: 'Guest Details',    s: 'Add your information' },
    { t: 'Review & Confirm', s: 'Secure your booking' },
    { t: 'Confirmed',        s: 'All set!' }
  ];
  function renderSteps(host, current, subs) {
    if (!host) return;
    host.className = 'steps noprint';
    var n = STEPS.length;
    var html = '<div class="container steps__in">';
    for (var i = 0; i < n; i++) {
      var st = i < current ? 'is-done' : (i === current ? 'is-on' : '');
      var sub = (subs && subs[i]) || STEPS[i].s;
      html += '<div class="step ' + st + '">' +
        '<span class="step__n">' + (i < current ? U.icon('check', 14) : (i + 1)) + '</span>' +
        '<span class="step__t"><b>' + STEPS[i].t + '</b><span>' + U.esc(sub) + '</span></span></div>';
      if (i < n - 1) html += '<span class="step__line' + (i < current ? ' is-done' : '') + '"></span>';
    }
    host.innerHTML = html + '</div>';
  }

  /* ---------------- modal ---------------- */
  function modal(opts) {
    var m = U.el('div', { class: 'modal' });
    m.innerHTML =
      '<div class="modal__box"><div class="modal__b">' +
        (opts.icon ? '<div style="margin-bottom:14px;color:var(--' + (opts.tone || 'gold-dk') + ')">' + U.icon(opts.icon, 30) + '</div>' : '') +
        '<h3>' + U.esc(opts.title) + '</h3><p class="muted" style="font-size:.9rem">' + (opts.body || '') + '</p></div>' +
        '<div class="modal__ft">' +
          '<button class="btn btn--ghost" data-a="cancel">' + U.esc(opts.cancel || 'Cancel') + '</button>' +
          '<button class="btn ' + (opts.danger ? 'btn--dark' : 'btn--gold') + '" data-a="ok">' + U.esc(opts.ok || 'Confirm') + '</button>' +
        '</div></div>';
    document.body.appendChild(m);
    requestAnimationFrame(function () { m.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    function close() { m.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function () { m.remove(); }, 240); }
    U.$('[data-a=cancel]', m).onclick = function () { close(); opts.onCancel && opts.onCancel(); };
    U.$('[data-a=ok]', m).onclick = function () { close(); opts.onOk && opts.onOk(); };
    m.onclick = function (e) { if (e.target === m) close(); };
    return { close: close };
  }

  /* ---------------- shared chips ---------------- */
  function amenityIcon(name) {
    var n = String(name).toLowerCase();
    if (/wi-?fi|internet/.test(n)) return 'wifi';
    if (/breakfast|restaurant|dining|cuisine/.test(n)) return 'utensils';
    if (/bar|lounge|rooftop|tea/.test(n)) return 'coffee';
    if (/gym|fitness/.test(n)) return 'dumb';
    if (/spa|wellness|sauna/.test(n)) return 'leaf';
    if (/park|car|shuttle|airport|transfer|taxi/.test(n)) return 'car';
    if (/front desk|reception|24/.test(n)) return 'bell';
    if (/laundry|dry clean|housekeep|ironing/.test(n)) return 'spark';
    if (/safe|security|cctv/.test(n)) return 'safe';
    if (/elevator|lift/.test(n)) return 'door';
    if (/fridge|refrigerat|minibar/.test(n)) return 'fridge';
    if (/tv|television/.test(n)) return 'tv';
    if (/air condition|climate/.test(n)) return 'ac';
    if (/hair/.test(n)) return 'hair';
    if (/bath|shower|toilet/.test(n)) return 'bath';
    if (/balcon|terrace/.test(n)) return 'view';
    if (/luggage|baggage|storage|concierge/.test(n)) return 'key';
    if (/currency|exchange|payment/.test(n)) return 'wallet';
    if (/smok/.test(n)) return 'leaf';
    return 'checkC';
  }

  /* ---------------- boot ---------------- */
  function boot(opts) {
    opts = opts || {};
    renderHeader(opts);
    renderFooter();
    renderFloat();
    reveal();
  }

  global.App = {
    boot: boot, logo: logo, logoMark: logoMark,
    renderSteps: renderSteps, gallery: gallery, openLightbox: openLightbox,
    miniHTML: miniHTML, miniCarousel: miniCarousel,
    modal: modal, amenityIcon: amenityIcon, reveal: reveal,
    openDrawer: openDrawer, closeDrawer: closeDrawer
  };
})(window);
