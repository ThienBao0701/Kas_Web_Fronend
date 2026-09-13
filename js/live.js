/* KAS LIVE CATALOG — uploaded room photos + exact operator rate mapping. */
(function(global){
  'use strict';
  var cache = null;
  function load(){
    if(cache) return cache;
    cache = fetch('/api/catalog', {cache:'no-store'}).then(function(r){
      if(!r.ok) throw new Error('Không tải được catalog ảnh phòng.');
      return r.json();
    });
    return cache;
  }
  function indexCatalog(catalog){
    var rooms = {};
    (catalog.branches || []).forEach(function(b){
      (b.rooms || []).forEach(function(r){ rooms[r.key] = r; });
    });
    return rooms;
  }
  function uploadedUrls(entry){
    return (entry && entry.images || []).map(function(x){
      return typeof x === 'string' ? x : x.url;
    }).filter(Boolean);
  }
  function applyToHotel(hotel, catalog){
    if(!hotel || !catalog) return hotel;
    var rooms = indexCatalog(catalog);
    hotel.rooms.forEach(function(r){
      var mapping = global.KAS_RATES && global.KAS_RATES.mappingFor(r.id);
      if(!mapping) return;
      var live = rooms[mapping.branch + ':' + mapping.stt];
      if(!live) return;
      r.liveImages = uploadedUrls(live);
      r.liveRateMeta = live;
      r.liveSheetRoomName = live.name;
      r.liveEz = live.ez;
      r.liveUploadedCount = r.liveImages.length;
    });
    return hotel;
  }
  global.KAS_LIVE = {load:load, applyToHotel:applyToHotel, indexCatalog:indexCatalog, uploadedUrls:uploadedUrls};
})(window);
