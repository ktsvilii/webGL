export function setupResizeObserver(canvas, renderer3D) {
  const resizeObserver = new ResizeObserver(() => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      renderer3D.setSize(width, height, false);
    }
  });

  resizeObserver.observe(canvas);
  window.addEventListener('beforeunload', () => resizeObserver.disconnect());
}

export function setupWindowResizeHandlers(renderer3D, camera) {
  function updateDimensions() {
    const renderWidth = window.innerWidth;
    const renderHeight = window.innerHeight;
    renderer3D.setSize(renderWidth, renderHeight);
    camera.aspect = renderWidth / renderHeight;
    camera.updateProjectionMatrix();
  }

  function updateCameraAspect() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', updateDimensions);
  window.addEventListener('resize', updateCameraAspect);
}
