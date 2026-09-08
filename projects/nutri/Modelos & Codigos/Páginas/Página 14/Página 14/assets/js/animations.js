/**
 * KIT: canadadsgn-infoproduto — Animações JS
 * Sistema de scroll-reveal via IntersectionObserver
 * + card glow tracking + smooth scroll
 */

(function () {
  'use strict';

  /* ── Scroll Reveal ── */
  var REVEAL_SELECTOR = '[data-anim="scroll-eb"]';
  var VISIBLE_CLASS = 'kit-visible';
  var DEFAULT_THRESHOLD = 0.15;

  function initScrollReveal() {
    var elements = document.querySelectorAll(REVEAL_SELECTOR);
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.dataset.animDelay;
            if (delay) {
              el.style.transitionDelay = delay + 'ms';
            }
            el.classList.add(VISIBLE_CLASS);
            observer.unobserve(el);
          }
        });
      },
      { threshold: DEFAULT_THRESHOLD }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ── Stagger children (anima filhos em sequência) ── */
  function initStaggerReveal() {
    var containers = document.querySelectorAll('[data-anim-stagger]');
    if (!containers.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var container = entry.target;
            var delayStep = parseInt(container.dataset.animStagger, 10) || 100;
            var children = container.children;

            Array.from(children).forEach(function (child, i) {
              child.style.transitionDelay = i * delayStep + 'ms';
              child.classList.add(VISIBLE_CLASS);
            });

            observer.unobserve(container);
          }
        });
      },
      { threshold: 0.1 }
    );

    containers.forEach(function (el) { observer.observe(el); });
  }

  /* ── Parallax sutil (elementos com data-parallax) ── */
  function initParallax() {
    var elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    var ticking = false;

    function updateParallax() {
      elements.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.1;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - window.innerHeight / 2) * speed;
        el.style.transform = 'translateY(' + offset + 'px)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Card Glow — rastreia posição do mouse para radial glow ── */
  function initCardGlow() {
    var cards = document.querySelectorAll('.kit-card-glow');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
        var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
        card.style.setProperty('--mouse-x', x);
        card.style.setProperty('--mouse-y', y);
      });
    });
  }

  /* ── Counter animado (numbers count up) ── */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseInt(el.dataset.counter, 10);
            var duration = parseInt(el.dataset.counterDuration, 10) || 2000;
            var startTime = null;

            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              var value = Math.floor(progress * target);
              el.textContent = value.toLocaleString('pt-BR');
              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                el.textContent = target.toLocaleString('pt-BR');
              }
            }

            requestAnimationFrame(step);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ── Smooth Scroll (suaviza scroll para links âncora) ── */
  function initSmoothScroll() {
    if ('scrollBehavior' in document.documentElement.style) return;
    // Fallback para browsers sem suporte nativo (já definido em CSS)
  }

  /* ── Init ── */
  function init() {
    initScrollReveal();
    initStaggerReveal();
    initParallax();
    initCardGlow();
    initCounters();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
