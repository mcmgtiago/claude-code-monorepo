const revealMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('[data-jn-reveal]')];

let disconnectReveal = () => {};

function resetReveal() {
  revealElements.forEach((element) => {
    element.classList.remove('is-jn-pending', 'is-jn-visible');
  });
}

function initReveal() {
  disconnectReveal();
  resetReveal();

  if (revealMedia.matches || !('IntersectionObserver' in window)) {
    disconnectReveal = () => {};
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-jn-visible');
      entry.target.classList.remove('is-jn-pending');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08,
  });

  revealElements.forEach((element) => {
    element.classList.add('is-jn-pending');
    observer.observe(element);
  });

  disconnectReveal = () => observer.disconnect();
}

initReveal();

revealMedia.addEventListener('change', initReveal);

window.addEventListener('pagehide', () => {
  disconnectReveal();
  resetReveal();
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) initReveal();
});
