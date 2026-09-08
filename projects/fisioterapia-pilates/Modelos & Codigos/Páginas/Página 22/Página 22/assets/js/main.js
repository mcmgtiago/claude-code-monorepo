document.addEventListener("DOMContentLoaded", () => {
  const animatedNodes = document.querySelectorAll(".animate-on-load");
  const scrollAnimatedNodes = document.querySelectorAll(".animate-on-scroll");
  const visualTopicCard = document.querySelector(".future-card-visual");
  const protocolTitle = document.querySelector(".protocol-copy h2");
  const protocolText = document.querySelector(".protocol-copy p");
  const protocolLink = document.querySelector(".protocol-link");

  if (visualTopicCard) {
    visualTopicCard.classList.remove("future-card-visual");
    visualTopicCard.classList.add("future-card-copy");
    visualTopicCard.innerHTML = `
      <div class="future-card-dot" aria-hidden="true"></div>
      <h3>Cada historia merece ser ouvida com respeito</h3>
      <p>Um espaco terapeutico seguro para acolher sua experiencia, nomear sentimentos e atravessar processos com mais clareza e suporte.</p>
    `;
  }

  if (protocolTitle) {
    protocolTitle.textContent = "Quem sou eu";
  }

  if (protocolText) {
    protocolText.textContent = "Sou psicologa clinica e conduzo meu trabalho a partir de uma escuta atenta, etica e profundamente humana. Minha proposta e oferecer um espaco seguro para que cada pessoa possa compreender a propria historia, elaborar seus conflitos e construir novos caminhos com mais clareza e autonomia.";
  }

  if (protocolLink) {
    protocolLink.remove();
  }

  animatedNodes.forEach((node) => {
    const delay = Number(node.getAttribute("data-delay") || 0);

    window.setTimeout(() => {
      node.classList.add("is-visible");
    }, delay);
  });

  if (!scrollAnimatedNodes.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const node = entry.target;
        const delay = Number(node.getAttribute("data-scroll-delay") || 0);

        window.setTimeout(() => {
          node.classList.add("is-visible");
        }, delay);

        observer.unobserve(node);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  scrollAnimatedNodes.forEach((node) => {
    observer.observe(node);
  });
});
