const avatar = {
  init() {
    const avatars = document.querySelectorAll("[data-opai-avatar]");
    avatars.forEach((el) => {
      const delay = el.getAttribute("data-avatar-delay") ? parseFloat(el.getAttribute("data-avatar-delay")) : 0;
      const direction = el.getAttribute("data-avatar-direction") ? el.getAttribute("data-avatar-direction") : "left";
      const scale = el.getAttribute("data-avatar-scale") ? parseFloat(el.getAttribute("data-avatar-scale")) : 0;
      const offset = el.getAttribute("data-avatar-offset") ? parseFloat(el.getAttribute("data-avatar-offset")) : 0;
      const animationProps = {
        duration: 1.5,
        opacity: 0,
        scale,
        filter: "blur(5px)",
        delay,
        ease: "elastic.out(1, 0.7)",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          end: "bottom 20%"
        }
      };
      switch (direction) {
        case "left":
          animationProps.x = -offset;
          break;
        case "right":
          animationProps.x = offset;
          break;
        case "down":
          animationProps.y = offset;
          break;
        case "up":
        default:
          animationProps.y = -offset;
          break;
      }
      gsap.from(el, animationProps);
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  avatar.init();
});
document.addEventListener("DOMContentLoaded", function() {
  const numberObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const {
            number: numberStr,
            speed: speedStr,
            interval: intervalStr,
            rooms: roomsStr,
            heightSpace: dataSpace
          } = element.dataset;
          const number = Number.parseInt(numberStr, 10);
          const speed = Number.parseInt(speedStr, 10) || 800;
          const interval = Number.parseInt(intervalStr, 10) || 150;
          const rooms = Number.parseInt(roomsStr, 10) || 2;
          if (!element.classList.contains("animated")) {
            element.classList.add("animated");
            NumberAnimation(element, {
              number,
              speed,
              interval,
              rooms,
              dataSpace,
              // Pass the data-space attribute
              fontStyle: {
                "font-size": "inherit",
                color: "inherit"
              }
            });
          }
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: "0px 0px -50px 0px"
    }
  );
  const numberElements = document.querySelectorAll("[data-counter]");
  numberElements.forEach((element) => {
    numberObserver.observe(element);
  });
});
const elementsMoveUpOnScroll = {
  init() {
    document.querySelectorAll("[data-move-up-on-scroll-element]").forEach((element) => {
      const start = getComputedStyle(element).top;
      const h = (element.offsetParent ?? document.documentElement).clientHeight;
      const px = Number.parseFloat(start);
      if (!h || Number.isNaN(px)) return;
      const n = Number.parseFloat(element.dataset.moveUpValue ?? "8");
      const delta = Number.isNaN(n) ? 8 : n;
      gsap.fromTo(
        element,
        { top: start },
        {
          top: `${px / h * 100 - delta}%`,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            end: "bottom 20%",
            scrub: 1
          }
        }
      );
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  elementsMoveUpOnScroll.init();
});
if (typeof globalThis !== "undefined" && globalThis.gsap && globalThis.ScrollTrigger) {
  globalThis.gsap.registerPlugin(globalThis.ScrollTrigger);
}
const headerAnimation = {
  headerOne() {
    const header = document.querySelector(".header-one");
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.style.transition = "all 0.5s ease-in-out";
          header.classList.add("scroll-header");
        } else {
          header.classList.remove("scroll-header");
        }
      });
    }
  }
};
if (typeof window !== "undefined") {
  headerAnimation.headerOne();
}
class MobileMenuAccordion {
  constructor(options = {}) {
    this.defaultOpenMenu = options.defaultOpenMenu || "company";
    this.toggleButtons = null;
    this.submenus = null;
    this.arrows = null;
    this.sidebar = null;
    this.onSubmenuLinkClick = this.onSubmenuLinkClick.bind(this);
    this.init();
  }
  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.bindEvents());
    } else {
      this.bindEvents();
    }
  }
  clearToggleSelected() {
    if (!this.toggleButtons) return;
    this.toggleButtons.forEach((btn) => btn.removeAttribute("data-selected"));
  }
  setToggleSelected(button2) {
    this.clearToggleSelected();
    if (button2) {
      button2.setAttribute("data-selected", "true");
    }
  }
  clearLinkSelected() {
    if (!this.sidebar) return;
    this.sidebar.querySelectorAll(".mobile-submenu a").forEach((a) => a.removeAttribute("data-selected"));
  }
  syncLinkSelectedFromPath() {
    if (!this.sidebar) return;
    this.clearLinkSelected();
    const segments = window.location.pathname.split("/").filter(Boolean);
    const current = segments.length ? segments[segments.length - 1] : "index.html";
    this.sidebar.querySelectorAll(".mobile-submenu a").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const file = href.replace(/^\.\//, "").split(/[?#]/)[0];
      if (file === current) {
        a.setAttribute("data-selected", "true");
      }
    });
  }
  onSubmenuLinkClick(e) {
    var _a, _b, _c;
    const link = (_b = (_a = e.target).closest) == null ? void 0 : _b.call(_a, ".mobile-submenu a");
    if (!link || !((_c = this.sidebar) == null ? void 0 : _c.contains(link))) {
      return;
    }
    this.clearLinkSelected();
    link.setAttribute("data-selected", "true");
  }
  bindEvents() {
    this.toggleButtons = document.querySelectorAll(".mobile-menu-toggle[data-menu]");
    if (this.toggleButtons.length === 0) {
      return;
    }
    this.sidebar = this.toggleButtons[0].closest("aside.sidebar");
    if (this.sidebar && !this.sidebar.dataset.submenuLinkDelegate) {
      this.sidebar.dataset.submenuLinkDelegate = "true";
      this.sidebar.addEventListener("click", this.onSubmenuLinkClick);
    }
    this.submenus = document.querySelectorAll(".mobile-submenu[data-submenu]");
    this.arrows = document.querySelectorAll(".mobile-menu-toggle .menu-arrow");
    this.setDefaultState();
    this.toggleButtons.forEach((button2) => {
      button2.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const menuId = button2.getAttribute("data-menu");
        this.toggleMenu(menuId);
      });
    });
  }
  setDefaultState() {
    this.clearToggleSelected();
    this.submenus.forEach((submenu) => {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
    });
    this.arrows.forEach((arrow) => {
      arrow.classList.remove("rotate-90");
    });
    if (this.defaultOpenMenu) {
      const defaultSubmenu = document.querySelector(
        `.mobile-submenu[data-submenu="${this.defaultOpenMenu}"]`
      );
      const defaultButton = document.querySelector(
        `.mobile-menu-toggle[data-menu="${this.defaultOpenMenu}"]`
      );
      const defaultArrow = defaultButton == null ? void 0 : defaultButton.querySelector(".menu-arrow");
      if (defaultSubmenu) {
        defaultSubmenu.classList.remove("hidden");
        defaultSubmenu.classList.add("block");
      }
      if (defaultArrow) {
        defaultArrow.classList.add("rotate-90");
      }
      if (defaultButton) {
        this.setToggleSelected(defaultButton);
      }
    }
    this.syncLinkSelectedFromPath();
  }
  toggleMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button2 = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button2 == null ? void 0 : button2.querySelector(".menu-arrow");
    if (!submenu || !button2) {
      return;
    }
    const isCurrentlyOpen = submenu.classList.contains("block") && !submenu.classList.contains("hidden");
    this.closeAllMenus();
    if (isCurrentlyOpen) {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
      if (arrow) {
        arrow.classList.remove("rotate-90");
      }
      this.clearToggleSelected();
    } else {
      submenu.classList.remove("hidden");
      submenu.classList.add("block");
      if (arrow) {
        arrow.classList.add("rotate-90");
      }
      this.setToggleSelected(button2);
    }
  }
  closeAllMenus() {
    this.submenus.forEach((submenu) => {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
    });
    this.arrows.forEach((arrow) => {
      arrow.classList.remove("rotate-90");
    });
    this.clearToggleSelected();
  }
  openMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button2 = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button2 == null ? void 0 : button2.querySelector(".menu-arrow");
    if (submenu && button2) {
      this.closeAllMenus();
      submenu.classList.remove("hidden");
      submenu.classList.add("block");
      if (arrow) {
        arrow.classList.add("rotate-90");
      }
      this.setToggleSelected(button2);
    }
  }
  closeMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button2 = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button2 == null ? void 0 : button2.querySelector(".menu-arrow");
    if (submenu && button2) {
      submenu.classList.add("hidden");
      submenu.classList.remove("block");
      if (arrow) {
        arrow.classList.remove("rotate-90");
      }
      button2.removeAttribute("data-selected");
    }
  }
  reinit() {
    this.bindEvents();
  }
  setDefaultOpenMenu(menuId) {
    this.defaultOpenMenu = menuId;
    this.setDefaultState();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuExists = document.querySelector(".mobile-menu-toggle[data-menu]");
  if (mobileMenuExists) {
    window.mobileMenuAccordion = new MobileMenuAccordion({
      defaultOpenMenu: "company"
    });
  }
});
const animation = {
  init() {
    const elements = document.querySelectorAll("[data-opai-animate]");
    const Springer = window.Springer.default;
    elements.forEach((elem) => {
      const duration = elem.getAttribute("data-duration") ? parseFloat(elem.getAttribute("data-duration")) : 0.6;
      const blur = elem.getAttribute("data-blur") ? parseFloat(elem.getAttribute("data-blur")) : 0;
      const delay = elem.getAttribute("data-delay") ? parseFloat(elem.getAttribute("data-delay")) : 0;
      const offset = elem.getAttribute("data-offset") ? parseFloat(elem.getAttribute("data-offset")) : 60;
      const instant = elem.hasAttribute("data-instant") && elem.getAttribute("data-instant") !== "false";
      const start = elem.getAttribute("data-start") || "top 90%";
      const end = elem.getAttribute("data-end") || "top 50%";
      const direction = elem.getAttribute("data-direction") || "down";
      const useSpring = elem.hasAttribute("data-spring");
      const spring = useSpring ? Springer(0.2, 0.8) : null;
      const rotation = elem.getAttribute("data-rotation") ? parseFloat(elem.getAttribute("data-rotation")) : 0;
      const scale = elem.getAttribute("data-scale") ? parseFloat(elem.getAttribute("data-scale")) : 1;
      const animationType = elem.getAttribute("data-animation-type") || "from";
      elem.style.opacity = "1";
      elem.style.filter = `blur(${blur}px)`;
      let animationProps;
      if (animationType === "to") {
        animationProps = {
          opacity: 1,
          filter: "blur(0)",
          duration,
          delay,
          ease: useSpring ? spring : "power2.out",
          scale
        };
        if (rotation !== 0) {
          animationProps.rotation = rotation;
        }
      } else {
        animationProps = {
          opacity: 0,
          filter: "blur(16px)",
          duration,
          delay,
          ease: useSpring ? spring : "power2.out"
        };
        if (rotation !== 0) {
          animationProps.rotation = rotation;
        }
      }
      if (!instant) {
        animationProps.scrollTrigger = {
          trigger: elem,
          start,
          end,
          scrub: false
        };
      }
      switch (direction) {
        case "left":
          animationProps.x = -offset;
          break;
        case "right":
          animationProps.x = offset;
          break;
        case "down":
          animationProps.y = offset;
          break;
        case "up":
        default:
          animationProps.y = -offset;
          break;
      }
      if (animationType === "to") {
        gsap.to(elem, animationProps);
      } else {
        gsap.from(elem, animationProps);
      }
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  animation.init();
});
const sidebarAnimation = {
  elements: null,
  init() {
    try {
      this.cacheElements();
      this.bindEvents();
    } catch (error) {
      console.error("Sidebar animation initialization failed:", error);
    }
  },
  cacheElements() {
    this.elements = {
      navHamburger: document.querySelector(".nav-hamburger"),
      navHamburgerClose: document.querySelector(".nav-hamburger-close"),
      sidebar: document.querySelector(".sidebar")
    };
  },
  bindEvents() {
    const { navHamburger, navHamburgerClose, sidebar } = this.elements;
    if (navHamburger && sidebar) {
      navHamburger.addEventListener("click", () => {
        sidebar.classList.add("show-sidebar");
        document.body.classList.add("overflow-hidden");
      });
    }
    if (navHamburgerClose && sidebar) {
      navHamburgerClose.addEventListener("click", () => {
        sidebar.classList.remove("show-sidebar");
        document.body.classList.remove("overflow-hidden");
      });
    }
  }
};
if (typeof window !== "undefined") {
  sidebarAnimation.init();
}
let lenis;
const smoothScrolling = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768 || "ontouchstart" in window;
  if (!isMobile) {
    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true
    });
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((time) => {
      lenis.raf(time * 1e3);
    });
    gsap.ticker.lagSmoothing(0);
  }
};
const resetTocItems = (sidebarList) => {
  const allListItems = sidebarList.querySelectorAll("li");
  allListItems.forEach((item) => {
    const icon = item.querySelector("span:last-child");
    const text = item.querySelector("span:first-child, a span");
    if (icon) icon.classList.add("invisible");
    if (text) {
      text.classList.remove("font-medium", "text-background-13");
      text.classList.add("font-normal", "text-background-13/60");
    }
  });
};
const activateTocItem = (item) => {
  const icon = item.querySelector("span:last-child");
  const text = item.querySelector("span:first-child, a span");
  if (icon) icon.classList.remove("invisible");
  if (text) {
    text.classList.remove("font-normal", "text-background-13/60");
    text.classList.add("font-medium", "text-background-13");
  }
};
const handleTocItemClick = (clickedItem, sidebarList) => {
  resetTocItems(sidebarList);
  activateTocItem(clickedItem);
};
const lenisSmoothScrollLinks = () => {
  const lenisTargetElements = document.querySelectorAll(".lenis-scroll-to");
  const sidebarList = document.querySelector(".table-of-contents .table-of-list");
  lenisTargetElements.forEach((ele) => {
    ele.addEventListener("click", function(e) {
      e.preventDefault();
      const target = ele.getAttribute("href");
      if (sidebarList) {
        const clickedItem = ele.closest("li");
        if (clickedItem) {
          handleTocItemClick(clickedItem, sidebarList);
        }
      }
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, {
            offset: -100,
            duration: 1.7,
            easing: (t) => 1 - Math.pow(1 - t, 3)
          });
        } else {
          const targetElement = document.querySelector(target);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
            setTimeout(() => {
              window.scrollBy(0, -100);
            }, 100);
          }
        }
      }
    });
  });
};
const handleTocListClicks = () => {
  const sidebarList = document.querySelector(".table-of-contents .table-of-list");
  if (!sidebarList) return;
  const listItems = sidebarList.querySelectorAll("li");
  listItems.forEach((item) => {
    if (item.querySelector(".lenis-scroll-to")) {
      return;
    }
    item.addEventListener("click", function() {
      handleTocItemClick(item, sidebarList);
    });
  });
};
document.addEventListener("DOMContentLoaded", () => {
  smoothScrolling();
  lenisSmoothScrollLinks();
  handleTocListClicks();
});
const LINE_CLASS = "text-reveal-line";
const DEFAULT_DELAY = 0.1;
const LINES_CONFIG = { duration: 0.8, stagger: 0.08 };
function canReveal() {
  return typeof gsap !== "undefined" && typeof SplitText !== "undefined";
}
function initTextReveal() {
  if (!canReveal()) return;
  gsap.registerPlugin(SplitText);
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }
  const elements = document.querySelectorAll("[data-text-reveal]");
  if (!elements.length) return;
  document.fonts.ready.then(() => {
    elements.forEach((el) => {
      const raw = el.dataset.revealDelay;
      const delay = raw !== void 0 && raw !== "" && !Number.isNaN(Number.parseFloat(raw)) ? Number.parseFloat(raw) : DEFAULT_DELAY;
      const instant = el.dataset.instant !== void 0 && el.dataset.instant !== "false";
      const start = el.dataset.start || "top 90%";
      const end = el.dataset.end || "top 50%";
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: LINE_CLASS
      });
      const lines = el.querySelectorAll(`.${LINE_CLASS}`);
      gsap.set(el, { opacity: 1 });
      const tweenVars = {
        yPercent: 0,
        opacity: 1,
        duration: LINES_CONFIG.duration,
        stagger: LINES_CONFIG.stagger,
        ease: "power3.out",
        delay
      };
      if (!instant && typeof ScrollTrigger !== "undefined") {
        tweenVars.scrollTrigger = {
          trigger: el,
          start,
          end,
          scrub: false
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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTextReveal);
} else {
  initTextReveal();
}
function initAboutVideo() {
  const video = document.querySelector("[data-about-video]");
  const control = document.querySelector("[data-about-video-control]");
  if (!video || !control) return;
  function setPlaying(playing) {
    control.dataset.play = playing ? "true" : "false";
  }
  function syncState() {
    setPlaying(!video.paused);
  }
  control.addEventListener("click", (e) => {
    e.preventDefault();
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  });
  video.addEventListener("play", syncState);
  video.addEventListener("pause", syncState);
  video.addEventListener("ended", () => setPlaying(false));
  video.muted = true;
  const played = video.play();
  if (played && typeof played.then === "function") {
    played.then(() => setPlaying(true)).catch(() => setPlaying(false));
  } else {
    setPlaying(!video.paused);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAboutVideo);
} else {
  initAboutVideo();
}
function canSplit() {
  return typeof gsap !== "undefined" && typeof SplitText !== "undefined";
}
function revertSplit(accordionContent) {
  accordionContent.querySelectorAll("p").forEach((el) => {
    if (el._split) {
      try {
        el._split.revert();
      } catch {
      }
      el._split = null;
    }
    if (canSplit()) gsap.set(el, { clearProps: "all" });
  });
}
function animateSplitIn(accordionContent) {
  if (!canSplit()) return;
  accordionContent.querySelectorAll("p").forEach((el, i) => {
    if (!el.textContent.trim()) return;
    if (el._split) el._split.revert();
    gsap.killTweensOf(el);
    el._split = new SplitText(el, { type: "lines" });
    gsap.set(el._split.lines, {
      opacity: 0,
      y: 24,
      rotationX: -90
    });
    gsap.to(el._split.lines, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.08,
      delay: i * 0.05
    });
  });
}
function animateSplitOut(accordionContent) {
  if (!canSplit()) return;
  accordionContent.querySelectorAll("p").forEach((el, i) => {
    if (!el.textContent.trim()) return;
    if (!el._split) el._split = new SplitText(el, { type: "lines" });
    gsap.to(el._split.lines, {
      opacity: 0,
      y: -16,
      rotationX: 90,
      duration: 0.35,
      ease: "power2.in",
      stagger: 0.03,
      delay: i * 0.02
    });
  });
}
function openItem(item, btn, accordionContent, animate) {
  item.dataset.state = "open";
  btn.dataset.state = "open";
  btn.setAttribute("aria-expanded", "true");
  accordionContent.setAttribute("aria-hidden", "false");
  if (!animate) {
    accordionContent.style.height = "auto";
    accordionContent.style.opacity = "1";
    animateSplitIn(accordionContent);
    return;
  }
  revertSplit(accordionContent);
  accordionContent.style.height = "0px";
  accordionContent.style.opacity = "0";
  const target = (accordionContent.offsetHeight, accordionContent.scrollHeight);
  animateSplitIn(accordionContent);
  requestAnimationFrame(() => {
    accordionContent.style.height = `${target}px`;
    accordionContent.style.opacity = "1";
  });
  accordionContent.addEventListener(
    "transitionend",
    (e) => {
      if (e.propertyName === "height") {
        accordionContent.style.height = "auto";
      }
    },
    { once: true }
  );
}
function closeItem(item, btn, accordionContent, animate) {
  item.dataset.state = "closed";
  btn.dataset.state = "closed";
  btn.setAttribute("aria-expanded", "false");
  accordionContent.setAttribute("aria-hidden", "true");
  if (!animate) {
    accordionContent.style.height = "0px";
    accordionContent.style.opacity = "0";
    revertSplit(accordionContent);
    return;
  }
  animateSplitOut(accordionContent);
  const current = accordionContent.scrollHeight;
  accordionContent.style.height = `${current}px`;
  accordionContent.style.opacity = "1";
  (accordionContent.offsetHeight, setTimeout)(() => {
    requestAnimationFrame(() => {
      accordionContent.style.height = "0px";
      accordionContent.style.opacity = "0";
    });
  }, 80);
  accordionContent.addEventListener(
    "transitionend",
    (e) => {
      if (e.propertyName === "height") {
        revertSplit(accordionContent);
      }
    },
    { once: true }
  );
}
function initAccordions({ selector = ".accordion", allowMultiple = false, keyboard = true } = {}) {
  const accordions = document.querySelectorAll(selector);
  accordions.forEach((accordion, accIndex) => {
    const items = Array.from(accordion.querySelectorAll(".accordion-item"));
    if (!accordion.getAttribute("aria-label")) {
      accordion.setAttribute("aria-label", "Accordion");
    }
    items.forEach((item, i) => {
      const accordionAction = item.querySelector(".accordion-action");
      const accordionContent = item.querySelector(".accordion-content");
      if (!accordionAction || !accordionContent) return;
      const qId = `acc-q-${accIndex}-${i}`;
      const aId = `acc-a-${accIndex}-${i}`;
      accordionAction.id || (accordionAction.id = qId);
      accordionContent.id || (accordionContent.id = aId);
      accordionAction.setAttribute("aria-controls", accordionContent.id);
      accordionContent.setAttribute("role", "region");
      accordionContent.setAttribute("aria-labelledby", accordionAction.id);
      accordionContent.style.overflow = "hidden";
      accordionContent.style.transition = "height 300ms ease-in-out, opacity 300ms ease-in-out";
      const shouldOpen = item.dataset.defaultOpen === "true";
      if (shouldOpen) openItem(item, accordionAction, accordionContent, false);
      else closeItem(item, accordionAction, accordionContent, false);
    });
    if (!allowMultiple) {
      const openDefaults = items.filter((it) => it.dataset.defaultOpen === "true");
      openDefaults.slice(1).forEach((it) => {
        const btn = it.querySelector(".accordion-action");
        const accordionContent = it.querySelector(".accordion-content");
        if (btn && accordionContent) closeItem(it, btn, accordionContent, false);
        delete it.dataset.defaultOpen;
      });
    }
    accordion.addEventListener("click", (e) => {
      const btn = e.target.closest(".accordion-action");
      if (!btn || !accordion.contains(btn)) return;
      e.preventDefault();
      const item = btn.closest(".accordion-item");
      if (!item) return;
      const accordionContent = item.querySelector(".accordion-content");
      if (!accordionContent) return;
      const isOpen = item.dataset.state === "open";
      if (isOpen) {
        closeItem(item, btn, accordionContent, true);
        return;
      }
      if (!allowMultiple) {
        items.forEach((it) => {
          if (it === item) return;
          if (it.dataset.state === "open") {
            const b = it.querySelector(".accordion-action");
            const c = it.querySelector(".accordion-content");
            if (b && c) closeItem(it, b, c, true);
          }
        });
      }
      openItem(item, btn, accordionContent, true);
    });
    if (keyboard) {
      accordion.addEventListener("keydown", (e) => {
        const btn = e.target.closest(".accordion-action");
        if (!btn) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
      });
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initAccordions({
    allowMultiple: false,
    keyboard: true
  });
});
const button = {
  init() {
    const buttonWrappers = document.querySelectorAll(".button");
    buttonWrappers.forEach((buttonWrapper) => {
      const iconWrapper = buttonWrapper.querySelector(".button-icon");
      const buttonText = buttonWrapper.querySelector(".button-text");
      if (!iconWrapper || !buttonText) return;
      const wrapperRect = buttonWrapper.getBoundingClientRect();
      const iconRect = iconWrapper.getBoundingClientRect();
      const textRect = buttonText.getBoundingClientRect();
      const leftPadding = Number.parseFloat(getComputedStyle(buttonWrapper).paddingLeft) || 0;
      const rightPadding = Number.parseFloat(getComputedStyle(buttonWrapper).paddingRight) || 0;
      const iconLeftRelative = iconRect.left - wrapperRect.left;
      const iconTranslateXDistance = wrapperRect.width - rightPadding - iconWrapper.offsetWidth - iconLeftRelative;
      const textLeftRelative = textRect.left - wrapperRect.left;
      const textTranslateXDistance = Math.max(0, textLeftRelative - leftPadding);
      buttonWrapper.addEventListener("mouseenter", () => {
        iconWrapper.style.transform = `translateX(${iconTranslateXDistance}px)`;
        buttonText.style.transform = `translateX(-${textTranslateXDistance}px)`;
      });
      buttonWrapper.addEventListener("mouseleave", () => {
        iconWrapper.style.transform = "translateX(0)";
        buttonText.style.transform = "translateX(0)";
      });
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  button.init();
});
const updateFooterYear = () => {
  const footerYearElements = document.querySelectorAll("[data-footer-year]");
  if (footerYearElements.length > 0) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    footerYearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  }
};
if (globalThis.window !== void 0) {
  updateFooterYear();
}
document.addEventListener("DOMContentLoaded", function() {
  if (typeof InfiniteMarquee === "undefined") {
    console.error("InfiniteMarquee is not loaded.");
    return;
  }
  const animation2 = {
    infiniteLeft() {
      if (document.querySelector(".logos-marquee-container")) {
        new InfiniteMarquee({
          element: ".logos-marquee-container",
          speed: 55e3,
          smoothEdges: true,
          direction: "left",
          gap: "32px",
          duplicateCount: 1,
          mobileSettings: {
            direction: "top",
            speed: 5e4
          },
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    infiniteRight() {
      if (document.querySelector(".logos-right-marquee-container")) {
        new InfiniteMarquee({
          element: ".logos-right-marquee-container",
          speed: 55e3,
          smoothEdges: true,
          direction: "right",
          gap: "32px",
          duplicateCount: 1,
          mobileSettings: {
            direction: "right",
            speed: 5e4
          },
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    initHover() {
      if (document.querySelector(".cards-marquee-container")) {
        new InfiniteMarquee({
          element: ".cards-marquee-container",
          speed: 14e4,
          smoothEdges: true,
          direction: "left",
          gap: "32px",
          pauseOnHover: true,
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    initHoverRight() {
      if (document.querySelector(".cards-right-marquee-container")) {
        new InfiniteMarquee({
          element: ".cards-right-marquee-container",
          speed: 14e4,
          smoothEdges: true,
          direction: "right",
          gap: "32px",
          pauseOnHover: true,
          on: {
            beforeInit: () => console.log("Not Yet Initialized"),
            afterInit: () => console.log("Initialized")
          }
        });
      }
    },
    infiniteTop() {
      if (document.querySelector(".top-marquee-container")) {
        new InfiniteMarquee({
          element: ".top-marquee-container",
          speed: 4e4,
          smoothEdges: true,
          direction: "top",
          gap: "32px",
          pauseOnHover: true,
          duplicateCount: 0,
          mobileSettings: {
            direction: "top",
            speed: 5e4
          },
          on: {
            beforeInit: () => {
            },
            afterInit: () => {
            }
          }
        });
      }
    },
    infiniteBottom() {
      if (document.querySelector(".bottom-marquee-container")) {
        new InfiniteMarquee({
          element: ".bottom-marquee-container",
          speed: 4e4,
          smoothEdges: true,
          direction: "bottom",
          pauseOnHover: true,
          gap: "32px",
          duplicateCount: 0,
          mobileSettings: {
            direction: "bottom",
            speed: 5e4
          },
          on: {
            beforeInit: () => {
            },
            afterInit: () => {
            }
          }
        });
      }
    }
  };
  animation2.infiniteLeft();
  animation2.infiniteRight();
  animation2.initHover();
  animation2.initHoverRight();
  animation2.infiniteTop();
  animation2.infiniteBottom();
});
class ModalAnimation {
  constructor() {
    this.modal = null;
    this.content = null;
    this.isOpen = false;
    this.isAnimating = false;
    this.scrollTriggered = false;
    this.config = {
      scrollThreshold: 800,
      storageKey: "joinModalDismissed",
      animation: {
        duration: 300,
        closeDelay: 200
      }
    };
  }
  init() {
    this.bindEvents();
    this.setupScrollTrigger();
  }
  // Event binding
  bindEvents() {
    document.addEventListener("click", (e) => this.handleClick(e));
    document.addEventListener("keydown", (e) => this.handleKeydown(e));
  }
  handleClick(e) {
    var _a;
    const trigger = e.target.closest(".modal-action");
    if (trigger) {
      e.preventDefault();
      this.open(trigger);
      return;
    }
    const closeBtn = e.target.closest(".modal-close-btn, .close-join-modal");
    const overlay = (_a = e.target.classList) == null ? void 0 : _a.contains("modal-overlay");
    if (closeBtn) {
      this.close(true);
    } else if (overlay && e.target === this.modal) {
      this.close(false);
    }
  }
  handleKeydown(e) {
    if (e.key === "Escape" && this.isOpen) {
      this.close(false);
    }
  }
  // Open modal
  open(trigger) {
    if (this.isAnimating) return;
    const overlay = trigger.closest(".modal-overlay") || document.querySelector(".modal-overlay");
    if (!overlay) return;
    if (this.isOpen) {
      this.close(false);
      setTimeout(() => {
        this._openWithVideo(overlay, trigger);
      }, this.config.animation.closeDelay + 50);
      return;
    }
    this._openWithVideo(overlay, trigger);
  }
  _openWithVideo(overlay, trigger) {
    this.modal = overlay;
    this.content = overlay.querySelector(".modal-content");
    const videoUrl = trigger.dataset.videoUrl;
    if (videoUrl) this.loadVideo(videoUrl);
    this.show();
  }
  show() {
    this.isOpen = true;
    this.isAnimating = true;
    document.body.style.overflow = "hidden";
    this.modal.classList.add("modal-open");
    this.modal.classList.remove("modal-close");
    this.modal.removeAttribute("aria-hidden");
    if (this.modal.tagName === "DIALOG") {
      this.modal.showModal();
    }
    this.animate("open");
  }
  // Close modal
  close(persist = false) {
    if (!this.isOpen || this.isAnimating) return;
    this.isAnimating = true;
    this.isOpen = false;
    if (persist) {
      this.savePreference();
    }
    this.animate("close", () => {
      document.body.style.overflow = "auto";
      this.modal.classList.remove("modal-open");
      this.modal.classList.add("modal-close");
      this.modal.setAttribute("aria-hidden", "true");
      if (this.modal.tagName === "DIALOG") {
        this.modal.close();
      }
      this.clearVideo();
      this.isAnimating = false;
    });
  }
  // Animation
  animate(type, callback) {
    if (!this.content) {
      this.isAnimating = false;
      callback == null ? void 0 : callback();
      return;
    }
    if (typeof gsap === "undefined") {
      if (type === "open") {
        this.content.style.outline = "none";
        this.content.setAttribute("tabindex", "-1");
        this.content.focus();
      }
      this.isAnimating = false;
      callback == null ? void 0 : callback();
      return;
    }
    gsap.killTweensOf(this.content);
    if (type === "open") {
      this.content.style.outline = "none";
      this.content.setAttribute("tabindex", "-1");
      gsap.fromTo(
        this.content,
        { opacity: 0, y: -50 },
        {
          opacity: 1,
          y: 0,
          duration: this.config.animation.duration / 1e3,
          ease: "power3.inOut",
          onComplete: () => {
            this.content.focus();
            this.isAnimating = false;
          }
        }
      );
    } else {
      gsap.to(this.content, {
        opacity: 0,
        y: -50,
        duration: this.config.animation.closeDelay / 1e3,
        ease: "power2.in",
        onComplete: callback
      });
    }
  }
  // Video handling
  loadVideo(url) {
    var _a;
    const iframe = (_a = this.content) == null ? void 0 : _a.querySelector("iframe");
    if (!iframe) return;
    iframe.src = "";
    requestAnimationFrame(() => {
      iframe.src = url;
    });
  }
  clearVideo() {
    var _a;
    const iframe = (_a = this.content) == null ? void 0 : _a.querySelector("iframe");
    if (iframe) iframe.src = "";
  }
  // Scroll trigger
  setupScrollTrigger() {
    const joinModal = Array.from(document.querySelectorAll(".modal-overlay")).find(
      (m) => m.querySelector(".close-join-modal, #join-modal-title")
    );
    if (!joinModal || this.wasModalDismissed()) return;
    const handleScroll = () => {
      if (this.scrollTriggered) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY >= this.config.scrollThreshold) {
        this.scrollTriggered = true;
        this.modal = joinModal;
        this.content = joinModal.querySelector(".modal-content");
        this.show();
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (document.readyState !== "loading") {
      handleScroll();
    }
  }
  // Storage
  wasModalDismissed() {
    return localStorage.getItem(this.config.storageKey) === "true";
  }
  savePreference() {
    try {
      localStorage.setItem(this.config.storageKey, "true");
    } catch (e) {
      console.warn("Could not save modal preference");
    }
  }
  // Cleanup
  destroy() {
    if (this.isOpen) this.close(false);
  }
}
if (typeof window !== "undefined") {
  const modal = new ModalAnimation();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => modal.init(), { once: true });
  } else {
    modal.init();
  }
}
class NavigationMenu {
  constructor() {
    this.activeMenu = null;
    this.menuTimeout = null;
    this.isMouseInHeader = false;
    this.isMouseInMenu = false;
    this.init();
  }
  init() {
    this.bindEvents();
  }
  bindEvents() {
    const navItems = document.querySelectorAll(".nav-item[data-menu]");
    navItems.forEach((item) => {
      const menuId = item.getAttribute("data-menu");
      const menu = document.getElementById(menuId);
      if (!menu) return;
      item.addEventListener("mouseenter", () => {
        this.showMenu(item, menu);
      });
      item.addEventListener("mouseleave", (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !menu.contains(relatedTarget)) {
          this.scheduleHideMenu();
        }
      });
      menu.addEventListener("mouseenter", () => {
        this.cancelHideMenu();
        this.showMenu(item, menu);
      });
      menu.addEventListener("mouseleave", (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !item.contains(relatedTarget)) {
          this.scheduleHideMenu();
        }
      });
    });
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target && typeof target.closest === "function") {
        if (!target.closest(".nav-item") && !target.closest(".mega-menu, .dropdown-menu")) {
          this.hideAllMenus();
        }
      }
    });
    const header = document.querySelector("header");
    if (header) {
      header.addEventListener("mouseenter", () => {
        this.isMouseInHeader = true;
        this.cancelHideMenu();
      });
      header.addEventListener("mouseleave", (e) => {
        this.isMouseInHeader = false;
        const relatedTarget = e.relatedTarget;
        const isMovingToMenu = relatedTarget && (relatedTarget.closest(".mega-menu") || relatedTarget.closest(".dropdown-menu"));
        if (!isMovingToMenu) {
          this.scheduleHideMenu();
        }
      });
    }
    document.addEventListener(
      "mouseenter",
      (e) => {
        const target = e.target;
        if (target && typeof target.closest === "function") {
          if (target.closest(".mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge")) {
            this.isMouseInMenu = true;
            this.cancelHideMenu();
          }
        }
      },
      true
    );
    document.addEventListener(
      "mouseleave",
      (e) => {
        const target = e.target;
        if (target && typeof target.closest === "function") {
          if (target.closest(".mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge")) {
            this.isMouseInMenu = false;
            const relatedTarget = e.relatedTarget;
            const isMovingToHeader = relatedTarget && typeof relatedTarget.closest === "function" && (relatedTarget.closest("header") || relatedTarget.closest(".mega-menu") || relatedTarget.closest(".dropdown-menu") || relatedTarget.closest(".mega-menu-bridge") || relatedTarget.closest(".dropdown-menu-bridge"));
            if (!isMovingToHeader) {
              this.scheduleHideMenu();
            }
          }
        }
      },
      true
    );
    document.addEventListener("mouseleave", () => {
      this.hideAllMenus();
    });
  }
  showMenu(navItem, menu) {
    this.cancelHideMenu();
    this.hideAllMenus();
    this.activeMenu = menu;
    navItem.classList.add("active");
    menu.classList.add("active");
    navItem.classList.add("menu-active");
    const bridge = navItem.querySelector(".mega-menu-bridge, .dropdown-menu-bridge");
    if (bridge) {
      bridge.style.opacity = "1";
      bridge.style.pointerEvents = "auto";
    }
    this.dispatchMenuEvent("menu:show", { navItem, menu });
  }
  hideMenu(menu) {
    if (!menu) return;
    const navItem = document.querySelector(`[data-menu="${menu.id}"]`);
    menu.classList.remove("active");
    if (navItem) {
      navItem.classList.remove("active", "menu-active");
      const bridge = navItem.querySelector(".mega-menu-bridge, .dropdown-menu-bridge");
      if (bridge) {
        bridge.style.opacity = "0";
        bridge.style.pointerEvents = "none";
      }
    }
    if (this.activeMenu === menu) {
      this.activeMenu = null;
    }
    this.dispatchMenuEvent("menu:hide", { navItem, menu });
  }
  hideAllMenus() {
    const allMenus = document.querySelectorAll(".mega-menu, .dropdown-menu");
    const allNavItems = document.querySelectorAll(".nav-item[data-menu]");
    allMenus.forEach((menu) => this.hideMenu(menu));
    allNavItems.forEach((item) => {
      item.classList.remove("active", "menu-active");
    });
    this.activeMenu = null;
  }
  scheduleHideMenu() {
    this.cancelHideMenu();
    this.menuTimeout = setTimeout(() => {
      if (!this.isMouseInHeader && !this.isMouseInMenu) {
        this.hideAllMenus();
      }
    }, 200);
  }
  cancelHideMenu() {
    if (this.menuTimeout) {
      clearTimeout(this.menuTimeout);
      this.menuTimeout = null;
    }
  }
  dispatchMenuEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }
  showMenuById(menuId) {
    const navItem = document.querySelector(`[data-menu="${menuId}"]`);
    const menu = document.getElementById(menuId);
    if (navItem && menu) {
      this.showMenu(navItem, menu);
    }
  }
  hideMenuById(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
      this.hideMenu(menu);
    }
  }
  toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu && menu.classList.contains("active")) {
      this.hideMenu(menu);
    } else {
      this.showMenuById(menuId);
    }
  }
  getDebugInfo() {
    return {
      activeMenu: this.activeMenu ? this.activeMenu.id : null,
      isMouseInHeader: this.isMouseInHeader,
      isMouseInMenu: this.isMouseInMenu,
      hasTimeout: !!this.menuTimeout
    };
  }
}
document.addEventListener("DOMContentLoaded", () => {
  window.navigationMenu = new NavigationMenu();
});
const progressiveBlurEffect = {
  init() {
    const blurElements = document.querySelectorAll("[data-progressive-blur-effect]");
    blurElements.forEach((element) => {
      const intensity = element.dataset.intensity ? Number.parseFloat(element.dataset.intensity) : 50;
      const position = element.dataset.position ? element.dataset.position : "top";
      const className = element.dataset.class ? element.dataset.class : "";
      const intensityFactor = intensity / 50;
      const blurLayers = [
        { blur: `${1 * intensityFactor}px`, maskStart: 0, maskEnd: 25, zIndex: 1 },
        { blur: `${3 * intensityFactor}px`, maskStart: 25, maskEnd: 75, zIndex: 2 },
        { blur: `${6 * intensityFactor}px`, maskStart: 75, maskEnd: 100, zIndex: 3 }
      ];
      const positionStyles = {
        bottom: { bottom: "0", left: "0", right: "0", top: "auto" },
        top: { top: "0", left: "0", right: "0", bottom: "auto" },
        left: { left: "0", top: "0", bottom: "0", right: "auto" },
        right: { right: "0", top: "0", bottom: "0", left: "auto" }
      };
      const gradientDirection = {
        bottom: "to bottom",
        top: "to top",
        left: "to left",
        right: "to right"
      };
      Object.assign(
        element.style,
        {
          position: "absolute",
          zIndex: "10",
          pointerEvents: "auto"
        },
        positionStyles[position]
      );
      if (className) {
        className.split(" ").forEach((cls) => {
          if (cls.trim()) {
            element.classList.add(cls.trim());
          }
        });
      }
      blurLayers.forEach((layer, index) => {
        const layerElement = document.createElement("div");
        const maskImage = `linear-gradient(${gradientDirection[position]}, transparent ${layer.maskStart}%, black ${layer.maskEnd}%)`;
        Object.assign(layerElement.style, {
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          pointerEvents: "none",
          zIndex: String(layer.zIndex),
          backdropFilter: `blur(${layer.blur})`,
          WebkitBackdropFilter: `blur(${layer.blur})`,
          maskImage,
          WebkitMaskImage: maskImage
        });
        element.appendChild(layerElement);
      });
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  progressiveBlurEffect.init();
});
