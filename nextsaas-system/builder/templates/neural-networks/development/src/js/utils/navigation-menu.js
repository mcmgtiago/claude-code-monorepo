/**
 * Navigation Menu Handler
 */

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
    const navItems = document.querySelectorAll('.nav-item[data-menu]');

    navItems.forEach((item) => {
      const menuId = item.getAttribute('data-menu');
      const menu = document.getElementById(menuId);

      if (!menu) return;

      item.addEventListener('mouseenter', () => {
        this.showMenu(item, menu);
      });

      item.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !menu.contains(relatedTarget)) {
          this.scheduleHideMenu();
        }
      });

      menu.addEventListener('mouseenter', () => {
        this.cancelHideMenu();
        this.showMenu(item, menu);
      });

      menu.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !item.contains(relatedTarget)) {
          this.scheduleHideMenu();
        }
      });
    });

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target && typeof target.closest === 'function') {
        if (!target.closest('.nav-item') && !target.closest('.mega-menu, .dropdown-menu')) {
          this.hideAllMenus();
        }
      }
    });

    const header = document.querySelector('header');
    if (header) {
      header.addEventListener('mouseenter', () => {
        this.isMouseInHeader = true;
        this.cancelHideMenu();
      });

      header.addEventListener('mouseleave', (e) => {
        this.isMouseInHeader = false;
        const relatedTarget = e.relatedTarget;
        const isMovingToMenu =
          relatedTarget &&
          (relatedTarget.closest('.mega-menu') || relatedTarget.closest('.dropdown-menu'));

        if (!isMovingToMenu) {
          this.scheduleHideMenu();
        }
      });
    }

    document.addEventListener(
      'mouseenter',
      (e) => {
        const target = e.target;
        if (target && typeof target.closest === 'function') {
          if (
            target.closest('.mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge')
          ) {
            this.isMouseInMenu = true;
            this.cancelHideMenu();
          }
        }
      },
      true
    );

    document.addEventListener(
      'mouseleave',
      (e) => {
        const target = e.target;
        if (target && typeof target.closest === 'function') {
          if (
            target.closest('.mega-menu, .dropdown-menu, .mega-menu-bridge, .dropdown-menu-bridge')
          ) {
            this.isMouseInMenu = false;
            const relatedTarget = e.relatedTarget;
            const isMovingToHeader =
              relatedTarget &&
              typeof relatedTarget.closest === 'function' &&
              (relatedTarget.closest('header') ||
                relatedTarget.closest('.mega-menu') ||
                relatedTarget.closest('.dropdown-menu') ||
                relatedTarget.closest('.mega-menu-bridge') ||
                relatedTarget.closest('.dropdown-menu-bridge'));

            if (!isMovingToHeader) {
              this.scheduleHideMenu();
            }
          }
        }
      },
      true
    );

    document.addEventListener('mouseleave', () => {
      this.hideAllMenus();
    });
  }

  showMenu(navItem, menu) {
    this.cancelHideMenu();

    this.hideAllMenus();

    this.activeMenu = menu;
    navItem.classList.add('active');
    menu.classList.add('active');

    navItem.classList.add('menu-active');

    const bridge = navItem.querySelector('.mega-menu-bridge, .dropdown-menu-bridge');
    if (bridge) {
      bridge.style.opacity = '1';
      bridge.style.pointerEvents = 'auto';
    }

    this.dispatchMenuEvent('menu:show', { navItem, menu });
  }

  hideMenu(menu) {
    if (!menu) return;

    const navItem = document.querySelector(`[data-menu="${menu.id}"]`);

    menu.classList.remove('active');
    if (navItem) {
      navItem.classList.remove('active', 'menu-active');

      const bridge = navItem.querySelector('.mega-menu-bridge, .dropdown-menu-bridge');
      if (bridge) {
        bridge.style.opacity = '0';
        bridge.style.pointerEvents = 'none';
      }
    }

    if (this.activeMenu === menu) {
      this.activeMenu = null;
    }

    this.dispatchMenuEvent('menu:hide', { navItem, menu });
  }

  hideAllMenus() {
    const allMenus = document.querySelectorAll('.mega-menu, .dropdown-menu');
    const allNavItems = document.querySelectorAll('.nav-item[data-menu]');

    allMenus.forEach((menu) => this.hideMenu(menu));
    allNavItems.forEach((item) => {
      item.classList.remove('active', 'menu-active');
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
    if (menu && menu.classList.contains('active')) {
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
      hasTimeout: !!this.menuTimeout,
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.navigationMenu = new NavigationMenu();
});
