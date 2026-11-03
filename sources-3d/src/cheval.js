// Un cavalier qui traverse la carte, d'un feu à l'autre, pendant le voyage.
import * as THREE from "three";
import { NOIR, KAOLIN, ROUGE, JAUNE } from "./textures.js";

const axeY = new THREE.Vector3(0, 1, 0);
function membre(a, b, r, mat) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const d = B.clone().sub(A), l = d.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(.001, l), 3, 8), mat);
  m.position.copy(A).add(B).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(axeY, d.normalize());
  return m;
}
const boule = (p, r, mat, s = [1, 1, 1]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat); m.position.set(...p); m.scale.set(...s); return m; };

/** Cheval brun et son cavalier en tunique rouge ; il regarde vers +Z. Unité : 1 = longueur du cheval environ. */
export function creerCavalier() {
  const g = new THREE.Group();
  const robe = new THREE.MeshStandardMaterial({ color: "#6B4226", roughness: .8 });
  const crin = new THREE.MeshStandardMaterial({ color: "#1E140D", roughness: .9 });
  const peau = new THREE.MeshStandardMaterial({ color: "#4B2C1B", roughness: .8 });
  const tunique = new THREE.MeshStandardMaterial({ color: ROUGE, roughness: .85 });
  const selle = new THREE.MeshStandardMaterial({ color: JAUNE, roughness: .7 });
  const bois = new THREE.MeshStandardMaterial({ color: "#2A1A10", roughness: .9 });
  const fer = new THREE.MeshStandardMaterial({ color: KAOLIN, roughness: .4, metalness: .3 });

  // corps, encolure, tête
  g.add(boule([0, .62, 0], .2, robe, [1, .95, 2.2]));
  g.add(membre([0, .72, .36], [0, 1.0, .58], .1, robe));
  g.add(membre([0, 1.02, .6], [0, .9, .86], .075, robe));
  g.add(boule([0, .9, .9], .065, crin, [1, .9, 1]));                 // naseaux
  g.add(membre([-.05, 1.1, .6], [-.04, 1.18, .58], .02, robe), membre([.05, 1.1, .6], [.04, 1.18, .58], .02, robe)); // oreilles
  g.add(membre([0, 1.06, .52], [0, .82, .3], .035, crin));            // crinière
  g.add(membre([0, .7, -.42], [0, .35, -.58], .045, crin));           // queue
  g.add(boule([0, .84, -.02], .15, selle, [1.25, .3, 1.3]));          // selle

  // jambes : chacune pivote à la hanche ou à l'épaule
  const jambes = [];
  [[-.11, .36], [.11, .36], [-.11, -.32], [.11, -.32]].forEach(([x, z], i) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, .55, z);
    pivot.add(membre([0, 0, 0], [0, -.5, 0], .045, robe));
    pivot.add(boule([0, -.53, .02], .05, crin, [1, .6, 1.2]));       // sabot
    g.add(pivot);
    jambes.push({ pivot, phase: i === 0 || i === 3 ? 0 : Math.PI });
  });

  // cavalier : jambes de part et d'autre, buste droit, lance
  [-1, 1].forEach((s) => { g.add(membre([s * .16, .86, .02], [s * .2, .58, .12], .045, tunique)); g.add(membre([s * .2, .58, .12], [s * .19, .42, .06], .035, peau)); });
  g.add(membre([0, .92, -.02], [0, 1.28, .02], .1, tunique));
  g.add(boule([0, 1.44, .04], .085, peau));
  const bonnet = new THREE.Mesh(new THREE.CylinderGeometry(.075, .08, .07, 12), tunique);
  bonnet.position.set(0, 1.51, .03); g.add(bonnet);
  g.add(membre([.12, 1.22, 0], [.14, 1.02, .2], .035, tunique));
  g.add(membre([-.12, 1.22, 0], [-.08, 1.0, .25], .035, tunique));   // rênes en main
  const lance = new THREE.Group();
  lance.add(membre([.16, .7, .1], [.16, 1.9, .3], .014, bois));
  const pointe = new THREE.Mesh(new THREE.ConeGeometry(.03, .14, 8), fer);
  pointe.position.set(.16, 1.97, .315); pointe.rotation.x = .16; lance.add(pointe);
  g.add(lance);

  g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  g.userData = { jambes, pas: 0 };
  return g;
}

/** Fait marcher le cheval : allure entre 0 (à l'arrêt) et 1 (au trot). */
export function animerCavalier(g, dt, allure) {
  const d = g.userData;
  d.pas += dt * (2 + allure * 8);
  d.jambes.forEach((j) => { j.pivot.rotation.x = Math.sin(d.pas + j.phase) * .55 * allure; });
  g.children[0].position.y = .62 + Math.abs(Math.sin(d.pas)) * .03 * allure;
}
