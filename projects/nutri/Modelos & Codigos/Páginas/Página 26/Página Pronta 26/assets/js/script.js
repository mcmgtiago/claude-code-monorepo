"use strict";

const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));

if (revealElements.length > 0) {
  revealElements.forEach((element) => {
    element.classList.add("reveal-ready");
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
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }
}

const scrollFadeElements = Array.from(document.querySelectorAll("[data-scroll-fade]"));

if (scrollFadeElements.length > 0) {
  scrollFadeElements.forEach((element) => {
    element.classList.add("scroll-fade-ready");
  });

  if ("IntersectionObserver" in window) {
    const scrollFadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting && entry.intersectionRatio > 0.22);
        });
      },
      {
        threshold: [0, 0.22, 0.45],
        rootMargin: "-6% 0px -14% 0px",
      }
    );

    scrollFadeElements.forEach((element) => {
      scrollFadeObserver.observe(element);
    });
  } else {
    scrollFadeElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }
}

document.querySelectorAll("[data-access-slider]").forEach((slider) => {
  const track = slider.querySelector("[data-access-track]");
  const slides = Array.from(slider.querySelectorAll("[data-access-slide]"));
  const prevButton = slider.querySelector("[data-access-prev]");
  const nextButton = slider.querySelector("[data-access-next]");
  const section = slider.closest(".access");
  const dotsContainer = section ? section.querySelector("[data-access-dots]") : null;

  if (!track || slides.length === 0 || !prevButton || !nextButton || !dotsContainer) {
    return;
  }

  let activeIndex = 0;
  let slidesPerView = 1;
  let dots = [];
  let maxIndex = 0;

  const getSlidesPerView = () => {
    if (window.innerWidth <= 720) {
      return 1;
    }

    if (window.innerWidth <= 1100) {
      return 2;
    }

    return 4;
  };

  const getStepSize = () => {
    if (slides.length === 0) {
      return 0;
    }

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.gap || styles.columnGap || "0") || 0;
    return slides[0].getBoundingClientRect().width + gap;
  };

  const clampIndex = (value) => Math.max(0, Math.min(value, maxIndex));

  const syncUi = (index) => {
    activeIndex = clampIndex(index);

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === maxIndex;
  };

  const goToSlide = (index, smooth = true) => {
    const targetIndex = clampIndex(index);
    const stepSize = getStepSize();

    syncUi(targetIndex);
    track.style.transitionDuration = smooth ? "320ms" : "0ms";
    track.style.transform = `translateX(-${targetIndex * stepSize}px)`;
  };

  const createDots = () => {
    dotsContainer.innerHTML = "";
    dots = Array.from({ length: maxIndex + 1 }, (_, index) => {
      const dot = document.createElement("button");
      const endIndex = Math.min(index + slidesPerView, slides.length);

      dot.className = "access__dot";
      dot.type = "button";
      dot.dataset.accessDot = String(index);
      dot.setAttribute("aria-label", `Ir para os modulos ${index + 1} a ${endIndex}`);
      dot.addEventListener("click", () => {
        goToSlide(index);
      });

      dotsContainer.append(dot);
      return dot;
    });
  };

  const buildSlider = () => {
    slidesPerView = getSlidesPerView();
    maxIndex = Math.max(0, slides.length - slidesPerView);
    createDots();
    syncUi(Math.min(activeIndex, maxIndex));
  };

  prevButton.addEventListener("click", () => {
    goToSlide(activeIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    goToSlide(activeIndex + 1);
  });

  window.addEventListener("resize", () => {
    buildSlider();
    goToSlide(activeIndex, false);
  });

  buildSlider();
  goToSlide(0, false);
});
