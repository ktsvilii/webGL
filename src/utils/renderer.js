import * as THREE from 'three';

export function initRenderer(renderWidth = 1525, renderHeight= 700) {
    
    // Create container for rendering
const rootElement = document.createElement("div");
rootElement.style.position = "relative";
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
window.addEventListener("resize", updateSize);

// Renderer for the 3D scene
const renderer3D = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer3D.setSize(renderWidth, renderHeight);
renderer3D.setClearColor(0x000000, 1); // Black background
rootElement.appendChild(renderer3D.domElement);

return { renderer3D, rootElement };
}