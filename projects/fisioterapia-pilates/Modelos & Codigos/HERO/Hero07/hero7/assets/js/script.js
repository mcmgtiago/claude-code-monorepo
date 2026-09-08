document.addEventListener("DOMContentLoaded", () => {
  const src = "assets/videos/hero1-scrub.mp4";
  const video = document.querySelector("#hero-video");
  const wrapper = document.querySelector(".hero__video-wrapper");
  const heroContent = document.querySelector(".hero__content");
  const projectsSection = document.querySelector(".projects-section");
  const projectsInner = document.querySelector(".projects-section__inner");
  const loading = document.querySelector(".hero__loading");
  const progressText = document.querySelector("#hero-progress");

  if (!video || !wrapper) {
    return;
  }

  let duration = 0;
  let targetTime = 0;
  let currentTime = 0;
  let scrubFrame = 0;
  let hasTransitionTimeline = false;

  const updateProgress = (progress) => {
    if (!progressText) {
      return;
    }

    progressText.textContent = String(Math.min(100, Math.max(0, Math.round(progress))));
  };

  const getBufferedEnd = () => {
    if (!video.buffered.length) {
      return 0;
    }

    return video.buffered.end(video.buffered.length - 1);
  };

  const updateBufferProgress = () => {
    if (!duration) {
      duration = video.duration || 0;
    }

    if (!duration) {
      return;
    }

    updateProgress((getBufferedEnd() / duration) * 100);
  };

  const hideLoading = () => {
    updateProgress(100);
    loading?.classList.add("is-hidden");
  };

  const animateScrub = () => {
    currentTime += (targetTime - currentTime) * .08;
    currentTime = Math.min(duration, Math.max(0, currentTime));

    // Interpolação independente da taxa de frames, para manter a mesma fluidez.
    if (!video.seeking && Math.abs(video.currentTime - currentTime) > .01) {
      video.currentTime = currentTime;
    }

    scrubFrame = requestAnimationFrame(animateScrub);
  };

  const setupScrollSeek = () => {
    duration = video.duration || duration;

    if (!duration || !window.gsap || !window.ScrollTrigger) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    video.pause();
    currentTime = video.currentTime || 0;
    targetTime = currentTime;

    if (!scrubFrame) {
      scrubFrame = requestAnimationFrame(animateScrub);
    }

    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        targetTime = Math.min(duration, Math.max(0, self.progress * duration));
      },
    });

    if (heroContent && projectsSection && !hasTransitionTimeline) {
      hasTransitionTimeline = true;
      const isMobile = window.matchMedia("(max-width: 640px)").matches;

      gsap.set(projectsSection, {
        autoAlpha: 0,
        y: 58,
      });
      gsap.set(".projects-section h2, .project-card", {
        autoAlpha: 0,
        y: 34,
        filter: "blur(0px)",
      });
      gsap.set(".project-card", {
        y: 86,
      });

      const transitionTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: isMobile ? "top top" : "18% top",
          end: isMobile ? "+=260%" : "85% top",
          scrub: isMobile ? .55 : 1.15,
          invalidateOnRefresh: true,
        },
      });

      transitionTimeline
        .to(heroContent, {
          autoAlpha: 0,
          y: -22,
          duration: .55,
          ease: "none",
        }, 0)
        .to(projectsSection, {
          autoAlpha: 1,
          y: 0,
          duration: .75,
          ease: "none",
        }, .62)
        .to(".projects-section h2", {
          autoAlpha: 1,
          y: 0,
          duration: .48,
          ease: "none",
        }, .82)
        .to(".project-card", {
          autoAlpha: 1,
          y: 0,
          duration: .72,
          stagger: .24,
          ease: "none",
        }, 1);

      if (isMobile && projectsInner) {
        transitionTimeline.to(projectsInner, {
          y: () => {
            const visibleHeight = window.innerHeight - 68;
            const overflow = Math.max(0, projectsInner.scrollHeight - visibleHeight);

            return -overflow;
          },
          duration: 1.15,
          ease: "none",
        }, ">+=.12");
      } else {
        transitionTimeline
          .to(".project-card", {
            autoAlpha: 0,
            y: -24,
            filter: "blur(14px)",
            duration: .58,
            stagger: .16,
            ease: "none",
          }, ">+=.3")
          .to(".projects-section h2", {
            autoAlpha: 0,
            y: -18,
            filter: "blur(10px)",
            duration: .42,
            ease: "none",
          }, ">-=.2")
          .to(projectsSection, {
            autoAlpha: 0,
            y: -34,
            duration: .5,
            ease: "none",
          }, ">-=.12");
      }
    }
  };

  video.addEventListener("loadedmetadata", setupScrollSeek, { once: true });
  video.addEventListener("progress", updateBufferProgress);
  video.addEventListener("canplay", hideLoading, { once: true });

  if (src.endsWith(".m3u8") && window.Hls?.isSupported()) {
    const hls = new Hls({
      maxBufferLength: 120,
      maxMaxBufferLength: 600,
      maxBufferSize: 200 * 1024 * 1024,
      startPosition: 0,
      capLevelToPlayerSize: false,
      startLevel: -1,
      autoStartLoad: true,
    });

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const maxLevel = hls.levels.length - 1;

      hls.currentLevel = maxLevel;
      hls.startLevel = maxLevel;
    });

    hls.on(Hls.Events.FRAG_BUFFERED, updateBufferProgress);
  } else {
    video.src = src;
  }

  video.load();
});
