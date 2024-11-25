import * as THREE from 'three';
import * as GaussianSplats3D from './gaussian-splats-3d.module.js'; // Import the GaussianSplats3D library
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderWidth = 800;
const renderHeight = 800;

// Create container for rendering
const rootElement = document.createElement('div');
rootElement.style.position = 'relative';
rootElement.style.width = renderWidth + 'px';
rootElement.style.height = renderHeight + 'px';
document.body.appendChild(rootElement);

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

function createButton(label, position, target) {
  const button = document.createElement('button');
  button.innerText = label;
  button.classList.add('custom-button');

  button.onclick = () => {
    const targetVector = new THREE.Vector3(...target);
    const positionVector = new THREE.Vector3(...position);
    const direction = positionVector.clone().sub(targetVector).normalize();

    const reducedDistance = 2.5;

    const closerPosition = targetVector.clone().add(direction.multiplyScalar(reducedDistance));

    animateCameraTo([closerPosition.x, closerPosition.y, closerPosition.z], target);
  };

  buttonContainer.appendChild(button);
}

// Predefined camera views
createButton('Front View', [9, -1, -14], [0, 0, 0]);
createButton('Top View', [8, -15, -14], [0, 0, 0]);
createButton('Side View', [5, -1, 0], [0, 0, 0]);

// Load external file into Viewer
viewer.addSplatScene('https://huggingface.co/spaces/Vision70s/GaussianVision70s/resolve/main/archViz_orig.ply', {
  progressiveLoad: true,
});

// Scene animation loop
function animate() {
  requestAnimationFrame(() => setTimeout(animate, 1000 / 30)); // Limit FPS to 30
  viewer.update();
  viewer.render();
  // animateCameraRotation(); // Добавляем вращение камеры вокруг сцены
}

animate();
