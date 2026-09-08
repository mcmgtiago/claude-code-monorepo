const LINE_CLASS = 'text-reveal-line';
const DEFAULT_DELAY = 0.1;
const LINES_CONFIG = { duration: 0.8, stagger: 0.08 };

function canReveal() {
  return typeof gsap !== 'undefined' && typeof SplitText !== 'undefined';
}

function initTextReveal() {
  if (!canReveal()) return;

  gsap.registerPlugin(SplitText);
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const elements = document.querySelectorAll('[data-text-reveal]');
  if (!elements.length) return;

  document.fonts.ready.then(() => {
    elements.forEach((el) => {
      const raw = el.dataset.revealDelay;
      const delay =
        raw !== undefined && raw !== '' && !Number.isNaN(Number.parseFloat(raw))
          ? Number.parseFloat(raw)
          : DEFAULT_DELAY;

      const instant = el.dataset.instant !== undefined && el.dataset.instant !== 'false';
      const start = el.dataset.start || 'top 90%';
      const end = el.dataset.end || 'top 50%';

      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: LINE_CLASS,
      });

      const lines = el.querySelectorAll(`.${LINE_CLASS}`);

      gsap.set(el, { opacity: 1 });

      const tweenVars = {
        yPercent: 0,
        opacity: 1,
        duration: LINES_CONFIG.duration,
        stagger: LINES_CONFIG.stagger,
        ease: 'power3.out',
        delay,
      };

      if (!instant && typeof ScrollTrigger !== 'undefined') {
        tweenVars.scrollTrigger = {
          trigger: el,
          start,
          end,
          scrub: false,
        };
      }

      gsap.fromTo(
        lines,
        { yPercent: 110, opacity: 0 },
        tweenVars
      );
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextReveal);
} else {
  initTextReveal();
}
