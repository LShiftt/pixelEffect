import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export function createPixelEffect(scene, camera, renderer) {
  const composer = new EffectComposer(renderer);

  const renderPixelatedPass = new RenderPixelatedPass(4, scene, camera);
  composer.addPass(renderPixelatedPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // GUI 
  const gui = new GUI();
  const params = {
    pixelSize: 3,
    normalEdgeStrength: 0.3,
    depthEdgeStrength: 0.4,
    pixelAlignedPanning: true,
  };

  gui.add(params, "pixelSize").min(1).max(16).step(1).onChange(() => {
    renderPixelatedPass.setPixelSize(params.pixelSize);
  });
  gui.add(renderPixelatedPass, "normalEdgeStrength").min(0).max(2).step(0.05);
  gui.add(renderPixelatedPass, "depthEdgeStrength").min(0).max(1).step(0.05);
  gui.add(params, "pixelAlignedPanning");

  return composer;
  ColetandoChao
}