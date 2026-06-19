(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play-trigger]');
    var message = shell.querySelector('.player-message');
    var stream = shell.getAttribute('data-stream');
    var hls = null;
    var started = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setMessage('点击画面即可继续播放');
        });
      }
    }

    function begin() {
      if (!video || !stream) {
        setMessage('播放暂时不可用，请稍后再试');
        return;
      }

      shell.classList.add('is-started');
      setMessage('');

      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          setMessage('播放暂时不可用，请稍后再试');
          hls.destroy();
        });
        return;
      }

      setMessage('播放暂时不可用，请稍后再试');
    }

    if (trigger) {
      trigger.addEventListener('click', begin);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
