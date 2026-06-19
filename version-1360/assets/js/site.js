document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var next = document.querySelector(".hero-next");
  var prev = document.querySelector(".hero-prev");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      startTimer();
    });
  }

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      startTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide")) || 0);
      startTimer();
    });
  });

  startTimer();

  var filterScope = document.querySelector(".filter-scope");

  if (filterScope) {
    var textInput = document.querySelector(".filter-input");
    var yearSelect = document.querySelector(".filter-year");
    var typeSelect = document.querySelector(".filter-type");
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (textInput && initialQuery) {
      textInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(textInput ? textInput.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle("is-hidden-card", !matched);
      });
    }

    [textInput, yearSelect, typeSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
});
