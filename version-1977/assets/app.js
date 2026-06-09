(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        play();
      });
    });

    slider.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var items = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
    if (!input || items.length === 0) {
      return;
    }

    function applyFilter() {
      var keyword = normalize(input.value);
      var kind = select ? normalize(select.value) : '';
      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags')
        ].join(' '));
        var typeValue = normalize(item.getAttribute('data-type'));
        var matchText = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = !kind || typeValue.indexOf(kind) !== -1 || haystack.indexOf(kind) !== -1;
        item.classList.toggle('hidden-by-filter', !(matchText && matchType));
      });
    }

    input.addEventListener('input', applyFilter);
    if (select) {
      select.addEventListener('change', applyFilter);
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('play-toggle');
    if (!video || !button || !source) {
      return;
    }
    var hlsInstance = null;
    var initialized = false;

    function attachSource() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      button.classList.add('is-hidden');
      var playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
