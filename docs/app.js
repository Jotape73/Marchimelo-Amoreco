(function(){
'use strict';

var D = window.DADOS;
var FOTOS = (window.FOTOS || []).map(function(f){ return { src:'img/' + encodeURIComponent(f), cap:(D.legendas || {})[f] || '' }; });
var DAY = 86400000;
var START = new Date(D.inicio[0], D.inicio[1] - 1, D.inicio[2]);

function $(id){ return document.getElementById(id); }
function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
function daysTogether(){ return Math.max(0, Math.floor((Date.now() - START) / DAY)); }
function addDays(d, n){ var r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtDate(d){ return d.toLocaleDateString('pt-BR', { day:'numeric', month:'long', year:'numeric' }); }
function fmtNum(n){ return Math.round(n).toLocaleString('pt-BR'); }
function haptic(ms){ if(navigator.vibrate) try{ navigator.vibrate(ms || 12); }catch(e){} }
function photo(i){ return FOTOS.length ? FOTOS[((i % FOTOS.length) + FOTOS.length) % FOTOS.length] : { src:'', cap:'' }; }

// localStorage pode falhar (aba anônima etc.) — o site funciona sem ele
var store = {
  get:function(k, def){ try{ var v = localStorage.getItem('mea.' + k); return v ? JSON.parse(v) : def; }catch(e){ return def; } },
  set:function(k, v){ try{ localStorage.setItem('mea.' + k, JSON.stringify(v)); }catch(e){} }
};

// ---------- efeitos ----------
function confetti(x, y, count){
  var colors = ['#ff6b7a','#ffd166','#7fe3c4','#fff7ec'];
  for(var i = 0; i < (count || 18); i++){
    var d = el('div', 'confetti');
    var size = 5 + Math.random() * 5;
    d.style.width = size + 'px';
    d.style.height = (size * .45) + 'px';
    d.style.left = x + (Math.random() * 140 - 70) + 'px';
    d.style.top = y + 'px';
    d.style.background = colors[i % colors.length];
    d.style.animationDuration = (.9 + Math.random() * .9) + 's';
    document.body.appendChild(d);
    setTimeout(d.remove.bind(d), 2000);
  }
}
function confettiFrom(node, count){ var r = node.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 3, count); }

var toastTimer;
function toast(msg){
  var t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2600);
}

function celebrate(title, text){
  $('celebrateTitle').textContent = title;
  $('celebrateText').textContent = text;
  $('celebrate').classList.add('show');
  confetti(window.innerWidth / 2, 40, 50);
  haptic([30, 60, 30]);
}
$('celebrateClose').addEventListener('click', function(){ $('celebrate').classList.remove('show'); });

function countUp(node, target, ms){
  var t0 = performance.now();
  (function step(t){
    var p = Math.min(1, (t - t0) / ms);
    node.textContent = fmtNum(target * (1 - Math.pow(1 - p, 3)));
    if(p < 1) requestAnimationFrame(step);
  })(t0);
}

// modais fecham com o botão "voltar" do celular
var modalClose = null;
function openModal(closeFn){
  modalClose = closeFn;
  document.body.classList.add('modal-open');
  history.pushState({ modal:true }, '');
}
function closeModal(){
  if(!modalClose) return;
  var fn = modalClose; modalClose = null;
  document.body.classList.remove('modal-open');
  fn();
  if(history.state && history.state.modal) history.back();
}
window.addEventListener('popstate', function(){
  if(!modalClose) return;
  var fn = modalClose; modalClose = null;
  document.body.classList.remove('modal-open');
  fn();
});
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });

// ---------- corações flutuando ----------
(function(){
  var box = $('floatingHearts');
  for(var i = 0; i < 14; i++){
    var h = el('span', 'fh', i % 2 ? '♥' : '❤');
    h.style.left = (Math.random() * 100) + 'vw';
    h.style.fontSize = (12 + Math.random() * 16) + 'px';
    h.style.animationDuration = (10 + Math.random() * 12) + 's';
    h.style.animationDelay = (Math.random() * 14) + 's';
    box.appendChild(h);
  }
})();

