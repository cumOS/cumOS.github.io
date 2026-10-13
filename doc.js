(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // the same faint light as on the front page
  var glow = $('.glow');
  window.addEventListener('pointermove', function (e) {
    glow.style.setProperty('--x', e.clientX + 'px');
    glow.style.setProperty('--y', e.clientY + 'px');
  }, { passive: true });

  var tabs = $$('.tab');
  var items = $$('.item');
  var itemFor = {};
  items.forEach(function (a) { itemFor[a.getAttribute('data-tab')] = a; });
  var current = null;
  var barTitle = $('#bar-title');
  var toc = $('#toc');
  var ind = $('#ind');
  var tree = $('#tree');
  var spy = null;
  var burger = $('#burger');
  var side = $('#side');

  // ------------------------------------------------------------------ the menu on narrow screens: open, close, focus
  function setNav(open, quiet, el) {
    var was = document.body.classList.contains('nav-open');
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
    if (open && !was) { var it = el || side.querySelector('.item.on') || q; setTimeout(function () { it.focus({ preventScroll: true }); }, 30); }
    if (!open && was && !quiet && side.contains(document.activeElement)) burger.focus();
  }

  // ------------------------------------------------------------------ code blocks: colour and a copy button
  function highlight(code) {
    var text = code.textContent;
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var out = esc(text).replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)|(\/\/[^\n]*|--[^\n]*)/g,
      function (m, str, colon, bool, num, cmt) {
        if (str) return colon ? '<span class="tk-k">' + str + '</span>' + colon : '<span class="tk-s">' + str + '</span>';
        if (bool) return '<span class="tk-b">' + bool + '</span>';
        if (num) return '<span class="tk-n">' + num + '</span>';
        if (cmt) return '<span class="tk-c">' + cmt + '</span>';
        return m;
      });
    code.innerHTML = out;
  }
  function addCopy(pre) {
    var code = pre.querySelector('code');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy'; b.textContent = 'copy';
    b.addEventListener('click', function () {
      var t = (code || pre).textContent;
      var done = function () { b.textContent = 'copied'; setTimeout(function () { b.textContent = 'copy'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done);
      else done();
    });
    pre.appendChild(b);
  }
  $$('.tab pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (code && /lang-(json|lua)/.test(code.className)) highlight(code);
    addCopy(pre);
  });
  window.guideUi = { highlight: highlight, addCopy: addCopy };

  // ------------------------------------------------------------------ the page indicator in the sidebar
  function placeInd(a) {
    if (!a || !ind) return;
    var y = 0, n = a;
    while (n && n !== tree) { y += n.offsetTop; n = n.offsetParent; }
    ind.style.height = Math.max(8, a.offsetHeight - 10) + 'px';
    ind.style.transform = 'translateY(' + (y + 5) + 'px)';
  }

  // ------------------------------------------------------------------ on this page
  var subnav = null;
  function buildToc(tab) {
    toc.textContent = '';
    if (subnav) { subnav.remove(); subnav = null; }
    var heads = $$('h2, h3', tab);
    if (heads.length < 2) return;
    subnav = document.createElement('div');
    subnav.className = 'subnav';
    if (itemFor[tab.id]) itemFor[tab.id].after(subnav);
    var h = document.createElement('h2');
    h.textContent = 'on this page';
    toc.appendChild(h);
    var links = [];
    heads.forEach(function (el) {
      var a = document.createElement('a');
      a.href = '#' + el.id;
      a.textContent = el.textContent;
      if (el.tagName === 'H3') a.className = 'sub';
      toc.appendChild(a);
      var b = a.cloneNode(true);
      subnav.appendChild(b);
      links.push([el, a, b]);
    });
    if (spy) spy.disconnect();
    if ('IntersectionObserver' in window) {
      spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (p) { p[1].classList.toggle('on', p[0] === en.target); p[2].classList.toggle('on', p[0] === en.target); });
        });
      }, { rootMargin: '-80px 0px -70% 0px' });
      links.forEach(function (p) { spy.observe(p[0]); });
    }
  }

  // ------------------------------------------------------------------ showing a tab
  function activate(tab, instant) {
    if (!tab || current === tab) return false;
    if (current) current.classList.remove('active', 'enter');
    tab.classList.add('active');
    current = tab;
    if (!reduce && !instant) {
      Array.prototype.forEach.call(tab.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 14)); });
      tab.classList.add('enter');
    }
    items.forEach(function (a) {
      a.classList.toggle('on', a === itemFor[tab.id]);
      if (a === itemFor[tab.id]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    buildToc(tab);
    placeInd(itemFor[tab.id]);
    var it = itemFor[tab.id];
    if (it) {
      var r = it.getBoundingClientRect();
      if (r.top < 120 || r.bottom > window.innerHeight - 40) it.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    }
    document.title = tab.getAttribute('data-title') + ' \u00b7 KamiOS modules';
    barTitle.textContent = tab.getAttribute('data-title');
    barTitle.classList.toggle('on', tab !== tabs[0]);
    document.dispatchEvent(new CustomEvent('guide:tab', { detail: tab }));
    return true;
  }

  function go(id, opts) {
    opts = opts || {};
    var el = id ? document.getElementById(id) : null;
    var tab = el ? (el.classList.contains('tab') ? el : el.closest('.tab')) : null;
    if (!tab) { tab = tabs[0]; el = null; }
    var changed = activate(tab, opts.instant);
    setNav(false, true);
    if (typeof opts.y === 'number') { window.scrollTo({ top: opts.y, behavior: 'auto' }); return; }
    var target = (el && el !== tab) ? el : null;
    if (opts.find) {
      var low = opts.find.toLowerCase();
      var cand = $$('h2, h3, p, li, td', tab).filter(function (n) { return n.textContent.toLowerCase().indexOf(low) >= 0; })[0];
      if (cand) { target = cand; markHit(cand, low); }
    }
    if (!opts.instant) {
      // the reader (and a screen reader) continues where the page went, not in the menu they left
      var f = target || tab.querySelector('.tab-title');
      if (f) { if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
    }
    if (target) {
      var scroll = function () { target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
      if (changed) setTimeout(scroll, 40); else scroll();
      if (/^H[23]$/.test(target.tagName)) { target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash'); }
    } else if (changed || opts.top) {
      window.scrollTo(0, 0);
    }
  }

  // the found word, marked for a moment
  function markHit(node, low) {
    var walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), t;
    while ((t = walk.nextNode())) {
      var i = t.data.toLowerCase().indexOf(low);
      if (i < 0) continue;
      var m = document.createElement('mark');
      m.className = 'hit';
      var rest = t.splitText(i);
      rest.splitText(low.length);
      rest.parentNode.replaceChild(m, rest);
      m.appendChild(rest);
      setTimeout(function () { var p = m.parentNode; if (p) { p.replaceChild(m.firstChild, m); p.normalize(); } }, 2600);
      return;
    }
  }

  function route(first) {
    var id = decodeURIComponent(location.hash.replace(/^#/, ''));
    var st = history.state;
    go(id, { instant: first, y: !first && st && typeof st.y === 'number' ? st.y : undefined });
  }
  window.addEventListener('hashchange', function () { route(false); });
  route(true);

  // ------------------------------------------------------------------ the menu on narrow screens
  burger.addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  $('#scrim').addEventListener('click', function () { setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setNav(false); });
  var replace = function () { placeInd(itemFor[current && current.id]); };
  window.addEventListener('resize', replace);
  window.addEventListener('load', replace);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(replace);

  // ------------------------------------------------------------------ search
  var q = $('#q');
  var results = $('#results');
  var index = tabs.map(function (t) {
    return { id: t.id, title: t.getAttribute('data-title'), text: t.textContent.replace(/\s+/g, ' '), heads: $$('h2, h3', t).map(function (h) { return h.textContent; }) };
  });
  var cur = -1;

  function snippet(text, term) {
    var i = text.toLowerCase().indexOf(term);
    if (i < 0) return '';
    var a = Math.max(0, i - 50), b = Math.min(text.length, i + term.length + 90);
    var s = (a ? '\u2026' : '') + text.slice(a, b) + (b < text.length ? '\u2026' : '');
    var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(re, '<mark>$1</mark>');
  }
  function search() {
    var term = q.value.trim().toLowerCase();
    results.textContent = '';
    cur = -1;
    if (term.length < 2) { results.hidden = true; tree.hidden = false; return; }
    var words = term.split(/\s+/);
    var hits = index.map(function (t) {
      var low = t.text.toLowerCase();
      var score = 0;
      for (var w = 0; w < words.length; w++) {
        if (low.indexOf(words[w]) < 0) return null;
        score += 1 + (t.title.toLowerCase().indexOf(words[w]) >= 0 ? 12 : 0)
          + t.heads.filter(function (h) { return h.toLowerCase().indexOf(words[w]) >= 0; }).length * 4
          + Math.min(8, low.split(words[w]).length - 1) * 0.3;
      }
      return { t: t, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
    results.hidden = false;
    tree.hidden = true;
    var kh = knobHits(words);
    if (!hits.length && !kh.length) { results.innerHTML = '<p class="none">nothing found</p>'; return; }
    hits.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.t.id;
      a.innerHTML = '<b>' + h.t.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</b><small>' + snippet(h.t.text, words[0]) + '</small>';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        history.replaceState({ y: window.scrollY }, '');
        history.pushState(null, '', '#' + h.t.id);
        go(h.t.id, { find: words[0], top: true });
        q.value = ''; search();
      });
      results.appendChild(a);
    });
    kh.forEach(function (k) {
      var a = document.createElement('a');
      a.href = '#knob-reference';
      a.innerHTML = '<b>knob \u00b7 <code>' + k[1].replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</code></b><small>' + (k[4] + ': ' + k[5]).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</small>';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        history.replaceState({ y: window.scrollY }, '');
        history.pushState(null, '', '#knob-reference');
        go('knob-reference', { top: true });
        if (window.guideKnobs) window.guideKnobs.find(k[1]);
        q.value = ''; search();
      });
      results.appendChild(a);
    });
  }
  // every knob of knobs.json, also the ones the text does not name
  var knobRows = [];
  try { knobRows = JSON.parse(document.getElementById('knobs-data').textContent); } catch (e) { knobRows = []; }
  function knobHits(words) {
    return knobRows.filter(function (r) {
      var t = (r[1] + ' ' + r[4] + ' ' + r[5]).toLowerCase();
      return words.every(function (w) { return t.indexOf(w) >= 0; });
    }).slice(0, 6);
  }
  q.addEventListener('input', search);
  q.addEventListener('keydown', function (e) {
    var links = $$('a', results);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!links.length) return;
      e.preventDefault();
      cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach(function (l, i) { l.classList.toggle('cur', i === cur); });
    } else if (e.key === 'Enter') {
      var l = links[cur < 0 ? 0 : cur];
      if (l) l.click();
    } else if (e.key === 'Escape') { q.value = ''; search(); q.blur(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      if (window.innerWidth <= 900) setNav(true, false, q);
      q.focus();
    }
  });

  // a link to the page you are on (same address) still scrolls
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.closest('#results')) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (a.classList.contains('skip')) { e.preventDefault(); var t = current && current.querySelector('.tab-title'); if (t) { t.setAttribute('tabindex', '-1'); t.focus(); } return; }
    history.replaceState({ y: window.scrollY }, '');
    if (id && location.hash === '#' + id) { e.preventDefault(); go(id, {}); }
  });
})();
