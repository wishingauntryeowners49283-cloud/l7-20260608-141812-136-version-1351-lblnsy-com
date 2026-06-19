(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalizeText(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-slide'), 10);
        show(index);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5500);
  }

  function setupSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.querySelector('.filter-input');
    if (input && query) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    }
  }

  function setupFiltering() {
    var list = document.querySelector('.filter-list');
    if (!list) {
      return;
    }
    var input = document.querySelector('.filter-input');
    var year = document.querySelector('.filter-year');
    var region = document.querySelector('.filter-region');
    var reset = document.querySelector('.filter-reset');
    var empty = document.querySelector('.empty-state');
    var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-card'));

    function apply() {
      var keyword = normalizeText(input && input.value);
      var selectedYear = normalizeText(year && year.value);
      var selectedRegion = normalizeText(region && region.value);
      var visible = 0;
      items.forEach(function (item) {
        var text = normalizeText([
          item.getAttribute('data-title'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.textContent
        ].join(' '));
        var itemYear = normalizeText(item.getAttribute('data-year'));
        var itemRegion = normalizeText(item.getAttribute('data-region'));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || itemYear === selectedYear;
        var matchRegion = !selectedRegion || itemRegion.indexOf(selectedRegion) !== -1;
        var show = matchKeyword && matchYear && matchRegion;
        item.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;
      function start() {
        if (!video || !stream) {
          return;
        }
        player.classList.add('is-playing');
        if (!player.getAttribute('data-ready')) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            player._hls = hlsInstance;
          } else {
            video.src = stream;
          }
          player.setAttribute('data-ready', '1');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove('is-playing');
          }
        });
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
    setupSearchQuery();
    setupPlayers();
  });
})();
