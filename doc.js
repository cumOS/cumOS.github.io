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
  function buildToc(tab) {
    toc.textContent = '';
    var heads = $$('h2, h3', tab);
    if (heads.length < 2) return;
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
      links.push([el, a]);
    });
    if (spy) spy.disconnect();
    if ('IntersectionObserver' in window) {
      spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (p) { p[1].classList.toggle('on', p[0] === en.target); });
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
    items.forEach(function (a) { a.classList.toggle('on', a === itemFor[tab.id]); });
    placeInd(itemFor[tab.id]);
    var it = itemFor[tab.id];
    if (it) {
      var r = it.getBoundingClientRect();
      if (r.top < 120 || r.bottom > window.innerHeight - 40) it.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    }
    document.title = tab.getAttribute('data-title') + ' \u00b7 KamiOS modules';
    barTitle.textContent = tab.getAttribute('data-title');
    barTitle.classList.toggle('on', tab !== tabs[0]);
    buildToc(tab);
    document.dispatchEvent(new CustomEvent('guide:tab', { detail: tab }));
    return true;
  }

  function go(id, opts) {
    opts = opts || {};
    var el = id ? document.getElementById(id) : null;
    var tab = el ? (el.classList.contains('tab') ? el : el.closest('.tab')) : null;
    if (!tab) { tab = tabs[0]; el = null; }
    var changed = activate(tab, opts.instant);
    document.body.classList.remove('nav-open');
    $('#burger').setAttribute('aria-expanded', 'false');
    var target = (el && el !== tab) ? el : null;
    if (opts.find) {
      var low = opts.find.toLowerCase();
      var cand = $$('h2, h3, p, li, td', tab).filter(function (n) { return n.textContent.toLowerCase().indexOf(low) >= 0; })[0];
      if (cand) target = cand;
    }
    if (target) {
      var scroll = function () { target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
      if (changed) setTimeout(scroll, 40); else scroll();
      if (/^H[23]$/.test(target.tagName)) { target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash'); }
    } else if (changed || opts.top) {
      window.scrollTo(0, 0);
    }
  }

  function route(first) {
    var id = decodeURIComponent(location.hash.replace(/^#/, ''));
    go(id, { instant: first });
  }
  window.addEventListener('hashchange', function () { route(false); });
  route(true);

  // ------------------------------------------------------------------ the menu on narrow screens
  var burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $('#scrim').addEventListener('click', function () { document.body.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); });
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
    if (!hits.length) { results.innerHTML = '<p class="none">nothing found</p>'; return; }
    hits.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.t.id;
      a.innerHTML = '<b>' + h.t.title.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</b><small>' + snippet(h.t.text, words[0]) + '</small>';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        history.replaceState(null, '', '#' + h.t.id);
        go(h.t.id, { find: words[0], top: true });
        q.value = ''; search();
      });
      results.appendChild(a);
    });
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
      if (window.innerWidth <= 900) document.body.classList.add('nav-open');
      q.focus();
    }
  });

  // a link to the page you are on (same address) still scrolls
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.closest('#results')) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (id && location.hash === '#' + id) { e.preventDefault(); go(id, {}); }
  });
})();
