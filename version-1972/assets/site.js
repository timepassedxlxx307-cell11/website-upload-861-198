(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      mobileNav.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(nextSlide, 5000);
  }

  function resetHeroTimer() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }

    startHeroTimer();
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      resetHeroTimer();
    });
  });

  var prevButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      resetHeroTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      resetHeroTimer();
    });
  }

  showSlide(0);
  startHeroTimer();

  var filterInput = document.querySelector('.js-filter-input');
  var filterYear = document.querySelector('.js-filter-year');
  var filterType = document.querySelector('.js-filter-type');
  var filterReset = document.querySelector('.js-filter-reset');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.js-filter-card'));
  var filterEmpty = document.querySelector('.filter-empty');

  function getText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function runFilter() {
    if (!filterCards.length) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';
    var type = filterType ? filterType.value : '';
    var visible = 0;

    filterCards.forEach(function (card) {
      var content = getText(card);
      var matchQuery = !query || content.indexOf(query) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchType = !type || card.getAttribute('data-type') === type;
      var show = matchQuery && matchYear && matchType;
      card.hidden = !show;

      if (show) {
        visible += 1;
      }
    });

    if (filterEmpty) {
      filterEmpty.hidden = visible !== 0;
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', runFilter);
  }

  if (filterYear) {
    filterYear.addEventListener('change', runFilter);
  }

  if (filterType) {
    filterType.addEventListener('change', runFilter);
  }

  if (filterReset) {
    filterReset.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }

      if (filterYear) {
        filterYear.value = '';
      }

      if (filterType) {
        filterType.value = '';
      }

      runFilter();
    });
  }

  runFilter();

  function initPlayer(container) {
    var video = container.querySelector('video');
    var button = container.querySelector('.js-play-button');

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function attachStream() {
      if (ready || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function startVideo() {
      attachStream();
      container.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          container.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', startVideo);
    video.addEventListener('click', attachStream);
    video.addEventListener('play', function () {
      container.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        container.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(initPlayer);

  var searchInput = document.querySelector('.js-search-input');
  var searchResults = document.querySelector('.js-search-results');
  var searchForm = document.querySelector('.js-search-form');

  function cardForMovie(movie) {
    return [
      '<article class="movie-card compact-card">',
      '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="card-tags"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch() {
    if (!searchInput || !searchResults || !window.SITE_MOVIE_INDEX) {
      return;
    }

    var query = searchInput.value.trim().toLowerCase();
    var list = window.SITE_MOVIE_INDEX.filter(function (movie) {
      if (!query) {
        return true;
      }

      return [movie.title, movie.year, movie.type, movie.region, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase().indexOf(query) !== -1;
    }).slice(0, 72);

    if (!list.length) {
      searchResults.innerHTML = '<p class="filter-empty">没有找到匹配影片。</p>';
      return;
    }

    searchResults.innerHTML = '<div class="movie-grid dense-grid">' + list.map(cardForMovie).join('') + '</div>';
  }

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      searchInput.value = q;
    }

    searchInput.addEventListener('input', renderSearch);

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch();
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('q', searchInput.value.trim());
        window.history.replaceState({}, '', nextUrl.toString());
      });
    }

    renderSearch();
  }
}());
