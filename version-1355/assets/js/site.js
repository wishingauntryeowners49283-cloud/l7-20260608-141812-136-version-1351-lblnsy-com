(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

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
      showSlide(Number(dot.getAttribute('data-target')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindFilter(input) {
    var grid = input.closest('main').querySelector('.searchable-grid');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter(value) {
      var keyword = normalize(value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        card.classList.toggle('is-filtered-out', keyword && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener('input', function () {
      applyFilter(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && !input.value) {
      input.value = query;
      applyFilter(query);
    }

    var clear = document.querySelector('[data-clear-search]');

    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        applyFilter('');
        input.focus();
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.card-filter')).forEach(bindFilter);

  Array.prototype.slice.call(document.querySelectorAll('[data-year]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var input = document.querySelector('.card-filter');

      if (input) {
        input.value = button.getAttribute('data-year') || '';
        input.dispatchEvent(new Event('input'));
      }
    });
  });
})();
