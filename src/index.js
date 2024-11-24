import * as THREE from 'three';
import * as GaussianSplats3D from './gaussian-splats-3d.module.js'; // Import the GaussianSplats3D library
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderWidth = 800;
const renderHeight = 600;

// Создаем контейнер для рендера
const rootElement = document.createElement('div');
rootElement.style.position = 'relative';
rootElement.style.width = renderWidth + 'px';
rootElement.style.height = renderHeight + 'px';
document.body.appendChild(rootElement);

// Рендер для 3D сцены
const renderer3D = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer3D.setSize(renderWidth, renderHeight);
renderer3D.setClearColor(0x000000, 1); // Черный фон
rootElement.appendChild(renderer3D.domElement);

// Создаем основную сцену для 3D объектов
const threeScene = new THREE.Scene();

// Инициализация Viewer
const viewer = new GaussianSplats3D.Viewer({
  selfDrivenMode: true,
  threeScene: threeScene,
  renderer: renderer3D,
  camera: new THREE.PerspectiveCamera(50, renderWidth / renderHeight, 0.0001, 500),
  useBuiltInControls: true,
});

const camera = viewer.camera;
camera.position.set(-1, -4, 6);
camera.up.set(0, -1, 0).normalize();
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Настроим OrbitControls
const controls = new OrbitControls(camera, renderer3D.domElement);
controls.enableDamping = false;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;

// Ограничение углов наклона камеры
controls.maxPolarAngle = Math.PI / 2; // Ограничиваем максимально вертикальный угол вращения (90 градусов)
controls.minPolarAngle = Math.PI / 4; // Ограничиваем минимальный угол (чтобы камера не могла смотреть вниз)

const startPos = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endPos = new THREE.Vector3();
const endTarget = new THREE.Vector3();
let animationProgress = 1;

// Создаем первый куб - белый, меньшего размера, с регулируемой позицией
const smallCubeGeometry = new THREE.BoxGeometry(4.4, 1.8, 0.3); // Размеры 0.5 x 0.5 x 0.5
const whiteMaterial = new THREE.MeshBasicMaterial({ color: '#e1dcdb' }); // Белый цвет

const smallCube = new THREE.Mesh(smallCubeGeometry, whiteMaterial);
smallCube.position.set(-0.1, -0.75, -1.93); // Позиция: левее и немного выше
// threeScene.add(smallCube); // Добавляем только в threeScene

// Создаем второй куб - белый, большего размера, с регулируемой позицией
const largeCubeGeometry = new THREE.BoxGeometry(4.4, 0.3, 2.2); // Размеры 1.5 x 1.5 x 1.5
const largeCube = new THREE.Mesh(largeCubeGeometry, whiteMaterial);
largeCube.position.set(-0.1, 0, -0.76); // Позиция в центре
// threeScene.add(largeCube); // Добавляем только в threeScene

smallCube.renderOrder = -1; // Отрисовывать сначала
largeCube.renderOrder = -1; // Отрисовывать сначала

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

// Контейнер для кнопок
const buttonContainer = document.createElement('div');
buttonContainer.style.position = 'absolute';
buttonContainer.style.top = '10px';
buttonContainer.style.left = '10px';
document.body.appendChild(buttonContainer);

function createButton(label, position, target) {
  const button = document.createElement('button');
  button.innerText = label;
  button.classList.add('custom-button');
  button.onclick = () => animateCameraTo(position, target);
  buttonContainer.appendChild(button);
}

// Создаем кнопки для разных видов
createButton('Front View', [0, 0, 5], [0, 0, 0]);
createButton('Top View', [0, -5, 0], [0, 0, 0]);
createButton('Side View', [5, -1, 0], [0, 0, 0]);

// Загружаем внешний файл и добавляем его в Viewer
viewer
  .addSplatScene('https://huggingface.co/spaces/Vision70s/GaussianVision70s/resolve/main/archViz_orig.ply', {
    progressiveLoad: true,
  })
  .then(() => {
    animate();
  });

// Анимация сцены
let angle = 0; // Угол вращения камеры
const radius = 10; // Радиус вращения камеры

function animateCameraRotation() {
  angle += 0.001; // Увеличиваем угол на каждом кадре
  if (angle > Math.PI * 2) angle -= Math.PI * 2; // Ограничиваем угол до 360 градусов (2π)

  // Вычисляем новые координаты камеры
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);

  // Устанавливаем позицию камеры
  camera.position.set(x, camera.position.y, z);
  camera.lookAt(new THREE.Vector3(0, 0, 0)); // Смотрим в центр сцены

  controls.update();
}

function animate() {
  requestAnimationFrame(() => setTimeout(animate, 1000 / 30)); // Ограничение FPS до 30
  viewer.update();
  viewer.render();
  // animateCameraRotation(); // Добавляем вращение камеры вокруг сцены
}

animate();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const originalMaterials = new Map(); // Сохраняем оригинальные материалы объектов

// Добавьте обработчик кликов
renderer3D.domElement.addEventListener('click', event => {
  // Нормализуем координаты мыши
  mouse.x = (event.clientX / renderer3D.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer3D.domElement.clientHeight) * 2 + 1;

  // Определим, пересекает ли луч какой-либо объект
  raycaster.setFromCamera(mouse, camera);
  console.log(threeScene.children);
  const intersects = raycaster.intersectObjects(threeScene.children, true); // Проверяем все объекты в сцене

  // Возвращаем оригинальный цвет всем объектам
  threeScene.children.forEach(child => {
    if (originalMaterials.has(child)) {
      child.material = originalMaterials.get(child); // Восстановим оригинальный материал
    }
  });

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    // Запоминаем оригинальный материал объекта
    if (!originalMaterials.has(clickedObject)) {
      originalMaterials.set(clickedObject, clickedObject.material);
    }

    // Изменяем материал объекта, чтобы подсветить его
    clickedObject.material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Красный цвет для подсветки

    // Получаем позицию объекта
    const targetPosition = clickedObject.position;

    // Задаем целевую позицию камеры (немного отдаляемся от объекта)
    const newCameraPosition = targetPosition.clone().add(new THREE.Vector3(0, 2, 5));

    // Анимируем камеру к объекту
    animateCameraTo(
      [newCameraPosition.x, newCameraPosition.y, newCameraPosition.z],
      [targetPosition.x, targetPosition.y, targetPosition.z],
    );
  }
});
