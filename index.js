import { createPixelEffect } from "./postprocess-pixel.js";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { createRocket, rocket } from "./model/fusee/rocket.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const textureLoader = new THREE.TextureLoader();

const clock = new THREE.Clock();

const inventoryItems = [
  {
    id: "inventoryCubeJaune",
    name: "Microscope",
    localStorageKey: "cubeJaune",
    modelPath: "./model/microscope/scene.gltf",
    offset: new THREE.Vector3(0, 0, 0),
    scale: new THREE.Vector3(0.01, 0.01, 0.01),
    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeVert",
    name: "Antenne",
    localStorageKey: "cubeVert",
    modelPath: "./model/antena/scene.gltf",
    scale: new THREE.Vector3(0.04, 0.04, 0.04),
    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeBleu",
    name: "Moon Cake",
    localStorageKey: "cubeBleu",
    modelPath: "./model/final_space_-_mooncake/scene.gltf",
    scale: new THREE.Vector3(0.35, 0.35, 0.35),
    offset: new THREE.Vector3(0, 0.65, 0),

    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeRose",
    name: "Sci-Fi Boite",
    localStorageKey: "cubeRose",
    modelPath: "./model/science_fiction_box/scene.gltf",
    offset: new THREE.Vector3(0, 0.2, 0),

    obtained: false,
    placed: false,
  },
  {
    id: "inventoryCubeGris",
    name: "Perseverance",
    localStorageKey: "cubeGris",
    modelPath: "./model/perseverance_-_nasa_mars_landing_2021/scene.gltf",
    scale: new THREE.Vector3(0.15, 0.15, 0.15),
    obtained: false,
    placed: false,
  },
];

inventoryItems.forEach((item) => {
  if (localStorage.getItem(item.localStorageKey) === "true")
    item.obtained = true;
});
inventoryItems.forEach((item) => {
  const btn = document.getElementById(item.id);
  if (btn) {
    btn.textContent = item.obtained ? item.name : "Vide";
    btn.disabled = !item.obtained || item.placed;
  }
});
inventoryItems.forEach((item) => {
  const btn = document.getElementById(item.id);
  if (btn && item.obtained && !item.placed) {
    btn.addEventListener("click", () => {
      placeSelectedItem(item);
    });
  }
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.add(new THREE.AxesHelper(10));

const bgTexture = textureLoader.load("./textures/bg.jpg");
const bgGeometry = new THREE.SphereGeometry(500, 32, 32);
bgGeometry.scale(-1, 1, 1);

const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
const backgroundMesh = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(backgroundMesh);

const planetTexture = textureLoader.load("./textures/mars.jpg");

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
scene.add(new THREE.AmbientLight(0xffffff, 1));

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

let player,
  mixer,
  idleAction,
  walkAction,
  runAction,
  placeAction,
  currentAction,
  currentAnimName = "idle";

function setAnimation(name) {
  let newAction;
  const lowerName = name.toLowerCase();
  if (lowerName.includes("idle")) newAction = idleAction;
  else if (lowerName.includes("walk")) newAction = walkAction;
  else if (lowerName.includes("run")) newAction = runAction;
  else if (lowerName.includes("coletandochao")) newAction = placeAction;
  else return;
  if (!mixer || !newAction || currentAnimName === name) return;
  if (currentAction) currentAction.fadeOut(0.2);
  newAction.reset().fadeIn(0.2).play();
  currentAction = newAction;
  currentAnimName = name;
}

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./model/astronauta/scene.gltf",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);
    const bbox = new THREE.Box3().setFromObject(model);
    const offset = new THREE.Vector3(0, -bbox.min.y, 0);
    model.position.add(offset);
    const group = new THREE.Group();
    group.add(model);
    group.position.set(0.2, 2.1, 0);
    player = group;
    scene.add(player);
    mixer = new THREE.AnimationMixer(group);
    const idleClip = gltf.animations.find((clip) =>
      clip.name.toLowerCase().includes("idle")
    );
    const walkClip = gltf.animations.find((clip) =>
      clip.name.toLowerCase().includes("walk")
    );
    const runClip = gltf.animations.find((clip) =>
      clip.name.toLowerCase().includes("run")
    );
    const placeClip = gltf.animations.find((clip) =>
      clip.name.toLowerCase().includes("coletandochao")
    );
    if (idleClip) {
      idleAction = mixer.clipAction(idleClip);
      idleAction.loop = THREE.LoopRepeat;
      idleAction.play();
    }
    if (walkClip) {
      walkAction = mixer.clipAction(walkClip);
      walkAction.loop = THREE.LoopRepeat;
    }
    if (runClip) {
      runAction = mixer.clipAction(runClip);
      runAction.loop = THREE.LoopRepeat;
    }
    if (placeClip) {
      placeAction = mixer.clipAction(placeClip);
      placeAction.loop = THREE.LoopOnce;
      placeAction.clampWhenFinished = true;
    }
  },
  undefined,
  (error) => {
    console.error("Erreur de chargement du modèle GLTF", error);
  }
);

createRocket(scene);
rocket.position.set(0, 2.28, 0);
rocket.rotation.set(
  THREE.MathUtils.degToRad(35),
  THREE.MathUtils.degToRad(80),
  THREE.MathUtils.degToRad(-35)
);

