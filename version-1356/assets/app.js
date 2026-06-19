(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-slide-to]'));
    let activeIndex = 0;
    let timer = null;

    const showSlide = (nextIndex) => {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === activeIndex);
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    };

    const startTimer = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.slideTo || 0));
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const getSearchText = (card) => {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.year,
      card.dataset.category,
      card.dataset.tags,
      card.textContent
    ].join(' ').toLowerCase();
  };

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const cards = Array.from(document.querySelectorAll('[data-card-list] .movie-card'));
    const input = filterPanel.querySelector('[data-filter-input]');
    const yearSelect = filterPanel.querySelector('[data-year-filter]');
    const categorySelect = filterPanel.querySelector('[data-category-filter]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    const applyFilters = () => {
      const keyword = (input?.value || '').trim().toLowerCase();
      const year = yearSelect?.value || '';
      const category = categorySelect?.value || '';

      cards.forEach((card) => {
        const text = getSearchText(card);
        const matchKeyword = !keyword || text.includes(keyword);
        const matchYear = !year || card.dataset.year === year;
        const matchCategory = !category || card.dataset.category === category;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchCategory));
      });
    };

    [input, yearSelect, categorySelect].forEach((element) => {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  const players = Array.from(document.querySelectorAll('.movie-player'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    let readyPromise = null;

    const loadStream = () => {
      if (!video) {
        return Promise.resolve();
      }

      if (readyPromise) {
        return readyPromise;
      }

      readyPromise = new Promise((resolve) => {
        const stream = video.dataset.stream;

        if (!stream) {
          resolve();
          return;
        }

        const finish = () => {
          resolve();
        };

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
          hls.on(window.Hls.Events.ERROR, finish);
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
          video.addEventListener('loadedmetadata', finish, { once: true });
          video.load();
          window.setTimeout(finish, 600);
        }
      });

      return readyPromise;
    };

    const playVideo = async () => {
      await loadStream();

      try {
        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        player.classList.remove('is-playing');
      }
    };

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', () => {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', () => {
        player.classList.remove('is-playing');
      });

      video.addEventListener('click', () => {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });
})();
