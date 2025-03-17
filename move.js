import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

// Initialisation de la scène, caméra et rendu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Ajout de lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Charger le modèle 3D
const loader = new GLTFLoader();
let player, mixer, idleAction, walkAction, runAction;
loader.load("./model/astronauta/scene.gltf", (gltf) => {
  player = gltf.scene;
  player.scale.set(0.2, 0.2, 0.2);
  player.position.set(2.15, 0, 0);
  scene.add(player);

  // Initialiser l'AnimationMixer
  mixer = new THREE.AnimationMixer(player);

  // Chercher les animations disponibles
  const idleClip = gltf.animations.find((clip) =>
    clip.name.toLowerCase().includes("idle")
  );
  const walkClip = gltf.animations.find((clip) =>
    clip.name.toLowerCase().includes("walk")
  );
  const runClip = gltf.animations.find((clip) =>
    clip.name.toLowerCase().includes("run")
  );

  if (idleClip) {
    idleAction = mixer.clipAction(idleClip);
    idleAction.loop = THREE.LoopRepeat;
    idleAction.play(); // Démarrer en idle par défaut
  }
  if (walkClip) {
    walkAction = mixer.clipAction(walkClip);
    walkAction.loop = THREE.LoopRepeat;
  }
  if (runClip) {
    runAction = mixer.clipAction(runClip);
    runAction.loop = THREE.LoopRepeat;
  }
});

// sphère
const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const wireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
const planet = new THREE.Mesh(sphereGeometry, wireframeMaterial);
scene.add(planet);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let targetPosition = null;
let startPosition = new THREE.Vector3();
let startQuaternion = new THREE.Quaternion();
let endQuaternion = new THREE.Quaternion();

let progress = 0;
let moving = false;
const WALK_THRESHOLD = 1.5; // Distance à partir de laquelle on court

function onMouseClick(event) {
  if (moving || !player) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planet);

  if (intersects.length > 0) {
    const newTargetPosition = intersects[0].point
      .normalize()
      .multiplyScalar(2.15);
    const normal = intersects[0].point.clone().normalize();

    startPosition.copy(player.position);
    startQuaternion.copy(player.quaternion);

    // Calcul de la direction de déplacement projetée sur le plan tangent
    const direction = newTargetPosition.clone().sub(startPosition).normalize();
    const tangentDirection = direction
      .clone()
      .projectOnPlane(normal)
      .normalize();

    // Création d'une base orthonormée locale
    const up = normal; // Y local
    const forward = tangentDirection; // Z local
    const right = new THREE.Vector3().crossVectors(up, forward).normalize(); // X local

    // Création de la matrice de rotation
    const rotationMatrix = new THREE.Matrix4().makeBasis(right, up, forward);

    // Conversion de la matrice en quaternion
    endQuaternion.setFromRotationMatrix(rotationMatrix);

    targetPosition = newTargetPosition;
    progress = 0;
    moving = true;

    // Choisir la bonne animation
    const distance = startPosition.distanceTo(targetPosition);
    if (distance < WALK_THRESHOLD && walkAction) {
      walkAction.reset().play();
    } else if (distance >= WALK_THRESHOLD && runAction) {
      runAction.reset().play();
    }

    // Arrêter idle
    if (idleAction) idleAction.stop();
  }
}

window.addEventListener("click", onMouseClick);

function animate() {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(0.016); // Mettre à jour l'animation
  }

  if (targetPosition && player) {
    progress += 0.02;
    if (progress < 1) {
      player.position.lerpVectors(startPosition, targetPosition, progress);
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

      // Arrêter course ou marche, relancer idle
      if (runAction) runAction.stop();
      if (walkAction) walkAction.stop();
      if (idleAction) idleAction.play();
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
