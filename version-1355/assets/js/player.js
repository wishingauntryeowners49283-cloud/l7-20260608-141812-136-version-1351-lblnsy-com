function attachStream(video, source) {
  if (!source) {
    return Promise.resolve();
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    if (video.src !== source) {
      video.src = source;
    }

    return Promise.resolve();
  }

  if (window.Hls && window.Hls.isSupported()) {
    if (!video.hlsInstance) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    }

    return Promise.resolve();
  }

  video.src = source;
  return Promise.resolve();
}

function startPlayer(frame) {
  var video = frame.querySelector('video');
  var cover = frame.querySelector('.player-cover');
  var source = frame.getAttribute('data-stream');

  if (!video) {
    return;
  }

  attachStream(video, source).then(function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        video.controls = true;
      });
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('.video-frame')).forEach(function (frame) {
  var cover = frame.querySelector('.player-cover');

  if (cover) {
    cover.addEventListener('click', function () {
      startPlayer(frame);
    });
  }

  frame.addEventListener('click', function (event) {
    if (event.target && event.target.closest && event.target.closest('video')) {
      return;
    }

    if (!cover || cover.classList.contains('is-hidden')) {
      return;
    }

    startPlayer(frame);
  });
});
