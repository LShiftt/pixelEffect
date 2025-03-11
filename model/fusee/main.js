// main.js
import { createScene, renderer, camera, scene, composer } from "./scene.js";
import * as rocket from "./rocket.js";
import { createParticles, updateParticles } from "./particles.js";
import { setupControls } from "./controls.js";
import { createLights } from "./lights.js";

const targetRocketPosition = 40;
const animationDuration = 2000;

const loop = () => {
  renderer.render(scene, camera);
  
  updateParticles(rocket.rocket);
  const t = (Date.now() % animationDuration) / animationDuration;
  const delta = targetRocketPosition * Math.sin(Math.PI * 2 * t);
  if (rocket.rocket_fire) {
    rocket.rocket_fire.scale.set(
      1 + delta / 100,
      1 + Math.abs(delta / 100),
      1 + delta / 100
    );
  }
  composer.render();
  requestAnimationFrame(loop);
};

const main = () => {
  createScene();
  createLights();
  rocket.createRocket();
  createParticles();
  setupControls(rocket.rocket);
  
  loop();
};

main();