// ---------- abertura ----------
(function(){
  var intro = $('intro');
  function enter(){
    intro.classList.add('gone');
    document.body.classList.remove('locked');
    if(daysTogether() === 100) setTimeout(function(){ toast('hoje é o dia 100! 🎉'); }, 900);
  }
  try{ if(sessionStorage.getItem('mea.intro')){ intro.classList.add('gone'); document.body.classList.remove('locked'); return; } }catch(e){}

  $('giftBtn').addEventListener('click', function(){
    this.classList.add('open');
    haptic(40);
    confettiFrom(this, 40);
    setTimeout(function(){
      intro.classList.add('revealed');
      countUp($('introNum'), daysTogether(), 1600);
    }, 550);
  });
  $('introGo').addEventListener('click', function(){
    try{ sessionStorage.setItem('mea.intro', '1'); }catch(e){}
    confettiFrom(this, 30);
    enter();
  });
})();

// ---------- hero ----------
(function(){
  if(!FOTOS.length) return;
  var i = 0, img = $('heroImg'), bg = $('heroBg');
  function show(){
    img.style.opacity = 0;
    setTimeout(function(){
      img.src = photo(i).src;
      bg.style.backgroundImage = 'url("' + photo(i).src + '")';
      img.style.opacity = 1;
    }, 400);
  }
  img.src = photo(0).src;
  bg.style.backgroundImage = 'url("' + photo(0).src + '")';
  setInterval(function(){ i++; show(); }, 4500);
  $('heroPhoto').addEventListener('click', function(){ openLightbox(i % FOTOS.length); });
})();

function tickLive(){
  var ms = Date.now() - START;
  $('cDias').textContent = Math.floor(ms / DAY);
  $('cHoras').textContent = Math.floor(ms / 3600000) % 24;
  $('cMin').textContent = Math.floor(ms / 60000) % 60;
  $('cSeg').textContent = Math.floor(ms / 1000) % 60;
}
tickLive();
setInterval(tickLive, 1000);

// ---------- stories ----------
var STORY_MS = 5000;
var groups = [];
(function(){
  var names = ['a gente', 'sorrisos', 'rolês', 'dengos', 'nós dois', 'momentos', 'selfies', 'amoreco', 'marchimelo', 'noitadas', 'bobeiras', '100 dias'];
  var per = 5;
  for(var i = 0; i < FOTOS.length; i += per) groups.push({ name:names[groups.length % names.length], items:FOTOS.slice(i, i + per) });
  var seen = store.get('stories', []);
  var row = $('storyRow');
  groups.forEach(function(g, gi){
    var b = el('button', 'story-bubble' + (seen.indexOf(gi) >= 0 ? ' seen' : ''));
    b.innerHTML = '<span class="story-ring"><img loading="lazy" alt=""></span><span></span>';
    b.querySelector('img').src = g.items[0].src;
    b.lastChild.textContent = g.name;
    b.addEventListener('click', function(){ openStory(gi, 0); });
    row.appendChild(b);
  });
})();

