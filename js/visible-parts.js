import {THREE as T} from './kit.js';

// An offscreen flat-color render records the frontmost labeled structure at
// each pixel. Leaders can terminate on visible geometry as the camera orbits.
export function createPartPicker({renderer, scene, camera}) {
  const target = new T.WebGLRenderTarget(1, 1);
  const palette = Array.from({length: 4}, (_, index) => {
    const material = new T.MeshBasicMaterial({side: T.DoubleSide, toneMapped: false});
    material.color.setRGB((index + 1) / 8, 0, 0);
    return material;
  });
  const replaced = [];
  const hidden = [];
  const lastPosition = new T.Matrix4();
  const lastProjection = new T.Matrix4();
  let width, height, pixels, lastModel, lastCut;

  function update(model, cutaway, stageWidth, stageHeight) {
    camera.updateMatrixWorld();
    const nextWidth = Math.max(1, Math.min(320, Math.round(stageWidth)));
    const nextHeight = Math.max(1, Math.round(nextWidth * stageHeight / stageWidth));
    const sameSize = width === nextWidth && height === nextHeight;
    if (sameSize && model === lastModel && cutaway === lastCut &&
        lastPosition.equals(camera.matrixWorld) && lastProjection.equals(camera.projectionMatrix)) return;
    if (!sameSize) {
      width = nextWidth;
      height = nextHeight;
      pixels = new Uint8Array(width * height * 4);
      target.setSize(width, height);
    }
    model.root.traverseVisible(object => {
      if (!object.material) return;
      const part = object.userData.part;
      if (part == null) {
        hidden.push(object);
        object.visible = false;
      } else {
        replaced.push([object, object.material]);
        object.material = palette[part];
      }
    });
    try {
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      lastModel = model;
      lastCut = cutaway;
      lastPosition.copy(camera.matrixWorld);
      lastProjection.copy(camera.projectionMatrix);
    } finally {
      renderer.setRenderTarget(null);
      for (const [object, material] of replaced) object.material = material;
      for (const object of hidden) object.visible = true;
      replaced.length = hidden.length = 0;
    }
  }

  function partAt(x, y) {
    if (!pixels || x < 0 || x >= width || y < 0 || y >= height) return -1;
    return Math.round(pixels[(y * width + x) * 4] * 8 / 255) - 1;
  }

  function anchors(preferred) {
    const best = preferred.map(() => null);
    const scores = preferred.map(() => Infinity);
    const targets = preferred.map(point => ({x: point.x * width, y: (1 - point.y) * height}));
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const part = partAt(x, y);
        if (part < 0 || !targets[part]) continue;
        const target = targets[part];
        let score = (x - target.x) ** 2 + (y - target.y) ** 2;
        // Favor the center of a visible patch. Narrow details such as a fiber
        // shaft still qualify when their entire silhouette is only a pixel wide.
        for (const offset of [-2, 2]) {
          if (partAt(x + offset, y) !== part) score += 240;
          if (partAt(x, y + offset) !== part) score += 240;
        }
        if (score >= scores[part]) continue;
        scores[part] = score;
        best[part] = {x: (x + .5) / width, y: 1 - (y + .5) / height};
      }
    }
    return best;
  }

  return {
    update,
    anchors,
    pick(x, y) { return partAt(Math.floor(x * width), Math.floor((1 - y) * height)); }
  };
}
