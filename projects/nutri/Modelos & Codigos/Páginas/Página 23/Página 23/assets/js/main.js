const MOBILE_LAYOUT = window.matchMedia("(max-width: 920px)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage, { once: true });
} else {
  initPage();
}

function initPage() {
  initHeroBoomerang();
  initScrollReveal();
  initStackCards();
  initScienceScroll();
}

function initHeroBoomerang() {
  const media = document.querySelector(".hero__media");
  const video = document.querySelector(".hero__video");
  const canvas = document.querySelector(".hero__canvas");

  if (!media || !video || !canvas || REDUCED_MOTION.matches) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: false });

  if (!ctx) {
    return;
  }

  const capturedFrames = [];
  const captureCanvas = document.createElement("canvas");
  const captureContext = captureCanvas.getContext("2d", { alpha: false });

  if (!captureContext) {
    return;
  }

  let captureStopped = false;
  let captureStarted = false;
  let loopStarted = false;
  let frameIndex = 0;
  let direction = 1;
  let lastStepTime = 0;
  let rafId = 0;
  let resizeRafId = 0;

  const syncDisplayCanvas = () => {
    const bounds = media.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width * window.devicePixelRatio));
    const height = Math.max(1, Math.round(bounds.height * window.devicePixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    drawCurrentFrame();
  };

  const queueResizeSync = () => {
    if (resizeRafId) {
      return;
    }

    resizeRafId = window.requestAnimationFrame(() => {
      resizeRafId = 0;
      syncDisplayCanvas();
    });
  };

  const drawFrameToContext = (sourceCanvas, targetContext, targetCanvas) => {
    targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    const sourceWidth = sourceCanvas.width;
    const sourceHeight = sourceCanvas.height;
    const targetWidth = targetCanvas.width;
    const targetHeight = targetCanvas.height;
    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = targetWidth / targetHeight;

    let drawWidth;
    let drawHeight;
    let offsetX;
    let offsetY;

    if (sourceRatio > targetRatio) {
      drawHeight = targetHeight;
      drawWidth = drawHeight * sourceRatio;
      offsetX = (targetWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = targetWidth;
      drawHeight = drawWidth / sourceRatio;
      offsetX = 0;
      offsetY = (targetHeight - drawHeight) / 2;
    }

    targetContext.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);
  };

  const drawCurrentFrame = () => {
    const frame = capturedFrames[frameIndex];

    if (!frame || !canvas.width || !canvas.height) {
      return;
    }

    drawFrameToContext(frame, ctx, canvas);
  };

  const storeCurrentFrame = () => {
    if (captureStopped || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const cappedWidth = Math.min(960, video.videoWidth);
    const cappedHeight = Math.round((video.videoHeight / video.videoWidth) * cappedWidth);

    if (captureCanvas.width !== cappedWidth || captureCanvas.height !== cappedHeight) {
      captureCanvas.width = cappedWidth;
      captureCanvas.height = cappedHeight;
    }

    captureContext.drawImage(video, 0, 0, cappedWidth, cappedHeight);

    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = cappedWidth;
    frameCanvas.height = cappedHeight;
    const frameContext = frameCanvas.getContext("2d", { alpha: false });

    if (!frameContext) {
      return;
    }

    frameContext.drawImage(captureCanvas, 0, 0);
    capturedFrames.push(frameCanvas);
  };

  const captureNextFrame = () => {
    if (captureStopped) {
      return;
    }

    storeCurrentFrame();

    if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
      video.requestVideoFrameCallback(captureNextFrame);
    } else {
      rafId = window.requestAnimationFrame(captureNextFrame);
    }
  };

  const startCapture = () => {
    if (captureStarted) {
      return;
    }

    captureStarted = true;
    syncDisplayCanvas();
    captureNextFrame();
  };

  const startBoomerangLoop = () => {
    if (loopStarted || capturedFrames.length < 2) {
      return;
    }

    loopStarted = true;
    frameIndex = 0;
    direction = 1;
    media.classList.add("is-boomerang-ready");
    syncDisplayCanvas();

    const step = (timestamp) => {
      if (!lastStepTime) {
        lastStepTime = timestamp;
      }

      if (timestamp - lastStepTime >= 1000 / 30) {
        lastStepTime = timestamp;
        frameIndex += direction;

        if (frameIndex >= capturedFrames.length - 1) {
          frameIndex = capturedFrames.length - 1;
          direction = -1;
        } else if (frameIndex <= 0) {
          frameIndex = 0;
          direction = 1;
        }

        drawCurrentFrame();
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
  };

  const stopCapture = () => {
    captureStopped = true;

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    startBoomerangLoop();
  };

  video.addEventListener(
    "loadedmetadata",
    () => {
      startCapture();
    },
    { once: true }
  );

  video.addEventListener(
    "ended",
    () => {
      stopCapture();
    },
    { once: true }
  );

  video.addEventListener("error", () => {
    media.classList.remove("is-boomerang-ready");
  });

  window.addEventListener("resize", queueResizeSync);
  window.addEventListener("orientationchange", queueResizeSync);
  window.addEventListener("pagehide", () => {
    captureStopped = true;
    window.cancelAnimationFrame(rafId);
    window.cancelAnimationFrame(resizeRafId);
  });

  if (video.readyState >= 1) {
    startCapture();
  }
}

function initScrollReveal() {
  const revealItems = document.querySelectorAll(".reveal-on-scroll");
  const writingTitles = document.querySelectorAll(".insight-section__title--writing");
  const insightTopics = document.querySelectorAll(".insight-topic");

  if (!revealItems.length && !writingTitles.length && !insightTopics.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.classList.contains("insight-section__title--writing")) {
          animateWords(entry.target);
        }

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
  writingTitles.forEach((title) => observer.observe(title));

  if (!insightTopics.length) {
    return;
  }

  const topicObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const topic = entry.target;
        const topicIndex = Number(topic.getAttribute("data-topic-index") || "0");
        const delay = MOBILE_LAYOUT.matches ? topicIndex * 120 : topicIndex * 160;

        window.setTimeout(() => {
          topic.classList.add("is-visible");
        }, delay);

        topicObserver.unobserve(topic);
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  insightTopics.forEach((topic, index) => {
    topic.setAttribute("data-topic-index", String(index));
    topicObserver.observe(topic);
  });
}

function animateWords(title) {
  const words = title.querySelectorAll(".insight-word");

  if (MOBILE_LAYOUT.matches || REDUCED_MOTION.matches) {
    words.forEach((word) => word.classList.add("is-written"));
    return;
  }

  words.forEach((word, index) => {
    window.setTimeout(() => {
      word.classList.add("is-written");
    }, index * 40);
  });
}

function initStackCards() {
  const stackSection = document.querySelector(".stack-section");
  const cards = document.querySelectorAll("[data-stack-cards] .stack-card");

  if (!stackSection || !cards.length) {
    return;
  }

  let renderedProgress = 0;
  let targetProgress = 0;
  let stackAnimationFrame = 0;

  const renderStack = (progress) => {
    const steps = cards.length;
    const segment = 1 / steps;

    cards.forEach((card, index) => {
      const localStart = segment * index;
      const localEnd = segment * (index + 1);
      const phaseProgress = clamp((progress - localStart) / segment, 0, 1);
      const isPassed = progress >= localEnd;
      const rotation = -4 + index * 1.25;
      const restY = index * 16;
      const travelDistance = 360;
      const passedY = -380;
      const passedScale = 0.94;
      const fadeRate = 1.15;

      let y = restY;
      let scale = 1 - index * 0.015;
      let opacity = 1;

      if (phaseProgress > 0) {
        y = restY - phaseProgress * travelDistance;
        scale = 1 - phaseProgress * 0.06;
        opacity = 1 - phaseProgress * fadeRate;
      }

      if (isPassed) {
        y = passedY;
        scale = passedScale;
        opacity = 0;
      }

      if (progress < localStart) {
        y = restY;
        scale = 1 - index * 0.015;
        opacity = 1;
      }

      card.style.setProperty("--stack-offset", `${y}px`);
      card.style.setProperty("--stack-rotate", `${rotation}deg`);
      card.style.setProperty("--stack-scale", `${scale}`);
      card.style.setProperty("--stack-opacity", `${Math.max(0, opacity)}`);
    });
  };

  const animateStackProgress = () => {
    stackAnimationFrame = 0;

    const mobileMode = MOBILE_LAYOUT.matches;
    const maxStep = mobileMode ? 0.028 : 1;
    const delta = targetProgress - renderedProgress;

    if (Math.abs(delta) <= 0.0005) {
      renderedProgress = targetProgress;
      renderStack(renderedProgress);
      return;
    }

    renderedProgress += mobileMode ? clamp(delta, -maxStep, maxStep) : delta;
    renderStack(renderedProgress);

    if (mobileMode && Math.abs(targetProgress - renderedProgress) > 0.0005) {
      stackAnimationFrame = window.requestAnimationFrame(animateStackProgress);
    }
  };

  const clearCardStyles = () => {
    cards.forEach((card) => {
      card.style.removeProperty("--stack-offset");
      card.style.removeProperty("--stack-rotate");
      card.style.removeProperty("--stack-scale");
      card.style.removeProperty("--stack-opacity");
    });
  };

  const updateStack = () => {
    if (REDUCED_MOTION.matches) {
      window.cancelAnimationFrame(stackAnimationFrame);
      stackAnimationFrame = 0;
      clearCardStyles();
      return;
    }

    const rect = stackSection.getBoundingClientRect();
    const maxScroll = Math.max(stackSection.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / maxScroll, 0), 1);

    if (MOBILE_LAYOUT.matches) {
      window.cancelAnimationFrame(stackAnimationFrame);
      stackAnimationFrame = 0;
      clearCardStyles();
      return;
    }

    targetProgress = progress;
    renderedProgress = targetProgress;
    renderStack(renderedProgress);
  };

  const destroyScrollBinding = bindRafScroll(updateStack, stackSection);
  const destroyMobileReveal = initMobileStackReveal(cards);
  updateStack();

  const onMediaChange = () => {
    updateStack();
  };

  MOBILE_LAYOUT.addEventListener("change", onMediaChange);
  REDUCED_MOTION.addEventListener("change", onMediaChange);

  window.addEventListener("pagehide", () => {
    destroyScrollBinding();
    destroyMobileReveal();
    window.cancelAnimationFrame(stackAnimationFrame);
    MOBILE_LAYOUT.removeEventListener("change", onMediaChange);
    REDUCED_MOTION.removeEventListener("change", onMediaChange);
  });
}

function initMobileStackReveal(cards) {
  if (!cards.length) {
    return () => {};
  }

  const revealVisibleCards = () => {
    if (!MOBILE_LAYOUT.matches) {
      return;
    }

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (rect.top < viewportHeight * 0.86 && rect.bottom > viewportHeight * 0.08) {
        card.classList.add("is-visible");
        observer.unobserve(card);
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !MOBILE_LAYOUT.matches) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.24,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  cards.forEach((card) => observer.observe(card));
  window.requestAnimationFrame(revealVisibleCards);

  return () => observer.disconnect();
}

function initScienceScroll() {
  const section = document.querySelector("[data-science-section]");
  const sticky = section?.querySelector(".science-section__sticky");
  const steps = Array.from(document.querySelectorAll("[data-science-step]"));
  const lede = document.querySelector("[data-science-lede]");

  if (!section || !sticky || !steps.length || !lede) {
    return;
  }

  let activeIndex = -1;
  let ledeTimer = 0;
  let renderedProgress = 0;
  let targetProgress = 0;
  let scienceAnimationFrame = 0;
  let mobileStepIndex = 0;
  const desktopInitialIndex = Math.max(
    0,
    steps.findIndex((step) => step.classList.contains("science-step--active"))
  );

  const setActiveStep = (index) => {
    if (index === activeIndex) {
      return;
    }

    activeIndex = index;
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("science-step--active", stepIndex === index);
    });

    const nextLede = steps[index].getAttribute("data-lede");

    if (!nextLede || lede.innerHTML === nextLede) {
      return;
    }

    window.clearTimeout(ledeTimer);

    if (REDUCED_MOTION.matches) {
      lede.innerHTML = nextLede;
      lede.style.opacity = "1";
      lede.style.transform = "translateY(0)";
      return;
    }

    lede.style.opacity = "0.35";
    lede.style.transform = "translateY(10px)";

    ledeTimer = window.setTimeout(() => {
      lede.innerHTML = nextLede;
      lede.style.opacity = "1";
      lede.style.transform = "translateY(0)";
    }, 140);
  };

  const updateScience = () => {
    if (REDUCED_MOTION.matches) {
      window.cancelAnimationFrame(scienceAnimationFrame);
      scienceAnimationFrame = 0;
      setActiveStep(0);
      return;
    }

    const rect = section.getBoundingClientRect();
    const maxScroll = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / maxScroll, 0, 0.9999);

    if (!MOBILE_LAYOUT.matches) {
      targetProgress = progress;
      renderedProgress = targetProgress;
      const index = Math.max(
        desktopInitialIndex,
        Math.min(steps.length - 1, Math.floor(renderedProgress * steps.length))
      );
      setActiveStep(index);
      return;
    }

    targetProgress = stepIndexToProgress(mobileStepIndex, steps.length);

    if (!scienceAnimationFrame) {
      scienceAnimationFrame = window.requestAnimationFrame(animateScienceProgress);
    }
  };

  const animateScienceProgress = () => {
    scienceAnimationFrame = 0;

    const maxStep = MOBILE_LAYOUT.matches ? 0.04 : 1;
    const delta = targetProgress - renderedProgress;

    if (Math.abs(delta) <= 0.0005) {
      renderedProgress = targetProgress;
    } else {
      renderedProgress += MOBILE_LAYOUT.matches ? clamp(delta, -maxStep, maxStep) : delta;
    }

    const index = Math.min(steps.length - 1, Math.floor(renderedProgress * steps.length));
    setActiveStep(index);

    if (MOBILE_LAYOUT.matches && Math.abs(targetProgress - renderedProgress) > 0.0005) {
      scienceAnimationFrame = window.requestAnimationFrame(animateScienceProgress);
    }
  };

  const setMobileScienceIndex = (nextIndex) => {
    const clampedIndex = clamp(nextIndex, 0, steps.length - 1);

    if (clampedIndex === mobileStepIndex) {
      return;
    }

    mobileStepIndex = clampedIndex;
    targetProgress = stepIndexToProgress(mobileStepIndex, steps.length);

    if (!scienceAnimationFrame) {
      scienceAnimationFrame = window.requestAnimationFrame(animateScienceProgress);
    }
  };

  const destroyTouchStepper = createTouchStepper({
    container: sticky,
    getIndex: () => mobileStepIndex,
    setIndex: setMobileScienceIndex,
    maxIndex: steps.length - 1,
  });
  const destroyWheelStepper = createWheelStepper({
    container: sticky,
    getIndex: () => mobileStepIndex,
    setIndex: setMobileScienceIndex,
    maxIndex: steps.length - 1,
  });

  if (MOBILE_LAYOUT.matches) {
    renderedProgress = 0;
    targetProgress = 0;
    setActiveStep(0);
  }

  const destroyScrollBinding = bindRafScroll(updateScience, section);
  updateScience();

  const onMediaChange = () => {
    updateScience();
  };

  MOBILE_LAYOUT.addEventListener("change", onMediaChange);
  REDUCED_MOTION.addEventListener("change", onMediaChange);

  window.addEventListener("pagehide", () => {
    destroyScrollBinding();
    destroyTouchStepper();
    destroyWheelStepper();
    window.cancelAnimationFrame(scienceAnimationFrame);
    MOBILE_LAYOUT.removeEventListener("change", onMediaChange);
    REDUCED_MOTION.removeEventListener("change", onMediaChange);
    window.clearTimeout(ledeTimer);
  });
}

