// Generic "clear (x)" affordance for any text/search input, loaded once in the shared
// Automechanika layout so it applies to every current and future filter field automatically —
// no per-page script tag or per-field JS to remember. Shows a small clear button once the field
// has a value; clicking it empties the field, refocuses it, and dispatches a real `input` event
// so whatever search/filter logic is already listening for that event re-runs on its own. That
// last part is the easy mistake in a hand-rolled clear button: the field looks empty but a filter
// bound only to the visible text stays applied until the user types again.
//
// Markup contract — wrap the input and its clear button in one element carrying
// [data-clearable-input]:
//   <label data-clearable-input class="input input-bordered ...">
//     {{ icon.icon("search", "...") }}
//     <input type="text" class="grow" ... />
//     <button type="button" data-clear-input class="hidden ..." aria-label="Clear search">
//       {{ icon.icon("close", "w-4 h-4") }}
//     </button>
//   </label>
(function () {
  document.querySelectorAll('[data-clearable-input]').forEach(function (wrapper) {
    var input = wrapper.querySelector('input');
    var clearBtn = wrapper.querySelector('[data-clear-input]');
    if (!input || !clearBtn) return;

    function update() {
      clearBtn.classList.toggle('hidden', !input.value.length);
    }

    input.addEventListener('input', update);
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      input.value = '';
      input.focus();
      update();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    update();
  });
})();
