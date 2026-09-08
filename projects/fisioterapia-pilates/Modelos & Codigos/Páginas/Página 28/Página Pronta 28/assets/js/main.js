document.addEventListener('DOMContentLoaded', () => {
  initHeroMouseFollow();
  initScrollFadeIn();
  initMarqueeScroll();
  initAboutTextReveal();
  initProjectsStack();
});

/**
 * Move a imagem principal da hero acompanhando o cursor
 */
function initHeroMouseFollow() {
  const hero = document.querySelector('.hero-section');
  const portrait = document.querySelector('.hero-portrait-shell');
  if (!hero || !portrait) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const state = {
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0
  };

  const maxShiftX = 150;
  const maxShiftY = 64;

  const setTargetFromPointer = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    const pointerX = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const pointerY = ((clientY - rect.top) / rect.height - 0.5) * 2;

    state.targetX = pointerX * maxShiftX;
    state.targetY = pointerY * maxShiftY;
  };

  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    setTargetFromPointer(event.clientX, event.clientY);
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    state.targetX = 0;
    state.targetY = 0;
  });

  const tick = () => {
    state.currentX += (state.targetX - state.currentX) * 0.18;
    state.currentY += (state.targetY - state.currentY) * 0.18;

    hero.style.setProperty('--hero-shift-x', `${state.currentX.toFixed(2)}px`);
    hero.style.setProperty('--hero-shift-y', `${state.currentY.toFixed(2)}px`);
    hero.style.setProperty('--hero-rotate-x', `${(-state.currentY * 0.055).toFixed(2)}deg`);
    hero.style.setProperty('--hero-rotate-y', `${(state.currentX * 0.055).toFixed(2)}deg`);

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/**
 * Fade-in de elementos ao entrar na viewport
 */
function initScrollFadeIn() {
  const elements = document.querySelectorAll('.scroll-fade-in');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // once: true
      }
    });
  }, {
    root: null,
    rootMargin: '50px',
    threshold: 0
  });

  elements.forEach(el => observer.observe(el));
}

/**
 * Carrossel em duas linhas reagindo ao scroll da página
 */
function initMarqueeScroll() {
  const marqueeSection = document.querySelector('.marquee-section');
  const track1 = document.querySelector('.marquee-track-1');
  const track2 = document.querySelector('.marquee-track-2');

  if (!marqueeSection || !track1 || !track2) return;

  const tick = () => {
    const sectionRect = marqueeSection.getBoundingClientRect();
    const sectionTop = sectionRect.top + window.scrollY;

    if (sectionRect.bottom >= 0 && sectionRect.top <= window.innerHeight) {
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;

      track1.style.transform = `translate3d(${offset - 200}px, 0, 0)`;
      track2.style.transform = `translate3d(${-(offset - 200)}px, 0, 0)`;
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/**
 * Revela o texto do sobre caractere por caractere durante o scroll
 */
function initAboutTextReveal() {
  const paragraph = document.querySelector('.about-paragraph');
  if (!paragraph) return;

  const originalText = paragraph.textContent.trim();
  paragraph.innerHTML = '';

  const chars = originalText.split('').map(char => {
    const span = document.createElement('span');
    span.classList.add('char');
    span.textContent = char;
    paragraph.appendChild(span);
    return span;
  });

  const handleScroll = () => {
    const rect = paragraph.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    const startOffset = viewHeight * 0.8;
    const endOffset = viewHeight * 0.2;

    const totalRange = startOffset - endOffset;
    const currentPos = rect.top;

    let progress = (startOffset - currentPos) / totalRange;
    progress = Math.max(0, Math.min(1, progress));

    const numChars = chars.length;
    chars.forEach((char, idx) => {
      const charStart = (idx / numChars) * 0.85;
      const charProgress = (progress - charStart) / 0.15;
      const opacity = 0.2 + 0.8 * Math.max(0, Math.min(1, charProgress));
      char.style.opacity = opacity;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Empilha os cards de cases com leve redução de escala
 */
function initProjectsStack() {
  const containers = Array.from(document.querySelectorAll('.project-card-wrapper'));
  if (containers.length === 0) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const section = document.querySelector('.projects-section');
  if (!section) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  containers.forEach((container, idx) => {
    container.style.zIndex = String(idx + 1);
  });

  const tick = () => {
    const sectionRect = section.getBoundingClientRect();
    const isVisible = sectionRect.bottom > 0 && sectionRect.top < window.innerHeight;

    if (!isVisible) {
      requestAnimationFrame(tick);
      return;
    }

    containers.forEach((container, idx) => {
      const card = container.querySelector('.project-card');
      if (!card) return;

      let scale = 1;
      let translateY = 0;
      let overlayOpacity = 0;
      let brightness = 1;

      for (let offset = 1; offset <= 2; offset += 1) {
        const nextContainer = containers[idx + offset];
        if (!nextContainer) continue;

        const nextCard = nextContainer.querySelector('.project-card');
        if (!nextCard) continue;

        const nextRect = nextContainer.getBoundingClientRect();
        const stickyTop = parseFloat(window.getComputedStyle(nextCard).top) || 96;
        const startY = window.innerHeight * 0.92;
        const endY = stickyTop;
        const progress = clamp((startY - nextRect.top) / (startY - endY), 0, 1);
        const influence = offset === 1 ? 1 : 0.55;

        scale -= progress * 0.055 * influence;
        translateY -= progress * 28 * influence;
        overlayOpacity += progress * 0.2 * influence;
        brightness -= progress * 0.075 * influence;
      }

      const safeScale = clamp(scale, 0.89, 1);
      const safeBrightness = clamp(brightness, 0.84, 1);
      const safeOverlay = clamp(overlayOpacity, 0, 0.28);

      card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${safeScale.toFixed(4)})`;
      card.style.filter = `brightness(${safeBrightness.toFixed(3)})`;
      card.style.setProperty('--stack-overlay-opacity', safeOverlay.toFixed(3));
    });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
