import * as THREE from 'three';
import { initRenderer } from '../utils/renderer.js';
import { initScene } from '../utils/scene.js';
import { initViewer } from '../utils/viewer.js';
import { animateCameraTo, initControls } from '../utils/controls.js';
import { setupResizeObserver, setupWindowResizeHandlers } from '../utils/resizing.js';

// Constants for initial dimensions
let renderWidth = window.innerWidth;
let renderHeight = window.innerHeight;

// Initialize Renderer
const { renderer3D } = initRenderer(renderWidth, renderHeight);
const canvas = renderer3D.domElement;

// Setup Resize Observer for Dynamic Canvas Resizing
setupResizeObserver(canvas, renderer3D);

// Initialize Main Scene
const { threeScene } = initScene();

// Initialize Viewer and Controls
const { viewer, camera } = initViewer(
  'https://huggingface.co/spaces/Vision70s/GaussianVision70s/resolve/main/13millOrigCompressed.ply',
  renderer3D,
  threeScene,
  renderHeight,
  renderWidth,
);
const { controls } = initControls(camera, renderer3D);

// Button Creation Function
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

// Create Button Container
const buttonContainer = document.createElement('div');
buttonContainer.style.position = 'absolute';
buttonContainer.style.top = '10px';
buttonContainer.style.left = '10px';
document.body.appendChild(buttonContainer);

// Bounding Box for Camera Limits
const boundingBox = new THREE.Box3(new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10));

controls.addEventListener('change', () => {
  const pos = camera.position;

  pos.x = THREE.MathUtils.clamp(pos.x, boundingBox.min.x, boundingBox.max.x);
  pos.y = THREE.MathUtils.clamp(pos.y, boundingBox.min.y, boundingBox.max.y);
  pos.z = THREE.MathUtils.clamp(pos.z, boundingBox.min.z, boundingBox.max.z);
});

// Create Predefined Camera Views
createButton(2, 'Front View', [9, 4, -15], [0, 0, 0]);
createButton(3, 'Top View', [8, -15, -14], [0, 0, 0]);
createButton(2.5, 'Side View', [5, -1, 3.5], [0, 0, 0]);

// Setup Window Resize Handlers
setupWindowResizeHandlers(renderer3D, camera);

// Animation Loop
function animate() {
  requestAnimationFrame(() => setTimeout(animate, 1000 / 30)); // Limit FPS to 30

  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  controls.update();

  viewer.update();
  viewer.render();
}

animate();