var sv = { g:0, i:0, t0:0, elapsed:0, paused:false, raf:0 };
function openStory(g, i){
  $('storyViewer').classList.add('show');
  openModal(function(){ cancelAnimationFrame(sv.raf); $('storyViewer').classList.remove('show'); });
  showStory(g, i);
}
function showStory(g, i){
  if(g >= groups.length){ closeModal(); return; }
  if(g < 0){ g = 0; i = 0; }
  sv.g = g; sv.i = i; sv.elapsed = 0; sv.t0 = performance.now(); sv.paused = false;
  var grp = groups[g], item = grp.items[i];
  var seen = store.get('stories', []);
  if(seen.indexOf(g) < 0){ seen.push(g); store.set('stories', seen); }
  document.querySelectorAll('.story-bubble')[g].classList.add('seen');

  var bars = $('svBars');
  bars.innerHTML = '';
  grp.items.forEach(function(_, k){
    var bar = el('i', null, '<b></b>');
    if(k < i) bar.firstChild.style.width = '100%';
    bars.appendChild(bar);
  });
  $('svImg').src = item.src;
  $('storyViewer').style.setProperty('--sv-bg', 'url("' + item.src + '")');
  $('svAvatar').style.backgroundImage = 'url("' + grp.items[0].src + '")';
  $('svLabel').textContent = '· ' + grp.name;
  $('svCaption').textContent = item.cap;
  var liked = store.get('likes', []);
  $('svLike').classList.toggle('on', liked.indexOf(item.src) >= 0);
  $('svLike').textContent = liked.indexOf(item.src) >= 0 ? '♥' : '♡';
  cancelAnimationFrame(sv.raf);
  sv.raf = requestAnimationFrame(storyTick);
}
function storyTick(t){
  if(!sv.paused){
    var p = (sv.elapsed + (t - sv.t0)) / STORY_MS;
    var bar = $('svBars').children[sv.i];
    if(bar) bar.firstChild.style.width = Math.min(100, p * 100) + '%';
    if(p >= 1){ nextStory(); return; }
  }
  sv.raf = requestAnimationFrame(storyTick);
}
function nextStory(){
  var grp = groups[sv.g];
  if(sv.i + 1 < grp.items.length) showStory(sv.g, sv.i + 1);
  else showStory(sv.g + 1, 0);
}
function prevStory(){
  if(sv.i > 0) showStory(sv.g, sv.i - 1);
  else if(sv.g > 0) showStory(sv.g - 1, groups[sv.g - 1].items.length - 1);
  else showStory(0, 0);
}
function pauseStory(){ if(!sv.paused){ sv.paused = true; sv.elapsed += performance.now() - sv.t0; } }
function resumeStory(){ if(sv.paused){ sv.paused = false; sv.t0 = performance.now(); } }
function likeStory(){
  var src = groups[sv.g].items[sv.i].src;
  var liked = store.get('likes', []);
  if(liked.indexOf(src) < 0){ liked.push(src); store.set('likes', liked); }
  $('svLike').classList.add('on');
  $('svLike').textContent = '♥';
  var h = el('div', 'big-heart', '💗');
  document.body.appendChild(h);
  setTimeout(h.remove.bind(h), 950);
  haptic(25);
}

(function(){
  // toque curto navega, segurar pausa, toque duplo curte, arrastar pra baixo fecha
  var downAt = 0, downY = 0, lastTap = 0, tapTimer;
  function down(e){ downAt = Date.now(); downY = e.clientY; pauseStory(); }
  function up(dir){
    return function(e){
      resumeStory();
      if(e.clientY - downY > 90){ closeModal(); return; }
      if(Date.now() - downAt > 250) return;
      var now = Date.now();
      if(now - lastTap < 280){ clearTimeout(tapTimer); lastTap = 0; likeStory(); return; }
      lastTap = now;
      tapTimer = setTimeout(function(){ dir > 0 ? nextStory() : prevStory(); }, 230);
    };
  }
  [['svLeft', -1], ['svRight', 1]].forEach(function(p){
    var z = $(p[0]);
    z.addEventListener('pointerdown', down);
    z.addEventListener('pointerup', up(p[1]));
    z.addEventListener('pointercancel', resumeStory);
  });
  $('svClose').addEventListener('click', closeModal);
  $('svLike').addEventListener('click', likeStory);
  document.addEventListener('keydown', function(e){
    if(!$('storyViewer').classList.contains('show')) return;
    if(e.key === 'ArrowRight') nextStory();
    if(e.key === 'ArrowLeft') prevStory();
  });
})();

// ---------- números ----------
(function(){
  var days = daysTogether();
  var mins = (Date.now() - START) / 60000;
  var anoFim = new Date(START.getFullYear() + 1, START.getMonth(), START.getDate());
  var pctAno = Math.min(100, (Date.now() - START) / (anoFim - START) * 100);
  var items = [
    ['📅', days, 'dias juntos'],
    ['⏰', mins / 60, 'horas de nós'],
    ['💓', mins * 80, 'batidas de coração (acelerado)'],
    ['📸', FOTOS.length, 'fotos no álbum'],
    ['💋', days * 25, 'beijos (estimativa por baixo)'],
    ['🗓️', days / 7, 'semanas de Amoreco'],
  ];
  var box = $('stats');
  items.forEach(function(it){
    var s = el('div', 'stat', '<div class="e">' + it[0] + '</div><b data-n="' + it[1] + '">0</b><span>' + it[2] + '</span>');
    box.appendChild(s);
  });
  var wide = el('div', 'stat wide',
    '<div class="e">🎯</div><span>rumo a 1 ano — ' + fmtDate(anoFim) + '</span>' +
    '<div class="progress"><i id="anoBar"></i></div><span><b style="display:inline;font-size:18px">' + pctAno.toFixed(1).replace('.', ',') + '%</b> do primeiro ano</span>');
  box.appendChild(wide);

  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      box.querySelectorAll('b[data-n]').forEach(function(b){ countUp(b, +b.dataset.n, 1400); });
      $('anoBar').style.width = pctAno + '%';
      io.disconnect();
    });
  }, { threshold:.3 });
  io.observe(box);
})();

