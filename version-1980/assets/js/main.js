document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
        var target = input.getAttribute("data-filter-target");
        var scope = target ? document.querySelector(target) : document;

        if (!scope) {
            return;
        }

        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var matched = !keyword || (card.getAttribute("data-search") || "").toLowerCase().indexOf(keyword) !== -1;
                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            scope.classList.toggle("has-no-results", visible === 0);
        });
    });
});
