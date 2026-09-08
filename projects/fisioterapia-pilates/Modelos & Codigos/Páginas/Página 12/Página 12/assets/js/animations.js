/**
 * Kit Makro — Animações de Scroll (Intersection Observer)
 * Sem dependências externas — vanilla JS
 */
(function() {
  'use strict';

  // Intersection Observer para reveal on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('kit-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  // Observar todos os elementos [data-anim]
  function initAnimations() {
    const animatedElements = document.querySelectorAll('[data-anim]');
    if (!animatedElements.length) return;

    // Garante conteúdo visível no primeiro paint (evita NO_FCP no Lighthouse/PageSpeed).
    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inInitialViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (inInitialViewport) {
        el.classList.add('kit-visible');
      }
    });

    // Só após preparar os elementos visíveis ativamos o modo de animação.
    document.documentElement.classList.add('anim-init');

    animatedElements.forEach((el) => {
      observer.observe(el);
    });
  }

  // Nav scroll effect
  function initNavScroll() {
    const nav = document.querySelector('.kit-nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            nav.classList.add('kit-nav--scrolled');
          } else {
            nav.classList.remove('kit-nav--scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Pricing toggle
  function initPricingToggle() {
    const toggleOptions = document.querySelectorAll('.kit-toggle__option');
    if (!toggleOptions.length) return;

    toggleOptions.forEach((option) => {
      option.addEventListener('click', () => {
        toggleOptions.forEach((o) => o.classList.remove('kit-toggle__option--active'));
        option.classList.add('kit-toggle__option--active');

        const period = option.dataset.period;
        document.querySelectorAll('[data-price-monthly]').forEach((el) => {
          if (period === 'annual') {
            el.textContent = el.dataset.priceAnnual;
          } else {
            el.textContent = el.dataset.priceMonthly;
          }
        });
      });
    });
  }

  // FAQ accordion
  function initFaqAccordion() {
    document.querySelectorAll('.kit-faq__item').forEach((item) => {
      const trigger = item.querySelector('.kit-faq__question');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('kit-faq__item--open');

        // Close all others
        document.querySelectorAll('.kit-faq__item--open').forEach((openItem) => {
          openItem.classList.remove('kit-faq__item--open');
        });

        if (!isOpen) {
          item.classList.add('kit-faq__item--open');
        }
      });
    });
  }

  // Scroll story — Bloco 3 (frase 1 surge, frase 2 substitui sem descer a página)
  function initScrollStory() {
    var section = document.querySelector('.pna-story-section');
    if (!section) return;

    var phrase1 = document.getElementById('pna-story-1');
    var phrase2 = document.getElementById('pna-story-2');
    if (!phrase1 || !phrase2) return;

    var currentState = 0; // 0 = nenhuma, 1 = frase 1, 2 = frase 2

    function setState(state) {
      if (state === currentState) return;
      currentState = state;

      phrase1.classList.toggle('pna-story-phrase--active', state === 1);
      phrase1.classList.toggle('pna-story-phrase--exit',   state === 2);
      if (state !== 2) phrase1.classList.remove('pna-story-phrase--exit');

      phrase2.classList.toggle('pna-story-phrase--active', state === 2);
      phrase2.classList.remove('pna-story-phrase--exit');

      if (state === 0) {
        phrase1.classList.remove('pna-story-phrase--active', 'pna-story-phrase--exit');
        phrase2.classList.remove('pna-story-phrase--active');
      }
    }

    function onScroll() {
      var rect     = section.getBoundingClientRect();
      var scrolled = -rect.top;
      var range    = section.offsetHeight - window.innerHeight;

      if (scrolled < 0 || range <= 0) {
        setState(0);
        return;
      }

      var progress = scrolled / range; // 0 → 1
      if (progress < 0.45) {
        setState(1);
      } else {
        setState(2);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll-driven background change for "Como funciona" section (Tidy Build effect)
  function initScrollSteps() {
    const section = document.querySelector('.pna-steps-scroll-section');
    if (!section) return;

    const panels = section.querySelectorAll('.pna-step-panel');
    if (!panels.length) return;

    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const phase = entry.target.dataset.phase || '1';
            section.classList.remove('pna-steps--phase-1', 'pna-steps--phase-2', 'pna-steps--phase-3');
            section.classList.add('pna-steps--phase-' + phase);
          }
        });
      },
      { threshold: 0.5 }
    );

    panels.forEach((panel) => panelObserver.observe(panel));
  }

  // Init everything on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initAnimations();
    initNavScroll();
    initSmoothScroll();
    initPricingToggle();
    initFaqAccordion();
    initScrollStory();
    initScrollSteps();
  }
})();
