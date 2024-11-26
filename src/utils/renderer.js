import * as THREE from 'three';

export function initRenderer(renderWidth, renderHeight) {
  const rootElement = document.createElement('div');
  rootElement.style.position = 'relative';
  document.body.appendChild(rootElement);

  const renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer3D.setSize(renderWidth, renderHeight);
  renderer3D.setPixelRatio(window.devicePixelRatio); // Ensure crisp rendering
  renderer3D.setClearColor(0x000000, 1); // Black background
  rootElement.appendChild(renderer3D.domElement);

  return { renderer3D, rootElement };
}
