//#region src/js/utils/accordion.js
function canSplit() {
	return typeof gsap !== "undefined" && typeof SplitText !== "undefined";
}
function revertSplit(accordionContent) {
	accordionContent.querySelectorAll(".accordion-content-text").forEach((el) => {
		if (el._split) {
			try {
				el._split.revert();
			} catch {}
			el._split = null;
		}
		if (canSplit()) gsap.set(el, { clearProps: "all" });
	});
}
function animateSplitIn(accordionContent) {
	if (!canSplit()) return;
	accordionContent.querySelectorAll(".accordion-content-text").forEach((el, i) => {
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
			duration: .6,
			ease: "power2.out",
			stagger: .08,
			delay: i * .05
		});
	});
}
function animateSplitOut(accordionContent) {
	if (!canSplit()) return;
	accordionContent.querySelectorAll(".accordion-content-text").forEach((el, i) => {
		if (!el.textContent.trim()) return;
		if (!el._split) el._split = new SplitText(el, { type: "lines" });
		gsap.to(el._split.lines, {
			opacity: 0,
			y: -16,
			rotationX: 90,
			duration: .35,
			ease: "power2.in",
			stagger: .03,
			delay: i * .02
		});
	});
}
function forceReflow(el) {
	return el.offsetHeight;
}
function syncIconState(btn, state) {
	const icon = btn.querySelector(".accordion-icon");
	if (icon) icon.dataset.state = state;
}
function setExpandedState(item, btn, accordionContent, state) {
	const isOpen = state === "open";
	item.dataset.state = state;
	btn.dataset.state = state;
	syncIconState(btn, state);
	btn.setAttribute("aria-expanded", String(isOpen));
	accordionContent.setAttribute("aria-hidden", String(!isOpen));
}
function openItem(item, btn, accordionContent, animate) {
	setExpandedState(item, btn, accordionContent, "open");
	if (!animate) {
		accordionContent.style.height = "auto";
		accordionContent.style.opacity = "1";
		animateSplitIn(accordionContent);
		return;
	}
	revertSplit(accordionContent);
	accordionContent.style.height = "0px";
	accordionContent.style.opacity = "0";
	forceReflow(accordionContent);
	const target = accordionContent.scrollHeight;
	animateSplitIn(accordionContent);
	requestAnimationFrame(() => {
		accordionContent.style.height = `${target}px`;
		accordionContent.style.opacity = "1";
	});
	accordionContent.addEventListener("transitionend", (e) => {
		if (e.propertyName === "height") accordionContent.style.height = "auto";
	}, { once: true });
}
function closeItem(item, btn, accordionContent, animate) {
	setExpandedState(item, btn, accordionContent, "closed");
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
	forceReflow(accordionContent);
	setTimeout(() => {
		requestAnimationFrame(() => {
			accordionContent.style.height = "0px";
			accordionContent.style.opacity = "0";
		});
	}, 80);
	accordionContent.addEventListener("transitionend", (e) => {
		if (e.propertyName === "height") revertSplit(accordionContent);
	}, { once: true });
}
function getAccordionParts(item) {
	return {
		btn: item.querySelector(".accordion-action"),
		accordionContent: item.querySelector(".accordion-content")
	};
}
function setupItemA11y(accordionAction, accordionContent, qId, aId) {
	accordionAction.id ||= qId;
	accordionContent.id ||= aId;
	accordionAction.setAttribute("aria-controls", accordionContent.id);
	accordionContent.setAttribute("role", "region");
	accordionContent.setAttribute("aria-labelledby", accordionAction.id);
}
function setupContentAnimationStyle(accordionContent) {
	accordionContent.style.overflow = "hidden";
	accordionContent.style.transition = "height 300ms ease-in-out, opacity 300ms ease-in-out";
}
function initializeItem(item, accIndex, itemIndex) {
	const { btn: accordionAction, accordionContent } = getAccordionParts(item);
	if (!accordionAction || !accordionContent) return;
	setupItemA11y(accordionAction, accordionContent, `acc-q-${accIndex}-${itemIndex}`, `acc-a-${accIndex}-${itemIndex}`);
	setupContentAnimationStyle(accordionContent);
	if (item.dataset.defaultOpen === "true") openItem(item, accordionAction, accordionContent, false);
	else closeItem(item, accordionAction, accordionContent, false);
}
function enforceSingleDefaultOpen(items) {
	items.filter((it) => it.dataset.defaultOpen === "true").slice(1).forEach((it) => {
		const { btn, accordionContent } = getAccordionParts(it);
		if (btn && accordionContent) closeItem(it, btn, accordionContent, false);
		delete it.dataset.defaultOpen;
	});
}
function closeOtherItems(items, activeItem) {
	items.forEach((it) => {
		if (it === activeItem || it.dataset.state !== "open") return;
		const { btn: siblingBtn, accordionContent: siblingContent } = getAccordionParts(it);
		if (siblingBtn && siblingContent) closeItem(it, siblingBtn, siblingContent, true);
	});
}
function handleAccordionClick(e, accordion, items, allowMultiple) {
	const btn = e.target.closest(".accordion-action");
	if (!btn || !accordion.contains(btn)) return;
	e.preventDefault();
	const item = btn.closest(".accordion-item");
	if (!item) return;
	const accordionContent = item.querySelector(".accordion-content");
	if (!accordionContent) return;
	if (item.dataset.state === "open") {
		closeItem(item, btn, accordionContent, true);
		return;
	}
	if (!allowMultiple) closeOtherItems(items, item);
	openItem(item, btn, accordionContent, true);
}
function handleAccordionKeydown(e) {
	const btn = e.target.closest(".accordion-action");
	if (!btn) return;
	if (e.key !== "Enter" && e.key !== " ") return;
	e.preventDefault();
	btn.click();
}
function initAccordions({ selector = ".accordion", allowMultiple = false, keyboard = true } = {}) {
	document.querySelectorAll(selector).forEach((accordion, accIndex) => {
		const items = Array.from(accordion.querySelectorAll(".accordion-item"));
		if (!accordion.getAttribute("aria-label")) accordion.setAttribute("aria-label", "Accordion");
		items.forEach((item, i) => initializeItem(item, accIndex, i));
		if (!allowMultiple) enforceSingleDefaultOpen(items);
		accordion.addEventListener("click", (e) => handleAccordionClick(e, accordion, items, allowMultiple));
		if (keyboard) accordion.addEventListener("keydown", handleAccordionKeydown);
	});
}
document.addEventListener("DOMContentLoaded", () => {
	initAccordions({
		allowMultiple: false,
		keyboard: true
	});
});
//#endregion
//#region src/js/utils/auth-modal.js
function createAuthModal(root) {
	const overlay = root.querySelector("[data-auth-modal-overlay]");
	const panel = root.querySelector("[data-auth-modal-panel]");
	const backdrop = root.querySelector("[data-auth-modal-backdrop]");
	const items = root.querySelectorAll("[data-auth-modal-item]");
	const closeBtns = root.querySelectorAll("[data-auth-modal-close]");
	const providerBtns = root.querySelectorAll("[data-auth-provider]");
	const emailForm = root.querySelector("[data-auth-email-form]");
	const openBtns = document.querySelectorAll("[data-auth-modal-open]");
	if (!overlay || !panel || openBtns.length === 0) return null;
	if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
	let isOpen = false;
	const finishClose = () => {
		overlay.classList.add("hidden");
		overlay.classList.remove("flex");
		overlay.setAttribute("aria-hidden", "true");
		document.body.style.overflow = "";
	};
	const open = () => {
		if (isOpen) return;
		isOpen = true;
		overlay.classList.remove("hidden");
		overlay.classList.add("flex");
		overlay.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
		if (typeof gsap === "undefined") return;
		gsap.killTweensOf([
			backdrop,
			panel,
			...items
		]);
		gsap.set(backdrop, { opacity: 0 });
		gsap.set(panel, {
			opacity: 0,
			y: 28,
			scale: .94
		});
		gsap.set(items, {
			opacity: 0,
			y: 16
		});
		gsap.timeline().to(backdrop, {
			opacity: 1,
			duration: .22,
			ease: "power2.out"
		}).to(panel, {
			opacity: 1,
			y: 0,
			scale: 1,
			duration: .32,
			ease: "power3.out"
		}, "-=0.08").to(items, {
			opacity: 1,
			y: 0,
			duration: .28,
			stagger: .045,
			ease: "power2.out"
		}, "-=0.18");
	};
	const close = () => {
		if (!isOpen) return;
		isOpen = false;
		if (typeof gsap === "undefined") {
			finishClose();
			return;
		}
		gsap.killTweensOf([
			backdrop,
			panel,
			...items
		]);
		gsap.timeline({ onComplete: finishClose }).to(items, {
			opacity: 0,
			y: 8,
			duration: .12,
			stagger: .02,
			ease: "power1.in"
		}).to(panel, {
			opacity: 0,
			y: 16,
			scale: .96,
			duration: .18,
			ease: "power2.in"
		}, "-=0.06").to(backdrop, {
			opacity: 0,
			duration: .16,
			ease: "power2.in"
		}, "-=0.1");
	};
	openBtns.forEach((btn) => btn.addEventListener("click", open));
	closeBtns.forEach((btn) => btn.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
		close();
	}));
	backdrop?.addEventListener("click", close);
	panel.addEventListener("click", (event) => event.stopPropagation());
	overlay.addEventListener("click", (event) => {
		if (!event.target.closest("[data-auth-modal-close]")) return;
		event.preventDefault();
		event.stopPropagation();
		close();
	});
	providerBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const provider = btn.dataset.authProvider;
			globalThis.dispatchEvent(new CustomEvent("auth:provider", { detail: { provider } }));
		});
	});
	emailForm?.addEventListener("submit", (event) => {
		event.preventDefault();
		const email = emailForm.querySelector("input[type=\"email\"]")?.value?.trim() || "";
		globalThis.dispatchEvent(new CustomEvent("auth:email", { detail: { email } }));
	});
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && isOpen) close();
	});
	return {
		open,
		close
	};
}
document.addEventListener("DOMContentLoaded", () => {
	const root = document.querySelector("[data-auth-modal-root]");
	if (!root) return;
	const modal = createAuthModal(root);
	globalThis.authModalInstances = modal ? [modal] : [];
});
//#endregion
//#region src/js/utils/button.js
var button = { init() {
	document.querySelectorAll(".button").forEach((buttonWrapper) => {
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
} };
document.addEventListener("DOMContentLoaded", () => {
	button.init();
});
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
//#region src/js/utils/microphone-permission.js
var MicPermissionHandler = () => {
	if (!navigator.mediaDevices?.getUserMedia) return;
	const micButtons = document.querySelectorAll("[data-mic-button]");
	if (!micButtons.length) return;
	const requestMicPermission = async (button) => {
		try {
			(await navigator.mediaDevices.getUserMedia({ audio: true })).getTracks().forEach((track) => track.stop());
			button.classList.add("mic-permission-granted");
			button.dispatchEvent(new CustomEvent("micPermissionGranted"));
			console.log("Microphone access granted");
		} catch (error) {
			button.classList.add("mic-permission-denied");
			button.dispatchEvent(new CustomEvent("micPermissionDenied", { detail: error }));
			console.error("Microphone access error:", error);
		}
	};
	micButtons.forEach((button) => {
		if (button.dataset.micHandlerAttached === "true") return;
		button.dataset.micHandlerAttached = "true";
		button.addEventListener("click", () => requestMicPermission(button));
	});
};
document.addEventListener("DOMContentLoaded", () => {
	MicPermissionHandler();
});
//#endregion
//#region src/js/utils/mobile-menu.js
var MobileMenuAccordion = class {
	constructor(options = {}) {
		this.defaultOpenMenu = options.defaultOpenMenu || "company";
		this.toggleButtons = null;
		this.submenus = null;
		this.arrows = null;
		this.init();
	}
	init() {
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => this.bindEvents());
		else this.bindEvents();
	}
	bindEvents() {
		this.toggleButtons = document.querySelectorAll(".mobile-menu-toggle[data-menu]");
		if (this.toggleButtons.length === 0) return;
		this.submenus = document.querySelectorAll(".mobile-submenu[data-submenu]");
		this.arrows = document.querySelectorAll(".mobile-menu-toggle .menu-arrow");
		this.setDefaultState();
		this.toggleButtons.forEach((button) => {
			button.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				const menuId = button.getAttribute("data-menu");
				this.toggleMenu(menuId);
			});
		});
	}
	setDefaultState() {
		this.submenus.forEach((submenu) => {
			submenu.classList.add("hidden");
			submenu.classList.remove("block");
		});
		this.arrows.forEach((arrow) => {
			arrow.classList.remove("rotate-90");
		});
		if (this.defaultOpenMenu) {
			const defaultSubmenu = document.querySelector(`.mobile-submenu[data-submenu="${this.defaultOpenMenu}"]`);
			const defaultArrow = document.querySelector(`.mobile-menu-toggle[data-menu="${this.defaultOpenMenu}"]`)?.querySelector(".menu-arrow");
			if (defaultSubmenu) {
				defaultSubmenu.classList.remove("hidden");
				defaultSubmenu.classList.add("block");
			}
			if (defaultArrow) defaultArrow.classList.add("rotate-90");
		}
	}
	toggleMenu(menuId) {
		const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
		const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
		const arrow = button?.querySelector(".menu-arrow");
		if (!submenu || !button) return;
		const isCurrentlyOpen = submenu.classList.contains("block") && !submenu.classList.contains("hidden");
		this.closeAllMenus();
		if (isCurrentlyOpen) {
			submenu.classList.add("hidden");
			submenu.classList.remove("block");
			if (arrow) arrow.classList.remove("rotate-90");
		} else {
			submenu.classList.remove("hidden");
			submenu.classList.add("block");
			if (arrow) arrow.classList.add("rotate-90");
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
	}
	openMenu(menuId) {
		const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
		const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
		const arrow = button?.querySelector(".menu-arrow");
		if (submenu && button) {
			this.closeAllMenus();
			submenu.classList.remove("hidden");
			submenu.classList.add("block");
			if (arrow) arrow.classList.add("rotate-90");
		}
	}
	closeMenu(menuId) {
		const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
		const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
		const arrow = button?.querySelector(".menu-arrow");
		if (submenu && button) {
			submenu.classList.add("hidden");
			submenu.classList.remove("block");
			if (arrow) arrow.classList.remove("rotate-90");
		}
	}
	reinit() {
		this.bindEvents();
	}
	setDefaultOpenMenu(menuId) {
		this.defaultOpenMenu = menuId;
		this.setDefaultState();
	}
};
document.addEventListener("DOMContentLoaded", () => {
	if (document.querySelector(".mobile-menu-toggle[data-menu]")) window.mobileMenuAccordion = new MobileMenuAccordion({ defaultOpenMenu: "company" });
});
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
			text.classList.remove("font-medium", "text-secondary", "dark:text-accent");
			text.classList.add("font-normal", "text-secondary/60", "dark:text-accent/60");
		}
	});
};
var activateTocItem = (item) => {
	const icon = item.querySelector("span:last-child");
	const text = item.querySelector("span:first-child, a span");
	if (icon) icon.classList.remove("invisible");
	if (text) {
		text.classList.remove("font-normal", "text-secondary/60", "dark:text-accent/60");
		text.classList.add("font-medium", "text-secondary", "dark:text-accent");
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
//#region src/js/animation/avatar.js
var avatar = { init() {
	document.querySelectorAll("[data-ns-avatar]").forEach((el) => {
		const delay = el.dataset.avatarDelay ? Number.parseFloat(el.dataset.avatarDelay) : 0;
		const direction = el.dataset.avatarDirection || "left";
		const scale = el.dataset.avatarScale ? Number.parseFloat(el.dataset.avatarScale) : 0;
		const offset = el.dataset.avatarOffset ? Number.parseFloat(el.dataset.avatarOffset) : 0;
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
			default:
				animationProps.y = -offset;
				break;
		}
		gsap.from(el, animationProps);
	});
} };
document.addEventListener("DOMContentLoaded", () => {
	avatar.init();
});
//#endregion
//#region src/js/animation/orbit.js
/**
* Integration “orbit” wheel (rotating logo ring). Distinct from logo-circle static markup.
* Markup: [data-orbit], [data-orbit-center], optional [data-orbit-layout], data-orbit-speed, data-orbit-size.
*/
var ORBIT_SIZE_DEFAULT = 400;
var ORBIT_SIZE_MIN = 200;
var ORBIT_SIZE_MAX = 1290;
var ORBIT_SPEED_DEFAULT = 1;
var ORBIT_SPEED_MIN = .01;
var ORBIT_SPEED_MAX = 20;
var clampOrbitSize = (px) => {
	if (!Number.isFinite(px)) return ORBIT_SIZE_DEFAULT;
	return Math.min(ORBIT_SIZE_MAX, Math.max(ORBIT_SIZE_MIN, Math.round(px)));
};
/** Prefer box size from CSS (`size-[…]` etc.); optional `data-orbit-size` fallback. */
var readOrbitSizePx = (el) => {
	const rect = el.getBoundingClientRect();
	const w = rect.width;
	const h = rect.height;
	const fromBox = Math.max(w, h);
	if (fromBox >= ORBIT_SIZE_MIN) return clampOrbitSize(fromBox);
	const raw = Number.parseInt(el.dataset.orbitSize ?? "", 10);
	if (Number.isFinite(raw)) return clampOrbitSize(raw);
	return ORBIT_SIZE_DEFAULT;
};
var clampOrbitSpeed = (value) => {
	if (!Number.isFinite(value)) return ORBIT_SPEED_DEFAULT;
	return Math.min(ORBIT_SPEED_MAX, Math.max(ORBIT_SPEED_MIN, value));
};
var buildTimeline = (center, basketsInWheel, speed) => {
	const tl = gsap.timeline({ repeat: -1 });
	tl.to(center, {
		rotation: 360,
		duration: 20,
		ease: "none"
	});
	tl.to(basketsInWheel, {
		rotation: "-=360",
		duration: 20,
		ease: "none"
	}, 0);
	tl.timeScale(speed);
	tl.play();
	return tl;
};
var applyOrbitGeometry = (root, center, sizePx) => {
	const sizeStr = `${sizePx}px`;
	root.style.setProperty("--orbit-size", sizeStr);
	const hubOffset = (sizePx - (center.offsetWidth || 20)) / 2;
	gsap.set(center, {
		x: hubOffset,
		y: hubOffset,
		rotation: 0
	});
	const pivotOriginY = sizePx / 2 + 10;
	const pivots = center.querySelectorAll(".orbit-pivot-outer");
	const count = pivots.length;
	if (count === 0) return null;
	const space = 360 / count;
	pivots.forEach((pivot, i) => {
		const basket = pivot.querySelector(".orbit-basket");
		const pivotHalf = pivot.offsetWidth / 2 || 10;
		gsap.set(pivot, {
			rotation: i * space,
			transformOrigin: `${pivotHalf}px ${pivotOriginY}px`
		});
		if (basket) gsap.set(basket, {
			rotation: -i * space,
			transformOrigin: "center center"
		});
	});
	return center.querySelectorAll(".orbit-basket");
};
var initOrbitWheel = () => {
	if (typeof gsap === "undefined") return;
	const root = document.querySelector("[data-orbit]");
	if (!root) return;
	const center = root.querySelector("[data-orbit-center]");
	if (!center) return;
	const speed = clampOrbitSpeed(Number.parseFloat(root.dataset.orbitSpeed ?? ""));
	let tl = null;
	const killTl = () => {
		if (tl) {
			tl.kill();
			tl = null;
		}
	};
	const runLayout = () => {
		const sizePx = readOrbitSizePx(root);
		killTl();
		const basketsInWheel = applyOrbitGeometry(root, center, sizePx);
		if (!basketsInWheel || basketsInWheel.length === 0) return;
		tl = buildTimeline(center, basketsInWheel, speed);
	};
	const scheduleLayout = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(runLayout);
		});
	};
	gsap.from(root, {
		autoAlpha: 0,
		duration: 1
	});
	scheduleLayout();
	if (typeof ResizeObserver !== "undefined") {
		let t = 0;
		new ResizeObserver(() => {
			globalThis.clearTimeout(t);
			t = globalThis.setTimeout(scheduleLayout, 80);
		}).observe(root);
	}
};
document.addEventListener("DOMContentLoaded", initOrbitWheel);
//#endregion
//#region src/js/animation/colored-border.js
var initColoredBorder = () => {
	if (typeof gsap === "undefined") return;
	document.querySelectorAll("[data-colored-border]").forEach((wrapper) => {
		wrapper.classList.add("relative", "overflow-hidden");
		if (wrapper.querySelector("[data-colored-border-layer]")) return;
		const shineColors = (wrapper.dataset.shineColor || "#000000").split(",").map((v) => v.trim()).filter(Boolean);
		const duration = Number.parseFloat(wrapper.dataset.shineDuration ?? "14") || 14;
		const borderWidth = Number.parseFloat(wrapper.dataset.borderWidth ?? "1") || 1;
		const gradientColors = (shineColors.length ? shineColors : ["#000000"]).join(",");
		const layer = document.createElement("span");
		layer.dataset.coloredBorderLayer = "";
		layer.className = "pointer-events-none absolute inset-0 size-full rounded-[inherit]";
		layer.style.padding = `${borderWidth}px`;
		layer.style.backgroundImage = `radial-gradient(transparent, transparent, ${gradientColors}, transparent, transparent)`;
		layer.style.backgroundSize = "300% 300%";
		layer.style.willChange = "background-position";
		const mask = "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)";
		layer.style.setProperty("mask", mask);
		layer.style.setProperty("-webkit-mask", mask);
		layer.style.setProperty("mask-composite", "exclude");
		layer.style.setProperty("-webkit-mask-composite", "xor");
		wrapper.prepend(layer);
		gsap.to(layer, {
			backgroundPosition: "100% 100%",
			duration,
			ease: "none",
			repeat: -1,
			yoyo: true
		});
	});
};
document.addEventListener("DOMContentLoaded", initColoredBorder);
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
//#region src/js/animation/form-file-attachment.js
var FileUploadHandler = () => {
	const fileUploadContainers = document.querySelectorAll("[data-file-upload]");
	if (!fileUploadContainers.length) return;
	const initFileUpload = (container) => {
		if (container.dataset.fileUploadInitialized === "true") return;
		container.dataset.fileUploadInitialized = "true";
		const fileInput = container.querySelector("input[type=\"file\"]");
		const fileIcon = container.querySelector("[data-file-upload-icon]");
		const fileNameWrapper = container.querySelector("[data-file-upload-filename]");
		const fileName = container.querySelector("[data-file-upload-name]");
		const removeButton = container.querySelector("[data-file-upload-remove]");
		if (!fileInput || !fileIcon || !fileNameWrapper || !fileName || !removeButton) return;
		const handleFileSelect = (event) => {
			const file = event.target.files[0];
			if (!file) return;
			fileName.textContent = file.name;
			fileIcon.classList.add("hidden");
			fileNameWrapper.classList.remove("hidden");
			fileNameWrapper.classList.add("flex");
			container.classList.remove("size-9", "min-w-9");
			container.classList.add("h-9", "min-w-fit");
			const finalWidth = container.offsetWidth;
			gsap.fromTo(container, { width: "36px" }, {
				width: finalWidth,
				duration: .3,
				ease: "linear"
			});
			gsap.fromTo(fileNameWrapper, {
				opacity: 0,
				x: -10
			}, {
				opacity: 1,
				x: 0,
				duration: .3,
				ease: "power3.out"
			});
		};
		const handleFileRemove = (event) => {
			event.preventDefault();
			event.stopPropagation();
			gsap.to(fileNameWrapper, {
				opacity: 0,
				x: -10,
				duration: .3,
				ease: "power3.in",
				onComplete: () => {
					fileNameWrapper.classList.add("hidden");
					fileNameWrapper.classList.remove("flex");
					fileIcon.classList.remove("hidden");
					fileInput.value = "";
					gsap.to(container, {
						width: "36px",
						duration: .3,
						ease: "power3.out",
						onComplete: () => {
							container.classList.remove("h-9", "min-w-fit");
							container.classList.add("size-9", "min-w-9");
							gsap.set(container, { clearProps: "width" });
						}
					});
					gsap.fromTo(fileIcon, {
						opacity: 0,
						scale: .8
					}, {
						opacity: 1,
						scale: 1,
						duration: .3,
						ease: "power3.out"
					});
				}
			});
		};
		fileInput.addEventListener("change", handleFileSelect);
		removeButton.addEventListener("click", handleFileRemove);
	};
	fileUploadContainers.forEach(initFileUpload);
};
document.addEventListener("DOMContentLoaded", () => {
	FileUploadHandler();
});
//#endregion
//#region src/js/animation/logos-carousel.js
var injectCarouselStyles = () => {
	if (document.getElementById("logos-carousel-styles")) return;
	const style = document.createElement("style");
	style.id = "logos-carousel-styles";
	style.textContent = `
    @keyframes logos-enter { from { transform: translateY(40px); filter: blur(4px); opacity: 0; } to { transform: translateY(0); filter: blur(0); opacity: 1; } }
    @keyframes logos-exit { from { transform: translateY(0); filter: blur(0); opacity: 1; } to { transform: translateY(-40px); filter: blur(4px); opacity: 0; } }
  `;
	document.head.appendChild(style);
};
var initLogosCarousel = () => {
	injectCarouselStyles();
	document.querySelectorAll("[data-logos-carousel]").forEach((root) => {
		const items = [...root.querySelectorAll("[data-logo-item]")];
		if (!items.length) return;
		const count = Number.parseInt(root.dataset.count ?? `${items.length}`, 10) || items.length;
		const stagger = Number.parseFloat(root.dataset.stagger ?? "0.14") || .14;
		const duration = Number.parseFloat(root.dataset.duration ?? "600") || 600;
		const interval = Number.parseFloat(root.dataset.interval ?? "2500") || 2500;
		const initialDelay = Number.parseFloat(root.dataset.initialDelay ?? "500") || 500;
		const groups = [];
		for (let i = 0; i < items.length; i += count) groups.push(items.slice(i, i + count));
		if (groups.length <= 1) return;
		const groupClass = root.dataset.groupClass || root.className;
		root.innerHTML = "";
		root.style.display = "grid";
		root.style.placeItems = "center";
		const groupEls = groups.map((group) => {
			const el = document.createElement("div");
			el.className = groupClass;
			el.style.gridArea = "1 / 1";
			el.style.opacity = "0";
			el.style.pointerEvents = "none";
			group.forEach((item) => {
				item.style.opacity = "0";
				el.appendChild(item);
			});
			root.appendChild(el);
			return el;
		});
		let currentIndex = 0;
		groupEls[0].style.opacity = "1";
		groupEls[0].style.pointerEvents = "auto";
		groupEls[0].querySelectorAll("[data-logo-item]").forEach((item) => item.style.opacity = "1");
		const run = () => {
			const current = groupEls[currentIndex];
			const nextIndex = (currentIndex + 1) % groupEls.length;
			const next = groupEls[nextIndex];
			next.style.opacity = "1";
			next.style.pointerEvents = "auto";
			current.querySelectorAll("[data-logo-item]").forEach((item, i) => {
				item.style.animation = `logos-exit ${duration}ms ease ${i * stagger}s both`;
			});
			next.querySelectorAll("[data-logo-item]").forEach((item, i) => {
				item.style.animation = `logos-enter ${duration}ms ease ${i * stagger}s both`;
			});
			const wait = duration + (Math.max(current.children.length, next.children.length) - 1) * stagger * 1e3;
			globalThis.setTimeout(() => {
				current.style.opacity = "0";
				current.style.pointerEvents = "none";
			}, wait);
			currentIndex = nextIndex;
		};
		globalThis.setTimeout(() => {
			run();
			globalThis.setInterval(run, interval);
		}, initialDelay);
	});
};
document.addEventListener("DOMContentLoaded", initLogosCarousel);
//#endregion
//#region src/js/animation/pricing.js
var initPricingAnimation = () => {
	if (typeof gsap === "undefined") return;
	const pricingRoots = document.querySelectorAll("[data-pricing]");
	if (!pricingRoots.length) return;
	const planData = {
		starter: {
			monthly: 2500,
			yearly: 25e3,
			activeCount: 5
		},
		pro: {
			monthly: 4190,
			yearly: 41900,
			activeCount: 7
		},
		business: {
			monthly: 8290,
			yearly: 82900,
			activeCount: 9
		}
	};
	pricingRoots.forEach((root) => {
		const tabs = Array.from(root.querySelectorAll("[data-pricing-tab]"));
		const badgeWrap = root.querySelector("[data-pricing-badge-wrap]");
		const badges = Array.from(root.querySelectorAll("[data-pricing-badge]"));
		const descWrap = root.querySelector("[data-pricing-desc-wrap]");
		const descs = Array.from(root.querySelectorAll("[data-pricing-desc]"));
		const priceFlow = root.querySelector("[data-pricing-price]");
		const periodEl = root.querySelector("[data-pricing-period]");
		const items = Array.from(root.querySelectorAll("[data-pricing-item]"));
		const billingToggle = document.querySelector("[data-pricing-billing-toggle]");
		const syncTabsActive = (selected) => {
			tabs.forEach((tab) => {
				tab.dataset.active = tab.dataset.pricingTab === selected ? "true" : "false";
			});
		};
		const syncItemsActive = (selected) => {
			const activeCount = Math.max(0, Number(planData[selected]?.activeCount ?? 0));
			items.forEach((li, idx) => {
				li.dataset.active = idx < activeCount ? "true" : "false";
			});
		};
		const setPrice = (selected, durationMs) => {
			const plan = planData[selected];
			const key = billingToggle?.checked ? "yearly" : "monthly";
			const value = plan?.[key] ?? 0;
			if (!priceFlow) return;
			if (typeof priceFlow.update === "function") {
				priceFlow.trend = 0;
				priceFlow.format = {
					useGrouping: true,
					minimumIntegerDigits: 2,
					maximumFractionDigits: 0,
					minimumFractionDigits: 0
				};
				priceFlow.transformTiming = {
					duration: durationMs,
					easing: "ease-out"
				};
				priceFlow.spinTiming = {
					duration: durationMs,
					easing: "ease-out"
				};
				priceFlow.opacityTiming = {
					duration: Math.max(250, durationMs * .45),
					easing: "ease-out"
				};
				priceFlow.update(value);
				return;
			}
			priceFlow.textContent = String(value);
		};
		const setPeriodLabel = () => {
			if (!periodEl) return;
			periodEl.textContent = billingToggle?.checked ? "/year" : "/month";
		};
		const measureAndLockBadgeSize = () => {
			if (!badgeWrap || !badges.length) return;
			const prevStyles = badges.map((el) => ({
				el,
				pos: el.style.position,
				opacity: el.style.opacity,
				transform: el.style.transform,
				display: el.style.display
			}));
			badges.forEach((el) => {
				el.style.position = "static";
				el.style.opacity = "1";
				el.style.transform = "none";
				el.style.display = "inline-flex";
			});
			const widths = badges.map((el) => el.offsetWidth);
			const heights = badges.map((el) => el.offsetHeight);
			const maxW = Math.max(...widths, 0);
			const maxH = Math.max(...heights, 0);
			if (maxW) badgeWrap.style.width = `${maxW}px`;
			if (maxH) badgeWrap.style.height = `${maxH}px`;
			prevStyles.forEach(({ el, pos, opacity, transform, display }) => {
				el.style.position = pos;
				el.style.opacity = opacity;
				el.style.transform = transform;
				el.style.display = display;
			});
		};
		const getBadgeEl = (plan) => badges.find((b) => b.dataset.pricingBadge === plan) || null;
		const getDescEl = (plan) => descs.find((d) => d.dataset.pricingDesc === plan) || null;
		const measureAndLockDescSize = () => {
			if (!descWrap || !descs.length) return;
			const prevStyles = descs.map((el) => ({
				el,
				pos: el.style.position,
				opacity: el.style.opacity,
				transform: el.style.transform,
				display: el.style.display
			}));
			descs.forEach((el) => {
				el.style.position = "static";
				el.style.opacity = "1";
				el.style.transform = "none";
				el.style.display = "block";
			});
			const heights = descs.map((el) => el.offsetHeight);
			const maxH = Math.max(...heights, 0);
			if (maxH) descWrap.style.minHeight = `${maxH}px`;
			prevStyles.forEach(({ el, pos, opacity, transform, display }) => {
				el.style.position = pos;
				el.style.opacity = opacity;
				el.style.transform = transform;
				el.style.display = display;
			});
		};
		const setSelected = (next) => {
			const current = root.dataset.selected || "starter";
			if (next === current) return;
			const fromBadge = getBadgeEl(current);
			const toBadge = getBadgeEl(next);
			const fromDesc = getDescEl(current);
			const toDesc = getDescEl(next);
			root.dataset.selected = next;
			syncTabsActive(next);
			const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
			if (fromBadge && toBadge) {
				tl.set(toBadge, {
					y: 12,
					opacity: 0
				}, 0);
				tl.to(fromBadge, {
					y: -12,
					opacity: 0,
					duration: .22
				}, 0);
				tl.to(toBadge, {
					y: 0,
					opacity: 1,
					duration: .28
				}, .12);
				tl.set(fromBadge, { y: 0 }, .3);
			}
			if (fromDesc && toDesc) {
				tl.set(toDesc, {
					y: 12,
					opacity: 0
				}, 0);
				tl.to(fromDesc, {
					y: -12,
					opacity: 0,
					duration: .22
				}, 0);
				tl.to(toDesc, {
					y: 0,
					opacity: 1,
					duration: .28
				}, .12);
				tl.set(fromDesc, { y: 0 }, .3);
			}
			tl.add(() => syncItemsActive(next), 0);
			tl.add(() => setPrice(next, 700), 0);
		};
		const initial = root.dataset.selected || "starter";
		syncTabsActive(initial);
		syncItemsActive(initial);
		setPeriodLabel();
		setPrice(initial, 0);
		measureAndLockBadgeSize();
		measureAndLockDescSize();
		if (billingToggle) billingToggle.addEventListener("change", () => {
			setPeriodLabel();
			setPrice(root.dataset.selected || "starter", 700);
		});
		tabs.forEach((tab) => {
			tab.addEventListener("click", () => setSelected(tab.dataset.pricingTab));
			tab.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					setSelected(tab.dataset.pricingTab);
				}
			});
		});
	});
};
document.addEventListener("DOMContentLoaded", initPricingAnimation);
//#endregion
//#region src/js/animation/process-cards.js
var initProcessCardsV2 = () => {
	if (typeof gsap === "undefined") return;
	const root = document.querySelector("[data-process-cards]");
	if (!root) return;
	const cards = Array.from(root.querySelectorAll("[data-process-card]"));
	if (cards.length < 2) return;
	const timelines = Array.from(root.querySelectorAll("[data-process-timeline]")).map((timeline) => ({
		steps: Array.from(timeline.querySelectorAll("[data-process-step]")),
		lines: Array.from(timeline.querySelectorAll("[data-process-line-fill]"))
	}));
	const STEP_WAIT = 1.2;
	const LINE_DURATION = 1;
	const CARD_DURATION = 1.2;
	const TEXT_DURATION = 1;
	const TEXT_IN_DELAY = .35;
	const TEXT_OFFSET = 120;
	let activeIndex = 0;
	let busy = false;
	let lineTl;
	let loopDelay;
	let isPaused = false;
	const isHorizontal = (el) => el.offsetWidth > el.offsetHeight;
	const setActiveStep = (index) => {
		timelines.forEach(({ steps }) => {
			steps.forEach((step, i) => {
				let state = "inactive";
				if (i === index) state = "active";
				else if (i < index) state = "completed";
				step.dataset.item = state;
			});
		});
	};
	const setLineProgress = (index) => {
		timelines.forEach(({ lines }) => {
			lines.forEach((line, i) => {
				if (isHorizontal(line)) gsap.set(line, { scaleX: i < index ? 1 : 0 });
				else gsap.set(line, { scaleY: i < index ? 1 : 0 });
			});
		});
	};
	timelines.forEach(({ lines }) => {
		lines.forEach((line) => {
			if (isHorizontal(line)) gsap.set(line, {
				transformOrigin: "left center",
				scaleX: 0
			});
			else gsap.set(line, {
				transformOrigin: "top center",
				scaleY: 0
			});
		});
	});
	cards.forEach((card, i) => {
		const image = card.querySelector("[data-process-image]");
		const text = card.querySelector("[data-process-content]");
		gsap.set(card, {
			pointerEvents: i === 0 ? "auto" : "none",
			zIndex: i === 0 ? 2 : 0
		});
		if (image) gsap.set(image, { yPercent: 0 });
		if (text) gsap.set(text, { yPercent: 0 });
	});
	setActiveStep(0);
	setLineProgress(0);
	const schedule = () => {
		if (isPaused) return;
		if (loopDelay) loopDelay.kill();
		loopDelay = gsap.delayedCall(STEP_WAIT, runLoop);
	};
	const slideTo = (nextIndex, reverse = false) => {
		if (busy || nextIndex === activeIndex) return;
		busy = true;
		const current = cards[activeIndex];
		const next = cards[nextIndex];
		const currentImage = current.querySelector("[data-process-image]");
		const currentText = current.querySelector("[data-process-content]");
		const nextImage = next.querySelector("[data-process-image]");
		const nextText = next.querySelector("[data-process-content]");
		const outImage = reverse ? 100 : -100;
		const inImage = reverse ? -100 : 100;
		const outText = reverse ? -TEXT_OFFSET : TEXT_OFFSET;
		const inText = reverse ? TEXT_OFFSET : -TEXT_OFFSET;
		gsap.killTweensOf([
			current,
			next,
			currentImage,
			currentText,
			nextImage,
			nextText
		]);
		const tl = gsap.timeline();
		tl.set(next, {
			pointerEvents: "auto",
			zIndex: 2
		}, 0);
		tl.set(current, {
			zIndex: 3,
			backgroundColor: "transparent"
		}, 0);
		if (nextImage) tl.set(nextImage, { yPercent: inImage }, 0);
		if (nextText) tl.set(nextText, { yPercent: inText }, 0);
		if (currentImage) tl.to(currentImage, {
			yPercent: outImage,
			duration: CARD_DURATION,
			ease: "power2.inOut"
		}, 0);
		if (nextImage) tl.to(nextImage, {
			yPercent: 0,
			duration: CARD_DURATION,
			ease: "power1.inOut"
		}, 0);
		if (currentText) tl.to(currentText, {
			yPercent: outText,
			duration: TEXT_DURATION,
			ease: "sine.inOut"
		}, 0);
		if (nextText) tl.to(nextText, {
			yPercent: 0,
			duration: TEXT_DURATION,
			ease: "sine.out"
		}, TEXT_IN_DELAY);
		tl.set(current, {
			pointerEvents: "none",
			zIndex: 0,
			backgroundColor: ""
		}, CARD_DURATION);
		tl.call(() => {
			busy = false;
		}, [], CARD_DURATION);
		activeIndex = nextIndex;
		setActiveStep(activeIndex);
		setLineProgress(activeIndex);
	};
	const runLoop = () => {
		if (isPaused) return;
		if (busy) return schedule();
		const nextIndex = (activeIndex + 1) % cards.length;
		const lineIndex = activeIndex % Math.max(cards.length - 1, 1);
		lineTl = gsap.timeline({ onComplete: () => {
			slideTo(nextIndex);
			schedule();
		} });
		timelines.forEach(({ lines }) => {
			const line = lines[lineIndex];
			if (!line) return;
			if (isHorizontal(line)) lineTl.to(line, {
				scaleX: 1,
				duration: LINE_DURATION,
				ease: "sine.inOut"
			}, 0);
			else lineTl.to(line, {
				scaleY: 1,
				duration: LINE_DURATION,
				ease: "sine.inOut"
			}, 0);
		});
	};
	timelines.forEach(({ steps }) => {
		steps.forEach((step, i) => {
			if (i >= cards.length) return;
			step.addEventListener("click", () => {
				if (i === activeIndex || busy) return;
				if (lineTl) lineTl.kill();
				if (loopDelay) loopDelay.kill();
				slideTo(i, i < activeIndex);
				schedule();
			});
		});
	});
	root.addEventListener("mouseenter", () => {
		isPaused = true;
		lineTl?.pause();
		loopDelay?.pause();
	});
	root.addEventListener("mouseleave", () => {
		isPaused = false;
		if (lineTl?.isActive()) lineTl.resume();
		else {
			if (loopDelay) loopDelay.kill();
			runLoop();
		}
	});
	schedule();
};
document.addEventListener("DOMContentLoaded", initProcessCardsV2);
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
			default:
				animationProps.y = -offset;
				break;
		}
		if (animationType === "to") gsap.to(elem, animationProps);
		else gsap.from(elem, animationProps);
	});
} };
document.addEventListener("DOMContentLoaded", () => {
	animation.init();
});
//#endregion
//#region src/js/animation/slider.js
document.addEventListener("DOMContentLoaded", () => {
	const roots = Array.from(document.querySelectorAll("[data-slider]"));
	if (!roots.length || typeof Swiper === "undefined") return;
	roots.forEach((root) => {
		const sliderTrack = root.querySelector("[data-slider-track]");
		const nextButtons = root.querySelectorAll("[data-slider-next]");
		const prevButtons = root.querySelectorAll("[data-slider-prev]");
		const currentEls = root.querySelectorAll("[data-slider-current]");
		if (!sliderTrack) return;
		const formatNumber = (index) => String(index + 1);
		const setCurrentLabels = (index) => {
			const text = formatNumber(index);
			currentEls.forEach((el) => {
				el.textContent = text;
			});
		};
		const prepareSlide = (slide) => {
			const image = slide.querySelector("[data-slice-image]");
			const tiles = Array.from(slide.querySelectorAll("[data-slice-tile]"));
			if (!image || !tiles.length) return;
			image.style.opacity = "0";
			const total = tiles.length;
			tiles.forEach((tile, i) => {
				tile.style.backgroundImage = `url("${image.getAttribute("src")}")`;
				tile.style.backgroundRepeat = "no-repeat";
				tile.style.backgroundSize = `${total * 100}% 100%`;
				tile.style.backgroundPosition = `${i / (total - 1) * 100}% 50%`;
				tile.style.opacity = "0";
				tile.style.transform = "translate3d(26px, 0, 0)";
				tile.style.willChange = "transform, opacity";
				tile.style.backfaceVisibility = "hidden";
			});
		};
		const showSlideVisual = (slide, instant = false) => {
			if (!slide) return;
			prepareSlide(slide);
			const tiles = Array.from(slide.querySelectorAll("[data-slice-tile]"));
			const content = slide.querySelector("[data-slide-content]");
			tiles.forEach((tile, i) => {
				const delay = instant ? 0 : (tiles.length - 1 - i) * .08;
				tile.style.transition = "none";
				tile.style.opacity = "0";
				tile.style.transform = "translate3d(26px, 0, 0)";
				tile.getBoundingClientRect();
				requestAnimationFrame(() => {
					tile.style.transition = `transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity 0.6s ease ${delay}s`;
					tile.style.opacity = "1";
					tile.style.transform = "translate3d(0, 0, 0)";
				});
			});
			if (content) {
				content.style.transition = "none";
				content.style.opacity = instant ? "1" : "0";
				content.style.transform = instant ? "translate3d(0, 0, 0)" : "translate3d(16px, 0, 0)";
				content.getBoundingClientRect();
				requestAnimationFrame(() => {
					content.style.transition = "opacity 0.55s ease 0.15s, transform 0.55s ease 0.15s";
					content.style.opacity = "1";
					content.style.transform = "translate3d(0, 0, 0)";
				});
			}
		};
		const swiper = new Swiper(sliderTrack, {
			slidesPerView: 1,
			speed: 650,
			direction: "horizontal",
			loop: true,
			autoplay: {
				delay: 4800,
				disableOnInteraction: false
			},
			observer: true,
			observeParents: true,
			on: {
				init(sw) {
					sw.slides.forEach((slide) => prepareSlide(slide));
					showSlideVisual(sw.slides[sw.activeIndex], true);
					setCurrentLabels(sw.realIndex);
					sw.update();
					requestAnimationFrame(() => sw.update());
				},
				slideChangeTransitionStart(sw) {
					showSlideVisual(sw.slides[sw.activeIndex]);
					setCurrentLabels(sw.realIndex);
				}
			}
		});
		function onNextClick(e) {
			if (!swiper || swiper.destroyed) return;
			e.preventDefault();
			e.stopPropagation();
			swiper.slideNext();
			if (swiper.autoplay) swiper.autoplay.start();
		}
		function onPrevClick(e) {
			if (!swiper || swiper.destroyed) return;
			e.preventDefault();
			e.stopPropagation();
			swiper.slidePrev();
			if (swiper.autoplay) swiper.autoplay.start();
		}
		nextButtons.forEach((btn) => btn.addEventListener("click", onNextClick, true));
		prevButtons.forEach((btn) => btn.addEventListener("click", onPrevClick, true));
		root.addEventListener("mouseenter", () => {
			if (swiper.autoplay) swiper.autoplay.pause();
		});
		root.addEventListener("mouseleave", () => {
			if (swiper.autoplay) swiper.autoplay.resume();
		});
	});
});
//#endregion
//#region src/js/animation/slightly-move-elements-on-mouse-move.js
var throttled = (delay, fn) => {
	let lastCall = 0;
	return function throttledHandler(...args) {
		const now = Date.now();
		if (now - lastCall < delay) return;
		lastCall = now;
		return fn(...args);
	};
};
var movableElementsWrapper = document.querySelector("[data-slightly-move-root]");
var movableElements = document.querySelectorAll("[data-slightly-move]");
movableElements.forEach((movableElement) => {
	movableElement._moveAxis = {
		x: Math.random() * 2 - 1,
		y: Math.random() * 2 - 1
	};
});
var mouseMoveHandler = (e) => {
	movableElements.forEach((movableElement) => {
		const shiftValue = Number(movableElement.dataset.shift || 0);
		const { x: axisX, y: axisY } = movableElement._moveAxis || {
			x: 1,
			y: 1
		};
		const moveX = e.clientX * shiftValue / 150 * axisX;
		const moveY = e.clientY * shiftValue / 150 * axisY;
		gsap.to(movableElement, {
			x: moveX,
			y: moveY,
			duration: .6
		});
	});
};
if (movableElementsWrapper && typeof gsap !== "undefined") movableElementsWrapper.onmousemove = throttled(200, mouseMoveHandler);
//#endregion
//#region src/js/animation/sticky-mini-prompt-form.js
var StickyPromptForm = () => {
	const promptForm = document.querySelector("[data-mini-prompt-form]");
	if (!promptForm) return;
	const promptFormWidth = promptForm.offsetWidth;
	gsap.set(promptForm, { width: `${promptFormWidth / 2}px` });
	gsap.to(promptForm, {
		y: "0%",
		width: `${promptFormWidth}px`,
		visibility: "visible",
		opacity: 1,
		ease: "power3.out",
		duration: 1.2,
		scrollTrigger: {
			trigger: promptForm,
			start: "top 65%",
			toggleActions: "play none none reverse"
		}
	});
};
document.addEventListener("DOMContentLoaded", () => {
	StickyPromptForm();
});
//#endregion
//#region src/js/animation/text-reveal.js
var LINE_CLASS = "text-reveal-line";
var DEFAULT_DELAY = .1;
var LINES_CONFIG = {
	duration: .8,
	stagger: .08
};
function canReveal() {
	return typeof gsap !== "undefined" && typeof SplitText !== "undefined";
}
function initTextReveal() {
	if (!canReveal()) return;
	gsap.registerPlugin(SplitText);
	if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
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
			if (!instant && typeof ScrollTrigger !== "undefined") tweenVars.scrollTrigger = {
				trigger: el,
				start,
				end,
				scrub: false
			};
			gsap.fromTo(lines, {
				yPercent: 110,
				opacity: 0
			}, tweenVars);
		});
	});
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initTextReveal);
else initTextReveal();
//#endregion
//#region src/js/animation/typeWriter.js
var typewriterAnimation = {
	init() {
		if (typeof gsap === "undefined") return;
		gsap.registerPlugin(ScrollTrigger);
		const container = document.querySelectorAll("[data-typewriter]");
		if (container.length === 0) return;
		container.forEach((container) => {
			const typewriterElement = container.querySelector("[data-typewriter-text]");
			if (!typewriterElement || !container) return;
			const duration = Number.parseFloat(container.dataset.duration) || 3;
			if ((typewriterElement.tagName === "INPUT" || typewriterElement.tagName === "TEXTAREA") && typewriterElement.placeholder) this.animatePlaceholder(typewriterElement, container, duration);
			else if (typeof SplitText !== "undefined") this.animateTextContent(typewriterElement, container, duration);
		});
	},
	animatePlaceholder(formElement, container, duration = 3) {
		const placeholderText = formElement.placeholder;
		formElement.placeholder = "";
		const tl = gsap.timeline({ scrollTrigger: {
			trigger: container,
			start: "top 80%",
			once: true
		} });
		const charDelay = duration / placeholderText.length;
		placeholderText.split("").forEach((char, index) => {
			tl.call(() => {
				formElement.placeholder += char;
			}, null, index * charDelay);
		});
	},
	animateTextContent(typewriterElement, container, duration = 3) {
		const split = new SplitText(typewriterElement, {
			type: "chars",
			tag: "span"
		});
		gsap.set(split.chars, { opacity: 0 });
		const tl = gsap.timeline({ scrollTrigger: {
			trigger: container,
			start: "top 80%",
			once: true
		} });
		const charDelay = duration / split.chars.length;
		split.chars.forEach((char, index) => {
			tl.to(char, {
				opacity: 1,
				duration: .01
			}, index * charDelay);
		});
	}
};
document.addEventListener("DOMContentLoaded", () => {
	typewriterAnimation.init();
});
//#endregion
