const carouselTrack = document.querySelector("[data-carousel-track]");
const carouselNextButton = document.querySelector(".contents__arrow--next");
const carouselWrapper = document.querySelector(".contents__carousel");
const feedbackTrack = document.querySelector("[data-feedback-track]");
const feedbackSideButton = document.querySelector(".feedbacks__arrow--side");
const feedbackWrapper = document.querySelector(".feedbacks__carousel");
const draggableTracks = document.querySelectorAll("[data-draggable-track]");

const attachReveal = (selector, type, step = 0.04, start = 0) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.dataset.reveal = type;
    element.style.transitionDelay = `${start + index * step}s`;
  });
};

attachReveal(".brand, .hero__text h1, .hero__text p, .hero__cta", "fade-up", 0.04);
attachReveal(".about-ebook__title, .reasons__title, .contents__title, .bonus__title, .feedbacks__title, .pricing__title, .offer__title, .guarantee__title, .author__title, .faq__title", "title-write", 0.01);
attachReveal(".about-ebook__eyebrow, .reasons__eyebrow, .contents__eyebrow, .bonus__eyebrow, .feedbacks__eyebrow, .pricing__eyebrow, .offer__eyebrow, .guarantee__eyebrow, .author__eyebrow, .faq__eyebrow", "fade-up", 0.03);
attachReveal(".about-ebook__media, .bonus__visual, .author__visual, .offer-card", "blur-in", 0.03);
attachReveal(".about-ebook__copy p, .bonus__text, .bonus__price, .offer__subtitle, .guarantee__text, .author__copy p, .author__item, .faq-item", "fade-up", 0.04);
attachReveal(".reason-card, .price-card, .feedback-card", "soft-scale", 0.05);
attachReveal(".content-card", "slide-left", 0.04);
attachReveal(".reasons__cta, .about-ebook__cta, .bonus__cta, .offer-card__cta, .faq__cta", "tilt-up", 0.03);
attachReveal(".guarantee__seal", "soft-scale");

const revealBlocks = document.querySelectorAll("[data-reveal]");

if (revealBlocks.length) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    revealBlocks.forEach((block) => block.classList.add("is-visible"));
  } else {
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
        threshold: 0.08,
        rootMargin: "0px 0px -4% 0px",
      }
    );

    revealBlocks.forEach((block) => {
      if (block.closest(".hero__section")) {
        block.classList.add("is-visible");
        return;
      }

      revealObserver.observe(block);
    });
  }
}

const setupDragScroll = (track, onScrollChange) => {
  let pointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  track.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    startX = event.clientX;
    startScrollLeft = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!pointerDown) {
      return;
    }

    const delta = event.clientX - startX;
    track.scrollLeft = startScrollLeft - delta;
    if (onScrollChange) {
      onScrollChange();
    }
  });

  const endDrag = () => {
    if (!pointerDown) {
      return;
    }

    pointerDown = false;
    track.classList.remove("is-dragging");
    if (onScrollChange) {
      onScrollChange();
    }
  };

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("lostpointercapture", endDrag);
};

if (carouselTrack) {
  let carouselDirection = 1;

  const updateCarouselState = () => {
    const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
    const isAtStart = carouselTrack.scrollLeft <= 4;
    const isAtEnd = carouselTrack.scrollLeft >= maxScroll - 4;
    const canScroll = maxScroll > 4;

    if (!canScroll || isAtStart) {
      carouselDirection = 1;
    } else if (isAtEnd) {
      carouselDirection = -1;
    }

    if (carouselWrapper) {
      carouselWrapper.classList.toggle("is-end", isAtEnd || !canScroll);
      carouselWrapper.classList.toggle("is-back", carouselDirection === -1 && !isAtStart && canScroll);
    }

    if (carouselNextButton) {
      carouselNextButton.disabled = !canScroll;
      carouselNextButton.setAttribute("aria-disabled", String(!canScroll));
      carouselNextButton.setAttribute("aria-label", carouselDirection === -1 ? "Voltar conteudos" : "Avancar conteudos");
    }
  };

  setupDragScroll(carouselTrack, updateCarouselState);
  carouselTrack.addEventListener("scroll", updateCarouselState, { passive: true });

  if (carouselNextButton) {
    carouselNextButton.addEventListener("click", () => {
      const firstCard = carouselTrack.querySelector(".content-card");
      const step = firstCard ? firstCard.offsetWidth + 16 : 352;
      const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
      const nextScroll = carouselDirection === -1
        ? Math.max(carouselTrack.scrollLeft - step, 0)
        : Math.min(carouselTrack.scrollLeft + step, maxScroll);
      carouselTrack.scrollTo({ left: nextScroll, behavior: "smooth" });
    });
  }

  window.addEventListener("resize", updateCarouselState);
  updateCarouselState();
}

if (feedbackTrack) {
  const updateFeedbackState = () => {
    const maxScroll = feedbackTrack.scrollWidth - feedbackTrack.clientWidth;
    const isAtEnd = feedbackTrack.scrollLeft >= maxScroll - 4;
    const canScroll = maxScroll > 4;

    if (feedbackWrapper) {
      feedbackWrapper.classList.toggle("is-end", isAtEnd || !canScroll);
    }

    if (feedbackSideButton) {
      feedbackSideButton.disabled = isAtEnd || !canScroll;
      feedbackSideButton.setAttribute("aria-disabled", String(isAtEnd || !canScroll));
    }
  };

  feedbackTrack.addEventListener("scroll", updateFeedbackState, { passive: true });

  const advanceFeedback = () => {
    const firstCard = feedbackTrack.querySelector(".feedback-card");
    const step = firstCard ? firstCard.offsetWidth + 8 : 428;
    const maxScroll = feedbackTrack.scrollWidth - feedbackTrack.clientWidth;
    const nextScroll = Math.min(feedbackTrack.scrollLeft + step, maxScroll);
    feedbackTrack.scrollTo({ left: nextScroll, behavior: "smooth" });
  };

  if (feedbackSideButton) {
    feedbackSideButton.addEventListener("click", advanceFeedback);
  }

  window.addEventListener("resize", updateFeedbackState);
  updateFeedbackState();
}

draggableTracks.forEach((track) => {
  const callback = track === feedbackTrack
    ? () => {
        const maxScroll = feedbackTrack.scrollWidth - feedbackTrack.clientWidth;
        const isAtEnd = feedbackTrack.scrollLeft >= maxScroll - 4;
        const canScroll = maxScroll > 4;

        if (feedbackWrapper) {
          feedbackWrapper.classList.toggle("is-end", isAtEnd || !canScroll);
        }

        if (feedbackSideButton) {
          feedbackSideButton.disabled = isAtEnd || !canScroll;
          feedbackSideButton.setAttribute("aria-disabled", String(isAtEnd || !canScroll));
        }
      }
    : undefined;

  setupDragScroll(track, callback);
});
