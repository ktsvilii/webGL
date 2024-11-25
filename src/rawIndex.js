import * as THREE from 'three';
import * as GaussianSplats3D from './gaussian-splats-3d.module.js'; // Import the GaussianSplats3D library
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderWidth = 1525;
const renderHeight = 700;

// Create container for rendering
const rootElement = document.createElement('div');
rootElement.style.position = 'relative';
document.body.appendChild(rootElement);

function updateSize() {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  rootElement.style.width = `${viewportWidth}px`;
  rootElement.style.height = `${viewportHeight}px`;
}

// Вызываем функцию при загрузке страницы
updateSize();

// Вызываем функцию при изменении размера окна
window.addEventListener('resize', updateSize);

// Renderer for the 3D scene
const renderer3D = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer3D.setSize(renderWidth, renderHeight);
renderer3D.setClearColor(0x000000, 1); // Black background
rootElement.appendChild(renderer3D.domElement);

// Create main scene for 3D objects
const threeScene = new THREE.Scene();

// Initialize Viewer
const viewer = new GaussianSplats3D.Viewer({
  selfDrivenMode: true,
  threeScene: threeScene,
  renderer: renderer3D,
  camera: new THREE.PerspectiveCamera(50, renderWidth / renderHeight, 0.01, 500),
  useBuiltInControls: true,
});

const camera = viewer.camera;
camera.position.set(-1, -4, 6);
camera.up.set(0, -1, 0).normalize();
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer3D.domElement);
controls.enableDamping = false;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2; // Restrict vertical angle
controls.minPolarAngle = Math.PI / 4;

const startPos = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endPos = new THREE.Vector3();
const endTarget = new THREE.Vector3();
let isAnimating = false;
let animationProgress = 1;

function animateCameraTo(position, target, duration = 1.5) {
  if (isAnimating) return;

  startPos.copy(camera.position);
  startTarget.copy(controls.target);
  endPos.set(...position);
  endTarget.set(...target);

  isAnimating = true;
  animationProgress = 0;

  const animate = () => {
    if (!isAnimating) return;

    animationProgress += 0.02 / duration;
    if (animationProgress >= 1) {
      animationProgress = 1;
      isAnimating = false;
    }

    camera.position.lerpVectors(startPos, endPos, animationProgress);
    controls.target.lerpVectors(startTarget, endTarget, animationProgress);
    controls.update();

    if (isAnimating) {
      requestAnimationFrame(animate);
    }
  };
  animate();
}

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

    animateCameraTo([closerPosition.x, closerPosition.y, closerPosition.z], target);
  };

  buttonContainer.appendChild(button);
}

// Predefined camera views
createButton(2, 'Front View', [9, 4, -15], [0, 0, 0]);
createButton(3, 'Top View', [8, -15, -14], [0, 0, 0]);
createButton(2.5, 'Side View', [5, -1, 3], [0, 0, 0]);

// Load external file into Viewer
viewer.addSplatScene('https://huggingface.co/spaces/Vision70s/GaussianVision70s/resolve/main/archViz_orig.ply', {
  progressiveLoad: true,
});

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
