import { GLTFLoader } from "https://unpkg.com/three@0.143.0/examples/jsm/loaders/GLTFLoader.js";

import { setupModel } from "./setupModel.js";

async function loadModel() {
  const loader = new GLTFLoader();

  const [modelData] = await Promise.all([
    loader.loadAsync("/static/js/three/assets/models/scene.glb"),
  ]);

  const model = setupModel(modelData);
  model.position.set(0, 0, 0);

  return {
    model,
  };
}

export { loadModel };
