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

    function installMobileMenu() {
        var button = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function installHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    }

    function installFilters() {
        qsa('[data-filter-root]').forEach(function (root) {
            var input = qs('[data-filter-input]', root);
            var typeSelect = qs('[data-filter-type]', root);
            var yearSelect = qs('[data-filter-year]', root);
            var cards = qsa('[data-search-card]', root);
            var empty = qs('[data-filter-empty]', root);

            function apply() {
                var query = normalize(input ? input.value : '');
                var type = normalize(typeSelect ? typeSelect.value : '');
                var year = normalize(yearSelect ? yearSelect.value : '');
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search-text'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input && !input.value) {
                input.value = q;
            }

            apply();
        });
    }

    window.setupPlayer = function (videoUrl, videoId, layerId) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var hlsInstance = null;
        var ready = false;

        if (!video || !videoUrl) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = videoUrl;
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var played = video.play();
            if (played && typeof played.catch === 'function') {
                played.catch(function () {});
            }
        }

        attach();

        if (layer) {
            layer.addEventListener('click', play);
            layer.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    play();
                }
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        installMobileMenu();
        installHero();
        installFilters();
    });
}());
