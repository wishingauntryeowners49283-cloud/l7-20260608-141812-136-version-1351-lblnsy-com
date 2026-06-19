import { H as Hls } from './hls.js';

const state = {
    year: 'all',
    type: 'all',
    category: 'all',
    query: ''
};

function normalize(text) {
    return String(text || '').trim().toLowerCase();
}

function initNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
}

function initHeroCarousel() {
    const root = document.querySelector('[data-hero-carousel]');
    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dotsWrap = root.querySelector('[data-hero-dots]');
    if (slides.length <= 1 || !dotsWrap) {
        return;
    }

    let current = 0;
    const dots = slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `切换到第 ${index + 1} 个推荐`);
        dot.addEventListener('click', () => show(index));
        dotsWrap.appendChild(dot);
        return dot;
    });

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    show(0);
    window.setInterval(() => show(current + 1), 5200);
}

function initFilters() {
    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
    if (!panels.length) {
        return;
    }

    panels.forEach(panel => {
        const section = panel.closest('section') || document;
        const cards = Array.from(section.querySelectorAll('[data-movie-card]'));
        const count = panel.querySelector('[data-result-count]');
        const search = panel.querySelector('[data-search-input]');
        const localState = { ...state };

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');
        if (initialQuery && search) {
            search.value = initialQuery;
            localState.query = normalize(initialQuery);
        }

        function setActive(selector, attr, value) {
            panel.querySelectorAll(selector).forEach(button => {
                button.classList.toggle('active', button.getAttribute(attr) === value);
            });
        }

        function apply() {
            let visible = 0;
            cards.forEach(card => {
                const blob = normalize(card.dataset.search);
                const year = card.dataset.year || '';
                const type = card.dataset.type || '';
                const category = card.dataset.category || '';
                const matchesQuery = !localState.query || blob.includes(localState.query);
                const matchesYear = localState.year === 'all' || year === localState.year;
                const matchesType = localState.type === 'all' || type === localState.type;
                const matchesCategory = localState.category === 'all' || category === localState.category;
                const isVisible = matchesQuery && matchesYear && matchesType && matchesCategory;
                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        if (search) {
            search.addEventListener('input', () => {
                localState.query = normalize(search.value);
                apply();
            });
        }

        panel.querySelectorAll('[data-filter-year]').forEach(button => {
            button.addEventListener('click', () => {
                localState.year = button.dataset.filterYear || 'all';
                setActive('[data-filter-year]', 'data-filter-year', localState.year);
                apply();
            });
        });

        panel.querySelectorAll('[data-filter-type]').forEach(button => {
            button.addEventListener('click', () => {
                localState.type = button.dataset.filterType || 'all';
                setActive('[data-filter-type]', 'data-filter-type', localState.type);
                apply();
            });
        });

        panel.querySelectorAll('[data-filter-category]').forEach(button => {
            button.addEventListener('click', () => {
                localState.category = button.dataset.filterCategory || 'all';
                setActive('[data-filter-category]', 'data-filter-category', localState.category);
                apply();
            });
        });

        apply();
    });
}

function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(player => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const message = player.querySelector('[data-player-message]');
        const source = player.dataset.source;
        let hls = null;
        let started = false;

        if (!video || !button || !source) {
            return;
        }

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add('show');
        }

        function attachSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        showMessage('视频网络加载异常，正在尝试重新连接。');
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        showMessage('媒体解码异常，正在尝试恢复播放。');
                        hls.recoverMediaError();
                    } else {
                        showMessage('当前浏览器无法继续播放该视频。');
                        hls.destroy();
                    }
                });
                return;
            }

            showMessage('当前浏览器不支持 HLS 播放，请更换浏览器访问。');
        }

        async function startPlayback() {
            if (!started) {
                attachSource();
                started = true;
            }
            player.classList.add('playing');
            try {
                await video.play();
            } catch (error) {
                showMessage('浏览器已阻止自动播放，请再次点击播放器开始播放。');
                player.classList.remove('playing');
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('play', () => player.classList.add('playing'));
        video.addEventListener('pause', () => {
            if (!video.ended) {
                return;
            }
            player.classList.remove('playing');
        });
    });
}

function initSearchLinks() {
    document.querySelectorAll('[data-global-search]').forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            const input = form.querySelector('input[type="search"]');
            const query = input ? input.value.trim() : '';
            const prefix = form.dataset.prefix || '';
            window.location.href = `${prefix}search.html?q=${encodeURIComponent(query)}`;
        });
    });
}

initNavigation();
initHeroCarousel();
initFilters();
initPlayers();
initSearchLinks();
