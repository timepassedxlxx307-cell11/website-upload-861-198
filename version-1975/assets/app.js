(function () {
    function getRoot() {
        return document.body.getAttribute("data-root") || "";
    }

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setText(node, value) {
        node.textContent = value || "";
    }

    function createResult(item, root) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = root + item.url;
        var title = document.createElement("strong");
        var meta = document.createElement("span");
        setText(title, item.title);
        setText(meta, item.year + " · " + item.region + " · " + item.type);
        link.appendChild(title);
        link.appendChild(meta);
        return link;
    }

    function bindSearch(input) {
        var wrap = input.closest(".header-search") || input.closest(".wide-search") || input.parentElement;
        var box = qs(".search-results", wrap);
        if (!box || !window.MOVIES_SEARCH) {
            return;
        }
        input.addEventListener("input", function () {
            var term = input.value.trim().toLowerCase();
            box.innerHTML = "";
            if (!term) {
                box.hidden = true;
                return;
            }
            var root = getRoot();
            var matched = window.MOVIES_SEARCH.filter(function (item) {
                return item.text.toLowerCase().indexOf(term) !== -1;
            }).slice(0, 14);
            matched.forEach(function (item) {
                box.appendChild(createResult(item, root));
            });
            box.hidden = matched.length === 0;
        });
        document.addEventListener("click", function (event) {
            if (!wrap.contains(event.target)) {
                box.hidden = true;
            }
        });
    }

    function bindMenu() {
        var toggle = qs(".menu-toggle");
        var nav = qs(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.hidden;
            nav.hidden = !open;
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function bindHero() {
        var hero = qs(".hero-carousel");
        if (!hero) {
            return;
        }
        var slides = qsa(".hero-slide", hero);
        var dots = qsa(".hero-dot", hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                var active = i === index;
                slide.classList.toggle("active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        hero.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        play();
    }

    function bindLocalFilters() {
        var input = qs(".local-filter-input");
        var chips = qsa(".filter-chip");
        var cards = qsa(".movie-card, .ranking-row");
        if (!input && chips.length === 0) {
            return;
        }
        var activeType = "全部";
        function apply() {
            var term = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-keywords") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var typeOk = activeType === "全部" || type.indexOf(activeType) !== -1;
                var termOk = !term || text.indexOf(term) !== -1;
                card.hidden = !(typeOk && termOk);
            });
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                activeType = chip.getAttribute("data-filter") || "全部";
                apply();
            });
        });
        if (input) {
            input.addEventListener("input", apply);
        }
    }

    window.bindMoviePlayer = function (streamUrl) {
        var holder = qs("[data-player]");
        var video = qs("#movie-player", holder || document);
        var button = qs(".player-cover", holder || document);
        if (!holder || !video || !button || !streamUrl) {
            return;
        }
        var hls = null;
        var started = false;
        function start() {
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
            button.classList.add("is-hidden");
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        bindMenu();
        bindHero();
        bindLocalFilters();
        qsa(".site-search").forEach(bindSearch);
    });
})();
