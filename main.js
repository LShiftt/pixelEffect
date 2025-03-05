import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initialisation de la scène, caméra et rendu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const axesHelper = new THREE.AxesHelper(10); 
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Création du cube rouge (joueur)
const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(player);

const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const planet = new THREE.Mesh(sphereGeometry, wireframeMaterial);
scene.add(planet);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let targetPosition = null;
let moveSpeed = 0.05;
let pathLine = null; // Ligne pour la trajectoire temporaire
let hasCrossedPlanet = false; // Variable pour savoir si le chemin traverse la planète

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planet);
    
    if (intersects.length > 0) {
        const newTargetPosition = intersects[0].point;
        const normal = intersects[0].face.normal.clone().normalize();
        const offset = normal.multiplyScalar(0.15); // Décalage pour éviter le clipping
        targetPosition = newTargetPosition.add(offset);
        
        // Vérifier si le chemin traverse la planète
        checkPathIntersection(player.position, targetPosition);
        
        if (hasCrossedPlanet) {
            console.log('Le chemin traverse la planète, calcul du nouveau chemin.');
            // Calculer et afficher un chemin qui contourne la planète
            const newPath = calculatePathAroundPlanet(player.position, targetPosition);
            displayPathLine(player.position, newPath, true); // Afficher le chemin en rouge (courbé)
        } else {
            // Afficher le chemin normal en blanc
            displayPathLine(player.position, targetPosition, false);
        }

        console.log('Nouvelle position sauvegardée:', targetPosition);
    }
}

function checkPathIntersection(start, end) {
    // Calculer si le chemin traverse la planète
    const direction = end.clone().sub(start).normalize();
    const ray = new THREE.Ray(start, direction);
    
    // Calculer l'intersection avec la surface de la planète
    const intersects = ray.intersectObject(planet);
    
    if (intersects.length > 0) {
        hasCrossedPlanet = true;
    } else {
        hasCrossedPlanet = false;
    }
}

function calculatePathAroundPlanet(start, end) {
    // Calculer un chemin alternatif autour de la planète en créant un chemin courbe
    const planetRadius = planet.geometry.parameters.radius;
    
    const vectorToStart = start.clone().sub(planet.position).normalize().multiplyScalar(planetRadius);
    const vectorToEnd = end.clone().sub(planet.position).normalize().multiplyScalar(planetRadius);

    // Faire une trajectoire autour de la planète (exemple : demi-cercle entre les deux points)
    const curve = new THREE.QuadraticBezierCurve3(vectorToStart, planet.position, vectorToEnd);
    
    return curve.getPoint(0.5).add(planet.position);
}

function displayPathLine(start, end, isCurved) {
    // Supprimer la ligne précédente si elle existe
    if (pathLine) {
        scene.remove(pathLine);
    }

    // Créer la ligne de trajectoire
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const materialColor = isCurved ? new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 }) : new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    pathLine = new THREE.Line(geometry, materialColor);
    scene.add(pathLine);
}

window.addEventListener('click', onMouseClick);

// Boucle de rendu
function animate() {
    requestAnimationFrame(animate);
    
    if (targetPosition) {
        const direction = targetPosition.clone().sub(player.position).normalize();
        const distance = targetPosition.distanceTo(player.position);
        
        if (distance > moveSpeed) {
            player.position.add(direction.multiplyScalar(moveSpeed));
        } else {
            player.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
            targetPosition = null;
            // Supprimer la ligne de la trajectoire après le déplacement
            if (pathLine) {
                scene.remove(pathLine);
            }
        }
    }
    
    controls.update();
    renderer.render(scene, camera);
}
animate();
