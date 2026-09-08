const FRAME_PATH = "assets/images/hero";
const POINTER_SHIFT = 18;
const FRAME_SEQUENCE = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
  35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
  46, 47, 48
];
const FRAME_COUNT = FRAME_SEQUENCE.length;

const canvas = document.getElementById("hero-canvas");
const scrolly = document.querySelector(".scrolly");
const heroCopy = document.getElementById("hero-copy");
const featureCard = document.getElementById("bloco-2");
const canvasDissolve = document.getElementById("canvas-dissolve");

const context = canvas.getContext("2d");
const images = [];

let loadedFrames = 0;
let activeFrame = 0;
let targetProgress = 0;
let currentProgress = 0;
let pointerX = 0;
let pointerY = 0;
let pointerTargetX = 0;
let pointerTargetY = 0;
let rafId = 0;
let scrollTriggerRefreshId = 0;

function getViewportHeight() {
  return window.visualViewport?.height || window.innerHeight;
}

function getViewportWidth() {
  return window.visualViewport?.width || window.innerWidth;
}

function updateViewportUnit() {
  document.documentElement.style.setProperty("--app-height", `${getViewportHeight()}px`);
}

function scheduleScrollTriggerRefresh() {
  if (!window.ScrollTrigger) {
    return;
  }

  if (scrollTriggerRefreshId) {
    window.clearTimeout(scrollTriggerRefreshId);
  }

  scrollTriggerRefreshId = window.setTimeout(() => {
    window.ScrollTrigger.refresh();
  }, 120);
}

function buildFramePath(index) {
  return `${FRAME_PATH}/img${FRAME_SEQUENCE[index]}.jpg`;
}