// ---------- álbum + lightbox ----------
(function(){
  var box = $('masonry');
  FOTOS.forEach(function(f, i){
    var it = el('figure', 'm-item');
    it.style.setProperty('--r', (Math.random() * 4 - 2).toFixed(1) + 'deg');
    it.innerHTML = '<img loading="lazy" alt="foto nossa ' + (i + 1) + '">' + (f.cap ? '<figcaption class="cap"></figcaption>' : '');
    it.firstChild.src = f.src;
    if(f.cap) it.lastChild.textContent = f.cap;
    it.addEventListener('click', function(){ openLightbox(i); });
    box.appendChild(it);
  });
})();

var lbIndex = 0;
function openLightbox(i){
  if(!FOTOS.length) return;
  $('lightbox').classList.add('show');
  openModal(function(){ $('lightbox').classList.remove('show'); });
  showLightbox(i);
}
function showLightbox(i){
  lbIndex = (i + FOTOS.length) % FOTOS.length;
  $('lbImg').src = FOTOS[lbIndex].src;
  $('lbCap').textContent = FOTOS[lbIndex].cap;
  $('lbCount').textContent = (lbIndex + 1) + ' / ' + FOTOS.length;
}
(function(){
  var lb = $('lightbox'), img = $('lbImg'), x0 = null, dx = 0;
  $('lbClose').addEventListener('click', closeModal);
  $('lbPrev').addEventListener('click', function(e){ e.stopPropagation(); showLightbox(lbIndex - 1); });
  $('lbNext').addEventListener('click', function(e){ e.stopPropagation(); showLightbox(lbIndex + 1); });
  lb.addEventListener('click', function(e){ if(e.target === lb) closeModal(); });
  lb.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; dx = 0; img.style.transition = 'none'; }, { passive:true });
  lb.addEventListener('touchmove', function(e){ if(x0 === null) return; dx = e.touches[0].clientX - x0; img.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 30 + 'deg)'; }, { passive:true });
  lb.addEventListener('touchend', function(){
    img.style.transition = '';
    img.style.transform = '';
    if(Math.abs(dx) > 60){ showLightbox(lbIndex + (dx < 0 ? 1 : -1)); haptic(); }
    x0 = null;
  });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('show')) return;
    if(e.key === 'ArrowRight') showLightbox(lbIndex + 1);
    if(e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
  });
})();

// ---------- linha do tempo ----------
(function(){
  var days = daysTogether(), list = $('timeline');
  var nomes = window.FOTOS || [];
  D.linhaDoTempo.forEach(function(m){
    // só mostra foto quando o marco escolhe uma em dados.js (campo "foto")
    var pi = m.foto ? nomes.indexOf(m.foto) : -1;
    var li = el('li', 'tl reveal' + (m.dia > days ? ' future' : '') + (m.dia === days ? ' today' : ''));
    li.innerHTML = '<div class="tl-card">' + (pi >= 0 ? '<img loading="lazy" alt="">' : '') +
      '<div><span class="tl-day"></span><h3></h3><p></p></div></div>';
    if(pi >= 0){
      li.querySelector('img').src = photo(pi).src;
      li.querySelector('img').addEventListener('click', function(){ openLightbox(pi); });
    }
    li.querySelector('.tl-day').textContent = 'dia ' + m.dia + ' · ' + fmtDate(addDays(START, m.dia));
    li.querySelector('h3').textContent = m.titulo;
    li.querySelector('p').textContent = m.texto;
    list.appendChild(li);
  });
})();

