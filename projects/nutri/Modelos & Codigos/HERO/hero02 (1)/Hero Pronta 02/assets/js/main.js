document.addEventListener("DOMContentLoaded", async () => {
  const sceneHost = document.getElementById("hero02-scene");

  if (!sceneHost || !window.Hero02Studio || !window.hero02SceneData) {
    return;
  }

  const sceneDataTag = document.createElement("script");
  sceneDataTag.id = "hero02-scene-data";
  sceneDataTag.type = "application/json";
  sceneDataTag.textContent = JSON.stringify(window.hero02SceneData);
  document.body.appendChild(sceneDataTag);

  try {
    await window.Hero02Studio.addScene({
      elementId: "hero02-scene",
      filePath: "hero02-scene-data",
      scale: 1,
      dpi: 1.5,
      fps: 60,
      lazyLoad: false,
    });
  } catch (error) {
    console.error("hero02 scene error", error);
  }
});