function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    gsap.set([
      ".section-heading .eyebrow",
      ".section-heading h2",
      ".section-heading p",
      ".benefit-card",
      ".testimonial-card",
      ".method-card",
      ".deliverable-card",
      ".offer-card",
      ".guarantee-card",
      ".faq-item",
      ".footer-brand",
      ".footer-meta"
    ], { clearProps: "all" });
    return;
  }

  gsap.utils.toArray(".section-heading").forEach((heading) => {
    const eyebrow = heading.querySelector(".eyebrow");
    const title = heading.querySelector("h2");
    const copy = heading.querySelector("p");

    gsap.from([eyebrow, title, copy].filter(Boolean), {
      opacity: 0,
      y: 52,
      filter: "blur(18px)",
      duration: 1.05,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: heading,
        start: "top 82%",
        once: true
      }
    });
  });

  const revealGroups = [
    { selector: ".benefit-card", y: 54, stagger: 0.12 },
    { selector: ".deliverable-card", y: 54, stagger: 0.1 },
    { selector: ".faq-item", y: 34, stagger: 0.08 }
  ];

  revealGroups.forEach(({ selector, y, stagger }) => {
    const items = gsap.utils.toArray(selector);
    if (!items.length) return;

    gsap.from(items, {
      opacity: 0,
      y,
      filter: "blur(18px)",
      scale: 0.96,
      duration: 1,
      ease: "power3.out",
      stagger,
      scrollTrigger: {
        trigger: items[0].parentElement || items[0],
        start: "top 80%",
        once: true
      }
    });
  });

  const methodCore = document.querySelector(".method-core");
  const methodCards = gsap.utils.toArray(".method-card");
  if (methodCore) {
    gsap.from(methodCore, {
      opacity: 0,
      filter: "blur(20px)",
      scale: 0.72,
      y: 40,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".method-diagram",
        start: "top 75%",
        once: true
      }
    });

    gsap.to(".method-core-ring", {
      rotate: 360,
      duration: 16,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%"
    });

    gsap.to(".method-core-ring--alt", {
      rotate: -360,
      duration: 22,
      ease: "none",
      repeat: -1,
      transformOrigin: "50% 50%"
    });

    gsap.to(".method-core-glow", {
      scale: 1.08,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      transformOrigin: "50% 50%"
    });
  }

  if (methodCards.length) {
    gsap.set(methodCards, {
      opacity: 0,
      y: 56,
      scale: 0.96,
      filter: "blur(18px)"
    });

    const methodCardsTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".method-section",
        start: "top 68%",
        end: "bottom 34%",
        scrub: 1.1
      }
    });

    methodCardsTimeline.to(methodCards, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.42,
      ease: "power2.out",
      stagger: 0.08
    });

    methodCardsTimeline.to(methodCards, {
      opacity: 0,
      y: -34,
      scale: 0.94,
      filter: "blur(18px)",
      duration: 0.34,
      ease: "power2.in",
      stagger: 0.06
    }, 0.62);
  }

  const offerCard = document.querySelector(".offer-card");
  const ctaButtons = gsap.utils.toArray(".primary-button, .offer-button");
  if (offerCard) {
    gsap.from(offerCard, {
      opacity: 0,
      y: 58,
      filter: "blur(18px)",
      scale: 0.96,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: offerCard,
        start: "top 80%",
        once: true
      }
    });

    gsap.to(offerCard, {
      y: -8,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  ctaButtons.forEach((button) => {
    gsap.to(button, {
      y: -4,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    const shimmerTarget = button;
    gsap.to(shimmerTarget, {
      duration: 2.8,
      repeat: -1,
      ease: "power1.inOut",
      onRepeat: () => {
        if (shimmerTarget) {
          shimmerTarget.style.setProperty("--shimmer-reset", "0");
        }
      }
    });

    const pseudoAnimation = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
    pseudoAnimation.to(button, {
      duration: 0.01,
      onStart: () => {
        button.classList.add("is-shimmering");
      }
    });
    pseudoAnimation.to(button, {
      duration: 1.15
    });
    pseudoAnimation.to(button, {
      duration: 0.01,
      onStart: () => {
        button.classList.remove("is-shimmering");
      }
    });
  });

  const guaranteeCard = document.querySelector(".guarantee-card");
  if (guaranteeCard) {
    gsap.fromTo(guaranteeCard, {
      opacity: 0,
      y: 34,
      filter: "blur(14px)",
      scale: 0.985
    }, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      duration: 0.72,
      ease: "power2.out",
      overwrite: "auto",
      scrollTrigger: {
        trigger: guaranteeCard,
        start: "top 92%",
        end: "bottom 12%",
        toggleActions: "play reverse play reverse",
        invalidateOnRefresh: true
      }
    });
  }

  const footerElements = gsap.utils.toArray([".footer-brand", ".footer-meta"]);
  if (footerElements.length) {
    gsap.from(footerElements, {
      opacity: 0,
      y: 32,
      filter: "blur(14px)",
      duration: 0.95,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: ".site-footer",
        start: "top 90%",
        once: true
      }
    });
  }

  gsap.utils.toArray(".benefit-card, .deliverable-card, .faq-item").forEach((card) => {
    gsap.to(card, {
      yPercent: -3,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2
      }
    });
  });
}

function initTestimonialsCarousel() {
  if (!window.gsap) {
    return;
  }

  const gsap = window.gsap;
  const cards = Array.from(document.querySelectorAll(".testimonial-card"));
  const wrapper = document.querySelector(".testimonials-grid");
  const dots = Array.from(document.querySelectorAll(".testimonials-indicator__dot"));

  if (!wrapper || cards.length < 2) {
    return;
  }

  let activeIndex = 1;
  let autoRotateId = 0;

  function getRelativeOffset(index) {
    const total = cards.length;
    let offset = index - activeIndex;

    if (offset > total / 2) {
      offset -= total;
    }

    if (offset < -total / 2) {
      offset += total;
    }

    return offset;
  }

  function render(immediate = false) {
    const offsetStep = Math.max(112, Math.min(290, wrapper.clientWidth * 0.36));

    cards.forEach((card, index) => {
      const offset = getRelativeOffset(index);
      const isActive = offset === 0;
      const isSide = Math.abs(offset) === 1;

      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-side", isSide);

      const targetX = offset * offsetStep;
      const targetScale = isActive ? 1 : 0.84;
      const targetOpacity = isActive ? 1 : 0.42;
      const targetBlur = isActive ? 0 : 10;
      const targetY = isActive ? 0 : 18;
      const targetZ = isActive ? 3 : 1;

      gsap.to(card, {
        x: targetX,
        y: targetY,
        scale: targetScale,
        opacity: targetOpacity,
        filter: `blur(${targetBlur}px)`,
        zIndex: targetZ,
        duration: immediate ? 0 : 0.8,
        ease: "power3.out"
      });
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  function goTo(index) {
    activeIndex = (index + cards.length) % cards.length;
    render();
  }

  function startAutoRotate() {
    if (autoRotateId) {
      window.clearInterval(autoRotateId);
    }

    autoRotateId = window.setInterval(() => {
      goTo(activeIndex + 1);
    }, 4200);
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      goTo(index);
      startAutoRotate();
    });
  });

  window.addEventListener("resize", () => render(true));

  render(true);
  startAutoRotate();
}

