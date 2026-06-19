(function () {
  var movies = window.SITE_MOVIES || [];
  var input = document.getElementById('searchInput');
  var typeSelect = document.getElementById('searchType');
  var yearSelect = document.getElementById('searchYear');
  var results = document.getElementById('searchResults');

  if (!input || !typeSelect || !yearSelect || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  input.value = initialQuery;

  var years = Array.from(new Set(movies.map(function (movie) {
    return movie.year;
  }))).sort(function (a, b) {
    return b - a;
  });

  years.forEach(function (year) {
    var option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  });

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

  function renderCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span><span class="poster-play">▶</span></a>' +
      '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p><div class="tag-row">' + tags + '</div></div></article>';
  }

  function search() {
    var keyword = input.value.trim().toLowerCase();
    var type = typeSelect.value.trim().toLowerCase();
    var year = yearSelect.value.trim();
    var matched = movies.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine, movie.year].join(' ').toLowerCase();
      var byKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var byType = !type || String(movie.type).toLowerCase().indexOf(type) !== -1;
      var byYear = !year || String(movie.year) === year;
      return byKeyword && byType && byYear;
    }).slice(0, 120);

    if (!matched.length) {
      results.innerHTML = '<div class="empty-result">没有找到匹配内容，可尝试更换片名、年份、地区或类型。</div>';
      return;
    }

    results.innerHTML = matched.map(renderCard).join('');
  }

  input.addEventListener('input', search);
  typeSelect.addEventListener('change', search);
  yearSelect.addEventListener('change', search);

  search();
})();
