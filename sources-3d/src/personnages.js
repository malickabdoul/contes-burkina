// Les personnes de la veillée : auditeurs assis sur des tabourets ou sur une natte, et le conteur debout.
// Vêtements en Faso Dan Fani (pagne tissé à rayures) aux couleurs du site.
import * as THREE from "three";
import { NOIR, KAOLIN, OCRE, ROUGE, VERT, JAUNE } from "./textures.js";

const PEAUX = ["#4B2C1B", "#5C3722", "#3E2416", "#6A4029"];

// tissu rayé, comme le Faso Dan Fani
function tissu(couleurs, largeurs) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 8;
  const g = c.getContext("2d");
  const total = largeurs.reduce((a, b) => a + b, 0);
  let x = 0;
  couleurs.forEach((couleur, i) => { const l = largeurs[i] / total * 128; g.fillStyle = couleur; g.fillRect(x, 0, l + 1, 8); x += l; });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  return new THREE.MeshStandardMaterial({ map: t, roughness: .95 });
}
export const TISSUS = [
  () => tissu([NOIR, KAOLIN, NOIR, ROUGE, NOIR, KAOLIN], [3, 1, 1, 2, 1, 1]),
  () => tissu([VERT, JAUNE, VERT, NOIR], [4, 1, 2, 1]),
  () => tissu([OCRE, KAOLIN, OCRE, NOIR], [4, 1, 3, 1]),
  () => tissu([KAOLIN, NOIR, KAOLIN, ROUGE], [5, 1, 3, 1]),
  () => tissu([ROUGE, NOIR, JAUNE, NOIR], [4, 1, 1, 1]),
  () => tissu([JAUNE, OCRE, JAUNE, NOIR], [3, 2, 3, 1]),
];

// un membre entre deux points : une capsule orientée de a vers b
const axeY = new THREE.Vector3(0, 1, 0);
function membre(a, b, r, mat) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const d = B.clone().sub(A), l = d.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(.001, l), 4, 10), mat);
  m.position.copy(A).add(B).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(axeY, d.normalize());
  return m;
}
function boule(p, r, mat, s = [1, 1, 1]) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat);
  m.position.set(...p); m.scale.set(...s);
  return m;
}

// tête : visage, cheveux ou coiffe ; regarde vers +Z
function tete(peau, coiffe, matCoiffe) {
  const g = new THREE.Group();
  g.add(boule([0, 0, 0], .105, peau, [.88, 1.08, .96]));
  g.add(boule([0, -.075, .03], .06, peau, [1.1, .7, 1]));             // mâchoire
  g.add(boule([0, -.005, .095], .022, peau, [1, .8, 1]));             // nez
  g.add(boule([-.098, -.005, 0], .024, peau, [.5, 1, .8]), boule([.098, -.005, 0], .024, peau, [.5, 1, .8])); // oreilles
  const sombre = new THREE.MeshStandardMaterial({ color: "#120C08", roughness: 1 });
  if (coiffe === "foulard") {
    g.add(boule([0, .05, -.01], .118, matCoiffe, [1.02, .85, 1.08]));
    g.add(boule([0, .1, -.1], .06, matCoiffe, [1.4, .9, 1]));         // nœud
  } else if (coiffe === "bonnet") {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(.095, .1, .09, 18), matCoiffe);
    b.position.set(0, .085, -.005); b.rotation.x = -.12;
    g.add(b);
  } else {
    g.add(boule([0, .03, -.012], .103, sombre, [.9, 1, .97]));        // cheveux courts
  }
  return g;
}

// mains et pieds
const pied = (p, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.085, .05, .2), mat); m.position.set(...p); return m; };

/**
 * Personne assise. o.siege : "tabouret" | "sol" ; o.coiffe : "foulard" | "bonnet" | "" ;
 * o.femme : pagne sur les jambes ; o.pose : "genoux" (coudes sur les genoux) | "menton" (main sous le menton) | "bras" (bras autour des genoux)
 */