// ---------- 100 motivos ----------
(function(){
  var M = D.motivos, read = store.get('lidos', []), cur = -1;
  var card = $('reasonCard'), grid = $('hundred');
  for(var i = 0; i < M.length; i++){
    var b = el('button', read.indexOf(i) >= 0 ? 'read' : '', String(i + 1));
    b.setAttribute('aria-label', 'motivo ' + (i + 1));
    b.addEventListener('click', show.bind(null, i, 0));
    grid.appendChild(b);
  }
  $('reasonRead').textContent = read.length;

  function show(i, dir){
    i = (i + M.length) % M.length;
    if(dir){
      card.classList.add(dir > 0 ? 'out-left' : 'out-right');
      setTimeout(function(){ card.classList.remove('out-left', 'out-right'); render(i); }, 220);
    } else render(i);
  }
  function render(i){
    cur = i;
    $('reasonNum').textContent = '#' + (i + 1);
    $('reasonText').textContent = M[i];
    card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
    grid.querySelectorAll('.cur').forEach(function(b){ b.classList.remove('cur'); });
    grid.children[i].classList.add('cur', 'read');
    if(read.indexOf(i) < 0){
      read.push(i);
      store.set('lidos', read);
      $('reasonRead').textContent = read.length;
      if(read.length === M.length) setTimeout(function(){ celebrate('você leu os 100 motivos!', 'e mesmo assim ainda faltou motivo. eu te amo por mais coisa do que cabe aqui, Amoreco.'); }, 500);
    }
    haptic(8);
  }
  function next(){ show(cur + 1, 1); }
  function prev(){ show(cur - 1, -1); }
  function random(){
    var unread = [];
    for(var i = 0; i < M.length; i++) if(read.indexOf(i) < 0) unread.push(i);
    var pool = unread.length ? unread : M.map(function(_, k){ return k; });
    show(pool[Math.floor(Math.random() * pool.length)], 1);
    confettiFrom(card, 10);
  }
  $('reasonNext').addEventListener('click', next);
  $('reasonPrev').addEventListener('click', prev);
  $('reasonRandom').addEventListener('click', random);

  var x0 = null, dx = 0;
  card.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; dx = 0; }, { passive:true });
  card.addEventListener('touchmove', function(e){ if(x0 === null) return; dx = e.touches[0].clientX - x0; card.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 20 + 'deg)'; }, { passive:true });
  card.addEventListener('touchend', function(){ card.style.transform = ''; x0 = null; });
  card.addEventListener('click', function(){
    if(Math.abs(dx) > 50){ dx < 0 ? next() : prev(); dx = 0; return; }
    dx = 0;
    next();
  });
})();

// ---------- raspadinha ----------
(function(){
  var wrap = $('scratch'), cv = $('scratchCanvas'), ctx = cv.getContext('2d');
  $('scratchPrize').textContent = D.raspadinha;
  var drawing = false, done = false, moves = 0;

  function paint(){
    var r = wrap.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if(!r.width) return;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = ctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, '#f5c04a'); g.addColorStop(.5, '#ffe39a'); g.addColorStop(1, '#e8a93a');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
    ctx.fillStyle = 'rgba(44,33,64,.18)'; ctx.font = '18px Fredoka, sans-serif';
    for(var y = 14; y < r.height; y += 34) for(var x = (y / 34 % 2) * 20; x < r.width; x += 40) ctx.fillText('♥', x, y);
    ctx.fillStyle = '#2c2140'; ctx.textAlign = 'center'; ctx.font = '600 20px Fredoka, sans-serif';
    ctx.fillText('raspe aqui ✨', r.width / 2, r.height / 2 + 7);
  }
  function scratchAt(e){
    var r = cv.getBoundingClientRect();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, Math.PI * 2); ctx.fill();
    if(++moves % 12 === 0) check();
  }
  function check(){
    var data = ctx.getImageData(0, 0, cv.width, cv.height).data, clear = 0, total = 0;
    for(var i = 3; i < data.length; i += 4 * 40){ total++; if(data[i] === 0) clear++; }
    if(clear / total > .55 && !done){
      done = true;
      wrap.classList.add('done');
      confettiFrom(wrap, 40);
      haptic([20, 40, 20]);
    }
  }
  cv.addEventListener('pointerdown', function(e){ drawing = true; cv.setPointerCapture(e.pointerId); scratchAt(e); });
  cv.addEventListener('pointermove', function(e){ if(drawing) scratchAt(e); });
  cv.addEventListener('pointerup', function(){ drawing = false; check(); });
  paint();
  if(document.fonts) document.fonts.ready.then(function(){ if(!done && !moves) paint(); });
  window.addEventListener('resize', function(){ if(!done && !moves) paint(); });
})();

