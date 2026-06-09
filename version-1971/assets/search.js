(function () {
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    var meta = [movie.region, movie.type, movie.year].filter(Boolean).join(' · ');
    return [
      '<article class="movie-card">',
      '<a class="card-poster" href="' + escapeHtml(movie.url) + '">',
      '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="card-content">',
      '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '<p class="card-meta">' + escapeHtml(meta) + '</p>',
      '<p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function render() {
    if (!results || !status) {
      return;
    }
    var keyword = query.trim().toLowerCase();
    if (input) {
      input.value = query;
    }
    if (!keyword) {
      status.textContent = '请输入关键词开始搜索。';
      results.innerHTML = '';
      return;
    }
    var matched = SEARCH_INDEX.filter(function (movie) {
      return movie.searchText.toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);
    status.textContent = matched.length ? '已找到相关影片，点击卡片进入播放页。' : '暂无匹配影片，请尝试其他关键词。';
    results.innerHTML = matched.map(card).join('');
  }

  render();
})();
