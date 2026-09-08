const hero = document.querySelector('.hero');
const reveal = document.querySelector('.hero__reveal');
const mobileQuery = window.matchMedia('(max-width: 760px)');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let mobileAnimationFrame = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function updateReveal(clientX, clientY) {
  const rect = hero.getBoundingClientRect();
  const width = Math.min(window.innerWidth * 0.34, 440);
  const height = clamp(window.innerWidth * 0.12, 82, 144);
  const mobileWidth = Math.min(window.innerWidth * 0.72, 360);
  const activeWidth = mobileQuery.matches ? mobileWidth : width;
  const activeHeight = mobileQuery.matches ? 96 : height;

  const x = clamp(clientX - rect.left, activeWidth / 2 + 12, rect.width - activeWidth / 2 - 12);
  const y = clamp(clientY - rect.top, activeHeight / 2 + 12, rect.height - activeHeight / 2 - 12);

  const left = x - activeWidth / 2;
  const top = y - activeHeight / 2;
  const right = rect.width - left - activeWidth;
  const bottom = rect.height - top - activeHeight;

  hero.style.setProperty('--reveal-x', `${x}px`);
  hero.style.setProperty('--reveal-y', `${y}px`);
  reveal.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 2px)`;
}

function activate(event) {
  if (mobileQuery.matches) {
    return;
  }

  hero.classList.add('is-active');
  updateReveal(event.clientX, event.clientY);
}

function deactivate() {
  if (mobileQuery.matches) {
    return;
  }

  hero.classList.remove('is-active');
}

function stopMobileLoop() {
  if (mobileAnimationFrame) {
    cancelAnimationFrame(mobileAnimationFrame);
    mobileAnimationFrame = null;
  }
}

function animateMobileReveal(time) {
  const rect = hero.getBoundingClientRect();
  const horizontal = Math.sin(time / 2200);
  const vertical = Math.sin(time / 3100 + 0.8);
  const x = rect.left + rect.width * (0.5 + horizontal * 0.18);
  const y = rect.top + rect.height * (0.46 + vertical * 0.2);

  updateReveal(x, y);
  mobileAnimationFrame = requestAnimationFrame(animateMobileReveal);
}

function syncRevealMode() {
  stopMobileLoop();

  if (!mobileQuery.matches) {
    hero.classList.remove('is-active');
    return;
  }

  hero.classList.add('is-active');

  if (reducedMotionQuery.matches) {
    const rect = hero.getBoundingClientRect();
    updateReveal(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return;
  }

  mobileAnimationFrame = requestAnimationFrame(animateMobileReveal);
}

hero.addEventListener('pointerenter', activate);
hero.addEventListener('pointermove', activate);
hero.addEventListener('pointerleave', deactivate);
hero.addEventListener('pointerdown', activate);

window.addEventListener('resize', () => {
  syncRevealMode();
});

window.addEventListener('load', () => {
  syncRevealMode();
});

mobileQuery.addEventListener('change', syncRevealMode);
reducedMotionQuery.addEventListener('change', syncRevealMode);
syncRevealMode();