function createTouchStepper({ container, getIndex, setIndex, maxIndex, onAfterLast }) {
  let touchStartY = 0;
  let touchCurrentY = 0;
  let isTrackingTouch = false;
  let stepLockUntil = 0;

  const isEnabled = () => MOBILE_LAYOUT.matches && !REDUCED_MOTION.matches;

  const onTouchStart = (event) => {
    if (!isEnabled() || event.touches.length !== 1) {
      return;
    }

    touchStartY = event.touches[0].clientY;
    touchCurrentY = touchStartY;
    isTrackingTouch = true;
  };

  const onTouchMove = (event) => {
    if (!isTrackingTouch || !isEnabled() || event.touches.length !== 1) {
      return;
    }

    touchCurrentY = event.touches[0].clientY;
    const deltaY = touchCurrentY - touchStartY;
    const currentIndex = getIndex();
    const wantsNext = deltaY < -18;
    const wantsPrev = deltaY > 18;
    const canAdvance = (wantsNext && currentIndex < maxIndex) || (wantsPrev && currentIndex > 0);

    if (canAdvance) {
      event.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (!isTrackingTouch || !isEnabled()) {
      isTrackingTouch = false;
      return;
    }

    isTrackingTouch = false;

    if (Date.now() < stepLockUntil) {
      return;
    }

    const deltaY = touchCurrentY - touchStartY;

    if (Math.abs(deltaY) < 36) {
      return;
    }

    const currentIndex = getIndex();

    if (deltaY < 0 && currentIndex < maxIndex) {
      setIndex(currentIndex + 1);
      stepLockUntil = Date.now() + 360;
    } else if (deltaY < 0 && currentIndex >= maxIndex && typeof onAfterLast === "function") {
      onAfterLast();
      stepLockUntil = Date.now() + 360;
    } else if (deltaY > 0 && currentIndex > 0) {
      setIndex(currentIndex - 1);
      stepLockUntil = Date.now() + 360;
    }
  };

  container.addEventListener("touchstart", onTouchStart, { passive: true });
  container.addEventListener("touchmove", onTouchMove, { passive: false });
  container.addEventListener("touchend", onTouchEnd, { passive: true });
  container.addEventListener("touchcancel", onTouchEnd, { passive: true });

  return () => {
    container.removeEventListener("touchstart", onTouchStart);
    container.removeEventListener("touchmove", onTouchMove);
    container.removeEventListener("touchend", onTouchEnd);
    container.removeEventListener("touchcancel", onTouchEnd);
  };
}

function createWheelStepper({ container, getIndex, setIndex, maxIndex, onAfterLast }) {
  let lockUntil = 0;

  const isEnabled = () => MOBILE_LAYOUT.matches && !REDUCED_MOTION.matches;
  const isContainerActive = () => {
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top <= viewportHeight * 0.55 && rect.bottom >= viewportHeight * 0.45;
  };

  const onWheel = (event) => {
    if (!isEnabled() || !isContainerActive()) {
      return;
    }

    const currentIndex = getIndex();
    const scrollingDown = event.deltaY > 0;
    const scrollingUp = event.deltaY < 0;
    const canAdvance =
      (scrollingDown && currentIndex < maxIndex) ||
      (scrollingDown && currentIndex >= maxIndex && typeof onAfterLast === "function") ||
      (scrollingUp && currentIndex > 0);

    if (!canAdvance) {
      return;
    }

    event.preventDefault();

    if (Date.now() < lockUntil || Math.abs(event.deltaY) < 8) {
      return;
    }

    if (scrollingDown && currentIndex < maxIndex) {
      setIndex(currentIndex + 1);
    } else if (scrollingDown && currentIndex >= maxIndex && typeof onAfterLast === "function") {
      onAfterLast();
    } else if (scrollingUp) {
      setIndex(currentIndex - 1);
    }

    lockUntil = Date.now() + 320;
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    window.removeEventListener("wheel", onWheel);
  };
}

function bindRafScroll(callback, section) {
  let ticking = false;
  let isActive = false;

  const run = () => {
    ticking = false;

    if (!isActive) {
      return;
    }

    callback();
  };

  const requestRun = () => {
    if (ticking || !isActive) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(run);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      isActive = entries.some((entry) => entry.isIntersecting);

      if (isActive) {
        requestRun();
      }
    },
    {
      rootMargin: "20% 0px 20% 0px",
    }
  );

  observer.observe(section);
  window.addEventListener("scroll", requestRun, { passive: true });
  window.addEventListener("resize", requestRun);

  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", requestRun);
    window.removeEventListener("resize", requestRun);
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function stepIndexToProgress(index, total) {
  if (total <= 1) {
    return 0;
  }

  return index / total;
}
