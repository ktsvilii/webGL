import * as THREE from 'three';
import * as GaussianSplats3D from '../gaussian-splats-3d.module.js'; // Импорт библиотеки

export function initViewer(link, renderer3D, threeScene, renderHeight, renderWidth, initial = true) {
  // Инициализация Viewer
  let viewer;
  let camera;
  if (initial) {
    viewer = new GaussianSplats3D.Viewer({
      selfDrivenMode: true,
      threeScene: threeScene,
      renderer: renderer3D,
      camera: new THREE.PerspectiveCamera(50, renderWidth / renderHeight, 0.01, 500),
      useBuiltInControls: false,
      'sharedMemoryForWorkers': false
    });

    camera = viewer.camera;
    camera.position.set(-1, -4, 6);
    camera.up.set(0, -1, 0).normalize();
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Загрузка внешнего файла в Viewer
    viewer.addSplatScene(link, {
      progressiveLoad: true,
      showLoadingUI: false,
      onLoad: threeScene => {
        // Ensure the target child exists before trying to access it
        const targetChild = threeScene.children[0]?.children[3];
        if (targetChild) {
          // Remove or hide all other children
          threeScene.children.forEach(child => {
            if (child !== targetChild) {
              child.visible = false; // Hide other children
            }
          });
          // Optionally, you can also set the specific child to be visible, in case needed
          targetChild.visible = true;
        }
      },
    });
  } else {
    viewer = new GaussianSplats3D.Viewer({
      selfDrivenMode: true,
      threeScene: threeScene,
      renderer: renderer3D,
      camera: new THREE.PerspectiveCamera(50, renderWidth / renderHeight, 0.01, 500),
      useBuiltInControls: true,
      'sharedMemoryForWorkers': false
    });

    camera = viewer.camera;
    camera.position.set(-1, -4, 6);
    camera.up.set(0, -1, 0).normalize();
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Load external splat scene and run animation only when the scene is fully loaded
    viewer
      .addSplatScene('https://huggingface.co/spaces/Vision70s/GaussianVision70s/resolve/main/archViz_orig.ply', {
        splatAlphaRemovalThreshold: 1,
        showLoadingUI: false,
        progressiveLoad: true,
      })
      .then(() => {
        // Ensure the scene and its children are fully loaded
        const mainObject = threeScene.children[0]?.children[0]; // Safely access the first child

        // Render the updated scene
        viewer.render();

        // Start the viewer once the scene is loaded
        viewer.start();

        // Run the point cloud to splat animation after the scene is loaded
        viewer.animatePointCloudToSplats({
          duration: 3000, // 3 seconds for the main transition
          expandDuration: 5000, // 5 seconds for expanding splats
          maxSplatScale: 1.0, // Maximum splat size
          minSplatScale: 0.1, // Initial splat size
          maxVisibleRadius: 15.0, // Maximum visibility radius
        });
      })
      .catch(error => {
        console.error('Error loading the scene:', error);
      });
  }
  return { viewer, camera };
}
