(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.site-search, .large-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (!query) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var searchInput = panel.querySelector('[data-card-search]');
        var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-genre-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var activeGenre = 'all';

        function applyFilter() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var cardText = (card.getAttribute('data-search') || '').toLowerCase();
                var cardGenre = card.getAttribute('data-genre') || '';
                var matchText = !query || cardText.indexOf(query) !== -1;
                var matchGenre = activeGenre === 'all' || cardGenre === activeGenre;
                var show = matchText && matchGenre;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeGenre = button.getAttribute('data-genre-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    });
})();