const planet = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshStandardMaterial({ map: planetTexture })
);
scene.add(planet);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetPosition = null,
  startPosition = new THREE.Vector3(),
  startQuaternion = new THREE.Quaternion(),
  endQuaternion = new THREE.Quaternion();
let progress = 0,
  moving = false;

function onMouseClick(event) {
  if (moving || !player) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, activeCamera);
  const intersects = raycaster.intersectObject(planet);
  if (intersects.length > 0) {
    const newTarget = intersects[0].point.normalize().multiplyScalar(2.0);
    startPosition.copy(player.position);
    startQuaternion.copy(player.quaternion);
    const radial = newTarget.clone().normalize();
    const forward = newTarget.clone().sub(startPosition);
    forward.projectOnPlane(radial).normalize();
    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(
      startPosition,
      startPosition.clone().add(forward),
      radial
    );
    endQuaternion.setFromRotationMatrix(lookAtMatrix);
    endQuaternion.multiply(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        Math.PI
      )
    );
    targetPosition = newTarget;
    progress = 0;
    moving = true;
    const distance = startPosition.distanceTo(newTarget);
    distance > 1.5 ? setAnimation("run") : setAnimation("walk");
  }
}
window.addEventListener("click", onMouseClick);

let angleMain = 0,
  angleX = 0,
  angleY = 0;
const radius = 5;
const speeds = { main: 0.001, x: 0.001, y: 0.01 };

const gui = new GUI();
gui.add(speeds, "main", 0.001, 0.05).name("Vitesse Satellite Principal");
gui.add(speeds, "x", 0.001, 0.05).name("Vitesse Satellite X");
gui.add(speeds, "y", 0.001, 0.05).name("Vitesse Satellite Y");

let composer = createPixelEffect(scene, activeCamera, renderer);
function updateCamera(newCamera) {
  activeCamera = newCamera;
  composer = createPixelEffect(scene, activeCamera, renderer);
}
document
  .getElementById("btnCameraMain")
  .addEventListener("click", () => updateCamera(cameraMain));
document
  .getElementById("btnCameraX")
  .addEventListener("click", () => updateCamera(cameraX));
document
  .getElementById("btnCameraY")
  .addEventListener("click", () => updateCamera(cameraY));
gui
  .add({ switchCamera: "main" }, "switchCamera", ["main", "x", "y"])
  .name("Caméra Active")
  .onChange((value) => {
    const newCam =
      value === "main" ? cameraMain : value === "x" ? cameraX : cameraY;
    updateCamera(newCam);
  });

const playerSettings = { speed: 0.01, color: "#ff0000" };
gui.add(playerSettings, "speed", 0.01, 0.1, 0.01).name("Vitesse Joueur");
gui
  .addColor(playerSettings, "color")
  .name("Couleur Joueur")
  .onChange((value) => {
    if (player) {
      player.traverse((child) => {
        if (child.isMesh) child.material.color.set(value);
      });
    }
  });

function placeSelectedItem(item) {
  if (item.placed) {
    console.log("Cet objet a déjà été placé.");
    return;
  }
  setAnimation("coletandochao");

  if (item.modelPath) {
    const loader = new GLTFLoader();
    loader.load(
      item.modelPath,
      (gltf) => {
        const model = gltf.scene;
        if (item.scale) {
          model.scale.copy(item.scale);
        } else {
          model.scale.set(0.5, 0.5, 0.5);
        }
        model.position.copy(player.position);
        if (item.offset) {
          const offset = item.offset.clone().applyQuaternion(player.quaternion);
          model.position.add(offset);
        }
        model.quaternion.copy(player.quaternion);
        scene.add(model);
        item.placed = true;
        const btn = document.getElementById(item.id);
        if (btn) {
          btn.disabled = true;
        }
      },
      undefined,
      (error) => {
        console.error("Erreur de chargement du modèle GLTF", error);
      }
    );
  } else {
    const mesh = new THREE.Mesh(item.geometry, item.material);
    mesh.position.copy(player.position);
    if (item.offset) {
      const offset = item.offset.clone().applyQuaternion(player.quaternion);
      mesh.position.add(offset);
    }
    if (item.scale) {
      mesh.scale.copy(item.scale);
    }
    scene.add(mesh);
    item.placed = true;
    const btn = document.getElementById(item.id);
    if (btn) {
      btn.disabled = true;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
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
  if (targetPosition && player) {
    progress += playerSettings.speed;
    if (progress < 1) {
      const startNorm = startPosition.clone().normalize();
      const targetNorm = targetPosition.clone().normalize();
      const angle = startNorm.angleTo(targetNorm);
      const axis = new THREE.Vector3()
        .crossVectors(startNorm, targetNorm)
        .normalize();
      const q = new THREE.Quaternion().setFromAxisAngle(axis, angle * progress);
      const newPos = startNorm.clone().applyQuaternion(q).multiplyScalar(2.0);
      player.position.copy(newPos);
      player.quaternion.copy(startQuaternion);
      player.quaternion.slerp(endQuaternion, progress);
      player.up.copy(player.position.clone().normalize());
    } else {
      player.position.copy(targetPosition);
      player.quaternion.copy(endQuaternion);
      player.up.copy(player.position.clone().normalize());
      targetPosition = null;
      moving = false;
      setAnimation("idle");
    }
  }
  backgroundMesh.position.copy(activeCamera.position);
  composer.render();
}
animate();
