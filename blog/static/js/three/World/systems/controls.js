import { OrbitControls } from "https://unpkg.com/three@0.143.0/examples/jsm/controls/OrbitControls.js";
import { PerspectiveCamera, Vector3 } from "three";

function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  // damping and auto rotation require
  // the controls to be updated each frame

  //   controls.autoRotate = true;
  //   controls.enableDamping = true;
  controls.target.set(1, 2, 3);

  controls.tick = () => controls.update();

  return controls;
}

export { createControls };
