const elementsMoveUpOnScroll = {
  init() {
    document.querySelectorAll('[data-move-up-on-scroll-element]').forEach((element) => {
      const start = getComputedStyle(element).top;
      const h = (element.offsetParent ?? document.documentElement).clientHeight;
      const px = Number.parseFloat(start);
      if (!h || Number.isNaN(px)) return;

      const n = Number.parseFloat(element.dataset.moveUpValue ?? '8');
      const delta = Number.isNaN(n) ? 8 : n;

      gsap.fromTo(
        element,
        { top: start },
        {
          top: `${(px / h) * 100 - delta}%`,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            end: 'bottom 20%',
            scrub: 1,
          },
        }
      );
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  elementsMoveUpOnScroll.init();
});
