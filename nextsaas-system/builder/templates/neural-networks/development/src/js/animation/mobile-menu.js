class MobileMenuAccordion {
  constructor(options = {}) {
    this.defaultOpenMenu = options.defaultOpenMenu || 'company';
    this.toggleButtons = null;
    this.submenus = null;
    this.arrows = null;
    this.sidebar = null;
    this.onSubmenuLinkClick = this.onSubmenuLinkClick.bind(this);
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindEvents());
    } else {
      this.bindEvents();
    }
  }

  clearToggleSelected() {
    if (!this.toggleButtons) return;
    this.toggleButtons.forEach((btn) => btn.removeAttribute('data-selected'));
  }

  setToggleSelected(button) {
    this.clearToggleSelected();
    if (button) {
      button.setAttribute('data-selected', 'true');
    }
  }

  clearLinkSelected() {
    if (!this.sidebar) return;
    this.sidebar.querySelectorAll('.mobile-submenu a').forEach((a) => a.removeAttribute('data-selected'));
  }

  syncLinkSelectedFromPath() {
    if (!this.sidebar) return;
    this.clearLinkSelected();
    const segments = window.location.pathname.split('/').filter(Boolean);
    const current = segments.length ? segments[segments.length - 1] : 'index.html';

    this.sidebar.querySelectorAll('.mobile-submenu a').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const file = href.replace(/^\.\//, '').split(/[?#]/)[0];
      if (file === current) {
        a.setAttribute('data-selected', 'true');
      }
    });
  }

  onSubmenuLinkClick(e) {
    const link = e.target.closest?.('.mobile-submenu a');
    if (!link || !this.sidebar?.contains(link)) {
      return;
    }
    this.clearLinkSelected();
    link.setAttribute('data-selected', 'true');
  }

  bindEvents() {
    this.toggleButtons = document.querySelectorAll('.mobile-menu-toggle[data-menu]');

    if (this.toggleButtons.length === 0) {
      return;
    }

    this.sidebar = this.toggleButtons[0].closest('aside.sidebar');
    if (this.sidebar && !this.sidebar.dataset.submenuLinkDelegate) {
      this.sidebar.dataset.submenuLinkDelegate = 'true';
      this.sidebar.addEventListener('click', this.onSubmenuLinkClick);
    }

    this.submenus = document.querySelectorAll('.mobile-submenu[data-submenu]');
    this.arrows = document.querySelectorAll('.mobile-menu-toggle .menu-arrow');

    this.setDefaultState();

    this.toggleButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const menuId = button.getAttribute('data-menu');
        this.toggleMenu(menuId);
      });
    });
  }

  setDefaultState() {
    this.clearToggleSelected();

    this.submenus.forEach((submenu) => {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
    });

    this.arrows.forEach((arrow) => {
      arrow.classList.remove('rotate-90');
    });

    if (this.defaultOpenMenu) {
      const defaultSubmenu = document.querySelector(
        `.mobile-submenu[data-submenu="${this.defaultOpenMenu}"]`
      );
      const defaultButton = document.querySelector(
        `.mobile-menu-toggle[data-menu="${this.defaultOpenMenu}"]`
      );
      const defaultArrow = defaultButton?.querySelector('.menu-arrow');

      if (defaultSubmenu) {
        defaultSubmenu.classList.remove('hidden');
        defaultSubmenu.classList.add('block');
      }

      if (defaultArrow) {
        defaultArrow.classList.add('rotate-90');
      }

      if (defaultButton) {
        this.setToggleSelected(defaultButton);
      }
    }

    this.syncLinkSelectedFromPath();
  }

  toggleMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button?.querySelector('.menu-arrow');

    if (!submenu || !button) {
      return;
    }

    const isCurrentlyOpen =
      submenu.classList.contains('block') && !submenu.classList.contains('hidden');

    this.closeAllMenus();

    if (isCurrentlyOpen) {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
      if (arrow) {
        arrow.classList.remove('rotate-90');
      }
      this.clearToggleSelected();
    } else {
      submenu.classList.remove('hidden');
      submenu.classList.add('block');
      if (arrow) {
        arrow.classList.add('rotate-90');
      }
      this.setToggleSelected(button);
    }
  }

  closeAllMenus() {
    this.submenus.forEach((submenu) => {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
    });

    this.arrows.forEach((arrow) => {
      arrow.classList.remove('rotate-90');
    });

    this.clearToggleSelected();
  }

  openMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button?.querySelector('.menu-arrow');

    if (submenu && button) {
      this.closeAllMenus();

      submenu.classList.remove('hidden');
      submenu.classList.add('block');
      if (arrow) {
        arrow.classList.add('rotate-90');
      }
      this.setToggleSelected(button);
    }
  }

  closeMenu(menuId) {
    const submenu = document.querySelector(`.mobile-submenu[data-submenu="${menuId}"]`);
    const button = document.querySelector(`.mobile-menu-toggle[data-menu="${menuId}"]`);
    const arrow = button?.querySelector('.menu-arrow');

    if (submenu && button) {
      submenu.classList.add('hidden');
      submenu.classList.remove('block');
      if (arrow) {
        arrow.classList.remove('rotate-90');
      }
      button.removeAttribute('data-selected');
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

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuExists = document.querySelector('.mobile-menu-toggle[data-menu]');

  if (mobileMenuExists) {
    window.mobileMenuAccordion = new MobileMenuAccordion({
      defaultOpenMenu: 'company',
    });
  }
});