function initFaqAccordion() {
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));

  if (!faqItems.length) {
    return;
  }

  faqItems.forEach((item, index) => {
    const trigger = item.querySelector(".faq-trigger");
    const answer = item.querySelector(".faq-answer");

    if (!trigger || !answer) {
      return;
    }

    function closeAnswer() {
      trigger.setAttribute("aria-expanded", "false");
      item.classList.remove("is-open");
      answer.style.height = `${answer.scrollHeight}px`;

      window.requestAnimationFrame(() => {
        answer.style.height = "0px";
      });

      window.setTimeout(() => {
        if (!item.classList.contains("is-open")) {
          answer.hidden = true;
          answer.style.height = "";
        }
      }, 320);
    }

    function openAnswer() {
      trigger.setAttribute("aria-expanded", "true");
      item.classList.add("is-open");
      answer.hidden = false;
      answer.style.height = "0px";

      window.requestAnimationFrame(() => {
        answer.style.height = `${answer.scrollHeight}px`;
      });
    }

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      faqItems.forEach((otherItem) => {
        if (otherItem === item) return;
        const otherTrigger = otherItem.querySelector(".faq-trigger");
        const otherAnswer = otherItem.querySelector(".faq-answer");

        if (!otherTrigger || !otherAnswer || !otherItem.classList.contains("is-open")) {
          return;
        }

        otherTrigger.setAttribute("aria-expanded", "false");
        otherItem.classList.remove("is-open");
        otherAnswer.style.height = `${otherAnswer.scrollHeight}px`;
        window.requestAnimationFrame(() => {
          otherAnswer.style.height = "0px";
        });

        window.setTimeout(() => {
          if (!otherItem.classList.contains("is-open")) {
            otherAnswer.hidden = true;
            otherAnswer.style.height = "";
          }
        }, 320);
      });

      if (isOpen) {
        closeAnswer();
      } else {
        openAnswer();
      }
    });

    answer.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      if (item.classList.contains("is-open")) {
        answer.style.height = "auto";
      }
    });

  });
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(getViewportWidth());
  const height = Math.round(getViewportHeight());

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  drawFrame(activeFrame);
}

function drawFrame(index) {
  const img = images[index];
  if (!img || !img.complete) {
    return;
  }

  const viewportWidth = getViewportWidth();
  const viewportHeight = getViewportHeight();
  const imageRatio = img.naturalWidth / img.naturalHeight;
  const viewportRatio = viewportWidth / viewportHeight;
  const zoom = 1.15;
  const mobileYOffset = viewportWidth <= 640 ? viewportHeight * 0.1 : 0;

  let drawWidth;
  let drawHeight;

  if (imageRatio > viewportRatio) {
    drawHeight = viewportHeight * zoom;
    drawWidth = drawHeight * imageRatio;
  } else {
    drawWidth = viewportWidth * zoom;
    drawHeight = drawWidth / imageRatio;
  }

  const offsetX = (viewportWidth - drawWidth) / 2 + pointerX;
  const offsetY = (viewportHeight - drawHeight) / 2 + pointerY + mobileYOffset;

  context.clearRect(0, 0, viewportWidth, viewportHeight);
  context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const normalized = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * normalized;
}

