document.documentElement.classList.add("is-ready");

const heroVideos = document.querySelectorAll(".hero__video");
const revealMediaItems = document.querySelectorAll(".reveal-media");
const revealSideItems = document.querySelectorAll(".reveal-side");
const revealUpItems = document.querySelectorAll(".reveal-up");
const revealMarkItems = document.querySelectorAll(".reveal-mark");
const revealWriteItems = document.querySelectorAll(".reveal-write");
const faqItems = document.querySelectorAll(".faq-item");

function keepVideoPlaying(video) {
  if (!video) {
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("x5-playsinline", "true");
  video.setAttribute("x5-video-player-type", "h5");
  video.setAttribute("x5-video-player-fullscreen", "false");
  video.setAttribute("preload", "auto");
  video.setAttribute("disablepictureinpicture", "");
  video.setAttribute("disableremoteplayback", "");
  video.setAttribute("controlslist", "nodownload nofullscreen noremoteplayback");
  video.removeAttribute("controls");

  const tryPlay = () => {
    video.muted = true;
    video.defaultMuted = true;

    if (video.readyState === 0) {
      video.load();
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener("loadeddata", tryPlay, { once: true });
  }

  video.addEventListener("pause", () => {
    if (!video.ended && document.visibilityState === "visible") {
      tryPlay();
    }
  });

  video.addEventListener("ended", () => {
    video.currentTime = 0;
    tryPlay();
  });

  ["visibilitychange", "pageshow", "focus"].forEach((eventName) => {
    const target = eventName === "focus" ? window : document;

    target.addEventListener(eventName, () => {
      if (document.visibilityState === "visible") {
        tryPlay();
      }
    });
  });

  ["touchstart", "touchend", "click"].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        tryPlay();
      },
      { passive: true }
    );
  });

  let retryCount = 0;
  const retryTimer = window.setInterval(() => {
    retryCount += 1;

    if (!video.paused) {
      if (retryCount > 10) {
        window.clearInterval(retryTimer);
      }

      return;
    }

    tryPlay();

    if (retryCount >= 20) {
      window.clearInterval(retryTimer);
    }
  }, 1200);
}

heroVideos.forEach(keepVideoPlaying);

function splitRevealNode(node, state) {
  if (node.nodeType === Node.TEXT_NODE) {
    const fragment = document.createDocumentFragment();
    const parts = node.textContent.split(/(\s+)/);

    parts.forEach((part) => {
      if (!part) {
        return;
      }

      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const span = document.createElement("span");
      span.className = "reveal-word";
      span.style.setProperty("--word-index", state.index);
      span.textContent = part;
      state.index += 1;
      fragment.appendChild(span);
    });

    return fragment;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const clone = node.cloneNode(false);

    node.childNodes.forEach((child) => {
      const processedChild = splitRevealNode(child, state);

      if (processedChild) {
        clone.appendChild(processedChild);
      }
    });

    return clone;
  }

  return null;
}

revealWriteItems.forEach((item) => {
  const state = { index: 0 };
  const fragment = document.createDocumentFragment();

  item.childNodes.forEach((child) => {
    const processedChild = splitRevealNode(child, state);

    if (processedChild) {
      fragment.appendChild(processedChild);
    }
  });

  item.replaceChildren(fragment);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealMediaItems.forEach((item) => revealObserver.observe(item));
  revealSideItems.forEach((item) => revealObserver.observe(item));
  revealUpItems.forEach((item) => revealObserver.observe(item));
  revealMarkItems.forEach((item) => revealObserver.observe(item));
  revealWriteItems.forEach((item) => revealObserver.observe(item));
} else {
  revealMediaItems.forEach((item) => item.classList.add("is-visible"));
  revealSideItems.forEach((item) => item.classList.add("is-visible"));
  revealUpItems.forEach((item) => item.classList.add("is-visible"));
  revealMarkItems.forEach((item) => item.classList.add("is-visible"));
  revealWriteItems.forEach((item) => item.classList.add("is-visible"));
}

faqItems.forEach((item) => {
  const trigger = item.querySelector(".faq-item__trigger");
  const answer = item.querySelector(".faq-item__answer");

  if (!trigger || !answer) {
    return;
  }

  trigger.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((faqItem) => {
      const faqTrigger = faqItem.querySelector(".faq-item__trigger");
      const faqAnswer = faqItem.querySelector(".faq-item__answer");

      faqItem.classList.remove("is-open");

      if (faqTrigger) {
        faqTrigger.setAttribute("aria-expanded", "false");
      }

      if (faqAnswer) {
        faqAnswer.hidden = true;
      }
    });

    if (!isOpen) {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      answer.hidden = false;
    }
  });
});
