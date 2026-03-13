/**
 * Splash page: particles moving from random outer positions toward the center
 * (black-hole effect). New particles spawn continuously as others reach the center.
 */
(function () {
  var container = document.querySelector(".splash-particles");
  if (!container) return;

  var PARTICLE_COUNT = 35;
  var MIN_DISTANCE = 45;  // vmin from center
  var MAX_DISTANCE = 85;
  var MIN_DURATION = 1.8;
  var MAX_DURATION = 3.2;
  var MAX_STAGGER = 0.4;  // max delay (s) so they don't all spawn at once

  function randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function createParticle() {
    var angle = Math.random() * 2 * Math.PI;
    var distance = randomInRange(MIN_DISTANCE, MAX_DISTANCE);
    var startX = Math.cos(angle) * distance;
    var startY = Math.sin(angle) * distance;
    var duration = randomInRange(MIN_DURATION, MAX_DURATION);
    var delay = Math.random() * MAX_STAGGER;

    var span = document.createElement("span");
    span.className = "splash-particle";
    span.style.setProperty("--start-x", startX.toFixed(2) + "vmin");
    span.style.setProperty("--start-y", startY.toFixed(2) + "vmin");
    span.style.setProperty("--duration", duration.toFixed(2) + "s");
    span.style.setProperty("--delay", delay.toFixed(2) + "s");

    function onEnd() {
      span.removeEventListener("animationend", onEnd);
      span.remove();
      var next = createParticle();
      container.appendChild(next);
    }
    span.addEventListener("animationend", onEnd);
    return span;
  }

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    container.appendChild(createParticle());
  }
})();
