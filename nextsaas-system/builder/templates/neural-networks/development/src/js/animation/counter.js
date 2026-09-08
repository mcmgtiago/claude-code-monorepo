// Initialize number animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Create Intersection Observer for number animations
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
            heightSpace: dataSpace,
          } = element.dataset;
          const number = Number.parseInt(numberStr, 10);
          const speed = Number.parseInt(speedStr, 10) || 800;
          const interval = Number.parseInt(intervalStr, 10) || 150;
          const rooms = Number.parseInt(roomsStr, 10) || 2;

          // Only animate if not already animated
          if (!element.classList.contains('animated')) {
            element.classList.add('animated');

            NumberAnimation(element, {
              number: number,
              speed: speed,
              interval: interval,
              rooms: rooms,
              dataSpace: dataSpace, // Pass the data-space attribute
              fontStyle: {
                'font-size': 'inherit',
                color: 'inherit',
              },
            });
          }
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Observe number elements
  const numberElements = document.querySelectorAll('[data-counter]');
  numberElements.forEach((element) => {
    numberObserver.observe(element);
  });
});
