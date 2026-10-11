(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // a faint light follows the pointer (or the finger)
  var glow = document.querySelector('.glow');
  function move(x, y) {
    glow.style.setProperty('--x', x + 'px');
    glow.style.setProperty('--y', y + 'px');
  }
  window.addEventListener('pointermove', function (e) { move(e.clientX, e.clientY); }, { passive: true });

  // things appear as you reach them
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('seen'); });
  }

  // the mask blinks now and then, and answers when touched
  var mask = document.getElementById('mask');
  var whisper = document.getElementById('whisper');
  var hint = document.querySelector('.hint');

  function blink() {
    mask.classList.add('blink');
    setTimeout(function () { mask.classList.remove('blink'); }, 160);
    setTimeout(blink, 3500 + Math.random() * 7000);
  }
  if (!reduce) setTimeout(blink, 4000);

  // every so often the title, and sometimes the mask, tears for a moment
  var title = document.getElementById('title');
  var tears = document.getElementById('tears');
  var spookyTimer;
  // the background tears in a few thin bands and the light goes red
  function glitchBg() {
    root.classList.add('spooky');
    clearTimeout(spookyTimer);
    spookyTimer = setTimeout(function () { root.classList.remove('spooky'); }, 650);
    tears.textContent = '';
    var n = 2 + Math.floor(Math.random() * 4);
    for (var k = 0; k < n; k++) {
      var b = document.createElement('i');
      b.style.top = (Math.random() * 100) + '%';
      b.style.height = (2 + Math.random() * 38) + 'px';
      b.style.animationDelay = (Math.random() * 0.15) + 's';
      if (Math.random() < 0.4) b.className = 'r';
      tears.appendChild(b);
    }
    setTimeout(function () { tears.textContent = ''; }, 700);
  }
  function glitch() {
    var el = Math.random() < 0.3 ? mask : title;
    el.classList.add('glitch');
    glitchBg();
    setTimeout(function () { el.classList.remove('glitch'); }, 400);
    setTimeout(glitch, 5000 + Math.random() * 9000);
  }
  if (!reduce) setTimeout(glitch, 2500);
  // and sometimes only the background
  function lone() {
    glitchBg();
    setTimeout(lone, 8000 + Math.random() * 12000);
  }
  if (!reduce) setTimeout(lone, 7000);

  var lines = [
    'i do not speak.',
    'modules, not settings.',
    'a launcher can be anything.',
    'take only what you need.',
    'it is quieter than it looks.',
    'come closer.',
    'nothing is enabled until you say so.',
    '...'
  ];
  var at = -1;
  mask.addEventListener('click', function () {
    var next;
    do { next = Math.floor(Math.random() * lines.length); } while (next === at);
    at = next;
    if (hint) hint.style.display = 'none';
    mask.classList.add('speak');
    if (!reduce) { mask.classList.add('glitch'); glitchBg(); setTimeout(function () { mask.classList.remove('glitch'); }, 400); }
    whisper.classList.add('out');
    setTimeout(function () {
      whisper.textContent = lines[at];
      whisper.classList.remove('out');
      mask.classList.remove('speak');
    }, 450);
  });
})();
