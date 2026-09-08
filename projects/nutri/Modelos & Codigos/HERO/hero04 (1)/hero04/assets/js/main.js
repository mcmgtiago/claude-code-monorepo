const hero = document.querySelector(".hero");
const gridPattern = document.querySelector("#grid");
const revealLayer = document.querySelector(".hero__reveal");
const maskCanvas = document.querySelector(".hero__mask-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
const context = maskCanvas ? maskCanvas.getContext("2d") : null;

window.addEventListener("load", () => {
  document.body.classList.add("is-ready");
});

if (hero && gridPattern && revealLayer && maskCanvas && context && supportsFinePointer && !prefersReducedMotion) {
  const mouse = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
  };
  const smooth = { ...mouse };
  const gridOffset = { x: 0, y: 0 };
  const cursorPos = { ...mouse };

  const resizeCanvas = () => {
    maskCanvas.width = window.innerWidth;
    maskCanvas.height = window.innerHeight;
  };

  const drawRevealMask = (cursorX, cursorY) => {
    context.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    const gradient = context.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 260);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,1)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.75)");
    gradient.addColorStop(0.75, "rgba(255,255,255,0.4)");
    gradient.addColorStop(0.88, "rgba(255,255,255,0.12)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.beginPath();
    context.arc(cursorX, cursorY, 260, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();

    const dataUrl = maskCanvas.toDataURL();
    revealLayer.style.maskImage = `url("${dataUrl}")`;
    revealLayer.style.webkitMaskImage = `url("${dataUrl}")`;
  };

  const animate = () => {
    smooth.x += (mouse.x - smooth.x) * 0.1;
    smooth.y += (mouse.y - smooth.y) * 0.1;

    const bounds = hero.getBoundingClientRect();
    const cx = (smooth.x - bounds.left) / bounds.width - 0.5;
    const cy = (smooth.y - bounds.top) / bounds.height - 0.5;

    gridOffset.x += (cx * 16 - gridOffset.x) * 0.06;
    gridOffset.y += (cy * 16 - gridOffset.y) * 0.06;

    cursorPos.x = smooth.x;
    cursorPos.y = smooth.y;

    gridPattern.setAttribute("x", gridOffset.x.toFixed(2));
    gridPattern.setAttribute("y", gridOffset.y.toFixed(2));

    drawRevealMask(cursorPos.x, cursorPos.y);

    window.requestAnimationFrame(animate);
  };

  hero.addEventListener("pointerenter", () => {
    hero.classList.add("is-interactive");
  });

  hero.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  hero.addEventListener("pointerleave", () => {
    const bounds = hero.getBoundingClientRect();

    mouse.x = bounds.left + bounds.width * 0.5;
    mouse.y = bounds.top + bounds.height * 0.5;
    hero.classList.remove("is-interactive");
  });

  resizeCanvas();
  drawRevealMask(cursorPos.x, cursorPos.y);

  window.addEventListener("resize", resizeCanvas);
  window.requestAnimationFrame(animate);
}