// ---------- roleta ----------
(function(){
  var cv = $('wheel'), ctx = cv.getContext('2d'), items = D.dates, n = items.length;
  var colors = ['#ff6b7a', '#ffd166', '#7fe3c4', '#e6485c', '#fff7ec', '#3c2b66'];
  var ink = ['#fff', '#2c2140', '#2c2140', '#fff', '#2c2140', '#fff7ec'];
  var R = cv.width / 2, seg = Math.PI * 2 / n, rot = 0, spinning = false;

  function draw(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    for(var i = 0; i < n; i++){
      var a0 = -Math.PI / 2 + i * seg;
      ctx.beginPath(); ctx.moveTo(R, R); ctx.arc(R, R, R - 6, a0, a0 + seg); ctx.closePath();
      ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      ctx.save();
      ctx.translate(R, R); ctx.rotate(a0 + seg / 2);
      ctx.fillStyle = ink[i % ink.length]; ctx.textAlign = 'right'; ctx.font = '600 21px Fredoka, sans-serif';
      var txt = items[i].length > 22 ? items[i].slice(0, 21) + '…' : items[i];
      ctx.fillText(txt, R - 26, 7);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(R, R, R - 4, 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = '#1c1330'; ctx.stroke();
    ctx.beginPath(); ctx.arc(R, R, 34, 0, Math.PI * 2); ctx.fillStyle = '#1c1330'; ctx.fill();
    ctx.fillStyle = '#ff6b7a'; ctx.font = '34px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('♥', R, R + 12);
  }
  draw();
  if(document.fonts) document.fonts.ready.then(draw);

  $('spinBtn').addEventListener('click', function(){
    if(spinning) return;
    spinning = true;
    $('wheelResult').textContent = '';
    var target = Math.floor(Math.random() * n);
    var segDeg = 360 / n;
    var want = (360 - (target + .5) * segDeg + (Math.random() - .5) * segDeg * .6 + 360) % 360;
    rot += 360 * 6 + ((want - rot % 360) + 360) % 360;
    cv.style.transform = 'rotate(' + rot + 'deg)';
    haptic(15);
    setTimeout(function(){
      spinning = false;
      $('wheelResult').textContent = '→ ' + items[target] + '!';
      confettiFrom(cv, 30);
      haptic([20, 40, 20]);
    }, 4600);
  });
})();

// ---------- vales ----------
(function(){
  var used = store.get('vales', []), box = $('coupons');
  D.vales.forEach(function(v, i){
    var b = el('button', 'coupon' + (used.indexOf(i) >= 0 ? ' used' : ''),
      '<span class="ce"></span><span><b></b><small></small></span>');
    b.querySelector('.ce').textContent = v.emoji;
    b.querySelector('b').textContent = v.titulo;
    b.querySelector('small').textContent = v.texto;
    b.addEventListener('click', function(){
      var k = used.indexOf(i);
      if(k >= 0){
        if(!confirm('desmarcar esse vale como usado?')) return;
        used.splice(k, 1);
        b.classList.remove('used');
      } else {
        used.push(i);
        b.classList.add('used');
        confettiFrom(b, 20);
        haptic(30);
        toast('vale usado! me mostra essa tela 😏');
      }
      store.set('vales', used);
    });
    box.appendChild(b);
  });
})();

// ---------- próximos capítulos ----------
(function(){
  var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var nextMes = new Date(today.getFullYear(), today.getMonth(), START.getDate());
  if(nextMes <= today) nextMes.setMonth(nextMes.getMonth() + 1);
  var marcos = [
    ['🌙', 'próximo mesversário', nextMes],
    ['🎁', '150 dias — tem mais surpresa!', addDays(START, 150)],
    ['💯', '200 dias', addDays(START, 200)],
    ['🌸', '6 meses', new Date(START.getFullYear(), START.getMonth() + 6, START.getDate())],
    ['🎂', '1 ano', new Date(START.getFullYear() + 1, START.getMonth(), START.getDate())],
  ];
  var box = $('countdowns');
  marcos.forEach(function(m){
    var falta = Math.round((m[2] - today) / DAY);
    var c = el('div', 'cd', '<span class="e"></span><span><b></b><small></small></span><span class="n"></span>');
    c.querySelector('.e').textContent = m[0];
    c.querySelector('b').textContent = m[1];
    c.querySelector('small').textContent = fmtDate(m[2]);
    c.querySelector('.n').innerHTML = falta > 0 ? falta + '<small>dias</small>' : 'hoje!';
    box.appendChild(c);
  });
})();

// ---------- música ----------
$('vinylToggle').addEventListener('click', function(){ $('vinylWrap').classList.toggle('spin'); haptic(); });

// ---------- carta ----------
(function(){
  var c = D.carta, card = $('letterCard');
  var p = el('p', 'letter-open'); p.textContent = c.abertura; card.appendChild(p);
  c.paragrafos.forEach(function(t, i){
    var q = el('p', 'para'); q.textContent = t; q.style.transitionDelay = (.3 + i * .25) + 's'; card.appendChild(q);
  });
  var s = el('p', 'letter-sign'); s.textContent = c.assinatura; card.appendChild(s);

  function open(){
    var env = $('envelope');
    if(env.classList.contains('open')) return;
    env.classList.add('open');
    $('envHint').style.display = 'none';
    confettiFrom(env, 24);
    haptic(30);
    setTimeout(function(){ card.classList.add('show'); }, 380);
  }
  $('envelope').addEventListener('click', open);
  $('envelope').addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } });
})();

