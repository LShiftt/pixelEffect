// rocket.js
import * as THREE from "three";

let rocket, rocket_fire;
const rocketParts = {};
let scWing = "red",
  scBody = "blue",
  scWindow = "gray";

// /**
//  * Mettre à jour la couleur du cube.
//  */
// function updateColor(obj, selectedElement) {
//   obj.material.color.set(selectedElement);
// }

export const createRocket = (scene) => {
  // Facteur de réduction des dimensions (division par 10)
  const s = 0.01;

  // Partie supérieure de la fusée (pointe)
  rocketParts.topc = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 6 * s, 4 * s, 64),
    new THREE.MeshStandardMaterial({ color: scBody })
  );
  scene.add(rocketParts.topc);
  rocketParts.topc.position.y = 60 * s;

  rocketParts.topa = new THREE.Mesh(
    new THREE.CylinderGeometry(6 * s, 12 * s, 8 * s, 64),
    new THREE.MeshStandardMaterial({ color: scBody })
  );
  scene.add(rocketParts.topa);
  rocketParts.topa.position.y = 54 * s;

  rocketParts.topb = new THREE.Mesh(
    new THREE.CylinderGeometry(12 * s, 18 * s, 20 * s, 64),
    new THREE.MeshStandardMaterial({ color: scBody })
  );
  scene.add(rocketParts.topb);
  rocketParts.topb.position.y = 40 * s;

  rocketParts.mida = new THREE.Mesh(
    new THREE.CylinderGeometry(18 * s, 20 * s, 16 * s, 64),
    new THREE.MeshStandardMaterial({ color: scBody })
  );
  scene.add(rocketParts.mida);
  rocketParts.mida.position.y = 22 * s;

  rocketParts.midc = new THREE.Mesh(
    new THREE.CylinderGeometry(20 * s, 20 * s, 8 * s, 64),
    new THREE.MeshStandardMaterial({ color: scBody })
  );
  scene.add(rocketParts.midc);
  rocketParts.midc.position.y = 10 * s;

  rocketParts.midb = new THREE.Mesh(
    new THREE.CylinderGeometry(20 * s, 18 * s, 16 * s, 64),
    new THREE.MeshStandardMaterial({
      color: scBody,
      receiveShadow: false,
    })
  );
  scene.add(rocketParts.midb);
  rocketParts.midb.position.y = -2 * s;

  rocketParts.bota = new THREE.Mesh(
    new THREE.CylinderGeometry(18 * s, 14 * s, 10 * s, 64),
    new THREE.MeshStandardMaterial({ color: scBody })
  );
  scene.add(rocketParts.bota);
  rocketParts.bota.position.y = -15 * s;

  rocketParts.botb = new THREE.Mesh(
    new THREE.CylinderGeometry(14 * s, 12 * s, 6 * s, 64),
    new THREE.MeshStandardMaterial({
      color: scBody,
      roughness: 0.5,
      metalness: 1,
      side: THREE.DoubleSide,
    })
  );
  scene.add(rocketParts.botb);
  rocketParts.botb.position.y = -20 * s;

  rocketParts.botc = new THREE.Mesh(
    new THREE.CylinderGeometry(10 * s, 8 * s, 4 * s, 64),
    new THREE.MeshStandardMaterial({
      color: scBody,
      roughness: 0,
      metalness: 1,
      side: THREE.DoubleSide,
    })
  );
  scene.add(rocketParts.botc);
  rocketParts.botc.position.y = -22 * s;

  // Bord de la fenêtre
  rocketParts.wina = new THREE.Mesh(
    new THREE.CylinderGeometry(12 * s, 12 * s, 23 * s, 64),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.5,
      metalness: 1,
      side: THREE.DoubleSide,
    })
  );
  scene.add(rocketParts.wina);
  rocketParts.wina.position.set(0, 20 * s, 10 * s);
  rocketParts.wina.rotation.set(Math.PI / 2, 0, 0);

  // Fenêtre de la fusée
  rocketParts.winb = new THREE.Mesh(
    new THREE.CylinderGeometry(9 * s, 9 * s, 8 * s, 64),
    new THREE.MeshPhysicalMaterial({
      color: scWindow,
      roughness: 0.1,
      transmission: 1,
      thickness: 0.9,
      side: THREE.DoubleSide,
    })
  );
  scene.add(rocketParts.winb);
  rocketParts.winb.position.set(0, 20 * s, 18 * s);
  rocketParts.winb.rotation.set(Math.PI / 2, 0, 0);

  // Ailerons
  rocketParts.fina = new THREE.Mesh(
    new THREE.BoxGeometry(40 * s, 8 * s, 18 * s),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
    })
  );
  scene.add(rocketParts.fina);
  rocketParts.fina.position.set(16 * s, -10 * s, 0);
  rocketParts.fina.rotation.set(Math.PI / 2, 0.7 * Math.PI, 0);

  rocketParts.finb = new THREE.Mesh(
    new THREE.BoxGeometry(40 * s, 8 * s, 18 * s),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
    })
  );
  scene.add(rocketParts.finb);
  rocketParts.finb.position.set(-16 * s, -10 * s, 0);
  rocketParts.finb.rotation.set(-Math.PI / 2, 0.7 * Math.PI, 0);

  // Flamme de la fusée
  var flame_material = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color("yellow") },
      color2: { value: new THREE.Color("red") },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      }
    `,
    wireframe: false,
  });

  rocket_fire = new THREE.Mesh(
    new THREE.CylinderGeometry(6 * s, 0, 20 * s, 64),
    flame_material
  );
  scene.add(rocket_fire);
  rocket_fire.position.y = -30 * s;

  // Regroupe toutes les parties dans un groupe
  rocket = new THREE.Group();
  rocket.add(
    rocketParts.midb,
    rocketParts.mida,
    rocketParts.midc,
    rocketParts.topa,
    rocketParts.topb,
    rocketParts.bota,
    rocketParts.botb,
    rocketParts.botc,
    rocketParts.topc,
    rocketParts.wina,
    rocketParts.winb,
    rocketParts.fina,
    rocketParts.finb,
    rocket_fire
  );
  rocket.position.y = 2.30;
  rocket.position.x = 0;
  rocket.position.z = 0;

  // Rotation de 300 degrés convertie en radians
  rocket.rotation.z = THREE.MathUtils.degToRad(300);
  scene.add(rocket);
};

export { rocket, rocket_fire, scBody, scWindow, scWing };
