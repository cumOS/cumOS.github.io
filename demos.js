/* the live examples of the guide: each one is a small playground that also writes the JSON of a module */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var demos = {};

  // ------------------------------------------------------------------ helpers
  function h(tag, a, kids) {
    var e = document.createElement(tag);
    if (a) Object.keys(a).forEach(function (k) {
      if (k === 'class') e.className = a[k];
      else if (k === 'text') e.textContent = a[k];
      else if (k === 'html') e.innerHTML = a[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), a[k]);
      else e.setAttribute(k, a[k]);
    });
    (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var mixc = function (a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); };
  var rgb = function (c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a === undefined ? 1 : a) + ')'; };
  function hex2rgb(x) { var n = parseInt(x.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(x) { var c = hex2rgb(x); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function argb(x, alpha) { return '#' + ('0' + Math.round(clamp(alpha, 0, 1) * 255).toString(16)).slice(-2).toUpperCase() + x.slice(1).toUpperCase(); }

  var ICON = {
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
    bt: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
    flash: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
    plane: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>',
    rotate: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>',
    batt: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M10 2h4"/>',
    spk: '<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    bell: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>'
  };
  var svg = function (n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; };

  function card(title, hint, wide) {
    var view = h('div', { class: 'view' });
    var ctl = h('div', { class: 'ctl' });
    var out = h('pre', { class: 'out' }, [h('code', { class: 'lang-json' })]);
    var root = h('div', null, [
      h('div', { class: 'dh' }, [h('b', { text: 'live example' }), h('span', { text: title }), h('i', { text: hint || '' })]),
      h('div', { class: 'db' + (wide ? ' wide' : '') }, wide ? [ctl] : [view, ctl]),
      out
    ]);
    if (window.guideUi) window.guideUi.addCopy(out);
    return { root: root, view: view, ctl: ctl, out: out, code: out.firstChild };
  }
  function show(c, obj) {
    var text = JSON.stringify(obj, null, 2);
    c.code.textContent = text;
    c.code.className = 'lang-json';
    if (window.guideUi) window.guideUi.highlight(c.code);
  }
  function range(label, min, max, step, val, unit, cb, fmt) {
    var out = h('output');
    var inp = h('input', { type: 'range', min: min, max: max, step: step, value: val, 'aria-label': label });
    var set = function () {
      var v = parseFloat(inp.value);
      out.textContent = fmt ? fmt(v) : v + (unit || '');
      inp.style.setProperty('--fill', ((v - min) / (max - min) * 100) + '%');
      return v;
    };
    inp.addEventListener('input', function () { cb(set()); });
    var row = h('div', { class: 'row' }, [h('label', { text: label }), inp, out]);
    set();
    return { row: row, set: function (v) { inp.value = v; set(); }, get: function () { return parseFloat(inp.value); } };
  }
  function pick(label, options, val, cb) {
    var sel = h('select', { 'aria-label': label });
    options.forEach(function (o) { sel.appendChild(h('option', { value: o[0], text: o[1] })); });
    sel.value = val;
    sel.addEventListener('change', function () { cb(sel.value); });
    return { row: h('div', { class: 'row pick' }, [h('label', { text: label }), sel]), set: function (v) { sel.value = v; }, get: function () { return sel.value; } };
  }
  function colour(label, val, cb) {
    var inp = h('input', { type: 'color', value: val, 'aria-label': label });
    inp.addEventListener('input', function () { cb(inp.value); });
    return { row: h('div', { class: 'row pick' }, [h('label', { text: label }), h('div', null, [inp])]), set: function (v) { inp.value = v; }, get: function () { return inp.value; } };
  }
  function chips(list, val, cb) {
    var box = h('div', { class: 'chips' });
    var btns = list.map(function (o) {
      var b = h('button', { type: 'button', class: 'chip', text: o[1] });
      b.addEventListener('click', function () { set(o[0]); cb(o[0]); });
      box.appendChild(b);
      return [o[0], b];
    });
    function set(v) { btns.forEach(function (p) { p[1].classList.toggle('on', p[0] === v); p[1].setAttribute('aria-pressed', p[0] === v ? 'true' : 'false'); }); }
    set(val);
    return { el: box, set: set };
  }

  // ================================================================== 1. a phone you can style
  demos.phone = function (host) {
    var presets = {
      stock: { name: 'stock', aR: 24, iR: 50, icR: 16, act: '#6a58d0', inact: '#26242f', sl: '#7c6cf0', sw: '#7c6cf0' },
      nebula: { name: 'nebula', aR: 30, iR: 30, icR: 18, act: '#6a58d0', inact: '#1b1535', sl: '#ff5cc8', sw: '#7c5cff' },
      hollow: { name: 'hollow eve', aR: 8, iR: 8, icR: 4, act: '#ff7a1a', inact: '#2a1b1b', sl: '#d1241b', sw: '#ff7a1a' },
      metro: { name: 'metro', aR: 0, iR: 0, icR: 0, act: '#0078d7', inact: '#2b2b2b', sl: '#0078d7', sw: '#0078d7' }
    };
    var s = Object.assign({}, presets.nebula);
    var c = card('a module is a set of values', 'tap the tiles and the switch');
    var qs = h('div', { class: 'qs' });
    var tiles = [['wifi', 'Internet', 1], ['bt', 'Bluetooth', 1], ['flash', 'Torch', 0], ['plane', 'Airplane', 0], ['rotate', 'Rotate', 0], ['batt', 'Saver', 0]];
    var grid = h('div', { class: 'qgrid' });
    tiles.forEach(function (t) {
      var b = h('button', { type: 'button', class: 'qt' + (t[2] ? ' on' : ''), 'aria-pressed': t[2] ? 'true' : 'false', html: '<span class="qi">' + svg(t[0]) + '</span><span>' + t[1] + '</span>' });
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.classList.toggle('on') ? 'true' : 'false'); });
      grid.appendChild(b);
    });
    var sw = h('button', { type: 'button', class: 'mini-sw on', 'aria-label': 'Dark theme', 'aria-pressed': 'true' });
    sw.addEventListener('click', function () {
      var dark = sw.classList.toggle('on');
      sw.setAttribute('aria-pressed', dark ? 'true' : 'false');
      phone.firstChild.classList.toggle('day', !dark);
    });
    qs.appendChild(h('div', { class: 'clock', html: '10:42<small>TUE 13 OCT</small>' }));
    qs.appendChild(grid);
    qs.appendChild(h('div', { class: 'qbright' }));
    qs.appendChild(h('div', { class: 'qrow' }, [h('span', { text: 'Dark theme' }), sw]));
    var phone = h('div', { class: 'phone' }, [h('div', { class: 'scr' }, [h('div', { class: 'wall' }, [h('i'), h('i'), h('i')]), h('div', { class: 'st', html: '<span>KamiOS</span><span>98%</span>' }), qs])]);
    c.view.appendChild(phone);
    var chipBox = chips([['stock', 'stock'], ['nebula', 'nebula'], ['hollow', 'hollow eve'], ['metro', 'metro']], 'nebula', function (k) { apply(presets[k]); });
    var rAct = range('tile corner, on', 0, 50, 1, s.aR, 'dp', function (v) { s.aR = v; render(); });
    var rIn = range('tile corner, off', 0, 50, 1, s.iR, 'dp', function (v) { s.iR = v; render(); });
    var rIc = range('icon corner, on', 0, 24, 1, s.icR, 'dp', function (v) { s.icR = v; render(); });
    var cAct = colour('tile that is on', s.act, function (v) { s.act = v; render(); });
    var cIn = colour('tile that is off', s.inact, function (v) { s.inact = v; render(); });
    var cSl = colour('brightness bar', s.sl, function (v) { s.sl = v; render(); });
    var cSw = colour('switch (Settings)', s.sw, function (v) { s.sw = v; render(); });
    [chipBox.el, rAct.row, rIn.row, rIc.row, cAct.row, cIn.row, cSl.row, cSw.row].forEach(function (e) { c.ctl.appendChild(e); });
    c.ctl.appendChild(h('p', { class: 'note', html: 'These knobs are explained in <a href="#colours-corners-and-shapes">quick settings: colours, corners and shapes</a>.' }));
    function apply(p) {
      s = Object.assign({}, p);
      rAct.set(s.aR); rIn.set(s.iR); rIc.set(s.icR); cAct.set(s.act); cIn.set(s.inact); cSl.set(s.sl); cSw.set(s.sw);
      render();
    }
    function render() {
      qs.style.setProperty('--ar', s.aR + 'px'); qs.style.setProperty('--ir', s.iR + 'px'); qs.style.setProperty('--icr', s.icR + 'px');
      qs.style.setProperty('--act', s.act); qs.style.setProperty('--inact', s.inact); qs.style.setProperty('--sl', s.sl); qs.style.setProperty('--sw', s.sw);
      qs.style.setProperty('--actfg', lum(s.act) > 0.6 ? '#14100a' : '#ffffff');
      show(c, {
        targets: {
          'com.android.systemui': {
            'dimen/common_tile_default_active_tile_corner_radius': s.aR + 'dp',
            'dimen/common_tile_default_inactive_tile_corner_radius': s.iR + 'dp',
            'dimen/common_tile_default_active_icon_corner_radius': s.icR + 'dp',
            'color/kami_qs_tile_active_bg': argb(s.act, 1),
            'color/kami_qs_tile_active_fg': lum(s.act) > 0.6 ? '#FF14100A' : '#FFFFFFFF',
            'color/kami_qs_tile_inactive_bg': argb(s.inact, 1),
            'color/kami_brightness_slider_active': argb(s.sl, 1)
          },
          'com.android.settings': { 'color/kami_switch_track_on': argb(s.sw, 1) }
        }
      });
    }
    host.appendChild(c.root);
    render();
  };

  // ================================================================== 2. glass: the dock and the bar
  demos.glass = function (host) {
    var s = { nav: 'dock', blur: 36, shine: 30, gloss: 14, frost: 6, rim: 85, shade: 14, vib: 70, tint: 0.35 };
    var c = card('the glass of the dock', 'the wallpaper moves behind it');
    var gl = h('div', { class: 'gl' });
    ['g-back', 'g-tint', 'g-frost', 'g-shade', 'g-shine', 'g-gloss', 'g-rim'].forEach(function (k) { gl.appendChild(h('i', { class: k })); });
    var icons = h('div', { class: 'gl-icons' });
    var names = [['wifi', 'network'], ['spk', 'sound'], ['sun', 'display'], ['bell', 'alerts'], ['batt', 'battery']];
    var spans = names.map(function (n, i) {
      var sp = h('span', { html: svg(n[0]) + '<em>' + n[1] + '</em>' });
      sp.addEventListener('click', function () { cur(i); });
      icons.appendChild(sp);
      return sp;
    });
    function cur(i) { spans.forEach(function (sp, k) { sp.classList.toggle('cur', k === i); }); }
    cur(2);
    gl.appendChild(icons);
    var page = h('div', { class: 'gl-page' }, [h('h4', { text: 'Display' })]);
    for (var i = 0; i < 6; i++) page.appendChild(h('div', { class: 'gl-row', html: '<i></i><div style="flex:1"><b style="width:' + (46 + (i * 13) % 40) + '%"></b><em></em></div>' }));
    var phone = h('div', { class: 'phone' }, [h('div', { class: 'scr' }, [h('div', { class: 'wall' }, [h('i'), h('i'), h('i')]), h('div', { class: 'st', html: '<span>10:42</span><span>98%</span>' }), page, gl])]);
    c.view.appendChild(phone);
    var navChips = chips([['dock', 'dock'], ['bar', 'bar']], 'dock', function (v) { s.nav = v; render(); });
    c.ctl.appendChild(navChips.el);
    [['blur', 'blur', 0, 60, 'dp'], ['shine', 'shine', 0, 100, ''], ['gloss', 'gloss', 0, 100, ''], ['frost', 'frost', 0, 100, ''], ['rim', 'rim', 0, 100, ''],
      ['shade', 'shade', 0, 100, ''], ['vib', 'vibrance', 0, 100, ''], ['tint', 'bar colour alpha', 0, 100, '%']].forEach(function (d) {
      var r = range(d[1], d[2], d[3], 1, d[0] === 'tint' ? s.tint * 100 : s[d[0]], d[4], function (v) { s[d[0]] = d[0] === 'tint' ? v / 100 : v; render(); });
      c.ctl.appendChild(r.row);
    });
    function q(sel) { return gl.querySelector(sel); }
    function render() {
      var v = s.vib / 100;
      gl.className = 'gl' + (s.nav === 'bar' ? ' bar' : '');
      gl.style.setProperty('--blur', s.blur + 'px');
      gl.style.setProperty('--sat', (1 + 1.2 * v).toFixed(2));
      gl.style.setProperty('--bri', (1 + 0.35 * v).toFixed(2));
      gl.style.setProperty('--rim', 'rgba(255,255,255,' + (0.62 * s.rim / 100).toFixed(2) + ')');
      q('.g-tint').style.background = 'rgba(21,14,58,' + s.tint + ')';
      q('.g-frost').style.background = 'rgba(255,255,255,' + (s.frost * 0.0045).toFixed(3) + ')';
      q('.g-shine').style.background = 'linear-gradient(180deg, rgba(255,255,255,' + (s.shine / 100 * 0.9).toFixed(2) + '), rgba(255,255,255,0) 55%)';
      q('.g-shade').style.background = 'linear-gradient(0deg, rgba(0,0,0,' + (s.shade / 100).toFixed(2) + '), rgba(0,0,0,0) 40%)';
      q('.g-gloss').style.background = 'linear-gradient(115deg, rgba(255,255,255,0) 18%, rgba(255,255,255,' + (s.gloss * 0.006).toFixed(3) + ') 30%, rgba(255,255,255,0) 42%)';
      show(c, {
        settings_layout: {
          pages: {
            nav: s.nav,
            colors: { bar: argb('#150e3a', s.tint) },
            glass: { blur: s.blur, shine: s.shine, gloss: s.gloss, frost: s.frost, rim: s.rim, shade: s.shade, vibrance: s.vib }
          }
        }
      });
    }
    host.appendChild(c.root);
    render();
  };

  // ================================================================== 3. a switch you can slow down
  demos.switch = function (host) {
    var STOCK = 250;
    var s = { style: 'sky', dur: 700, anim: 'none', frames: 16 };
    var c = card('a switch as a strip of pictures', 'tap the switch');
    var cv = h('canvas', { width: 312, height: 192, 'aria-hidden': 'true' });
    var main = h('button', { type: 'button', class: 'sw-main', 'aria-label': 'Example switch' }, [cv]);
    var strip = h('div', { class: 'strip' });
    var thumbs = [];
    for (var i = 0; i < 16; i++) {
      var t = h('canvas', { width: 156, height: 96, 'aria-hidden': 'true' });
      thumbs.push(t);
      strip.appendChild(t);
    }
    var stats = h('div', { class: 'sw-stats' });
    c.view.appendChild(h('div', { class: 'sw-stage' }, [main, h('div', { class: 'sw-hint', text: 'off ← → on' }), strip, stats]));
    var on = false, p = 0, anim = null;

    function draw(ctx, w, h_, e, style) {
      ctx.clearRect(0, 0, w, h_);
      var r = h_ / 2;
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, w, h_, r); else ctx.rect(0, 0, w, h_);
      ctx.clip();
      var cx = r * 0.95 + e * (w - r * 1.9), cy = h_ / 2, kr = h_ * (style === 'plain' ? 0.38 : 0.36);
      if (style === 'plain') {
        var tc = mixc([60, 58, 74], [124, 92, 255], e);
        ctx.fillStyle = rgb(tc); ctx.fillRect(0, 0, w, h_);
        ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 8; ctx.fillStyle = rgb(mixc([180, 176, 200], [255, 255, 255], e));
        ctx.beginPath(); ctx.arc(cx, cy, kr, 0, 6.2832); ctx.fill();
      } else if (style === 'sky') {
        var g = ctx.createLinearGradient(0, 0, 0, h_);
        g.addColorStop(0, rgb(mixc([22, 18, 70], [84, 178, 255], e))); g.addColorStop(1, rgb(mixc([52, 44, 120], [160, 220, 255], e)));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h_);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * (1 - e)) + ')';
        [[.32, .22], [.52, .7], [.42, .5], [.7, .3], [.62, .8], [.8, .62]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0] * w, q[1] * h_, 1.4, 0, 6.2832); ctx.fill(); });
        ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * e) + ')';
        [[.4, .8, 9], [.52, .86, 12], [.64, .8, 9], [.3, .92, 8], [.76, .92, 8]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0] * w, q[1] * h_, q[2], 0, 6.2832); ctx.fill(); });
        var gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, kr * 1.7);
        gg.addColorStop(0, 'rgba(255,214,90,' + (0.6 * e) + ')'); gg.addColorStop(1, 'rgba(255,214,90,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, kr * 1.7, 0, 6.2832); ctx.fill();
        ctx.fillStyle = rgb(mixc([236, 232, 255], [255, 214, 80], e)); ctx.beginPath(); ctx.arc(cx, cy, kr, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(190,184,228,' + (1 - e) + ')';
        [[-.35, -.25, .2], [.25, .1, .28], [-.1, .45, .14]].forEach(function (q) { ctx.beginPath(); ctx.arc(cx + q[0] * kr, cy + q[1] * kr, q[2] * kr, 0, 6.2832); ctx.fill(); });
      } else {
        var g2 = ctx.createLinearGradient(0, 0, 0, h_);
        g2.addColorStop(0, rgb(mixc([34, 30, 36], [120, 36, 8], e))); g2.addColorStop(1, rgb(mixc([20, 17, 22], [255, 120, 20], e)));
        ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h_);
        var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, kr * 1.8);
        gl.addColorStop(0, 'rgba(255,150,40,' + (0.75 * e) + ')'); gl.addColorStop(1, 'rgba(255,150,40,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, kr * 1.8, 0, 6.2832); ctx.fill();
        ctx.fillStyle = rgb(mixc([92, 70, 58], [255, 138, 28], e));
        [[-.55, .62], [.55, .62], [0, .78]].forEach(function (q) { ctx.beginPath(); ctx.ellipse(cx + q[0] * kr, cy, kr * q[1], kr * 0.92, 0, 0, 6.2832); ctx.fill(); });
        ctx.fillStyle = rgb(mixc([70, 70, 40], [100, 110, 40], e)); ctx.fillRect(cx - kr * .08, cy - kr * 1.2, kr * .18, kr * .3);
        ctx.fillStyle = rgb(mixc([14, 10, 12], [255, 242, 150], e));
        [[-.62, -.2], [.2, .62]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(cx + q[0] * kr, cy - kr * .12); ctx.lineTo(cx + q[1] * kr, cy - kr * .12); ctx.lineTo(cx + (q[0] + q[1]) / 2 * kr, cy - kr * .5); ctx.fill(); });
        ctx.beginPath(); ctx.moveTo(cx - kr * .6, cy + kr * .22); ctx.lineTo(cx - kr * .3, cy + kr * .5); ctx.lineTo(cx - kr * .12, cy + kr * .28); ctx.lineTo(cx, cy + kr * .54);
        ctx.lineTo(cx + kr * .12, cy + kr * .28); ctx.lineTo(cx + kr * .3, cy + kr * .5); ctx.lineTo(cx + kr * .6, cy + kr * .22); ctx.lineTo(cx + kr * .4, cy + kr * .62); ctx.lineTo(cx - kr * .4, cy + kr * .62); ctx.fill();
      }
      ctx.restore();
    }
    function paint() {
      draw(cv.getContext('2d'), 312, 192, p, s.style);
      var f = Math.round(p * (s.frames - 1));
      thumbs.forEach(function (t, k) { t.classList.toggle('cur', k === f); });
      var d = s.dur > 0 ? s.dur : STOCK;
      stats.innerHTML = '<span>frame <b>' + (f + 1) + '</b> of ' + s.frames + '</span><span><b>' + d + ' ms</b>' + (s.dur > 0 ? '' : ' (stock)') + '</span>';
    }
    function drawThumbs() { thumbs.forEach(function (t, k) { draw(t.getContext('2d'), 156, 96, k / 15, s.style); }); }
    function play(to) {
      if (anim) cancelAnimationFrame(anim);
      var from = p, d = s.dur > 0 ? s.dur : STOCK, t0 = performance.now();
      if (d < 20) { p = to; paint(); return; }
      (function step(now) {
        var t = clamp((now - t0) / d, 0, 1);
        p = from + (to - from) * (1 - Math.pow(1 - t, 2.8));
        paint();
        if (t < 1) anim = requestAnimationFrame(step); else anim = null;
      })(t0);
    }
    function toggleAnim() {
      if (s.style !== 'plain' || s.anim === 'none' || !main.animate) return;
      var k = (s.dur > 0 ? s.dur : STOCK) / STOCK;
      var A = {
        pop: [[{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: .3 }, { transform: 'scale(1)' }], { duration: 370 * k, easing: 'cubic-bezier(.3,1.6,.5,1)' }],
        spin: [[{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 420 * k, easing: 'cubic-bezier(.1,.6,.3,1)' }],
        jelly: [[{ transform: 'scale(1)' }, { transform: 'scale(1.35,.7)', offset: .2 }, { transform: 'scale(.85,1.2)', offset: .45 }, { transform: 'scale(1)' }], { duration: 420 * k, easing: 'cubic-bezier(.3,1.5,.5,1)' }],
        drop: [[{ transform: 'translateY(-60%)' }, { transform: 'translateY(0)', offset: .6 }, { transform: 'translateY(-8%)', offset: .78 }, { transform: 'translateY(0)' }], { duration: 380 * k, easing: 'ease-in' }]
      }[s.anim];
      if (A) main.animate(A[0], A[1]);
    }
    main.addEventListener('click', function () { on = !on; play(on ? 1 : 0); toggleAnim(); });
    var rDur = range('switch time', 0, 1500, 50, s.dur, ' ms', function (v) { s.dur = v; render(); }, function (v) { return v === 0 ? 'stock' : v + ' ms'; });
    var pStyle = pick('picture', [['sky', 'moon to sun (strip)'], ['pumpkin', 'pumpkin (strip)'], ['plain', 'plain colours']], 'sky', function (v) { s.style = v; drawThumbs(); render(); });
    var pAnim = pick('toggle animation', [['none', '0 none'], ['pop', '1 pop'], ['spin', '2 spin'], ['jelly', '3 jelly'], ['drop', '4 drop']], 'none', function (v) { s.anim = v; render(); });
    [rDur.row, pStyle.row, pAnim.row].forEach(function (e) { c.ctl.appendChild(e); });
    c.ctl.appendChild(h('p', { class: 'note', text: 'The strip below the switch is what you draw: 16 pictures from off to on. The switch plays it forward and backward and cross-fades two neighbours. Toggle animations belong to plain switches; a strip already moves by itself.' }));
    function render() {
      var o = { 'integer/kami_switch_duration': s.dur };
      if (s.style !== 'plain') { o['drawable/kami_switch_sheet'] = 'img/switch_strip.png'; o['integer/kami_switch_sheet_frames'] = 16; }
      else if (s.anim !== 'none') o['integer/kami_switch_toggle_animation'] = ['none', 'pop', 'spin', 'jelly', 'drop'].indexOf(s.anim);
      show(c, { targets: { 'com.android.settings': o } });
      paint();
    }
    host.appendChild(c.root);
    drawThumbs();
    render();
  };

  // ================================================================== 4. an easing curve
  demos.curve = function (host) {
    var P = { x1: 0.25, y1: 1.35, x2: 0.5, y2: 1 };
    var dur = 500;
    var c = card('how a movement speeds up and slows down', 'drag the two handles');
    var NS = 'http://www.w3.org/2000/svg';
    var X = function (x) { return 30 + x * 180; }, Y = function (y) { return 200 - y * 130; };
    var svgEl = document.createElementNS(NS, 'svg');
    svgEl.setAttribute('viewBox', '0 0 240 250'); svgEl.setAttribute('class', 'cv-svg');
    svgEl.innerHTML = '<rect class="box" x="30" y="70" width="180" height="130"/><line class="ax" x1="30" y1="200" x2="210" y2="200"/><line class="ax" x1="30" y1="70" x2="210" y2="70" stroke-dasharray="3 3"/>' +
      '<line class="hl" id="l1"/><line class="hl" id="l2"/><path class="cu" id="cu"/><circle class="hd" id="h1" r="8"/><circle class="hd" id="h2" r="8"/>';
    var track = h('div', { class: 'cv-track' }, [h('div', { class: 'cv-ball' })]);
    var ball = track.firstChild;
    var win = h('div', { class: 'stg', style: 'width:236px;height:150px;border-radius:20px;padding:6px' }, [h('div', { class: 'scr', style: 'border-radius:15px' }, [
      h('div', { class: 'layer home' }), h('div', { class: 'layer back-a', style: 'transform-origin:50% 100%;border-radius:10px', html: '<h5>App</h5>' })])]);
    var card1 = win.querySelector('.back-a');
    c.view.appendChild(svgEl); c.view.appendChild(track); c.view.appendChild(win);
    var l1 = svgEl.querySelector('#l1'), l2 = svgEl.querySelector('#l2'), cu = svgEl.querySelector('#cu'), h1 = svgEl.querySelector('#h1'), h2 = svgEl.querySelector('#h2');
    function path() { return 'M 0,0 C ' + P.x1 + ',' + P.y1 + ' ' + P.x2 + ',' + P.y2 + ' 1,1'; }
    function draw() {
      cu.setAttribute('d', 'M' + X(0) + ',' + Y(0) + ' C' + X(P.x1) + ',' + Y(P.y1) + ' ' + X(P.x2) + ',' + Y(P.y2) + ' ' + X(1) + ',' + Y(1));
      l1.setAttribute('x1', X(0)); l1.setAttribute('y1', Y(0)); l1.setAttribute('x2', X(P.x1)); l1.setAttribute('y2', Y(P.y1));
      l2.setAttribute('x1', X(1)); l2.setAttribute('y1', Y(1)); l2.setAttribute('x2', X(P.x2)); l2.setAttribute('y2', Y(P.y2));
      h1.setAttribute('cx', X(P.x1)); h1.setAttribute('cy', Y(P.y1)); h2.setAttribute('cx', X(P.x2)); h2.setAttribute('cy', Y(P.y2));
    }
    function drag(el, kx, ky) {
      el.addEventListener('pointerdown', function (e) {
        el.setPointerCapture(e.pointerId);
        var move = function (ev) {
          var r = svgEl.getBoundingClientRect(), k = 240 / r.width;
          var x = ((ev.clientX - r.left) * k - 30) / 180, y = (200 - (ev.clientY - r.top) * k) / 130;
          P[kx] = Math.round(clamp(x, 0, 1) * 100) / 100; P[ky] = Math.round(clamp(y, -0.3, 1.5) * 100) / 100;
          draw(); render(false);
        };
        var up = function () { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); replay(); };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
        e.preventDefault();
      });
    }
    drag(h1, 'x1', 'y1'); drag(h2, 'x2', 'y2');
    [[h1, 'x1', 'y1', 'first handle'], [h2, 'x2', 'y2', 'second handle']].forEach(function (d) {
      d[0].setAttribute('tabindex', '0'); d[0].setAttribute('role', 'button'); d[0].setAttribute('aria-label', d[3] + ', move it with the arrow keys');
      d[0].addEventListener('keydown', function (e) {
        var k = { ArrowLeft: [d[1], -0.05, 0, 1], ArrowRight: [d[1], 0.05, 0, 1], ArrowUp: [d[2], 0.05, -0.3, 1.5], ArrowDown: [d[2], -0.05, -0.3, 1.5] }[e.key];
        if (!k) return;
        e.preventDefault();
        P[k[0]] = Math.round(clamp(P[k[0]] + k[1], k[2], k[3]) * 100) / 100;
        draw(); render(true);
      });
    });
    var timer, runs = 0;
    function replay(auto) {
      clearTimeout(timer);
      if (auto !== true) runs = 0;
      if (!ball.animate || !host.offsetParent || (reduce && auto === true) || runs++ >= 3) return;
      var easing = 'cubic-bezier(' + P.x1 + ',' + P.y1 + ',' + P.x2 + ',' + P.y2 + ')';
      var w = track.clientWidth - 32;
      ball.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + w + 'px)' }], { duration: dur, easing: easing, fill: 'both' });
      card1.animate([{ transform: 'scale(.4) translateY(30%)', opacity: 0.2 }, { transform: 'scale(1)', opacity: 1 }], { duration: dur, easing: easing, fill: 'both' });
      timer = setTimeout(function () { replay(true); }, dur + 900);
    }
    var presets = [['stock', 'stock', [0.4, 0, 0.2, 1]], ['snappy', 'snappy', [0.2, 0, 0, 1]], ['smooth', 'smooth', [0.35, 0, 0.15, 1]], ['bouncy', 'bouncy', [0.25, 1.35, 0.5, 1]], ['linear', 'mechanical', [0.33, 0.33, 0.66, 0.66]]];
    var ch = chips(presets.map(function (p) { return [p[0], p[1]]; }), 'bouncy', function (k) {
      var v = presets.filter(function (p) { return p[0] === k; })[0][2];
      P.x1 = v[0]; P.y1 = v[1]; P.x2 = v[2]; P.y2 = v[3]; draw(); render(true);
    });
    c.ctl.appendChild(ch.el);
    c.ctl.appendChild(range('activity time', 100, 1500, 10, dur, ' ms', function (v) { dur = v; render(true); }).row);
    c.ctl.appendChild(h('p', { class: 'note', text: 'The curve runs from 0,0 to 1,1: x is the time, y the progress. A y above 1 makes the movement overshoot and settle back. The ball and the window use the curve you see.' }));
    function render(again) {
      show(c, { targets: { android: { 'string/kami_curve_fast_out_slow_in': path(), 'integer/kami_activity_dur': dur } } });
      if (again) replay();
    }
    host.appendChild(c.root);
    draw(); render(true);
    document.addEventListener('guide:tab', function (e) { if (e.detail.contains(host)) replay(); });
  };

  // ================================================================== 5. waking and unlocking
  demos.wake = function (host) {
    var s = { style: 3, dur: 650, uScale: 1.18, uTy: 0.05, uRot: 0, uPivot: 0.66, uDur: 450 };
    var c = card('how the phone wakes and unlocks', 'press the buttons');
    var home = h('div', { class: 'layer home', html: '<div class="apps">' + new Array(13).join('<i></i>') + '</div>' });
    var lock = h('div', { class: 'layer lock', html: '<b>10:42</b><small>TUE 13 OCT</small><span class="pill"></span>' });
    var stg = h('div', { class: 'stg' }, [h('div', { class: 'scr' }, [home, lock])]);
    c.view.appendChild(stg);
    var names = [[0, '0  stock'], [1, '1  starts big and settles'], [2, '2  starts small and grows'], [3, '3  rises from below'], [4, '4  falls in with a bounce'], [5, '5  turns in'], [6, '6  flips like a card']];
    var pStyle = pick('wake style', names.map(function (n) { return [String(n[0]), n[1]]; }), String(s.style), function (v) { s.style = +v; render(); wake(); });
    var rDur = range('wake time', 80, 2000, 10, s.dur, ' ms', function (v) { s.dur = v; render(); });
    c.ctl.appendChild(pStyle.row); c.ctl.appendChild(rDur.row);
    c.ctl.appendChild(h('button', { type: 'button', class: 'dbtn', text: 'wake the screen', onclick: wake }));
    c.ctl.appendChild(h('p', { class: 'note', text: 'Unlocking: the screen behind the lock screen arrives from these values and settles.' }));
    [range('unlock: start scale', 0.5, 1.5, 0.01, s.uScale, '', function (v) { s.uScale = v; render(); }),
      range('unlock: move down', -0.2, 0.2, 0.01, s.uTy, '', function (v) { s.uTy = v; render(); }),
      range('unlock: rotation', -15, 15, 1, s.uRot, '°', function (v) { s.uRot = v; render(); }),
      range('unlock: pivot height', 0, 1, 0.01, s.uPivot, '', function (v) { s.uPivot = v; render(); }),
      range('unlock time', 100, 1200, 10, s.uDur, ' ms', function (v) { s.uDur = v; render(); })].forEach(function (r) { c.ctl.appendChild(r.row); });
    c.ctl.appendChild(h('button', { type: 'button', class: 'dbtn', text: 'unlock', onclick: unlock }));
    function wake() {
      lock.getAnimations && lock.getAnimations().forEach(function (a) { a.cancel(); });
      lock.style.opacity = 1;
      if (!lock.animate) return;
      var from = { 1: 'scale(1.25)', 2: 'scale(.7)', 3: 'translateY(12%)', 4: 'translateY(-20%)', 5: 'rotate(-12deg) scale(.85)', 6: 'perspective(500px) rotateY(-80deg)' }[s.style];
      home.style.opacity = 1;
      if (!from) { lock.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 }); return; }
      lock.animate([{ transform: from, opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: s.dur, easing: s.style === 4 ? 'cubic-bezier(.3,1.4,.5,1)' : 'cubic-bezier(.1,.6,.2,1)' });
    }
    function unlock() {
      if (!home.animate) return;
      lock.getAnimations().forEach(function (a) { a.cancel(); });
      home.style.transformOrigin = '50% ' + (s.uPivot * 100) + '%';
      lock.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-12%)', opacity: 0 }], { duration: 220, fill: 'forwards', easing: 'ease-in' });
      home.animate([{ transform: 'translateY(' + (s.uTy * 100) + '%) scale(' + s.uScale + ') rotate(' + s.uRot + 'deg)' }, { transform: 'none' }], { duration: s.uDur, easing: 'cubic-bezier(.1,.6,.2,1)' });
      setTimeout(function () { lock.getAnimations().forEach(function (a) { a.cancel(); }); wake(); }, s.uDur + 700);
    }
    function render() {
      show(c, {
        targets: {
          'com.android.systemui': {
            'integer/kami_wake_style': s.style, 'integer/kami_wake_duration': s.dur,
            'dimen/kami_unlock_start_scale': s.uScale, 'dimen/kami_unlock_translation_y': s.uTy,
            'dimen/kami_unlock_rotation': s.uRot, 'dimen/kami_unlock_pivot_y': s.uPivot, 'integer/kami_unlock_duration': s.uDur
          }
        }
      });
    }
    host.appendChild(c.root);
    render();
  };

  // ================================================================== 6. the back swipe
  demos.back = function (host) {
    var s = { style: 'book', dur: 420 };
    var c = card('what the two screens do on a back swipe', 'press the button');
    var b = h('div', { class: 'layer back-b', html: '<h5>Settings</h5><i></i><i></i><i></i><i></i><i></i>' });
    var a = h('div', { class: 'layer back-a', html: '<h5>Display</h5><i></i><i></i><i></i><i></i><i></i>' });
    var stg = h('div', { class: 'stg' }, [h('div', { class: 'scr' }, [b, a])]);
    c.view.appendChild(stg);
    var styles = [['stock', 'stock: the card shrinks'], ['off', 'off'], ['fade', 'fade'], ['zoom', 'zoom'], ['flip', 'flip'], ['book', 'book'], ['spin', 'spin'], ['glitch', 'glitch']];
    c.ctl.appendChild(pick('back style', styles, s.style, function (v) { s.style = v; render(); run(); }).row);
    c.ctl.appendChild(range('swipe time', 150, 1000, 10, s.dur, ' ms', function (v) { s.dur = v; render(); }).row);
    c.ctl.appendChild(h('button', { type: 'button', class: 'dbtn', text: 'swipe back', onclick: run }));
    c.ctl.appendChild(h('p', { class: 'note', text: 'On the phone your finger takes the first part of the movement and letting go plays the rest. Here the whole look plays at once.' }));
    var busy = null;
    function reset() {
      [a, b].forEach(function (e) { e.getAnimations().forEach(function (x) { x.cancel(); }); e.style.opacity = ''; e.style.transform = ''; e.style.transformOrigin = ''; });
      a.style.display = ''; a.style.zIndex = 2; b.style.zIndex = 1;
    }
    function run() {
      reset(); clearTimeout(busy);
      if (!a.animate || s.style === 'off') return;
      var d = s.dur, o = { duration: d, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' };
      var under = [{ transform: 'scale(.94)', opacity: .7 }, { transform: 'none', opacity: 1 }];
      stg.style.perspective = '900px';
      switch (s.style) {
        case 'stock': a.animate([{ transform: 'none', borderRadius: '0' }, { transform: 'scale(.82)', borderRadius: '28px', opacity: .0 }], o); b.animate(under, o); break;
        case 'fade': a.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.92)' }], o); b.animate(under, o); break;
        case 'zoom': a.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.5)' }], o); b.animate([{ transform: 'scale(.7)', opacity: .3 }, { transform: 'none', opacity: 1 }], o); break;
        case 'flip': a.animate([{ transform: 'rotateY(0)', offset: 0 }, { transform: 'rotateY(-90deg)', offset: .5, opacity: 1 }, { transform: 'rotateY(-90deg)', opacity: 0 }], { duration: d, fill: 'forwards', easing: 'ease-in-out' });
          b.animate([{ transform: 'rotateY(90deg)', opacity: 0, offset: 0 }, { transform: 'rotateY(90deg)', opacity: 0, offset: .5 }, { transform: 'none', opacity: 1 }], { duration: d, fill: 'forwards', easing: 'ease-in-out' }); break;
        case 'book': a.style.transformOrigin = '0 50%'; a.animate([{ transform: 'rotateY(0)', opacity: 1 }, { transform: 'rotateY(-105deg)', opacity: .0 }], o); b.animate(under, o); break;
        case 'spin': a.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(55%, 35%) rotate(28deg)', opacity: 0 }], { duration: d, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' }); b.animate(under, o); break;
        case 'glitch': a.animate([{ transform: 'none', opacity: 1, offset: 0 }, { transform: 'translateX(-9px)', opacity: .8, offset: .15 }, { transform: 'translateX(12px) skewX(4deg)', opacity: 1, offset: .3 }, { transform: 'translateX(-6px)', opacity: .5, offset: .5 },
          { transform: 'translateX(8px)', opacity: .9, offset: .7 }, { transform: 'none', opacity: 0 }], { duration: d, easing: 'steps(7, end)', fill: 'forwards' }); b.animate(under, { duration: d, fill: 'forwards', easing: 'steps(7, end)' }); break;
      }
      busy = setTimeout(function () { reset(); }, d + 900);
    }
    function render() { show(c, { targets: { 'com.android.systemui': { 'string/kami_back_style': s.style, 'integer/kami_back_duration': s.dur } } }); }
    host.appendChild(c.root);
    render();
  };

  // ================================================================== 7. a sound, made in the browser
  demos.sound = function (host) {
    var c = card('sounds are plain files', 'a preview made in the browser', true);
    var ctx = null, current = null;
    function audio() { if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } return ctx; }
    function tone(out, f, t0, decay, gain) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(gain, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + decay + 0.05);
    }
    function bell(out, f, t0, decay, gain, parts) {
      parts.forEach(function (p) { tone(out, f * p[0], t0, decay * p[1], gain * p[2]); });
    }
    var glassP = [[1, 1, 1], [2.01, .55, .35]];
    var tollP = [[1, 1, 1], [2.0, .62, .5], [2.76, .45, .35], [5.4, .3, .15]];
    var sounds = {
      glass: { name: 'Glass: notification', len: 1.4, key: 'notification', play: function (o, t) { bell(o, 880, t, 1.1, .5, glassP); bell(o, 1175, t + .14, .9, .4, glassP); } },
      toll: { name: 'Hollow toll: ringtone', len: 3.6, key: 'ringtone', play: function (o, t) { bell(o, 110, t, 3.2, .7, tollP); bell(o, 440, t + .7, 1.2, .25, glassP); bell(o, 523, t + 1.0, 1.2, .25, glassP); bell(o, 659, t + 1.3, 1.4, .25, glassP); } },
      knock: { name: 'Knock: touch', len: .2, key: 'touch', play: function (o, t) {
        tone(o, 190, t, .09, .8);
        var n = ctx.createBufferSource(), b = ctx.createBuffer(1, 4410, 44100), d = b.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = (Math.random() - .5) * Math.exp(-i / 500);
        n.buffer = b; var g = ctx.createGain(); g.gain.value = .5; n.connect(g); g.connect(o); n.start(t); } },
      beat: { name: 'Heartbeat: charging', len: 1.4, key: 'charging', play: function (o, t) { [0, .2, .9, 1.1].forEach(function (d, i) { tone(o, i % 2 ? 50 : 58, t + d, .22, .9); }); } }
    };
    var wave = h('canvas', { class: 'wave', width: 600, height: 56, 'aria-hidden': 'true' });
    var list = h('div', { class: 'snd' });
    var json = {};
    Object.keys(sounds).forEach(function (k) {
      var sd = sounds[k];
      var b = h('button', { type: 'button', class: 'chip', text: sd.name });
      b.addEventListener('click', function () {
        var a = audio();
        if (!a) return;
        if (a.state === 'suspended') a.resume();
        var master = a.createGain(); master.gain.value = .5;
        var an = a.createAnalyser(); an.fftSize = 512; master.connect(an); an.connect(a.destination);
        sd.play(master, a.currentTime + .02);
        b.classList.add('play'); setTimeout(function () { b.classList.remove('play'); }, sd.len * 1000);
        var buf = new Uint8Array(an.fftSize), g = wave.getContext('2d'), end = performance.now() + sd.len * 1000 + 200;
        (function frame(now) {
          an.getByteTimeDomainData(buf);
          g.clearRect(0, 0, 600, 56); g.strokeStyle = '#9a86ff'; g.lineWidth = 1.5; g.beginPath();
          for (var i = 0; i < buf.length; i++) { var x = i / buf.length * 600, y = buf[i] / 255 * 56; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
          g.stroke();
          if (now < end) requestAnimationFrame(frame); else g.clearRect(0, 0, 600, 56);
        })(performance.now());
        json = {}; json[sd.key] = { file: 'sounds/' + sd.key + '.ogg', title: sd.name.split(':')[0] };
        show(c, { sounds: json });
      });
      list.appendChild(b);
    });
    c.ctl.appendChild(list);
    c.ctl.appendChild(wave);
    c.ctl.appendChild(h('p', { class: 'note', text: 'These are made from sine waves while you listen. A module brings real audio files (.ogg, .wav, .mp3, .flac or .m4a) and names the slot they replace; the JSON below shows how.' }));
    host.appendChild(c.root);
    show(c, { sounds: { notification: { file: 'sounds/notification.ogg', title: 'Glass' }, ringtone: 'sounds/ring.ogg', touch: 'sounds/tick.wav' } });
  };

  // ================================================================== 8. every knob, searchable
  demos.knobs = function (host) {
    var node = document.getElementById('knobs-data');
    var rows = [];
    try { rows = JSON.parse(node.textContent); } catch (e) { rows = []; }
    var short = { 'com.android.systemui': 'system UI', 'com.android.settings': 'Settings', 'com.android.launcher3': 'launcher', android: 'framework' };
    var root = h('div');
    var inp = h('input', { type: 'search', placeholder: 'search the knobs: “slider”, “blur”, “duration”…', 'aria-label': 'Search the knobs' });
    var targets = ['', 'com.android.systemui', 'com.android.settings', 'com.android.launcher3', 'android'];
    var tsel = h('select', { 'aria-label': 'Filter by app' });
    targets.forEach(function (t) { tsel.appendChild(h('option', { value: t, text: t ? short[t] : 'all apps' })); });
    var groups = [];
    rows.forEach(function (r) { if (groups.indexOf(r[3]) < 0) groups.push(r[3]); });
    var gsel = h('select', { 'aria-label': 'Filter by group' });
    gsel.appendChild(h('option', { value: '', text: 'all groups' }));
    groups.forEach(function (g) { gsel.appendChild(h('option', { value: g, text: g })); });
    var count = h('span', { class: 'kn-count', 'aria-live': 'polite' });
    var tbody = h('tbody');
    var table = h('table', null, [h('thead', null, [h('tr', null, ['resource', 'kind', 'default', 'what'].map(function (t) { return h('th', { text: t }); }))]), tbody]);
    root.appendChild(h('div', { class: 'dh' }, [h('b', { text: 'every knob' }), h('span', { text: rows.length + ' resources a module can set' }), h('i', { text: 'click a name to copy it' })]));
    root.appendChild(h('div', { class: 'kn' }, [h('div', { class: 'kn-bar' }, [inp, tsel, gsel, count]), h('div', { class: 'tw' }, [table])]));
    var built = rows.map(function (r) {
      var tr = h('tr');
      var code = h('code', { text: r[1] });
      var cb = h('button', { type: 'button', class: 'kcopy', title: 'copy ' + r[1] + ' (' + r[0] + ')' }, [code]);
      cb.addEventListener('click', function () { if (navigator.clipboard) navigator.clipboard.writeText(r[1]); code.style.background = 'rgba(154,134,255,.4)'; count.textContent = 'copied ' + r[1]; setTimeout(function () { code.style.background = ''; filter(); }, 900); });
      tr.appendChild(h('td', null, [cb, h('small', { class: 'tg', html: short[r[0]] + ' · ' + r[3] + (r[7] ? ' · <span class="ut">untested</span>' : '') })]));
      tr.appendChild(h('td', { text: r[2] }));
      tr.appendChild(h('td', null, [h('code', { text: r[6] })]));
      tr.appendChild(h('td', null, [h('b', { text: r[4], style: 'font-weight:400;color:var(--fg)' }), h('small', { text: r[5] })]));
      tbody.appendChild(tr);
      return { tr: tr, text: (r[1] + ' ' + r[3] + ' ' + r[4] + ' ' + r[5] + ' ' + short[r[0]] + ' ' + r[2]).toLowerCase(), t: r[0], g: r[3] };
    });
    function filter() {
      var words = inp.value.toLowerCase().split(/\s+/).filter(Boolean), n = 0;
      built.forEach(function (b) {
        var ok = (!tsel.value || b.t === tsel.value) && (!gsel.value || b.g === gsel.value) && words.every(function (w) { return b.text.indexOf(w) >= 0; });
        b.tr.style.display = ok ? '' : 'none';
        if (ok) n++;
      });
      count.textContent = n + ' of ' + built.length;
    }
    inp.addEventListener('input', filter); tsel.addEventListener('change', filter); gsel.addEventListener('change', filter);
    window.guideKnobs = { find: function (term) { inp.value = term; tsel.value = ''; gsel.value = ''; filter(); } };
    host.appendChild(root);
    filter();
  };

  // ------------------------------------------------------------------ start the ones the page asks for
  var hosts = Array.prototype.slice.call(document.querySelectorAll('.demo[data-demo]'));
  hosts.forEach(function (el) { var f = demos[el.getAttribute('data-demo')]; if (f) { try { f(el); } catch (e) { if (window.console) console.error(e); } } });
})();
