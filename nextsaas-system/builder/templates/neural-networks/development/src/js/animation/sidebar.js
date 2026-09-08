/* =========================
 Sidebar menu animation js
=========================== */
const sidebarAnimation = {
  elements: null,

  init() {
    try {
      this.cacheElements();
      this.bindEvents();
    } catch (error) {
      console.error('Sidebar animation initialization failed:', error);
    }
  },

  cacheElements() {
    this.elements = {
      navHamburger: document.querySelector('.nav-hamburger'),
      navHamburgerClose: document.querySelector('.nav-hamburger-close'),
      sidebar: document.querySelector('.sidebar'),
    };
  },

  bindEvents() {
    const { navHamburger, navHamburgerClose, sidebar } = this.elements;

    if (navHamburger && sidebar) {
      navHamburger.addEventListener('click', () => {
        sidebar.classList.add('show-sidebar');
        document.body.classList.add('overflow-hidden');
      });
    }

    if (navHamburgerClose && sidebar) {
      navHamburgerClose.addEventListener('click', () => {
        sidebar.classList.remove('show-sidebar');
        document.body.classList.remove('overflow-hidden');
      });
    }
  },
};

if (typeof window !== 'undefined') {
  sidebarAnimation.init();
}
