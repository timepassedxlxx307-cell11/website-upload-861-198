(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function setupSearchForms() {
    qsa('form.top-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupFilters() {
    var list = qs('[data-filter-list]');
    if (!list) {
      return;
    }
    var cards = qsa('[data-title]', list);
    var input = qs('[data-filter-input]');
    var region = qs('[data-filter-region]');
    var year = qs('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = !regionValue || normalize(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        card.classList.toggle('is-hidden-card', !(matchesKeyword && matchesRegion && matchesYear));
      });
    }

    [input, region, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
}());
