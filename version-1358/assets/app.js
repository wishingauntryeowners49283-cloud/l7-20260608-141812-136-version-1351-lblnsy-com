(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    if (!input && !chips.length) {
      return;
    }
    var chipValue = '';
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var matchText = !q || text.indexOf(q) !== -1;
        var matchChip = !chipValue || text.indexOf(chipValue.toLowerCase()) !== -1;
        card.classList.toggle('hidden-card', !(matchText && matchChip));
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        chipValue = chip.getAttribute('data-filter-chip') || '';
        apply();
      });
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var shade = shell.querySelector('.player-shade');
      var stream = shell.getAttribute('data-stream');
      var loaded = false;
      var hls = null;
      if (!video || !shade || !stream) {
        return;
      }
      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
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
      }
      function play() {
        attach();
        shell.classList.add('playing');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }
      shade.addEventListener('click', play);
      shade.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          play();
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    if (!root || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function render() {
      var q = input.value.trim().toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.line].join(' ').toLowerCase();
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 160);
      if (!list.length) {
        root.innerHTML = '<div class="content-panel"><h2>未找到相关影视作品</h2><p>可以尝试更换关键词，或进入分类频道继续浏览。</p></div>';
        return;
      }
      root.innerHTML = list.map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<div><h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</p>' +
          '<p>' + escapeHtml(item.line) + '</p></div></a>';
      }).join('');
    }
    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }
    input.addEventListener('input', render);
    var button = document.querySelector('.search-submit');
    if (button) {
      button.addEventListener('click', render);
    }
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
