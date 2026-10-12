(function () {
  // a quiet visit count in the footer. Tally API, a free counter that needs no account.
  // https://github.com/xueelf/tally-api
  var out = document.getElementById('visit-count');
  if (!out) return;

  var ns = 'kumiaomi';
  var res = 'site';

  fetch('https://tally.yuki.sh/hits/' + ns + '/' + res + '.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { out.textContent = data.visit.toLocaleString('en-US'); })
    .catch(function () { out.textContent = 'many'; });
})();