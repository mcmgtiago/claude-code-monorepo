const avatar = {
  init() {
    const avatars = document.querySelectorAll('[data-opai-avatar]');
    avatars.forEach((el) => {
      const delay = el.getAttribute('data-avatar-delay')
        ? parseFloat(el.getAttribute('data-avatar-delay'))
        : 0;
      const direction = el.getAttribute('data-avatar-direction')
        ? el.getAttribute('data-avatar-direction')
        : 'left';
      const scale = el.getAttribute('data-avatar-scale')
        ? parseFloat(el.getAttribute('data-avatar-scale'))
        : 0;
      const offset = el.getAttribute('data-avatar-offset')
        ? parseFloat(el.getAttribute('data-avatar-offset'))
        : 0;

      const animationProps = {
        duration: 1.5,
        opacity: 0,
        scale: scale,
        filter: 'blur(5px)',
        delay,
        ease: 'elastic.out(1, 0.7)',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          end: 'bottom 20%',
        },
      };

      // Set animation direction  data-avatar-direction
      switch (direction) {
        case 'left':
          animationProps.x = -offset;
          break;
        case 'right':
          animationProps.x = offset;
          break;
        case 'down':
          animationProps.y = offset;
          break;
        case 'up':
        default:
          animationProps.y = -offset;
          break;
      }

      gsap.from(el, animationProps);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  avatar.init();
});
