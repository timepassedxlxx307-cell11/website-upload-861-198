(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) {
      return;
    }

    var input = document.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var empty = document.querySelector("[data-empty-state]");

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var activeFilters = selects.map(function (select) {
        return {
          key: select.getAttribute("data-filter-key"),
          value: normalize(select.value)
        };
      }).filter(function (item) {
        return item.value;
      });
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var filterMatch = activeFilters.every(function (item) {
          return normalize(card.getAttribute("data-" + item.key)).indexOf(item.value) !== -1;
        });
        var shouldShow = keywordMatch && filterMatch;

        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    apply();
  }

  ready(function () {
    initNav();
    initHero();
    initFilters();
  });
}());
