// Footer Year text content function
const updateFooterYear = () => {
  const footerYearElements = document.querySelectorAll('[data-footer-year]');

  if (footerYearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    footerYearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  }
};

if (globalThis.window !== undefined) {
  updateFooterYear();
}
