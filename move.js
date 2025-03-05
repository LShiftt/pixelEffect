import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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

// cube rouge
const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(player);

// sphère
const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const wireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
const planet = new THREE.Mesh(sphereGeometry, wireframeMaterial);
scene.add(planet);

player.position.set(2.15, 0, 0);

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

  raycaster.setFromCamera(mouse, camera);
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

  if (settings.showPath) {
    const pathSegment = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0xff00ff })
    );
    scene.add(pathSegment);
    pathHistory.push(pathSegment);
  }
}

window.addEventListener("click", onMouseClick);

function animate() {
  requestAnimationFrame(animate);

  if (targetPosition) {
    progress += settings.speed;
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

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Interface GUI
const gui = new GUI();
const settings = {
  speed: 0.02,
  reset: () => resetPlayer(),
  showTrajectory: true,
  showPath: true,
  color: "#ff0000",
};

gui.add(settings, "speed", 0.01, 0.1, 0.01).name("Vitesse");
gui
  .add(settings, "showTrajectory")
  .name("Afficher Trajectoire")
  .onChange(updateTrajectoryVisibility);
gui
  .add(settings, "showPath")
  .name("Afficher Chemin")
  .onChange(updatePathVisibility);

function updateTrajectoryVisibility() {
  if (pathLine) pathLine.visible = settings.showTrajectory;
}

function updatePathVisibility() {
  pathHistory.forEach((line) => (line.visible = settings.showPath));
}
