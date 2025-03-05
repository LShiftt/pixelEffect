import { createPixelEffect } from "./postprocess-pixel.js";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const inventoryItems = [
  {
    id: "inventoryCubeJaune",
    name: "Cube Jaune",
    localStorageKey: "cubeJaune",
    geometry: new THREE.BoxGeometry(0.1, 0.1, 0.1),
    material: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeVert",
    name: "Cube Vert",
    localStorageKey: "cubeVert",
    geometry: new THREE.BoxGeometry(0.3, 0.3, 0.3),
    material: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeBleu",
    name: "Cube Bleu",
    localStorageKey: "cubeBleu",
    geometry: new THREE.BoxGeometry(0.2, 0.2, 0.2),
    material: new THREE.MeshBasicMaterial({ color: 0x0000ff }),
    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeRose",
    name: "Cube Rose",
    localStorageKey: "cubeRose",
    geometry: new THREE.BoxGeometry(0.25, 0.25, 0.25),
    material: new THREE.MeshBasicMaterial({ color: 0xff00ff }),
    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeGris",
    name: "Cube Gris",
    localStorageKey: "cubeGris",
    geometry: new THREE.BoxGeometry(0.2, 0.2, 0.2),
    material: new THREE.MeshBasicMaterial({ color: 0x808080 }),
    obtained: false,
    placed: false,
  },
];

// Pour chaque item, on vérifie si le joueur l'a obtenu (localStorage renvoie "true")
inventoryItems.forEach((item) => {
  if (localStorage.getItem(item.localStorageKey) === "true") {
    item.obtained = true;
  }
});
// Mise à jour de l'affichage de chaque bouton de l'inventaire
inventoryItems.forEach((item) => {
  const btn = document.getElementById(item.id);
  if (btn) {
    if (item.obtained) {
      btn.textContent = item.name;
      btn.disabled = item.placed;
    } else {
      btn.textContent = "Vide";
      btn.disabled = true;
    }
  }
});

// Création de la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
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

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Cube rouge (joueur)
const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(player);

// Création de la planète
const planetGeometry = new THREE.SphereGeometry(2, 32, 32);
const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

player.position.set(2.15, 0, 0);

// Fonctionnalité de déplacement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let targetPosition = null;
let startPosition = new THREE.Vector3();
let startQuaternion = new THREE.Quaternion();
let endQuaternion = new THREE.Quaternion();

let progress = 0;
let totalAngle = 0;
let rotationAxis = new THREE.Vector3();
let pathLine = null;
let pathHistory = [];
let moving = false;

function onMouseClick(event) {
  if (moving) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, activeCamera);
  const intersects = raycaster.intersectObject(planet);

  if (intersects.length > 0) {
    const newTargetPosition = intersects[0].point
      .normalize()
      .multiplyScalar(2.15);

    startPosition.copy(player.position);
    startQuaternion.copy(player.quaternion);

    rotationAxis = new THREE.Vector3()
      .crossVectors(startPosition, newTargetPosition)
      .normalize();
    totalAngle = startPosition.angleTo(newTargetPosition);

    const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
      rotationAxis,
      totalAngle
    );
    endQuaternion.copy(startQuaternion).multiply(rotationQuaternion);

    targetPosition = newTargetPosition;
    progress = 0;
    moving = true;

    drawPath(startPosition, targetPosition);
  }
}

function drawPath(start, end) {
  if (pathLine) scene.remove(pathLine);

  const curve = new THREE.CatmullRomCurve3([start, end]);
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });

  pathLine = new THREE.Line(geometry, material);
  scene.add(pathLine);

  if (playerSettings.showPath) {
    const pathSegment = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0xff00ff })
    );
    scene.add(pathSegment);
    pathHistory.push(pathSegment);
  }
}

window.addEventListener("click", onMouseClick);

// Fonctionnalité de caméras
let angleMain = 0;
let angleX = 0;
let angleY = 0;
const radius = 5;
const speeds = { main: 0.001, x: 0.001, y: 0.01 };

