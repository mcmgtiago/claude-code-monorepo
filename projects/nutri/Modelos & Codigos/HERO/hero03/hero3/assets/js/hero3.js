const revealElements = document.querySelectorAll(".reveal");
const autoplayVideos = document.querySelectorAll("video");

const showHero = () => {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
};

const setupVideoAutoplay = () => {
  if (!autoplayVideos.length) {
    return;
  }

  const attemptPlay = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  autoplayVideos.forEach((video) => {
    attemptPlay(video);

    video.addEventListener("loadedmetadata", () => {
      attemptPlay(video);
    });

    video.addEventListener("canplay", () => {
      attemptPlay(video);
    });

    video.addEventListener("pause", () => {
      if (!video.ended && !document.hidden) {
        attemptPlay(video);
      }
    });
  });

  const replayVisibleVideos = () => {
    if (document.hidden) {
      return;
    }

    autoplayVideos.forEach((video) => {
      if (video.readyState >= 2) {
        attemptPlay(video);
      }
    });
  };

  document.addEventListener("visibilitychange", replayVisibleVideos);
  window.addEventListener("focus", replayVisibleVideos);

  ["touchstart", "touchend", "click"].forEach((eventName) => {
    window.addEventListener(eventName, replayVisibleVideos, { passive: true });
  });
};

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      showHero();
      setupVideoAutoplay();
    },
    { once: true }
  );
} else {
  showHero();
  setupVideoAutoplay();
}
