const button = {
  init() {
    const buttonWrappers = document.querySelectorAll('.button');

    buttonWrappers.forEach((buttonWrapper) => {
      const iconWrapper = buttonWrapper.querySelector('.button-icon');
      const buttonText = buttonWrapper.querySelector('.button-text');

      if (!iconWrapper || !buttonText) return;

      const wrapperRect = buttonWrapper.getBoundingClientRect();
      const iconRect = iconWrapper.getBoundingClientRect();
      const textRect = buttonText.getBoundingClientRect();

      const leftPadding = Number.parseFloat(getComputedStyle(buttonWrapper).paddingLeft) || 0;
      const rightPadding = Number.parseFloat(getComputedStyle(buttonWrapper).paddingRight) || 0;

      const iconLeftRelative = iconRect.left - wrapperRect.left;
      const iconTranslateXDistance =
        wrapperRect.width - rightPadding - iconWrapper.offsetWidth - iconLeftRelative;

      const textLeftRelative = textRect.left - wrapperRect.left;
      const textTranslateXDistance = Math.max(0, textLeftRelative - leftPadding);

      buttonWrapper.addEventListener('mouseenter', () => {
        iconWrapper.style.transform = `translateX(${iconTranslateXDistance}px)`;
        buttonText.style.transform = `translateX(-${textTranslateXDistance}px)`;
      });

      buttonWrapper.addEventListener('mouseleave', () => {
        iconWrapper.style.transform = 'translateX(0)';
        buttonText.style.transform = 'translateX(0)';
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  button.init();
});
