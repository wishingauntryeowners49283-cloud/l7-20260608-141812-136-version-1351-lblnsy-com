(function () {
    var list = window.movieIndex || [];
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var box = document.getElementById('search-results');
    var empty = document.getElementById('search-empty');
    var title = document.querySelector('[data-search-title]');
    var largeInput = document.querySelector('.large-search input[name="q"]');

    if (largeInput) {
        largeInput.value = query;
    }

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
            '<span class="poster-frame">' +
            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'">' +
            '<em>' + escapeHtml(movie.year) + '</em>' +
            '</span>' +
            '<span class="movie-card-body">' +
            '<strong>' + escapeHtml(movie.title) + '</strong>' +
            '<small>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</small>' +
            '<span class="card-summary">' + escapeHtml(movie.oneLine) + '</span>' +
            '<span class="tag-row">' + tags + '</span>' +
            '</span>' +
            '</a>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    if (!box) {
        return;
    }

    var normalized = query.toLowerCase();
    var results = normalized ? list.filter(function (movie) {
        return movie.search.indexOf(normalized) !== -1;
    }) : list.slice(0, 48);

    if (title) {
        title.textContent = normalized ? '搜索结果' : '热门推荐';
    }

    box.innerHTML = results.slice(0, 120).map(card).join('');

    if (empty) {
        empty.hidden = results.length !== 0;
    }
})();
