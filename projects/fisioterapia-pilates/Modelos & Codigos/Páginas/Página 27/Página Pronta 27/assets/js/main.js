document.documentElement.classList.add("js");

if (window.gsap && window.ScrollTrigger) {
  if (window.SplitText) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }

  const hero = document.querySelector(".hero");
  const philosophy = document.querySelector(".philosophy");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hero && philosophy && !reduceMotion) {
    gsap.to(hero, {
      filter: "blur(14px)",
      opacity: 0.58,
      scale: 1.025,
      ease: "none",
      scrollTrigger: {
        trigger: philosophy,
        start: "top bottom",
        end: "top top",
        scrub: true
      }
    });
  }

  const outcomeItems = document.querySelectorAll(".outcome-item");

  if (outcomeItems.length && !reduceMotion) {
    gsap.from(outcomeItems, {
      y: 36,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.14,
      scrollTrigger: {
        trigger: ".outcomes__list",
        start: "top 78%",
        once: true
      }
    });
  }

  document.querySelectorAll(".philosophy").forEach((section) => {
    const target = section.querySelector("[data-split='words']");

    if (!target) {
      return;
    }

    const normalizeWord = (word) => word
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w]/g, "");

    const words = target.textContent.trim().split(/\s+/);
    const emphasisPhrases = (target.dataset.emphasis || "")
      .split("|")
      .map((phrase) => phrase.trim().split(/\s+/).map(normalizeWord).filter(Boolean))
      .filter((phrase) => phrase.length);

    target.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join(" ");

    const wordEls = Array.from(target.querySelectorAll(".word"));
    const normalizedWords = words.map(normalizeWord);

    emphasisPhrases.forEach((phrase) => {
      for (let index = 0; index <= normalizedWords.length - phrase.length; index += 1) {
        const matches = phrase.every((word, offset) => normalizedWords[index + offset] === word);

        if (matches) {
          wordEls
            .slice(index, index + phrase.length)
            .forEach((wordEl) => wordEl.classList.add("word--emphasis"));
        }
      }
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.to(wordEls, {
      opacity: 1,
      ease: "none",
      stagger: 0.5,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
  });
}

function debounce(fn, delay) {
  let timer;

  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function initProcessoCardsScrollReveal(root = document) {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const sections = root.querySelectorAll('[data-effect="processo-cards-scroll-reveal"]');

  sections.forEach((section) => {
    let context;
    let splits = [];

    const build = () => {
      if (context) {
        context.revert();
      }

      splits.forEach((split) => split.revert && split.revert());
      splits = [];

      context = gsap.context(() => {
        section.querySelectorAll(".effect-title, .effect-subtitle").forEach((element) => {
          const split = window.SplitText
            ? new SplitText(element, {
              type: element.classList.contains("effect-title") ? "lines, words, chars" : "lines",
              mask: "lines",
              autoSplit: true,
              linesClass: "line-split",
              wordDelimiter: "\u200D"
            })
            : null;

          if (split) {
            splits.push(split);
          }

          const targets = split
            ? (element.classList.contains("effect-title") ? split.chars : split.lines)
            : element;

          gsap.from(targets, {
            yPercent: 100,
            opacity: 0,
            duration: 0.8,
            stagger: element.classList.contains("effect-title") ? { amount: 0.2 } : 0.1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              once: true
            }
          });
        });

        const cards = section.querySelectorAll(".effect-card");
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const xStep = isDesktop ? 150 : 75;
        const yStep = isDesktop ? 200 : 100;

        gsap.from(cards, {
          x: (index) => (index + 1) * xStep,
          y: (index) => (index + 1) * yStep,
          rotate: (index) => gsap.utils.wrap([-1, 1], index) * gsap.utils.random(10, 25),
          stagger: {
            each: 0.1,
            ease: "power2.out"
          },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: isDesktop ? "bottom 50%" : "bottom bottom",
            scrub: true
          }
        });
      }, section);
    };

    build();
    window.addEventListener("resize", debounce(build, 200));
  });
}

const startProcessEffects = () => initProcessoCardsScrollReveal();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(startProcessEffects);
} else {
  startProcessEffects();
}
