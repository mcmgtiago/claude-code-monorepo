/**
 * About page vision video: autoplay muted, toggle play/pause with icon swap (slide up).
 * Uses data-about-video, data-about-video-control, and data-play="true"|"false".
 */
function initAboutVideo() {
  const video = document.querySelector('[data-about-video]');
  const control = document.querySelector('[data-about-video-control]');
  if (!video || !control) return;

  function setPlaying(playing) {
    control.dataset.play = playing ? 'true' : 'false';
  }

  function syncState() {
    setPlaying(!video.paused);
  }

  control.addEventListener('click', (e) => {
    e.preventDefault();
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  });

  video.addEventListener('play', syncState);
  video.addEventListener('pause', syncState);
  video.addEventListener('ended', () => setPlaying(false));

  // Start playing (autoplay may be blocked; ensure we're in sync)
  video.muted = true;
  const played = video.play();
  if (played && typeof played.then === 'function') {
    played.then(() => setPlaying(true)).catch(() => setPlaying(false));
  } else {
    setPlaying(!video.paused);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutVideo);
} else {
  initAboutVideo();
}
