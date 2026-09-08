document.addEventListener("DOMContentLoaded", async () => {
  const sceneHost = document.getElementById("hero01-scene");

  if (!sceneHost || !window.Hero01Studio || !window.hero01SceneData) {
    return;
  }

  const sceneDataTag = document.createElement("script");
  sceneDataTag.id = "hero01-scene-data";
  sceneDataTag.type = "application/json";
  sceneDataTag.textContent = JSON.stringify(window.hero01SceneData);
  document.body.appendChild(sceneDataTag);

  try {
    await window.Hero01Studio.addScene({
      elementId: "hero01-scene",
      filePath: "hero01-scene-data",
      scale: 1,
      dpi: 1.5,
      fps: 60,
      lazyLoad: false,
    });
  } catch (error) {
    console.error("hero01 scene error", error);
  }
});
