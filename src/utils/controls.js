import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';

export function initControls(camera, renderer) {
  // Настройка OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = false;

  // Ограничение вращения камеры
  controls.maxPolarAngle = Math.PI / 2 - 0.1; // Почти горизонтально
  controls.minPolarAngle = Math.PI / 4; // Не смотрим слишком вниз

  // Ограничение приближения и удаления
  controls.minDistance = 1; // Минимальная дистанция
  controls.maxDistance = 5; // Максимальная дистанция

  const mainObjectPosition = new THREE.Vector3(0, 0, 0); // Позиция основного объекта

  // Проверяем, не вышла ли камера за пределы
  controls.addEventListener('change', () => {
    const currentDistance = camera.position.distanceTo(mainObjectPosition);

    // Если камера выходит за пределы, возвращаем её к объекту
    if (currentDistance > controls.maxDistance) {
      returnCameraToMainObject(camera, controls, mainObjectPosition, controls.maxDistance);
    }
  });

  return { controls };
}

let isAnimating = false;

// Возвращает камеру к основному объекту
function returnCameraToMainObject(camera, controls, mainObjectPosition, maxDistance, duration = 1) {
  if (isAnimating) return; // Если уже идёт анимация, пропускаем

  const startPosition = camera.position.clone();
  const targetPosition = mainObjectPosition.clone().add(
    camera.position.clone().sub(mainObjectPosition).normalize().multiplyScalar(maxDistance)
  );

  isAnimating = true; // Устанавливаем флаг анимации
  let animationProgress = 0;

  const animate = () => {
    if (!isAnimating) return; // Если анимация закончена, выходим

    animationProgress += 0.02 / duration; // Увеличиваем прогресс
    if (animationProgress >= 1) {
      animationProgress = 1; // Завершаем анимацию
      isAnimating = false; // Сбрасываем флаг
    }

    // Линейная интерполяция для плавного перемещения камеры
    camera.position.lerpVectors(startPosition, targetPosition, animationProgress);
    controls.target.lerpVectors(controls.target, mainObjectPosition, animationProgress);
    controls.update();

    if (isAnimating) {
      requestAnimationFrame(animate); // Продолжаем анимацию
    }
  };

  animate();
}

export function animateCameraTo(camera, controls, position, target, duration = 1.5) {
  if (isAnimating) return;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = new THREE.Vector3(...position);
  const endTarget = new THREE.Vector3(...target);

  isAnimating = true;
  let animationProgress = 0;

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