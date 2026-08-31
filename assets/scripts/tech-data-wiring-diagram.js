(function () {
  "use strict";
  // Zoom + fullscreen for the Wiring Diagrams preview modal (tech-data-preview-modal.njk). The
  // other five Technical Data preview modals are static — this is the one with real content
  // (an actual diagram) worth interacting with, see that file's header comment.
  var dialog = document.querySelector("[data-tech-data-diagram-dialog]");
  if (!dialog) return;

  var ZOOM_MIN = 1;
  var ZOOM_MAX = 2;
  var ZOOM_STEP = 0.25;
  var zoom = 1;

  var zoomEl = dialog.querySelector("[data-tech-data-diagram-zoom]");
  var zoomOutBtn = dialog.querySelector("[data-tech-data-zoom-out]");
  var zoomInBtn = dialog.querySelector("[data-tech-data-zoom-in]");
  var zoomLevelEl = dialog.querySelector("[data-tech-data-zoom-level]");

  function applyZoom() {
    if (zoomEl) zoomEl.style.transform = "scale(" + zoom + ")";
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(zoom * 100) + "%";
    if (zoomOutBtn) zoomOutBtn.disabled = zoom <= ZOOM_MIN;
    if (zoomInBtn) zoomInBtn.disabled = zoom >= ZOOM_MAX;
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      zoom = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
      applyZoom();
    });
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      zoom = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
      applyZoom();
    });
  }

  var box = dialog.querySelector("[data-tech-data-diagram-box]");
  var fullscreenToggle = dialog.querySelector("[data-tech-data-diagram-fullscreen-toggle]");
  var expandIcon = dialog.querySelector("[data-tech-data-fullscreen-icon-expand]");
  var collapseIcon = dialog.querySelector("[data-tech-data-fullscreen-icon-collapse]");

  function setFullscreen(on) {
    if (box) box.classList.toggle("tech-data-diagram-fullscreen", on);
    if (expandIcon) expandIcon.classList.toggle("hidden", on);
    if (collapseIcon) collapseIcon.classList.toggle("hidden", !on);
    if (fullscreenToggle) fullscreenToggle.setAttribute("aria-label", on ? "Collapse" : "Expand");
  }

  if (fullscreenToggle) {
    fullscreenToggle.addEventListener("click", function () {
      setFullscreen(box && !box.classList.contains("tech-data-diagram-fullscreen"));
    });
  }

  // Reset to a known state each time the modal is reopened, rather than persisting zoom/fullscreen
  // across visits — the dialog element itself isn't recreated between opens.
  dialog.addEventListener("close", function () {
    zoom = 1;
    applyZoom();
    setFullscreen(false);
  });

  applyZoom();
})();
