function initMoviePlayer(videoUrl) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('movie-play');
    var mounted = false;
    var hls = null;

    function mount() {
        if (!video || mounted) {
            return;
        }

        mounted = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function start() {
        mount();
        if (button) {
            button.classList.add('is-hidden');
        }
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
