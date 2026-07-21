/**
 * Welcome screen: rotates the tagline copy under "Welcome" and syncs the dot indicators.
 */
(function () {
  var taglineEl = document.getElementById('welcome-tagline');
  var dots = document.querySelectorAll('#welcome-tagline-dots [data-dot]');
  if (!taglineEl || !dots.length) return;

  var TAGLINES = [
    'Access thousands of vehicle systems with fast, secure diagnostics — always up to date.',
    'Guided, step-by-step setup — from install to your first scan in minutes.',
    'Reliable VCI connection, with clear guidance if something goes wrong.',
    'Secure, verified accounts protect your data and your vehicle.'
  ];
  var ROTATE_MS = 4000;
  var FADE_MS = 300;
  var index = 0;

  function setActiveDot(i) {
    dots.forEach(function (dot) {
      var isActive = parseInt(dot.getAttribute('data-dot'), 10) === i;
      dot.classList.toggle('bg-white', isActive);
      dot.classList.toggle('bg-white/40', !isActive);
    });
  }

  function next() {
    taglineEl.style.opacity = '0';
    setTimeout(function () {
      index = (index + 1) % TAGLINES.length;
      taglineEl.textContent = TAGLINES[index];
      setActiveDot(index);
      taglineEl.style.opacity = '1';
    }, FADE_MS);
  }

  setInterval(next, ROTATE_MS);
})();
