(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length < 2) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    scopes.forEach(function (scope) {
      var section = scope.closest("section") || document;
      var input = section.querySelector(".card-filter");
      var year = section.querySelector(".year-filter");
      var type = section.querySelector(".type-filter");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = section.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (input && initial && document.body.classList.contains("page-search")) {
        input.value = initial;
      }

      function matchYear(card, filter) {
        var value = Number(card.getAttribute("data-year") || 0);
        if (filter === "all") {
          return true;
        }
        if (filter === "old") {
          return value > 0 && value <= 2020;
        }
        return value === Number(filter);
      }

      function apply() {
        var q = normalize(input ? input.value : "");
        var y = year ? year.value : "all";
        var t = type ? type.value : "all";
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardType = card.getAttribute("data-type") || "";
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (ok && !matchYear(card, y)) {
            ok = false;
          }
          if (ok && t !== "all" && cardType.indexOf(t) === -1 && text.indexOf(t) === -1) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      apply();
    });
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      if (!video) {
        return;
      }

      function attach() {
        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (video.getAttribute("data-ready") !== "1") {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video.hlsPlayer = hls;
          } else {
            video.src = stream;
          }
          video.setAttribute("data-ready", "1");
        }
        box.classList.add("is-playing");
        video.controls = true;
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", attach);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          attach();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
