(function () {
  var searchEl = document.getElementById("my-garage-search");
  var wrappers = document.querySelectorAll(".my-garage-card-wrapper");
  var dropZones = document.querySelectorAll(".my-garage-column-cards");
  var draggedCard = null;
  var dropTargetClass = "my-garage-drop-target";

  if (!searchEl || !wrappers.length) return;

  function filter() {
    var q = (searchEl.value || "").trim().toLowerCase();
    wrappers.forEach(function (wrap) {
      var text = (wrap.getAttribute("data-searchable") || "").toLowerCase();
      wrap.classList.toggle("hidden", q && text.indexOf(q) === -1);
    });
  }

  searchEl.addEventListener("input", filter);
  searchEl.addEventListener("search", filter);
  filter();

  if (!dropZones.length) return;

  function clearDropTargets() {
    dropZones.forEach(function (zone) {
      zone.closest(".my-garage-column").classList.remove(dropTargetClass);
    });
  }

  wrappers.forEach(function (wrap) {
    wrap.addEventListener("dragstart", function (ev) {
      var card = ev.target.closest(".my-garage-card-wrapper");
      if (!card) return;
      draggedCard = card;
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", "");
      ev.dataTransfer.setDragImage(card, 0, 0);
      card.classList.add("opacity-50");
    });

    wrap.addEventListener("dragend", function (ev) {
      if (draggedCard) {
        draggedCard.classList.remove("opacity-50");
        draggedCard = null;
      }
      clearDropTargets();
    });
  });

  dropZones.forEach(function (zone) {
    zone.addEventListener("dragover", function (ev) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
      zone.closest(".my-garage-column").classList.add(dropTargetClass);
    });

    zone.addEventListener("dragleave", function (ev) {
      if (!zone.contains(ev.relatedTarget)) {
        zone.closest(".my-garage-column").classList.remove(dropTargetClass);
      }
    });

    zone.addEventListener("drop", function (ev) {
      ev.preventDefault();
      if (draggedCard && zone !== draggedCard.parentNode) {
        zone.appendChild(draggedCard);
        draggedCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        var cardEl = draggedCard.querySelector(".vehicle-item-card");
        if (cardEl) {
          cardEl.classList.add("attention-pulse");
          setTimeout(function () {
            cardEl.classList.remove("attention-pulse");
          }, 750);
        } else {
          draggedCard.classList.add("attention-pulse");
          setTimeout(function () {
            draggedCard.classList.remove("attention-pulse");
          }, 750);
        }
      }
      clearDropTargets();
    });
  });
})();