// ---------- mosaico final ----------
(function(){
  var box = $('mosaic');
  if(!FOTOS.length) return;
  for(var i = 0; i < 25; i++){
    var im = el('img'); im.loading = 'lazy'; im.alt = ''; im.src = photo(i).src; box.appendChild(im);
  }
})();

// ---------- coraçõezinhos escondidos ----------
(function(){
  var hearts = document.querySelectorAll('.secret-heart'), total = hearts.length;
  var found = store.get('coracoes', []);
  function update(){ $('heartCounter').textContent = '💗 ' + found.length + '/' + total; }
  hearts.forEach(function(h){
    if(found.indexOf(h.dataset.id) >= 0){ h.classList.add('found'); h.textContent = '★'; }
    h.addEventListener('click', function(){
      if(found.indexOf(h.dataset.id) >= 0) return;
      found.push(h.dataset.id);
      store.set('coracoes', found);
      h.classList.add('found');
      h.textContent = '★';
      update();
      $('heartCounter').classList.remove('bump'); void $('heartCounter').offsetWidth; $('heartCounter').classList.add('bump');
      confettiFrom(h, 16);
      haptic(25);
      if(found.length === total) setTimeout(function(){
        celebrate('você achou os ' + total + ' coraçõezinhos!', 'escondidos em cada cantinho do site, assim como eu escondo um tanto de amor por você em cada coisa que faço. te amo, Amoreco.');
      }, 400);
      else toast('achou um! faltam ' + (total - found.length) + ' 💗');
    });
  });
  update();
})();

// ---------- navegação e animações de entrada ----------
(function(){
  var navMap = { inicio:'inicio', stories:'inicio', numeros:'inicio', fotos:'fotos', linha:'fotos', motivos:'motivos', surpresas:'surpresas', musica:'carta', carta:'carta' };
  var links = document.querySelectorAll('.nav a');
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var target = navMap[e.target.id];
      links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + target); });
    });
  }, { rootMargin:'-45% 0px -50% 0px' });
  Object.keys(navMap).forEach(function(id){ if($(id)) io.observe($(id)); });
  links.forEach(function(a){ a.addEventListener('click', function(){ haptic(8); }); });

  document.querySelectorAll('.head, .panel, .stat, .reason-stage, .music-card, .envelope-wrap').forEach(function(n){ n.classList.add('reveal'); });
  var ro = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); } });
  }, { rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function(n){ ro.observe(n); });
})();

})();
