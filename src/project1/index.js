import * as THREE from 'three';
import { initRenderer } from '../utils/renderer.js';
import { initScene } from '../utils/scene.js';
import { initViewer } from '../utils/viewer.js';
import { animateCameraTo, initControls } from '../utils/controls.js';

const renderWidth = 1525;
const renderHeight = 700;

const { renderer3D, rootElement } = initRenderer();

// Create main scene for 3D objects
const { threeScene } = initScene();

const { viewer, camera } = initViewer(
  'https://huggingface.co/spaces/Vision70s/GaussianVision70s/resolve/main/archViz_orig.ply',
  renderer3D,
  threeScene,
  renderHeight,
  renderWidth,
);

const { controls } = initControls(camera, renderer3D);

// Button container
const buttonContainer = document.createElement('div');
buttonContainer.style.position = 'absolute';
buttonContainer.style.top = '10px';
buttonContainer.style.left = '10px';
document.body.appendChild(buttonContainer);

function createButton(reducedDistance, label, position, target) {
  const button = document.createElement('button');
  button.innerText = label;
  button.classList.add('custom-button');

  button.onclick = () => {
    const targetVector = new THREE.Vector3(...target);
    const positionVector = new THREE.Vector3(...position);
    const direction = positionVector.clone().sub(targetVector).normalize();

    const closerPosition = targetVector.clone().add(direction.multiplyScalar(reducedDistance));
    animateCameraTo(camera, controls, [closerPosition.x, closerPosition.y, closerPosition.z], target);
  };

  buttonContainer.appendChild(button);
}

const boundingBox = new THREE.Box3(
  new THREE.Vector3(-10, -10, -10), // Minimum x, y, z
  new THREE.Vector3(10, 10, 10), // Maximum x, y, z
);

controls.addEventListener('change', () => {
  const pos = camera.position;

  pos.x = THREE.MathUtils.clamp(pos.x, boundingBox.min.x, boundingBox.max.x);
  pos.y = THREE.MathUtils.clamp(pos.y, boundingBox.min.y, boundingBox.max.y);
  pos.z = THREE.MathUtils.clamp(pos.z, boundingBox.min.z, boundingBox.max.z);
});

// Predefined camera views
createButton(2, 'Front View', [9, 4, -15], [0, 0, 0]);
createButton(3, 'Top View', [8, -15, -14], [0, 0, 0]);
createButton(2.5, 'Side View', [5, -1, 3.5], [0, 0, 0]);

const rotationSpeed = 0.0001;

function animate() {
  requestAnimationFrame(() => setTimeout(animate, 1000 / 30)); // Limit FPS to 30

  // Use controls for smooth rotation
  controls.autoRotate = true; // Enable automatic rotation
  controls.autoRotateSpeed = 1.0; // Adjust speed as needed
  controls.update();

  viewer.update();
  viewer.render();
}

animate();
