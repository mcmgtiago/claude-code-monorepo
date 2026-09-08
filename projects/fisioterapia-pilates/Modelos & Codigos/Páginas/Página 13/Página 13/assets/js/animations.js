/* ═══════════════════════════════════════════════════════════
   Kit: New Genre Studio — Animations JS v3
   Advanced GSAP ScrollTrigger — dissolve, parallax, unique entrances
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP ou ScrollTrigger ausentes.");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── 1. Parallax Orbs ──
  function initParallax() {
    var orbs = document.querySelectorAll(".page-orb");
    orbs.forEach(function(orb, i) {
      var speed = i % 2 === 0 ? 120 : -80;
      gsap.to(orb, {
        y: speed,
        ease: "none",
        scrollTrigger: {
          trigger: orb.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 2
        }
      });
    });

    // Hero content fade away on scroll
    var heroContent = document.querySelector(".page-hero__content");
    if (heroContent) {
      gsap.to(heroContent, {
        y: 80,
        opacity: 0,
        scrollTrigger: {
          trigger: ".page-hero",
          start: "top top",
          end: "bottom 30%",
          scrub: 1
        }
      });
    }
  }

  // ── 2. Text reveal with split lines ──
  function initTextReveals() {
    // Section headers: fade up with blur dissolve
    var headers = document.querySelectorAll(".page-problema__header, .page-beneficios__header, .page-metodo__header, .page-faq__header, .page-entrega > div:first-child, .page-bonus > div:first-child");
    headers.forEach(function(header) {
      var title = header.querySelector(".kit-h2");
      var label = header.querySelector(".kit-label");
      var body = header.querySelector(".kit-body-lg");

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      if (label) {
        tl.from(label, { y: 20, opacity: 0, duration: 0.5, ease: "power2.out" }, 0);
      }
      if (title) {
        tl.from(title, { y: 30, opacity: 0, filter: "blur(6px)", duration: 0.8, ease: "power3.out" }, 0.1);
      }
      if (body) {
        tl.from(body, { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, 0.3);
      }
    });
  }

  // ── 3. H1 word reveal ──
  function initWordReveal() {
    var elements = document.querySelectorAll("[data-anim='word-reveal']");
    elements.forEach(function(el) {
      var text = el.textContent.trim();
      var words = text.split(/\s+/);
      el.innerHTML = "";
      words.forEach(function(word, i) {
        var span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        el.appendChild(span);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });

      gsap.from(el.querySelectorAll("span"), {
        scrollTrigger: {
          trigger: el,
          start: "top 90%"
        },
        y: 30,
        opacity: 0,
        filter: "blur(4px)",
        duration: 0.7,
        stagger: 0.04,
        ease: "power3.out"
      });
    });
  }

  // ── 4. Cards: unique entrances per section ──
  function initCardEntrances() {
    // Problema cards: stagger from left with border flash
    var problemaGrid = document.querySelector(".page-problema__grid");
    if (problemaGrid) {
      gsap.from(problemaGrid.children, {
        scrollTrigger: { trigger: problemaGrid, start: "top 85%", toggleActions: "play none none reverse" },
        x: -40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out"
      });
    }

    // Beneficio cards: fade up with blur (glassmorphism reveal)
    var beneficios = document.querySelector(".page-beneficios__grid");
    if (beneficios) {
      gsap.from(beneficios.children, {
        scrollTrigger: { trigger: beneficios, start: "top 85%", toggleActions: "play none none reverse" },
        y: 50,
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out"
      });
    }

    // Steps: horizontal slide alternating
    var steps = document.querySelectorAll(".page-metodo__step");
    if (steps.length) {
      steps.forEach(function(step, i) {
        gsap.from(step, {
          scrollTrigger: { trigger: step, start: "top 88%", toggleActions: "play none none reverse" },
          x: i % 2 === 0 ? -30 : 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        });
      });
    }

    // Para Quem columns: scale in from center
    var cols = document.querySelectorAll(".page-paraquem__col");
    if (cols.length) {
      gsap.from(cols, {
        scrollTrigger: { trigger: ".page-paraquem", start: "top 80%", toggleActions: "play none none reverse" },
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.4)"
      });
    }

    // Módulos: stagger from bottom with rotation
    var entregaGrid = document.querySelector(".page-entrega__grid");
    if (entregaGrid) {
      gsap.from(entregaGrid.children, {
        scrollTrigger: { trigger: entregaGrid, start: "top 85%", toggleActions: "play none none reverse" },
        y: 40,
        rotation: 1,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out"
      });
    }

    // Bonus cards: scale up with glow
    var bonusGrid = document.querySelector(".page-bonus__grid");
    if (bonusGrid) {
      gsap.from(bonusGrid.children, {
        scrollTrigger: { trigger: bonusGrid, start: "top 85%", toggleActions: "play none none reverse" },
        scale: 0.85,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "elastic.out(1, 0.6)"
      });
    }

    // FAQ items: cascade from left
    var faqs = document.querySelectorAll(".page-faq__item");
    if (faqs.length) {
      gsap.from(faqs, {
        scrollTrigger: { trigger: ".page-faq__list", start: "top 85%", toggleActions: "play none none reverse" },
        x: -25,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out"
      });
    }


  }

  // ── 5. Mecanismo: Intersecting Deck Cards (Scroll Trigger Reveal) ──
  function initMecanismoStackScroll() {
    var cards = document.querySelectorAll('.page-mecanismo__deck .page-mecanismo__card');
    if (!cards.length) return;

    // Fallback safety: keep cards visible even if ScrollTrigger is interrupted.
    gsap.set(cards, { opacity: 1, visibility: "visible" });

    gsap.from(cards, {
      scrollTrigger: {
        trigger: ".page-mecanismo__deck",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 50,
      rotateY: 0,
      scale: 0.9,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.7)",
      immediateRender: false
    });
  }

  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll("[data-anim]:not([data-anim='word-reveal'])");

    animatedElements.forEach(function(el) {
      // Skip elements already handled by dedicated init functions
      if (el.closest(".page-problema__grid") || el.closest(".page-beneficios__grid") ||
          el.closest(".page-entrega__grid") || el.closest(".page-bonus__grid") ||
          el.closest(".page-paraquem") || el.closest(".page-faq") ||
          el.closest(".page-metodo__steps") || el.closest("#oferta")) {
        return;
      }

      var yMove = 40;
      var xMove = 0;
      if (el.dataset.anim === "slide-reveal") { yMove = 0; xMove = -40; }

      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse"
        },
        y: yMove,
        x: xMove,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: (parseFloat(el.dataset.animDelay) || 0) / 1000
      });
    });
  }

  // ── 6. Dissolving section transitions (pin + crossfade) ──
  function initDissolveTransitions() {
    var strips = document.querySelectorAll(".page-gradient-strip");
    strips.forEach(function(strip) {
      var prevSection = strip.previousElementSibling;
      if (!prevSection || prevSection.tagName !== "SECTION") return;

      // Apply blur dissolve only after user has scrolled well into the strip
      gsap.to(prevSection, {
        scrollTrigger: {
          trigger: strip,
          start: "top 30%",
          end: "bottom top",
          scrub: 1.5
        },
        filter: "blur(3px)",
        opacity: 0.7,
        ease: "none"
      });

      // Reset when scrolling back up past the strip
      ScrollTrigger.create({
        trigger: strip,
        start: "top 80%",
        onLeaveBack: function() {
          gsap.to(prevSection, { filter: "blur(0px)", opacity: 1, duration: 0.4 });
        }
      });
    });
  }

  // ── 7. Metric bars ── removed (section no longer in page)

  // ── 8. Bio section parallax ──
  function initBioParallax() {
    var bioImage = document.querySelector(".page-bio__image");
    if (!bioImage) return;
    gsap.fromTo(bioImage, { y: 40 }, {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: ".page-bio",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5
      }
    });
  }

  // ── 9. Oferta + CTA final entrances ──
  function initOfertaAnimations() {
    var ofertaCard = document.querySelector(".page-oferta__card");
    if (ofertaCard) {
      gsap.from(ofertaCard, {
        scrollTrigger: { trigger: ofertaCard, start: "top 85%", toggleActions: "play none none reverse" },
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power3.out"
      });
    }
    var garantia = document.querySelector(".page-garantia--dark");
    if (garantia) {
      gsap.from(garantia, {
        scrollTrigger: { trigger: garantia, start: "top 90%", toggleActions: "play none none reverse" },
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out"
      });
    }
  }

  // ── Init ──
  document.addEventListener("DOMContentLoaded", function() {
    initParallax();
    initTextReveals();
    initWordReveal();
    initCardEntrances();
    initMecanismoStackScroll();
    initScrollAnimations();
    initDissolveTransitions();
    initBioParallax();
    initOfertaAnimations();
  });
})();
