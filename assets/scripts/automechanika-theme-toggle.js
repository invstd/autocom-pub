// Sidebar footer light/dark toggle (automechanika-sidebar.njk) — flips the CURRENT brand's own
// Light/Dark variant rather than offering the full theme list (that stays in Settings, now
// brand-only — see settings.njk). Theme names are literally "<Brand> Light" / "<Brand> Dark" (see
// main.css), so the brand is just whatever prefix is already set; this only ever changes the
// trailing Light/Dark word.
//
// Also persists the chosen mode to its own key ('theme-mode') — this is what lets Settings'
// brand-only picker (and a Test Link's brand-only ?theme= param, see base.njk) apply "whichever
// mode was last selected" instead of resetting to a fixed one every time the brand changes.
//
// Same localStorage key ('theme') and data-theme attribute Settings' own Branding <select> uses
// (settings.njk) — both dispatch 'automechanika-theme-changed' on document after changing it, and
// both listen for that event, so switching the theme from either control updates the other
// immediately if they're both on screen (only true on the Settings page itself, since the sidebar
// persists across every page but the <select> only lives there).
(function () {
  var THEME_KEY = 'theme';
  var THEME_MODE_KEY = 'theme-mode';
  var row = document.getElementById('automechanika-theme-toggle');
  var input = document.getElementById('automechanika-theme-toggle-input');
  var label = document.getElementById('automechanika-theme-toggle-label');
  if (!row || !input || !label) return;

  function parseTheme(name) {
    var m = /^(.+) (Light|Dark)$/.exec(name || '');
    return m ? { brand: m[1], mode: m[2] } : null;
  }

  function currentTheme() {
    return localStorage.getItem(THEME_KEY) || document.documentElement.getAttribute('data-theme') || 'Hi-Tech';
  }

  // Hi-Tech (this app's own default look, not a customer brand) has no Light/Dark pair to flip
  // between — disable the row rather than pretending there's something to toggle.
  function sync() {
    var parsed = parseTheme(currentTheme());
    if (!parsed) {
      row.classList.add('opacity-50', 'pointer-events-none');
      row.setAttribute('aria-disabled', 'true');
      row.title = 'This theme has no light/dark variant';
      label.textContent = 'Light/dark';
      return;
    }
    row.classList.remove('opacity-50', 'pointer-events-none');
    row.removeAttribute('aria-disabled');
    row.removeAttribute('title');
    input.checked = parsed.mode === 'Dark';
    label.textContent = parsed.mode === 'Dark' ? 'Dark mode' : 'Light mode';
  }

  input.addEventListener('change', function () {
    var parsed = parseTheme(currentTheme());
    if (!parsed) { sync(); return; }
    var mode = input.checked ? 'Dark' : 'Light';
    var next = parsed.brand + ' ' + mode;
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    localStorage.setItem(THEME_MODE_KEY, mode);
    sync();
    document.dispatchEvent(new CustomEvent('automechanika-theme-changed', { detail: { theme: next } }));
  });

  document.addEventListener('automechanika-theme-changed', sync);

  sync();
})();
