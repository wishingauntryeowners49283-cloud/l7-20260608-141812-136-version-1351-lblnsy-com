document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("moviePlayer");
  var button = document.querySelector(".play-cover");
  var hlsInstance = null;

  function startPlayback() {
    if (!video) {
      return;
    }

    var streamUrl = video.getAttribute("data-stream");

    if (!streamUrl) {
      return;
    }

    if (button) {
      button.classList.add("is-hidden");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", streamUrl);
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      }
      video.play().catch(function () {});
      return;
    }

    if (!video.getAttribute("src")) {
      video.setAttribute("src", streamUrl);
    }

    video.play().catch(function () {});
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }
});