export function personneAssise(o = {}) {
  const g = new THREE.Group();
  const peau = new THREE.MeshStandardMaterial({ color: o.peau || PEAUX[0], roughness: .78 });
  const habit = o.habit || TISSUS[0]();
  const bas = o.bas || habit;
  const h = o.siege === "sol" ? .1 : .3;               // hauteur du bassin
  if (o.siege !== "sol") {
    const bois = new THREE.MeshStandardMaterial({ color: "#2A1A10", roughness: .9 });
    const assise = new THREE.Mesh(new THREE.CylinderGeometry(.17, .15, .05, 16), bois); assise.position.y = .235;
    const pied1 = new THREE.Mesh(new THREE.CylinderGeometry(.1, .14, .21, 12), bois); pied1.position.y = .105;
    g.add(assise, pied1);
  }
  // jambes
  const genouY = o.siege === "sol" ? .42 : h + .04, genouZ = o.siege === "sol" ? .3 : .4;
  const piedZ = o.siege === "sol" ? .4 : .44;
  [-1, 1].forEach((s) => {
    g.add(membre([s * .09, h, .02], [s * .11, genouY, genouZ], .075, bas));
    g.add(membre([s * .11, genouY, genouZ], [s * .12, .07, piedZ], .055, o.femme ? bas : peau));
    g.add(pied([s * .12, .025, piedZ + .06], peau));
  });
  // buste, penché vers le feu
  const buste = new THREE.Group();
  buste.position.set(0, h, 0);
  buste.rotation.x = o.pose === "bras" ? .38 : .2;
  const corps = new THREE.Mesh(new THREE.CylinderGeometry(.17, .2, .48, 18), habit);
  corps.position.y = .27;
  const epaules = boule([0, .5, 0], .19, habit, [1.05, .42, .75]);
  const cou = new THREE.Mesh(new THREE.CylinderGeometry(.045, .05, .1, 10), peau); cou.position.y = .58;
  const t = tete(peau, o.coiffe, o.matCoiffe || habit);
  t.position.set(0, .71, .02);
  t.rotation.x = -.18 - (o.pose === "bras" ? .2 : 0);
  buste.add(corps, epaules, cou, t);
  g.add(buste);
  // bras, en coordonnées du groupe (le buste est penché)
  const ep = (s) => new THREE.Vector3(s * .2, .48, 0).applyEuler(buste.rotation).add(buste.position).toArray();
  [-1, 1].forEach((s) => {
    const e = ep(s);
    let coude, main;
    if (o.pose === "bras") { coude = [s * .26, genouY - .02, genouZ - .05]; main = [s * .02, genouY - .06, genouZ + .1]; }
    else if (o.pose === "menton" && s === 1) { coude = [.13, genouY + .04, genouZ - .02]; main = [.03, h + .55, .32]; }
    else { coude = [s * .17, genouY + .05, genouZ - .04]; main = [s * .07, genouY + .02, genouZ + .12]; }
    g.add(membre(e, coude, .052, habit));
    g.add(membre(coude, main, .042, peau));
    g.add(boule(main, .045, peau));
  });
  g.userData.tete = t;
  g.userData.phase = Math.random() * 10;
  return g;
}

/** Le conteur, debout, en grand boubou, une main levée et l'autre sur son bâton. */
export function conteur(o = {}) {
  const g = new THREE.Group();
  const peau = new THREE.MeshStandardMaterial({ color: o.peau || PEAUX[1], roughness: .78 });
  const boubou = o.habit || TISSUS[3]();
  const bois = new THREE.MeshStandardMaterial({ color: "#2A1A10", roughness: .9 });
  // grand boubou : une robe large des épaules aux chevilles
  const profil = [[.06, 0], [.4, .08], [.36, .5], [.29, .9], [.24, 1.25], [.25, 1.38], [.12, 1.47], [.05, 1.49]].map(([x, y]) => new THREE.Vector2(x, y));
  const robe = new THREE.Mesh(new THREE.LatheGeometry(profil, 28), boubou);
  robe.position.y = .03;
  robe.material.side = THREE.DoubleSide;
  g.add(robe);
  [-1, 1].forEach((s) => g.add(pied([s * .1, .025, .08], peau)));
  const cou = new THREE.Mesh(new THREE.CylinderGeometry(.05, .055, .12, 10), peau); cou.position.y = 1.55;
  const t = tete(peau, "bonnet", o.matCoiffe || new THREE.MeshStandardMaterial({ color: ROUGE, roughness: .9 }));
  t.position.set(0, 1.71, .01);
  g.add(cou, t);
  // bras gauche : la main sur le bâton
  g.add(membre([-.25, 1.4, 0], [-.36, 1.12, .12], .07, boubou));
  g.add(membre([-.36, 1.12, .12], [-.34, 1.0, .3], .045, peau));
  g.add(boule([-.34, 1.0, .3], .05, peau));
  const baton = membre([-.34, .02, .34], [-.34, 1.75, .3], .022, bois);
  g.add(baton);
  // bras droit levé : il raconte (articulé à l'épaule pour bouger doucement)
  const bras = new THREE.Group();
  bras.position.set(.25, 1.4, 0);
  bras.add(membre([0, 0, 0], [.16, .2, .14], .075, boubou));     // manche large
  bras.add(membre([.16, .2, .14], [.18, .45, .2], .045, peau));
  bras.add(boule([.18, .48, .2], .052, peau, [1, 1.2, .7]));
  g.add(bras);
  g.userData = { bras, tete: t, phase: 0 };
  return g;
}

/** Natte tressée posée au sol. */
export function natte(l = 1.2, p = .8) {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const x = c.getContext("2d");
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? OCRE : JAUNE; x.fillRect(0, i * 8, 64, 8); }
  x.fillStyle = NOIR; for (let i = 0; i < 64; i += 16) x.fillRect(i, 0, 2, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(l, p), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  m.rotation.x = -Math.PI / 2; m.position.y = .012;
  return m;
}

/** Petits mouvements : respiration, têtes qui suivent le conteur, main du conteur qui parle. */
export function animerPersonnes(personnes, t) {
  personnes.forEach((p) => {
    const d = p.userData;
    if (d.bras) {
      d.bras.rotation.z = Math.sin(t * 1.3) * .22 - .05;
      d.bras.rotation.x = Math.sin(t * .9 + 1) * .15;
      d.tete.rotation.y = Math.sin(t * .5) * .35;
    } else if (d.tete) {
      d.tete.rotation.y = d.regard + Math.sin(t * .35 + d.phase) * .08;
      p.scale.y = (d.echelle || 1) * (1 + Math.sin(t * 1.6 + d.phase) * .006);
    }
  });
}
