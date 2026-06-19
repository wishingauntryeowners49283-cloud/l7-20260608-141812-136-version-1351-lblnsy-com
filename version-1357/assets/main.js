(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (timer) {
      clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(nextIndex);
      startHero();
    });
  });

  startHero();

  var filterInput = document.querySelector('[data-filter-input]');
  var filterType = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var type = filterType ? filterType.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || ''
      ].join(' ').toLowerCase();

      var typeValue = (card.getAttribute('data-type') || '').toLowerCase();
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedType = !type || typeValue.indexOf(type) !== -1;

      card.classList.toggle('is-hidden', !(matchedKeyword && matchedType));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterType) {
    filterType.addEventListener('change', applyFilter);
  }
})();
