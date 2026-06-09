document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var button = document.getElementById("play-button");
    var ready = false;

    if (!video || typeof videoUrl !== "string" || !videoUrl) {
        return;
    }

    function beginPlay() {
        if (!ready) {
            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            } else {
                video.src = videoUrl;
            }

            video.controls = true;
        }

        if (cover) {
            cover.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", beginPlay);
    }

    if (cover) {
        cover.addEventListener("click", beginPlay);
    }

    video.addEventListener("click", function () {
        if (!ready) {
            beginPlay();
        }
    });
});
