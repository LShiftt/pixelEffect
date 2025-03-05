import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { createPixelEffect } from './postprocess-pixel.js';

// Création de la scène
const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// Chargement de la texture
const textureLoader = new THREE.TextureLoader();
const planetTexture = textureLoader.load("./textures/csgo.jpg");

// Création des caméras
const cameraMain = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
cameraMain.position.set(5, 3, 5);

const cameraX = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
cameraX.position.set(10, 0, 0);

const cameraY = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
cameraY.position.set(0, 10, 0);

let activeCamera = cameraMain;

// Création du rendu WebGL
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajout de la lumière sans ombres
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Création de la planète
const planetGeometry = new THREE.SphereGeometry(2, 64, 64);
const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Variables pour l'orbite
let angleMain = 0;
let angleX = 0;
let angleY = 0;
const radius = 5;
const speeds = { main: 0.01, x: 0.01, y: 0.01 };

// GUI pour changer la vitesse des satellites et la caméra active
const gui = new GUI();
gui.add(speeds, "main", 0.001, 0.05).name("Vitesse Satellite Principal");
gui.add(speeds, "x", 0.001, 0.05).name("Vitesse Satellite X");
gui.add(speeds, "y", 0.001, 0.05).name("Vitesse Satellite Y");
gui
  .add({ switchCamera: "main" }, "switchCamera", ["main", "x", "y"])
  .name("Caméra Active")
  .onChange((value) => {
    activeCamera =
      value === "main" ? cameraMain : value === "x" ? cameraX : cameraY;
  });

// Fonction d'animation
function animate() {
  requestAnimationFrame(animate);

  console.log(cameraY.position.y);
//   console.log(cameraX.position.x);


  // Mise à jour des orbites
  angleMain += speeds.main;
  cameraMain.position.x = radius * Math.cos(angleMain);
  cameraMain.position.z = radius * Math.sin(angleMain);
  cameraMain.lookAt(planet.position);

  angleX += speeds.x;
  cameraX.position.x = radius * Math.cos(angleX);
  cameraX.position.z = radius * Math.sin(angleX);
  cameraX.lookAt(planet.position);

  angleY += speeds.y;
  cameraY.position.y = radius * Math.cos(angleY);
  cameraY.position.z = radius * Math.sin(angleY);
  cameraY.lookAt(planet.position);

  renderer.render(scene, activeCamera);
}

animate();