function updateContent(progress) {
  const dissolveOpacity = mapRange(progress, 0.78, 0.98, 0, 1);
  const canvasOpacity = 1 - mapRange(progress, 0.8, 0.98, 0, 1);
  const canvasBlur = mapRange(progress, 0.82, 1, 0, 18);

  canvas.style.opacity = clamp(canvasOpacity, 0, 1).toFixed(3);
  canvas.style.filter = `blur(${canvasBlur.toFixed(2)}px)`;
  if (canvasDissolve) {
    canvasDissolve.style.opacity = clamp(dissolveOpacity, 0, 1).toFixed(3);
  }

  const heroOpacity = 1 - mapRange(progress, 0.2, 0.5, 0, 1);
  const heroY = mapRange(progress, 0.08, 0.5, 0, -90);
  const heroScale = 1 - mapRange(progress, 0.15, 0.5, 0, 0.08);

  heroCopy.style.opacity = clamp(heroOpacity, 0, 1).toFixed(3);
  heroCopy.style.transform = `translate3d(-50%, ${heroY}px, 0) scale(${heroScale.toFixed(3)})`;

  const cardOpacity = mapRange(progress, 0.62, 0.82, 0, 1);
  const cardY = mapRange(progress, 0.62, 0.86, 96, 0);
  const cardScale = mapRange(progress, 0.62, 0.82, 0.92, 1);

  featureCard.style.opacity = clamp(cardOpacity, 0, 1).toFixed(3);
  featureCard.style.transform = `translate3d(-50%, calc(-50% + ${cardY}px), 0) scale(${cardScale.toFixed(3)})`;
}

function getScrollProgress() {
  const sectionTop = scrolly.offsetTop;
  const sectionHeight = scrolly.offsetHeight - getViewportHeight();
  const currentScroll = window.scrollY - sectionTop;
  return clamp(currentScroll / sectionHeight, 0, 1);
}

function syncTargetProgress() {
  targetProgress = getScrollProgress();
}

function animatePointer() {
  currentProgress += (targetProgress - currentProgress) * 0.085;
  if (Math.abs(targetProgress - currentProgress) < 0.0005) {
    currentProgress = targetProgress;
  }

  activeFrame = Math.min(FRAME_COUNT - 1, Math.round(currentProgress * (FRAME_COUNT - 1)));
  pointerX += (pointerTargetX - pointerX) * 0.08;
  pointerY += (pointerTargetY - pointerY) * 0.08;
  updateContent(currentProgress);
  drawFrame(activeFrame);
  rafId = window.requestAnimationFrame(animatePointer);
}

function handlePointerMove(event) {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = (event.clientY / window.innerHeight) * 2 - 1;
  pointerTargetX = x * POINTER_SHIFT;
  pointerTargetY = y * POINTER_SHIFT;
}

function preloadFrames() {
  const framePromises = [];

  for (let index = 0; index < FRAME_COUNT; index += 1) {
    framePromises.push(new Promise((resolve, reject) => {
      const img = new Image();
      img.src = buildFramePath(index);

      img.onload = () => {
        images[index] = img;
        loadedFrames += 1;
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Falha ao carregar o frame ${FRAME_SEQUENCE[index]}`));
      };
    }));
  }

  return Promise.all(framePromises);
}

async function init() {
  try {
    updateViewportUnit();
    await preloadFrames();
    resizeCanvas();
    syncTargetProgress();
    currentProgress = targetProgress;
    updateContent(currentProgress);
    drawFrame(activeFrame);

    window.addEventListener("scroll", syncTargetProgress, { passive: true });
    window.addEventListener("touchmove", syncTargetProgress, { passive: true });
    window.addEventListener("resize", () => {
      updateViewportUnit();
      resizeCanvas();
      syncTargetProgress();
      scheduleScrollTriggerRefresh();
    });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("orientationchange", () => {
      updateViewportUnit();
      resizeCanvas();
      syncTargetProgress();
      scheduleScrollTriggerRefresh();
    });
    window.addEventListener("load", scheduleScrollTriggerRefresh);
    window.addEventListener("pageshow", scheduleScrollTriggerRefresh);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => {
        updateViewportUnit();
        resizeCanvas();
        syncTargetProgress();
        scheduleScrollTriggerRefresh();
      });
      window.visualViewport.addEventListener("scroll", () => {
        updateViewportUnit();
        syncTargetProgress();
      });
    }

    if (!rafId) {
      rafId = window.requestAnimationFrame(animatePointer);
    }

    initScrollAnimations();
    initTestimonialsCarousel();
    initFaqAccordion();
    scheduleScrollTriggerRefresh();
  } catch (error) {
    console.error(error);
  }
}

init();
