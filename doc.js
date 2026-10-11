(function () {
  // the same faint light as on the front page
  var glow = document.querySelector('.glow');
  window.addEventListener('pointermove', function (e) {
    glow.style.setProperty('--x', e.clientX + 'px');
    glow.style.setProperty('--y', e.clientY + 'px');
  }, { passive: true });
})();
