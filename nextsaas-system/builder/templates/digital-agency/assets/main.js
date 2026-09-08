//#region src/js/utils/blog-filter.js
var initBlogFilter = () => {
	const roots = document.querySelectorAll("[data-filter-root]");
	if (!roots.length) return;
	roots.forEach((root) => {
		const desktopButtons = [...root.querySelectorAll("[data-tab-button]")];
		const mobileButtons = [...root.querySelectorAll("[data-mobile-tab-button]")];
		const items = [...root.querySelectorAll("[data-filter-item]")];
		const activeBar = root.querySelector("[data-active-tab-bar]");
		if (!desktopButtons.length && !mobileButtons.length || !items.length) return;
		const getFilter = (button) => (button?.getAttribute("data-filter") || "all").trim().toLowerCase();
		const moveActiveBar = (button) => {
			if (!activeBar || !button) return;
			activeBar.style.width = `${button.offsetWidth}px`;
			activeBar.style.left = `${button.offsetLeft}px`;
		};
		const activate = (index) => {
			const count = Math.max(desktopButtons.length, mobileButtons.length);
			const safeIndex = Math.max(0, Math.min(index, count - 1));
			const sourceButton = desktopButtons[safeIndex] || mobileButtons[safeIndex];
			const filter = getFilter(sourceButton);
			desktopButtons.forEach((button, i) => {
				const selected = i === safeIndex;
				button.dataset.state = selected ? "selected" : "";
				button.setAttribute("aria-selected", selected ? "true" : "false");
			});
			mobileButtons.forEach((button, i) => {
				const selected = i === safeIndex;
				button.dataset.mobileActive = selected ? "true" : "false";
				button.setAttribute("aria-pressed", selected ? "true" : "false");
			});
			items.forEach((item) => {
				const category = (item.getAttribute("data-filter-category") || "").trim().toLowerCase();
				const show = filter === "all" || category === filter;
				item.classList.toggle("hidden", !show);
			});
			requestAnimationFrame(() => {
				moveActiveBar(desktopButtons[safeIndex]);
			});
		};
		desktopButtons.forEach((button, index) => {
			button.setAttribute("role", "tab");
			button.addEventListener("click", () => activate(index));
		});
		mobileButtons.forEach((button, index) => {
			button.addEventListener("click", () => activate(index));
		});
		activate(0);
		window.addEventListener("resize", () => {
			const selected = desktopButtons.find((button) => button.dataset.state === "selected") || desktopButtons[0];
			moveActiveBar(selected);
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBlogFilter);
else initBlogFilter();
//#endregion
//#region src/js/utils/header.js
var headerAnimation = { headerOne() {
	const header = document.querySelector(".header-scroll");
	if (header) window.addEventListener("scroll", () => {
		if (window.scrollY > 100) {
			header.style.transition = "all 0.5s ease-in-out";
			header.classList.add("scroll-header");
		} else header.classList.remove("scroll-header");
	});
} };
if (globalThis.window !== void 0) headerAnimation.headerOne();
//#endregion
//#region src/js/utils/marquee.js
document.addEventListener("DOMContentLoaded", () => {
	if (typeof InfiniteMarquee === "undefined") return;
	if (document.querySelector(".logos-marquee-container")) new InfiniteMarquee({
		element: ".logos-marquee-container",
		speed: 4e4,
		smoothEdges: false,
		direction: "left",
		spaceBetween: "0px",
		duplicateCount: 1,
		duplicateInnerElements: false,
		mobileSettings: {
			direction: "left",
			speed: 5e4
		}
	});
	if (document.querySelector(".cards-marquee-container")) new InfiniteMarquee({
		element: ".cards-marquee-container",
		speed: 5e4,
		smoothEdges: true,
		direction: "left",
		gap: { horizontal: "32px" },
		duplicateCount: 1,
		pauseOnHover: true,
		mobileSettings: {
			direction: "left",
			speed: 6e4
		}
	});
});
//#endregion
//#region src/js/utils/mobile-menu.js
var BACKDROP_DURATION = .45;
var DRAWER_DURATION = .75;
var PANEL_DURATION = .65;
var ROOT_FADE_DURATION = .35;
var DRAWER_EASE = "power2.inOut";
var PANEL_EASE = "power2.inOut";
var MobileNavMenu = class {
	constructor() {
		this.isOpen = false;
		this.activeMega = null;
		this.prevOverflow = "";
		this.elements = null;
		this.init();
	}
	init() {
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => this.setup());
		else this.setup();
	}
	setup() {
		this.cacheElements();
		if (!this.elements.sidebar) return;
		this.setInitialState();
		this.bindEvents();
	}
	cacheElements() {
		this.elements = {
			sidebar: document.querySelector("#mobile-nav-sidebar"),
			backdrop: document.querySelector(".mobile-nav-backdrop"),
			root: document.querySelector("[data-mobile-root]"),
			openBtn: document.querySelector(".nav-hamburger"),
			closeBtn: document.querySelector(".nav-hamburger-close"),
			megaButtons: document.querySelectorAll(".mobile-nav-mega[data-mega]"),
			panels: document.querySelectorAll(".mobile-nav-panel[data-panel]"),
			backButtons: document.querySelectorAll(".mobile-nav-back"),
			links: document.querySelectorAll(".mobile-nav-link")
		};
	}
	setInitialState() {
		const { sidebar, backdrop, panels, root } = this.elements;
		if (typeof gsap === "undefined") return;
		gsap.set(sidebar, {
			xPercent: -100,
			autoAlpha: 0
		});
		gsap.set(backdrop, { autoAlpha: 0 });
		gsap.set(panels, {
			xPercent: 100,
			autoAlpha: 0
		});
		if (root) gsap.set(root, { autoAlpha: 1 });
	}
	bindEvents() {
		const { openBtn, closeBtn, backdrop, megaButtons, backButtons, links } = this.elements;
		openBtn?.addEventListener("click", () => this.open());
		closeBtn?.addEventListener("click", () => this.close());
		backdrop?.addEventListener("click", () => this.close());
		megaButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				const mega = btn.getAttribute("data-mega");
				if (mega) this.openMega(mega);
			});
		});
		backButtons.forEach((btn) => {
			btn.addEventListener("click", () => this.closeMega());
		});
		links.forEach((link) => {
			link.addEventListener("click", () => this.close());
		});
		document.addEventListener("keydown", (e) => {
			if (e.key !== "Escape" || !this.isOpen) return;
			if (this.activeMega) {
				this.closeMega();
				return;
			}
			this.close();
		});
		const mq = window.matchMedia("(min-width: 1280px)");
		const onBreakpoint = () => {
			if (mq.matches && this.isOpen) this.close(true);
		};
		mq.addEventListener("change", onBreakpoint);
	}
	lockBody() {
		this.prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.body.classList.add("overflow-hidden");
	}
	unlockBody() {
		document.body.style.overflow = this.prevOverflow;
		document.body.classList.remove("overflow-hidden");
	}
	open() {
		const { sidebar, backdrop } = this.elements;
		if (!sidebar || this.isOpen) return;
		this.isOpen = true;
		this.lockBody();
		sidebar.classList.remove("pointer-events-none", "invisible");
		sidebar.setAttribute("aria-hidden", "false");
		backdrop?.classList.remove("pointer-events-none");
		backdrop?.classList.add("pointer-events-auto");
		if (typeof gsap === "undefined") {
			sidebar.style.transform = "translateX(0)";
			sidebar.style.visibility = "visible";
			sidebar.style.opacity = "1";
			if (backdrop) {
				backdrop.style.opacity = "1";
				backdrop.style.visibility = "visible";
			}
			return;
		}
		gsap.killTweensOf([sidebar, backdrop]);
		gsap.timeline().to(backdrop, {
			autoAlpha: 1,
			duration: BACKDROP_DURATION
		}, 0).to(sidebar, {
			xPercent: 0,
			autoAlpha: 1,
			duration: DRAWER_DURATION,
			ease: DRAWER_EASE
		}, 0);
	}
	close(immediate = false) {
		const { sidebar, backdrop, root } = this.elements;
		if (!sidebar || !this.isOpen) return;
		const finish = () => {
			this.isOpen = false;
			this.activeMega = null;
			this.unlockBody();
			sidebar.classList.add("pointer-events-none", "invisible");
			sidebar.setAttribute("aria-hidden", "true");
			backdrop?.classList.add("pointer-events-none");
			backdrop?.classList.remove("pointer-events-auto");
			this.elements.panels.forEach((panel) => {
				panel.classList.add("pointer-events-none", "invisible");
				if (typeof gsap !== "undefined") gsap.set(panel, {
					xPercent: 100,
					autoAlpha: 0
				});
			});
			if (root) {
				root.classList.remove("pointer-events-none");
				root.removeAttribute("aria-hidden");
				if (typeof gsap !== "undefined") gsap.set(root, { autoAlpha: 1 });
			}
		};
		if (typeof gsap === "undefined") {
			if (this.activeMega) this.resetPanelsInstant();
			sidebar.style.transform = "translateX(-100%)";
			sidebar.style.visibility = "hidden";
			sidebar.style.opacity = "0";
			if (backdrop) {
				backdrop.style.opacity = "0";
				backdrop.style.visibility = "hidden";
			}
			finish();
			return;
		}
		gsap.killTweensOf([
			sidebar,
			backdrop,
			...this.elements.panels,
			root
		]);
		const duration = immediate ? 0 : DRAWER_DURATION;
		const backdropDuration = immediate ? 0 : BACKDROP_DURATION;
		const panelDuration = immediate ? 0 : PANEL_DURATION;
		const tl = gsap.timeline({ onComplete: finish });
		if (this.activeMega) {
			const panel = this.getPanel(this.activeMega);
			if (panel) tl.to(panel, {
				xPercent: 100,
				autoAlpha: 0,
				duration: panelDuration,
				ease: PANEL_EASE
			}, 0);
			if (root) tl.set(root, {
				autoAlpha: 1,
				pointerEvents: "auto"
			}, 0);
		}
		tl.to(sidebar, {
			xPercent: -100,
			autoAlpha: 0,
			duration,
			ease: DRAWER_EASE
		}, 0).to(backdrop, {
			autoAlpha: 0,
			duration: backdropDuration
		}, 0);
	}
	getPanel(mega) {
		return document.querySelector(`.mobile-nav-panel[data-panel="${mega}"]`);
	}
	openMega(mega) {
		const { root } = this.elements;
		const panel = this.getPanel(mega);
		if (!panel || !this.isOpen) return;
		this.activeMega = mega;
		panel.classList.remove("pointer-events-none", "invisible");
		if (root) {
			root.classList.add("pointer-events-none");
			root.setAttribute("aria-hidden", "true");
		}
		if (typeof gsap === "undefined") {
			panel.style.transform = "translateX(0)";
			panel.style.visibility = "visible";
			panel.style.opacity = "1";
			if (root) root.style.opacity = "0";
			return;
		}
		if (root) gsap.to(root, {
			autoAlpha: 0,
			duration: ROOT_FADE_DURATION,
			ease: "power1.inOut"
		});
		gsap.killTweensOf(panel);
		gsap.fromTo(panel, {
			xPercent: 100,
			autoAlpha: 1
		}, {
			xPercent: 0,
			autoAlpha: 1,
			duration: PANEL_DURATION,
			ease: PANEL_EASE
		});
	}
	closeMega() {
		const { root } = this.elements;
		if (!this.activeMega) return;
		const panel = this.getPanel(this.activeMega);
		this.activeMega = null;
		const restoreRoot = () => {
			if (panel) panel.classList.add("pointer-events-none", "invisible");
			if (root) {
				root.classList.remove("pointer-events-none");
				root.removeAttribute("aria-hidden");
			}
		};
		if (typeof gsap === "undefined") {
			if (panel) {
				panel.style.transform = "translateX(100%)";
				panel.style.visibility = "hidden";
				panel.style.opacity = "0";
			}
			if (root) root.style.opacity = "1";
			restoreRoot();
			return;
		}
		const tl = gsap.timeline({ onComplete: restoreRoot });
		if (panel) tl.to(panel, {
			xPercent: 100,
			autoAlpha: 0,
			duration: PANEL_DURATION,
			ease: PANEL_EASE
		}, 0);
		if (root) tl.to(root, {
			autoAlpha: 1,
			duration: ROOT_FADE_DURATION,
			ease: "power1.inOut"
		}, .08);
	}
	resetPanelsInstant() {
		this.elements.panels.forEach((panel) => {
			panel.classList.add("pointer-events-none", "invisible");
			if (typeof gsap !== "undefined") gsap.set(panel, {
				xPercent: 100,
				autoAlpha: 0
			});
		});
		this.activeMega = null;
	}
};
var mobileNavMenu = new MobileNavMenu();
if (typeof window !== "undefined") window.mobileNavMenu = mobileNavMenu;
//#endregion
//#region src/js/utils/navigation-menu.js
/**
* Navigation Menu Handler
*/
var NavigationMenu = class {
	activeMenu = null;
	menuTimeout = null;
	isMouseInHeader = false;
	isMouseInMenu = false;
	constructor() {
		this.init();
	}
	init() {
		this.bindEvents();
	}
	bindEvents() {
		document.querySelectorAll(".nav-item[data-menu]").forEach((item) => {
			const menuId = item.dataset.menu;
			const menu = document.getElementById(menuId);
			if (!menu) return;
			item.addEventListener("mouseenter", (e) => {
				this.showMenu(item, menu);
			});
			item.addEventListener("mouseleave", (e) => {
				const relatedTarget = e.relatedTarget;
				if (!relatedTarget || !menu.contains(relatedTarget)) this.scheduleHideMenu();
			});
			menu.addEventListener("mouseenter", (e) => {
				this.cancelHideMenu();
				this.showMenu(item, menu);
			});
			menu.addEventListener("mouseleave", (e) => {
				const relatedTarget = e.relatedTarget;
				if (!relatedTarget || !item.contains(relatedTarget)) this.scheduleHideMenu();
			});
		});
		document.addEventListener("click", (e) => {
			const target = e.target;
			if (target && typeof target.closest === "function") {
				if (!target.closest(".nav-item") && !target.closest(".mega-menu, .dropdown-menu")) this.hideAllMenus();
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
				if (!(relatedTarget && (relatedTarget.closest(".mega-menu") || relatedTarget.closest(".dropdown-menu")))) this.scheduleHideMenu();
			});
		}
		document.addEventListener("mouseenter", (e) => {
			const target = e.target;
			if (target && typeof target.closest === "function") {
				if (target.closest(".mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge")) {
					this.isMouseInMenu = true;
					this.cancelHideMenu();
				}
			}
		}, true);
		document.addEventListener("mouseleave", (e) => {
			const target = e.target;
			if (target && typeof target.closest === "function") {
				if (target.closest(".mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge")) {
					this.isMouseInMenu = false;
					const relatedTarget = e.relatedTarget;
					if (!(relatedTarget && typeof relatedTarget.closest === "function" && (relatedTarget.closest("header") || relatedTarget.closest(".mega-menu") || relatedTarget.closest(".dropdown-menu") || relatedTarget.closest(".mega-menu-bridge") || relatedTarget.closest(".dropdown-menu-bridge")))) this.scheduleHideMenu();
				}
			}
		}, true);
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
		this.dispatchMenuEvent("menu:show", {
			navItem,
			menu
		});
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
		if (this.activeMenu === menu) this.activeMenu = null;
		this.dispatchMenuEvent("menu:hide", {
			navItem,
			menu
		});
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
			if (!this.isMouseInHeader && !this.isMouseInMenu) this.hideAllMenus();
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
		if (navItem && menu) this.showMenu(navItem, menu);
	}
	hideMenuById(menuId) {
		const menu = document.getElementById(menuId);
		if (menu) this.hideMenu(menu);
	}
	toggleMenu(menuId) {
		const menu = document.getElementById(menuId);
		if (menu?.classList.contains("active")) this.hideMenu(menu);
		else this.showMenuById(menuId);
	}
	getDebugInfo() {
		return {
			activeMenu: this.activeMenu ? this.activeMenu.id : null,
			isMouseInHeader: this.isMouseInHeader,
			isMouseInMenu: this.isMouseInMenu,
			hasTimeout: !!this.menuTimeout
		};
	}
};
document.addEventListener("DOMContentLoaded", () => {
	globalThis.navigationMenu = new NavigationMenu();
});
//#endregion
//#region src/js/utils/sidebar.js
var sidebarAnimation = {
	elements: null,
	init() {
		try {
			this.cacheElements();
			if (document.querySelector("#mobile-nav-sidebar")) return;
			this.bindEvents();
		} catch (error) {
			console.error("Sidebar animation initialization failed:", error);
		}
	},
	cacheElements() {
		this.elements = {
			navHamburger: document.querySelector(".nav-hamburger"),
			navHamburgerClose: document.querySelector(".nav-hamburger-close"),
			sidebar: document.querySelector(".sidebar"),
			subMenu: document.querySelectorAll(".sub-menu")
		};
	},
	bindEvents() {
		const { navHamburger, navHamburgerClose, subMenu } = this.elements;
		if (navHamburger) navHamburger.addEventListener("click", () => {
			this.elements.sidebar.classList.add("show-sidebar");
			document.body.classList.add("overflow-hidden");
		});
		if (navHamburgerClose) navHamburgerClose.addEventListener("click", () => {
			this.elements.sidebar.classList.remove("show-sidebar");
			document.body.classList.remove("overflow-hidden");
		});
		subMenu.forEach((menu) => {
			menu.addEventListener("click", () => {
				menu.classList.toggle("active-menu");
				menu.nextElementSibling.classList.toggle("hidden");
				menu.children[1].classList.toggle("rotate-90");
				subMenu.forEach((otherMenu) => {
					if (otherMenu !== menu) {
						otherMenu.nextElementSibling.classList.add("hidden");
						otherMenu.children[1].classList.remove("rotate-90");
						otherMenu.classList.remove("active-menu");
					}
				});
			});
		});
	}
};
if (typeof window !== "undefined") sidebarAnimation.init();
//#endregion
//#region src/js/utils/smooth-scrolling.js
var lenis;
var smoothScrolling = () => {
	if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || globalThis.innerWidth <= 768 || "ontouchstart" in globalThis)) {
		lenis = new Lenis({
			lerp: .1,
			smoothWheel: true
		});
		lenis.on("scroll", () => ScrollTrigger.update());
		gsap.ticker.add((time) => {
			lenis.raf(time * 1e3);
		});
		gsap.ticker.lagSmoothing(0);
	}
	globalThis.lenis = lenis;
};
var resetTocItems = (sidebarList) => {
	sidebarList.querySelectorAll("li").forEach((item) => {
		const icon = item.querySelector("span:last-child");
		const text = item.querySelector("span:first-child, a span");
		if (icon) icon.classList.add("invisible");
		if (text) {
			text.classList.remove("font-medium", "text-secondary");
			text.classList.add("font-normal", "text-secondary/60");
		}
	});
};
var activateTocItem = (item) => {
	const icon = item.querySelector("span:last-child");
	const text = item.querySelector("span:first-child, a span");
	if (icon) icon.classList.remove("invisible");
	if (text) {
		text.classList.remove("font-normal", "text-secondary/60");
		text.classList.add("font-medium", "text-secondary");
	}
};
var handleTocItemClick = (clickedItem, sidebarList) => {
	resetTocItems(sidebarList);
	activateTocItem(clickedItem);
};
var lenisSmoothScrollLinks = () => {
	const lenisTargetElements = document.querySelectorAll(".lenis-scroll-to");
	const sidebarList = document.querySelector(".table-of-contents .table-of-list");
	lenisTargetElements.forEach((ele) => {
		ele.addEventListener("click", function(e) {
			e.preventDefault();
			const target = ele.getAttribute("href");
			if (sidebarList) {
				const clickedItem = ele.closest("li");
				if (clickedItem) handleTocItemClick(clickedItem, sidebarList);
			}
			if (target) if (lenis) lenis.scrollTo(target, {
				offset: -100,
				duration: 1.7,
				easing: (t) => 1 - Math.pow(1 - t, 3)
			});
			else {
				const targetElement = document.querySelector(target);
				if (targetElement) {
					targetElement.scrollIntoView({
						behavior: "smooth",
						block: "start"
					});
					setTimeout(() => {
						globalThis.scrollBy(0, -100);
					}, 100);
				}
			}
		});
	});
};
var handleTocListClicks = () => {
	const sidebarList = document.querySelector(".table-of-contents .table-of-list");
	if (!sidebarList) return;
	sidebarList.querySelectorAll("li").forEach((item) => {
		if (item.querySelector(".lenis-scroll-to")) return;
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
//#endregion
//#region src/js/utils/tabs.js
var initTabs = () => {
	const roots = document.querySelectorAll("[data-tabs]");
	if (!roots.length) return;
	roots.forEach((root) => {
		const desktopButtons = [...root.querySelectorAll("[data-tab-button]")];
		const mobileButtons = [...root.querySelectorAll("[data-mobile-tab-button]")];
		const contents = [...root.querySelectorAll("[data-tab-content]")];
		const activeBar = root.querySelector("[data-active-tab-bar]");
		if (!desktopButtons.length || !contents.length) return;
		const moveActiveBar = (button) => {
			if (!activeBar || !button) return;
			activeBar.style.width = `${button.offsetWidth}px`;
			activeBar.style.left = `${button.offsetLeft}px`;
		};
		const activate = (index) => {
			const safeIndex = Math.max(0, Math.min(index, contents.length - 1));
			desktopButtons.forEach((button, i) => {
				button.dataset.state = i === safeIndex ? "selected" : "";
			});
			mobileButtons.forEach((button, i) => {
				button.dataset.mobileActive = i === safeIndex ? "true" : "false";
			});
			contents.forEach((content, i) => {
				content.classList.toggle("hidden", i !== safeIndex);
			});
			moveActiveBar(desktopButtons[safeIndex]);
		};
		desktopButtons.forEach((button, index) => {
			button.addEventListener("click", () => activate(index));
		});
		mobileButtons.forEach((button, index) => {
			button.addEventListener("click", () => activate(index));
		});
		activate(0);
		window.addEventListener("resize", () => {
			const selected = desktopButtons.find((button) => button.dataset.state === "selected") || desktopButtons[0];
			moveActiveBar(selected);
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initTabs);
else initTabs();
//#endregion
//#region src/js/animation/avatar.js
var avatar = { init() {
	document.querySelectorAll("[data-ns-avatar]").forEach((el) => {
		const delay = el.dataset.avatarDelay ? Number.parseFloat(el.dataset.avatarDelay) : 0;
		const direction = el.dataset.avatarDirection || "left";
		const scale = el.dataset.avatarScale ? Number.parseFloat(el.dataset.avatarScale) : 0;
		const offset = el.dataset.avatarOffset ? Number.parseFloat(el.dataset.avatarOffset) : 0;
		const fromProps = {
			opacity: 0,
			scale,
			filter: "blur(5px)"
		};
		switch (direction) {
			case "left":
				fromProps.x = -offset;
				break;
			case "right":
				fromProps.x = offset;
				break;
			case "down":
				fromProps.y = offset;
				break;
			default: fromProps.y = -offset;
		}
		gsap.fromTo(el, fromProps, {
			opacity: 1,
			scale: 1,
			filter: "blur(0px)",
			x: 0,
			y: 0,
			duration: 1.5,
			delay,
			ease: "elastic.out(1, 0.7)",
			scrollTrigger: {
				trigger: el,
				start: "top 90%",
				end: "bottom 20%"
			}
		});
	});
} };
document.addEventListener("DOMContentLoaded", () => {
	avatar.init();
});
//#endregion
//#region src/js/animation/blog-swiper.js
document.addEventListener("DOMContentLoaded", () => {
	if (typeof Swiper === "undefined") return;
	const sliders = document.querySelectorAll(".blog-article-swiper");
	if (!sliders.length) return;
	sliders.forEach((slider) => {
		const pagination = slider.querySelector(".pagination-bullets") || slider.parentElement?.querySelector(".pagination-bullets");
		const swiper = new Swiper(slider, {
			slidesPerView: 1,
			spaceBetween: 24,
			speed: 700,
			rewind: true,
			observer: true,
			observeParents: true,
			autoplay: {
				delay: 5e3,
				disableOnInteraction: false
			},
			pagination: pagination ? {
				el: pagination,
				clickable: true
			} : void 0,
			on: { init(instance) {
				requestAnimationFrame(() => instance.update());
			} }
		});
		slider.addEventListener("mouseenter", () => {
			if (swiper.autoplay) swiper.autoplay.pause();
		});
		slider.addEventListener("mouseleave", () => {
			if (swiper.autoplay) swiper.autoplay.resume();
		});
	});
});
//#endregion
//#region src/js/animation/border-expand.js
var borderExpand = { init() {
	if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
	gsap.registerPlugin(ScrollTrigger);
	document.querySelectorAll("[data-border-expand]").forEach((element) => {
		const delay = element.dataset.delay ? Number.parseFloat(element.dataset.delay) : 0;
		const top = element.dataset.top || "top 100%";
		const markerId = element.dataset.markerId || false;
		const duration = element.dataset.duration ? Number.parseFloat(element.dataset.duration) : 1.6;
		gsap.set(element, {
			scaleX: 0,
			transformOrigin: "center center"
		});
		gsap.to(element, {
			scaleX: 1,
			duration,
			ease: "power3.out",
			delay,
			scrollTrigger: {
				trigger: element,
				start: top,
				end: "top 100%",
				toggleActions: "play none none none",
				markers: Boolean(markerId),
				id: markerId || void 0
			}
		});
	});
} };
document.addEventListener("DOMContentLoaded", () => {
	borderExpand.init();
});
//#endregion
//#region src/js/animation/button.js
var buttonV9 = { init() {
	if (typeof gsap === "undefined" || typeof SplitText === "undefined") return;
	gsap.registerPlugin(SplitText);
	const buttonWrappers = document.querySelectorAll("[data-button-wrapper]");
	if (!buttonWrappers.length) return;
	const duration = .4;
	const stagger = .00625;
	buttonWrappers.forEach((buttonWrapper) => {
		const upperText = buttonWrapper.querySelector("[data-button-upper-text]");
		const lowerText = buttonWrapper.querySelector("[data-button-lower-text]");
		if (!upperText || !lowerText) return;
		const upperSplit = new SplitText(upperText, {
			type: "chars",
			tag: "span"
		});
		const lowerSplit = new SplitText(lowerText, {
			type: "chars",
			tag: "span"
		});
		gsap.set(upperSplit.chars, {
			y: "0%",
			opacity: 1,
			display: "inline-block"
		});
		gsap.set(lowerSplit.chars, {
			y: "0%",
			opacity: 0,
			display: "inline-block"
		});
		const hoverInTl = gsap.timeline({ paused: true });
		hoverInTl.to(upperSplit.chars, {
			y: "-100%",
			duration,
			opacity: 0,
			ease: "power2.inOut",
			stagger
		}).to(lowerSplit.chars, {
			y: "-100%",
			duration,
			opacity: 1,
			stagger,
			ease: "power2.inOut"
		}, "<");
		buttonWrapper.addEventListener("mouseenter", () => {
			hoverInTl.play();
		});
		buttonWrapper.addEventListener("mouseleave", () => {
			hoverInTl.reverse();
		});
	});
} };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => buttonV9.init());
else buttonV9.init();
//#endregion
//#region src/js/animation/card-flip.js
var initCardFlip = (scope = document) => {
	if (typeof gsap === "undefined") return;
	const cards = scope.querySelectorAll("[data-card-flip]");
	if (!cards.length) return;
	const isTouch = "ontouchstart" in window;
	cards.forEach((card) => {
		const front = card.querySelector("[data-card-flip-front]");
		const back = card.querySelector("[data-card-flip-back]");
		if (!front || !back) return;
		gsap.set([front, back], {
			backfaceVisibility: "hidden",
			transformStyle: "preserve-3d"
		});
		gsap.set(front, { rotateY: 0 });
		gsap.set(back, { rotateY: 180 });
		const flipTo = (flipped) => {
			gsap.to(front, {
				rotateY: flipped ? 180 : 0,
				duration: .6,
				ease: "power2.out",
				overwrite: true
			});
			gsap.to(back, {
				rotateY: flipped ? 0 : 180,
				duration: .6,
				ease: "power2.out",
				overwrite: true
			});
		};
		if (isTouch) {
			let flipped = false;
			card.addEventListener("click", () => {
				flipped = !flipped;
				flipTo(flipped);
			});
			return;
		}
		card.addEventListener("mouseenter", () => flipTo(true));
		card.addEventListener("mouseleave", () => flipTo(false));
		card.addEventListener("focusin", () => flipTo(true));
		card.addEventListener("focusout", (event) => {
			if (!card.contains(event.relatedTarget)) flipTo(false);
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initCardFlip());
else initCardFlip();
//#endregion
//#region src/js/animation/card-rotating-on-scroll-v2.js
var initCardRotatingOnScroll = () => {
	if (typeof gsap === "undefined") return;
	const wheel = document.querySelector("[data-rotating-wheel]");
	const cards = gsap.utils.toArray("[data-rotating-card]");
	if (!wheel || cards.length === 0) return;
	function setup() {
		const radius = wheel.offsetWidth / 2;
		const center = radius;
		const slice = 360 / cards.length;
		const DEG2RAD = Math.PI / 180;
		const cardHeight = cards[0]?.offsetHeight || 0;
		const CARD_GAP_OFFSET = 220;
		const CARD_SCALE = .82;
		const adjustedRadius = Math.max(radius - cardHeight / 2 + CARD_GAP_OFFSET, 0);
		gsap.set(cards, {
			x: (i) => center + adjustedRadius * Math.sin(i * slice * DEG2RAD),
			y: (i) => center - adjustedRadius * Math.cos(i * slice * DEG2RAD),
			rotation: (i) => i * slice,
			scale: CARD_SCALE,
			xPercent: -50,
			yPercent: -50
		});
	}
	setup();
	window.addEventListener("resize", setup);
	gsap.to(wheel, {
		rotation: -360,
		ease: "none",
		duration: Math.max(cards.length * 4, 16),
		repeat: -1
	});
};
document.addEventListener("DOMContentLoaded", initCardRotatingOnScroll);
//#endregion
//#region src/js/animation/circular-text-animation.js
/**
* Circular text with SplitText + GSAP rotation
* Logo stays fixed at center; text ring rotates around it.
*
* Markup:
*   [data-circular-text]            — root
*     data-duration                 — loop duration in seconds (default: 20)
*     data-radius                   — circle radius in px (default: 64)
*   [data-circular-text-content]    — text SplitText splits into chars
*   [data-circular-text-ring]       — element GSAP rotates around logo
*   [data-circular-text-icon]       — fixed center logo (not rotated)
*
*/
var initCircularText = (scope = document) => {
	if (typeof gsap === "undefined" || typeof SplitText === "undefined") return;
	gsap.registerPlugin(SplitText);
	const roots = scope.querySelectorAll("[data-circular-text]");
	if (!roots.length) return;
	roots.forEach((root) => {
		const content = root.querySelector("[data-circular-text-content]");
		const ring = root.querySelector("[data-circular-text-ring]");
		if (!content || !ring) return;
		const duration = Number.parseFloat(root.dataset.duration ?? "20") || 20;
		const radius = Number.parseFloat(root.dataset.radius ?? "64") || 64;
		const chars = new SplitText(content, {
			type: "chars",
			tag: "span"
		}).chars;
		if (!chars.length) return;
		const total = chars.length;
		gsap.set(chars, {
			position: "absolute",
			left: "50%",
			top: "50%",
			xPercent: -50,
			yPercent: -50
		});
		chars.forEach((char, i) => {
			const angle = i / total * 360;
			const rad = (angle - 90) * Math.PI / 180;
			gsap.set(char, {
				x: Math.cos(rad) * radius,
				y: Math.sin(rad) * radius,
				rotation: angle
			});
		});
		gsap.to(ring, {
			rotation: 360,
			duration,
			ease: "none",
			repeat: -1,
			transformOrigin: "50% 50%"
		});
	});
};
var startCircularText = () => {
	if (document.fonts) document.fonts.ready.then(() => initCircularText());
	else initCircularText();
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startCircularText);
else startCircularText();
//#endregion
//#region src/js/animation/counter-number-on-scroll.js
var initCounterNumberOnScroll = () => {
	if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
	gsap.registerPlugin(ScrollTrigger);
	document.querySelectorAll("[data-counter-trigger]").forEach((counterTrigger) => {
		const counterFlow = counterTrigger.querySelector("[data-counter-number]");
		const counterValue = Number(counterTrigger.dataset.counterValue) || 0;
		const counterDuration = Number(counterTrigger.dataset.counterDuration) || 1.8;
		const counterFractionDigits = Number(counterTrigger.dataset.counterFractionDigits) || 0;
		if (!counterFlow || typeof counterFlow.update !== "function") return;
		counterFlow.trend = 0;
		counterFlow.format = {
			useGrouping: true,
			maximumFractionDigits: counterFractionDigits,
			minimumFractionDigits: counterFractionDigits
		};
		counterFlow.update(0);
		ScrollTrigger.create({
			trigger: counterTrigger,
			start: "top 90%",
			once: true,
			onEnter: () => {
				counterFlow.transformTiming = {
					duration: counterDuration * 1e3,
					easing: "ease-out"
				};
				counterFlow.spinTiming = {
					duration: counterDuration * 1e3,
					easing: "ease-out"
				};
				counterFlow.opacityTiming = {
					duration: Math.max(250, counterDuration * 450),
					easing: "ease-out"
				};
				counterFlow.update(counterValue);
			}
		});
	});
};
document.addEventListener("DOMContentLoaded", initCounterNumberOnScroll);
//#endregion
//#region src/js/animation/faq-accordion.js
var initFaqAccordion = () => {
	const accordions = document.querySelectorAll("[data-faq-accordion]");
	if (!accordions.length) return;
	const hasGsap = typeof gsap !== "undefined";
	const hasSplitText = typeof SplitText !== "undefined";
	const hasCustomEase = typeof CustomEase !== "undefined";
	if (hasGsap && hasSplitText) gsap.registerPlugin(SplitText);
	if (hasGsap && hasCustomEase) {
		gsap.registerPlugin(CustomEase);
		CustomEase.create("faq-ease", "0.625, 0.05, 0, 1");
	}
	const textEase = "power3.out";
	const heightEase = hasCustomEase ? "faq-ease" : "power2.out";
	const setExpand = (item, action, content, icon, text, expanded) => {
		const value = expanded ? "true" : "false";
		item.dataset.expend = value;
		action.dataset.expend = value;
		content.dataset.expend = value;
		if (icon) icon.dataset.expend = value;
		if (text) text.dataset.expend = value;
		action.setAttribute("aria-expanded", value);
	};
	const getParts = (item) => ({
		button: item.querySelector("[data-faq-action]"),
		content: item.querySelector("[data-faq-content]"),
		icon: item.querySelector("[data-faq-icon]"),
		text: item.querySelector("[data-faq-text-reveal]")
	});
	const getLines = (text) => {
		const lines = text?._faqSplit?.lines;
		return lines?.length ? [...lines] : [];
	};
	const setupTextSplit = (text) => {
		if (!text || text._faqSplit || !hasSplitText) return;
		text._faqSplit = SplitText.create(text, {
			type: "lines",
			mask: "lines",
			linesClass: "line"
		});
	};
	const showFaqText = (text) => {
		if (!text?._faqSplit || !hasGsap) return;
		const lines = getLines(text);
		if (!lines.length) return;
		text._faqTween?.kill();
		gsap.set(lines, { yPercent: 0 });
	};
	const prepareItemText = (content, text) => {
		if (!text) return;
		content.style.height = "auto";
		setupTextSplit(text);
		const lines = getLines(text);
		if (hasGsap && lines.length) gsap.set(lines, { yPercent: 110 });
		content.style.height = "0px";
	};
	const hideFaqText = (text) => {
		if (!text?._faqSplit || !hasGsap) return;
		const lines = getLines(text);
		text._faqTween?.kill();
		gsap.set(lines, { yPercent: 110 });
	};
	const revealFaqText = (text) => {
		if (!text?._faqSplit || !hasGsap) return;
		const lines = getLines(text);
		if (!lines.length) return;
		text._faqTween?.kill();
		text._faqTween = gsap.fromTo(lines, { yPercent: 110 }, {
			yPercent: 0,
			duration: .65,
			stagger: .06,
			ease: textEase
		});
	};
	const measureContentHeight = (content, text) => {
		hideFaqText(text);
		gsap.set(content, { height: "auto" });
		const height = content.offsetHeight;
		gsap.set(content, { height: 0 });
		return height;
	};
	const openItem = (item, action, content, icon, text) => {
		content._faqTimeline?.kill();
		setExpand(item, action, content, icon, text, true);
		const targetHeight = measureContentHeight(content, text);
		content._faqTimeline = gsap.timeline({ onComplete: () => {
			content.style.height = "auto";
		} }).to(content, {
			height: targetHeight,
			duration: .6,
			ease: heightEase
		}).add(() => revealFaqText(text), .08);
	};
	const closeItem = (item, action, content, icon, text) => {
		content._faqTimeline?.kill();
		hideFaqText(text);
		setExpand(item, action, content, icon, text, false);
		content.style.height = `${content.offsetHeight}px`;
		content._faqTimeline = gsap.to(content, {
			height: 0,
			duration: .6,
			ease: heightEase,
			onComplete: () => {
				content.style.height = "0px";
			}
		});
	};
	const handleClick = (item, action, content, icon, text, items) => {
		if (item.dataset.expend === "true") {
			closeItem(item, action, content, icon, text);
			return;
		}
		items.forEach((other) => {
			if (other.dataset.expend !== "true") return;
			const parts = getParts(other);
			if (parts.button && parts.content) closeItem(other, parts.button, parts.content, parts.icon, parts.text);
		});
		openItem(item, action, content, icon, text);
	};
	accordions.forEach((accordion) => {
		const items = [...accordion.querySelectorAll("[data-faq-item]")];
		items.forEach((item) => {
			const { button: action, content, icon, text } = getParts(item);
			if (!action || !content) return;
			const isDefaultOpen = item.dataset.defaultOpen === "true";
			prepareItemText(content, text);
			if (isDefaultOpen) {
				setExpand(item, action, content, icon, text, true);
				content.style.height = "auto";
				showFaqText(text);
			} else {
				setExpand(item, action, content, icon, text, false);
				content.style.height = "0px";
			}
			action.addEventListener("click", () => handleClick(item, action, content, icon, text, items));
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(initFaqAccordion);
});
else document.fonts.ready.then(initFaqAccordion);
//#endregion
//#region src/js/animation/magnetic.js
/**
* Magnetic pull — element follows the cursor within a hover area, then springs back.
*
* Markup:
*   [data-magnetic-area]            — hover bounds (optional; falls back to the magnet)
*   [data-magnetic]                 — element that translates
*     data-magnetic-strength        — 0–1 pull factor (default: 0.35)
*/
var DEFAULT_STRENGTH = .35;
var QUICK_DURATION = .45;
var initMagnetic = (scope = document) => {
	if (typeof gsap === "undefined") return;
	if (window.matchMedia("(pointer: coarse)").matches) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	const magnets = scope.querySelectorAll("[data-magnetic]");
	if (!magnets.length) return;
	magnets.forEach((magnet) => {
		const area = magnet.closest("[data-magnetic-area]") || magnet.closest("[data-circular-text]") || magnet;
		const strength = Number.parseFloat(magnet.dataset.magneticStrength ?? area.dataset.magneticStrength ?? DEFAULT_STRENGTH) || DEFAULT_STRENGTH;
		const xTo = gsap.quickTo(magnet, "x", {
			duration: QUICK_DURATION,
			ease: "power3"
		});
		const yTo = gsap.quickTo(magnet, "y", {
			duration: QUICK_DURATION,
			ease: "power3"
		});
		const onMove = (event) => {
			const rect = area.getBoundingClientRect();
			const relX = event.clientX - (rect.left + rect.width / 2);
			const relY = event.clientY - (rect.top + rect.height / 2);
			xTo(relX * strength);
			yTo(relY * strength);
		};
		const onLeave = () => {
			xTo(0);
			yTo(0);
		};
		area.addEventListener("mousemove", onMove);
		area.addEventListener("mouseleave", onLeave);
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initMagnetic());
else initMagnetic();
//#endregion
//#region src/js/animation/process-expand.js
var initProcessExpand = () => {
	const root = document.querySelector("[data-process-expand]");
	if (!root) return;
	const cards = root.querySelectorAll("[data-process-expand-card]");
	if (!cards.length) return;
	const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
	const updateContentPosition = (card) => {
		const content = card.querySelector("[data-process-content]");
		if (!content) return;
		if (!isDesktop() || "active" in card.dataset) {
			const move = card.offsetHeight - content.offsetHeight - 50;
			content.style.transform = `translateY(${move}px)`;
		} else content.style.transform = "";
	};
	const setActive = (activeCard) => {
		cards.forEach((card) => {
			if (card === activeCard) card.dataset.active = "";
			else delete card.dataset.active;
			updateContentPosition(card);
		});
	};
	cards.forEach((card) => {
		updateContentPosition(card);
		new ResizeObserver(() => updateContentPosition(card)).observe(card);
		card.addEventListener("mouseenter", () => {
			if (!isDesktop()) return;
			setActive(card);
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initProcessExpand);
else initProcessExpand();
//#endregion
//#region src/js/animation/reveal-animation.js
var animation = { init() {
	if (typeof gsap === "undefined") return;
	if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
	const elements = document.querySelectorAll("[data-ns-animate]");
	const Springer = window.Springer?.default;
	elements.forEach((elem) => {
		const duration = elem.getAttribute("data-duration") ? parseFloat(elem.getAttribute("data-duration")) : .6;
		const blur = elem.getAttribute("data-blur") ? parseFloat(elem.getAttribute("data-blur")) : 0;
		const delay = elem.getAttribute("data-delay") ? parseFloat(elem.getAttribute("data-delay")) : 0;
		const offset = elem.getAttribute("data-offset") ? parseFloat(elem.getAttribute("data-offset")) : 60;
		const instant = elem.hasAttribute("data-instant") && elem.getAttribute("data-instant") !== "false";
		const start = elem.getAttribute("data-start") || "top 90%";
		const end = elem.getAttribute("data-end") || "top 50%";
		const direction = elem.getAttribute("data-direction") || "down";
		const useSpring = elem.hasAttribute("data-spring");
		const spring = useSpring ? Springer(.2, .8) : null;
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
			if (rotation !== 0) animationProps.rotation = rotation;
		} else {
			animationProps = {
				opacity: 0,
				filter: "blur(16px)",
				duration,
				delay,
				ease: useSpring ? spring : "power2.out"
			};
			if (rotation !== 0) animationProps.rotation = rotation;
		}
		if (!instant) animationProps.scrollTrigger = {
			trigger: elem,
			start,
			end,
			scrub: false
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
			default: animationProps.y = -offset;
		}
		if (animationType === "to") gsap.to(elem, animationProps);
		else gsap.from(elem, animationProps);
	});
} };
document.addEventListener("DOMContentLoaded", () => {
	animation.init();
});
//#endregion
//#region src/js/animation/spotlight-cards.js
var TILT_MAX = 9;
var initSpotlightCards = (scope = document) => {
	if (typeof gsap === "undefined") return;
	const roots = scope.querySelectorAll("[data-spotlight-cards]");
	if (!roots.length) return;
	if ("ontouchstart" in window) return;
	roots.forEach((root) => {
		const cards = root.querySelectorAll("[data-spotlight-card]");
		if (!cards.length) return;
		cards.forEach((card) => {
			gsap.set(card, {
				transformPerspective: 900,
				transformStyle: "preserve-3d"
			});
			card.addEventListener("mousemove", (e) => {
				const rect = card.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width;
				const y = (e.clientY - rect.top) / rect.height;
				gsap.to(card, {
					rotateY: (x - .5) * TILT_MAX * 2,
					rotateX: (.5 - y) * TILT_MAX * 2,
					duration: .35,
					ease: "power2.out",
					overwrite: "auto"
				});
			});
			card.addEventListener("mouseenter", () => {
				cards.forEach((sibling) => {
					if (sibling === card) {
						gsap.to(sibling, {
							scale: 1,
							opacity: 1,
							duration: .7,
							ease: "power2.out",
							overwrite: "auto"
						});
						return;
					}
					gsap.to(sibling, {
						scale: .96,
						opacity: .5,
						duration: .7,
						ease: "power2.out",
						overwrite: "auto"
					});
				});
			});
			card.addEventListener("mouseleave", () => {
				gsap.to(card, {
					rotateX: 0,
					rotateY: 0,
					duration: .45,
					ease: "power2.out",
					overwrite: "auto"
				});
				gsap.to(cards, {
					scale: 1,
					opacity: 1,
					duration: .7,
					ease: "power2.out",
					overwrite: "auto"
				});
			});
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initSpotlightCards());
else initSpotlightCards();
//#endregion
//#region src/js/animation/squad-cards.js
var initSquadCards = (scope = document) => {
	if (typeof gsap === "undefined") return;
	const roots = scope.querySelectorAll("[data-squad-cards]");
	if (!roots.length) return;
	if ("ontouchstart" in window) return;
	roots.forEach((root) => {
		const cards = root.querySelectorAll("[data-squad-card]");
		if (!cards.length) return;
		cards.forEach((card) => {
			card.addEventListener("mouseenter", () => {
				cards.forEach((sibling) => {
					const wrap = sibling.parentElement;
					if (sibling === card) {
						if (wrap) gsap.set(wrap, { zIndex: 20 });
						gsap.to(sibling, {
							scale: 1,
							filter: "blur(0px)",
							duration: .9,
							ease: "power2.out",
							overwrite: "auto"
						});
						return;
					}
					gsap.to(sibling, {
						scale: .96,
						filter: "blur(3px)",
						duration: .9,
						ease: "power2.out",
						overwrite: "auto"
					});
				});
			});
			card.addEventListener("mouseleave", () => {
				cards.forEach((sibling) => {
					if (sibling.parentElement) gsap.set(sibling.parentElement, { clearProps: "zIndex" });
				});
				gsap.to(cards, {
					scale: 1,
					opacity: 1,
					filter: "blur(0px)",
					duration: .55,
					ease: "power2.out",
					overwrite: "auto"
				});
			});
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initSquadCards());
else initSquadCards();
//#endregion
//#region src/js/animation/stat-cards.js
var initStatCards = (scope = document) => {
	if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || typeof CustomEase === "undefined") return;
	gsap.registerPlugin(ScrollTrigger, CustomEase);
	CustomEase.create("ease-bouncy", "0.34, 1.42, 0.64, 1");
	const roots = scope.querySelectorAll("[data-stat-cards]");
	if (!roots.length) return;
	roots.forEach((root) => {
		const cards = root.querySelectorAll("[data-stat-card]");
		if (!cards.length) return;
		gsap.set(cards, {
			opacity: 0,
			scale: 0,
			transformOrigin: "50% 50%"
		});
		gsap.to(cards, {
			opacity: 1,
			scale: 1,
			duration: 1,
			ease: "ease-bouncy",
			stagger: .08,
			overwrite: "auto",
			scrollTrigger: {
				trigger: root,
				start: "top 85%",
				once: true
			}
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initStatCards());
else initStatCards();
//#endregion
//#region src/js/animation/testimonial-cards.js
var initTestimonialCards = (scope = document) => {
	if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
	gsap.registerPlugin(ScrollTrigger);
	const roots = scope.querySelectorAll("[data-testimonial-cards]");
	if (!roots.length) return;
	const isTouch = "ontouchstart" in window;
	roots.forEach((root) => {
		const cols = gsap.utils.toArray(root.querySelectorAll("[data-testimonial-col]"));
		if (!cols.length) return;
		const cards = gsap.utils.toArray(root.querySelectorAll("[data-testimonial-card]"));
		const stars = root.querySelectorAll("[data-testimonial-stars]");
		const colMotion = [
			{
				x: -90,
				rotation: -5,
				y: 28
			},
			{
				x: 0,
				rotation: 0,
				y: 56
			},
			{
				x: 90,
				rotation: 5,
				y: 28
			}
		];
		cols.forEach((col, ci) => {
			const colCards = col.querySelectorAll("[data-testimonial-card]");
			const from = colMotion[ci] || colMotion[1];
			gsap.set(colCards, {
				opacity: 0,
				x: from.x,
				y: from.y,
				rotation: from.rotation,
				willChange: "transform, opacity"
			});
		});
		if (stars.length) gsap.set(stars, { clipPath: "inset(0 100% 0 0)" });
		const tl = gsap.timeline({ scrollTrigger: {
			trigger: root,
			start: "top 78%",
			once: true
		} });
		cols.forEach((col, ci) => {
			const colCards = col.querySelectorAll("[data-testimonial-card]");
			const at = ci === 1 ? .18 : ci * .06;
			tl.to(colCards, {
				opacity: 1,
				x: 0,
				y: 0,
				rotation: 0,
				duration: .75,
				ease: "power3.out",
				stagger: .14
			}, at);
		});
		if (stars.length) tl.to(stars, {
			clipPath: "inset(0 0% 0 0)",
			duration: .5,
			ease: "power2.out",
			stagger: .04
		}, .45);
		cols.forEach((col, ci) => {
			const drift = ci === 0 ? 48 : ci === 2 ? -48 : -28;
			gsap.to(col, {
				y: drift,
				ease: "none",
				scrollTrigger: {
					trigger: root,
					start: "top bottom",
					end: "bottom top",
					scrub: 1.2
				}
			});
		});
		if (isTouch) return;
		cards.forEach((card) => {
			const avatar = card.querySelector("img");
			const quote = card.querySelector("[data-testimonial-quote]");
			if (avatar) gsap.set(avatar, {
				transformOrigin: "50% 50%",
				transformPerspective: 600
			});
			card.addEventListener("mouseenter", () => {
				gsap.to(card, {
					y: -10,
					duration: .4,
					ease: "power2.out",
					overwrite: "auto"
				});
				if (avatar) gsap.fromTo(avatar, { rotationY: 0 }, {
					rotationY: 18,
					duration: .35,
					ease: "power2.out",
					yoyo: true,
					repeat: 1,
					overwrite: "auto"
				});
				if (quote) gsap.fromTo(quote, { backgroundSize: "0% 2px" }, {
					backgroundSize: "100% 2px",
					duration: .45,
					ease: "power2.out",
					overwrite: "auto"
				});
			});
			card.addEventListener("mouseleave", () => {
				gsap.to(card, {
					y: 0,
					duration: .4,
					ease: "power2.out",
					overwrite: "auto"
				});
				if (quote) gsap.to(quote, {
					backgroundSize: "0% 2px",
					duration: .3,
					ease: "power2.in",
					overwrite: "auto"
				});
			});
		});
	});
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initTestimonialCards());
else initTestimonialCards();
//#endregion
//#region src/js/animation/text-reveal.js
function initMaskedTextReveal() {
	if (typeof gsap === "undefined" || typeof SplitText === "undefined" || typeof ScrollTrigger === "undefined" || typeof CustomEase === "undefined") return;
	const headings = document.querySelectorAll("[data-text-reveal]");
	if (!headings.length) return;
	gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase);
	CustomEase.create("text-reveal-ease", "0.34, 1.42, 0.64, 1");
	headings.forEach((heading) => {
		SplitText.create(heading, {
			type: "lines, words, chars",
			mask: "lines",
			linesClass: "line",
			wordsClass: "word",
			charsClass: "letter"
		});
		const targets = heading.querySelectorAll(".line");
		const letters = heading.querySelectorAll(".letter");
		if (!targets.length) return;
		const duration = heading.dataset.duration ? Number.parseFloat(heading.dataset.duration) : .8;
		const delay = heading.dataset.delay ? Number.parseFloat(heading.dataset.delay) : 0;
		gsap.fromTo(targets, { yPercent: 110 }, {
			yPercent: 0,
			duration,
			stagger: .08,
			delay,
			ease: "text-reveal-ease",
			onStart: () => {
				gsap.set([heading, letters], { opacity: 1 });
			},
			scrollTrigger: {
				trigger: heading,
				start: "top 90%",
				end: "bottom 20%"
			}
		});
	});
}
document.addEventListener("DOMContentLoaded", () => {
	document.fonts.ready.then(initMaskedTextReveal);
});
//#endregion