const gui = new GUI();

// Contrôles pour les satellites
gui.add(speeds, "main", 0.001, 0.05).name("Vitesse Satellite Principal");
gui.add(speeds, "x", 0.001, 0.05).name("Vitesse Satellite X");
gui.add(speeds, "y", 0.001, 0.05).name("Vitesse Satellite Y");

// Fonction pour mettre à jour la caméra et le post-process
let composer = createPixelEffect(scene, activeCamera, renderer);
function updateCamera(newCamera) {
  activeCamera = newCamera;
  composer = createPixelEffect(scene, activeCamera, renderer);
}

document.getElementById("btnCameraMain").addEventListener("click", () => {
  updateCamera(cameraMain);
});

document.getElementById("btnCameraX").addEventListener("click", () => {
  updateCamera(cameraX);
});

document.getElementById("btnCameraY").addEventListener("click", () => {
  updateCamera(cameraY);
});

// Bouton pour changer la caméra dans le GUI
gui
  .add({ switchCamera: "main" }, "switchCamera", ["main", "x", "y"])
  .name("Caméra Active")
  .onChange((value) => {
    const newCamera =
      value === "main" ? cameraMain : value === "x" ? cameraX : cameraY;
    updateCamera(newCamera);
  });


const playerSettings = {
  speed: 0.01, 
  showTrajectory: true,
  showPath: true,
  color: "#ff0000",
};


gui.add(playerSettings, "speed", 0.01, 0.1, 0.01).name("Vitesse Joueur");
gui
  .add(playerSettings, "showTrajectory")
  .name("Afficher Trajectoire")
  .onChange(updateTrajectoryVisibility);
gui
  .add(playerSettings, "showPath")
  .name("Afficher Chemin")
  .onChange(updatePathVisibility);
gui
  .addColor(playerSettings, "color")
  .name("Couleur Joueur")
  .onChange((value) => {
    player.material.color.set(value);
  });


// Poser des objets sur le sol

function placeSelectedItem(item) {
  if (item.placed) {
    console.log("Cet objet a déjà été placé.");
    return;
  }

  // Crée une nouvelle instance du mesh
  const mesh = new THREE.Mesh(item.geometry, item.material);
  // Positionne l'objet aux coordonnées actuelles du joueur
  mesh.position.copy(player.position);
  // Ajoute l'objet à la scène
  scene.add(mesh);

  // Marquer l'item comme placé
  item.placed = true;

  // Désactiver le bouton de l'inventaire
  const btn = document.getElementById(item.id);
  if (btn) {
    btn.disabled = true;
  }
}

// Ajout d'un écouteur d'événement pour chaque bouton (uniquement si l'item est obtenu)
inventoryItems.forEach((item) => {
  const btn = document.getElementById(item.id);
  if (btn && item.obtained && !item.placed) {
    btn.addEventListener("click", () => {
      placeSelectedItem(item);
    });
  }
});
// Boucle d'animation
function animate() {
  requestAnimationFrame(animate);

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

  // Animation du joueur
  if (targetPosition) {
    progress += playerSettings.speed;
    if (progress < 1) {
      const currentAngle = totalAngle * progress;
      const currentQuaternion = new THREE.Quaternion().setFromAxisAngle(
        rotationAxis,
        currentAngle
      );
      const newPosition = startPosition
        .clone()
        .applyQuaternion(currentQuaternion);
      player.position.copy(newPosition);

      player.quaternion.slerpQuaternions(
        startQuaternion,
        endQuaternion,
        progress
      );
    } else {
      player.position.copy(targetPosition);
      player.quaternion.copy(endQuaternion);
      targetPosition = null;
      moving = false;
    }
  }

  composer.render();
}

animate();

// Fonctions pour mettre à jour l'affichage de la trajectoire et du chemin
function updateTrajectoryVisibility() {
  if (pathLine) pathLine.visible = playerSettings.showTrajectory;
}

function updatePathVisibility() {
  pathHistory.forEach((line) => (line.visible = playerSettings.showPath));
}
