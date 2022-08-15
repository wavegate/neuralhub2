import { PerspectiveCamera, Vector3 } from "three";

function createCamera() {
  const camera = new PerspectiveCamera(
    30, // fov = Field Of View
    1, // aspect ratio (dummy value)
    0.1, // near clipping plane
    100 // far clipping plane
  );

  // move the camera back so we can view the scene
  camera.position.set(0, 0.7, 3.5);

  return camera;
}

export { createCamera };
