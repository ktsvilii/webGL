import * as GaussianSplats3D from "../gaussian-splats-3d.module.js"



const viewer = new GaussianSplats3D.Viewer({
    'cameraUp': [0, -1, 0],
    'initialCameraPosition': [5.21449, 1.15657, -1.18348],
    'inMemoryCompressionLevel': 1,
    'renderMode': GaussianSplats3D.RenderMode.OnChange,
    'sceneRevealMode': GaussianSplats3D.SceneRevealMode.Gradual,
    'splatSortDistanceMapPrecision': 16,
    'sceneFadeInRateMultiplier': 20,
    'dynamicScene': false,
    'initialCameraLookAt': [	1.03942, 3.57931, -1.03766]
});

viewer.addSplatScene('../assets/GIGA_MAG32.ksplat', {
    'splatAlphaRemovalThreshold': 15,
    'showLoadingUI': true,
    'progressiveLoad': true,
    'position': [0, 1, 0],
    'rotation': [0, 0, 0, 1],
    'scale': [1.5, 1.5, 1.5]
})
.then(() => {
    viewer.start();

    // Запускаем анимацию перехода от точек к сплатам
    //viewer.animatePointCloudToSplats();
})
.catch(error => {
    console.error("Ошибка при загрузке сцены:", error);
});