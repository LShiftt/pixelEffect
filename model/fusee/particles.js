import * as THREE from "three";
import { scene } from "./scene.js";

let particles, 
    particleGeometry;

export const createParticles = () => {
  particleGeometry = new THREE.BufferGeometry();
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Position initiale proche de la flamme
    positions[i * 3] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 1] = -30; // Au niveau de la flamme
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

    // Vitesse aléatoire vers le bas
    velocities[i * 3] = (Math.random() - 0.5) * 0.5;
    velocities[i * 3 + 1] = -Math.random() * 2;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute(
    "velocity",
    new THREE.BufferAttribute(velocities, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
      color: 0xffaa00, // Couleur orange/jaune
      size: 2,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
};


export const updateParticles = (rocket) => {
    const positions = particleGeometry.attributes.position.array;
    const velocities = particleGeometry.attributes.velocity.array;


  for (let i = 0; i < positions.length / 3; i++) {
    positions[i * 3] += velocities[i * 3 ];
    positions[i * 3 + 1] += velocities[i * 3 + 1];
    positions[i * 3 + 10] += velocities[i * 3 + 10];

    // Réinitialiser les particules si elles sortent de la zone de flamme
    if (positions[i * 3 + 1] < -50) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = -20; // Retour en haut
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      velocities[i * 3 + 10] = -Math.random() * 2; // Redonner une vitesse vers le bas
    }
  }

    particleGeometry.attributes.position.needsUpdate = true;
    // Synchronisation de la position des étincelles avec la fusée
    particles.position.copy(rocket.position);
    particles.rotation.copy(rocket.rotation);
};
