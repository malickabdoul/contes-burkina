// Carte du Burkina Faso en relief : 17 régions en argile kaolin sur un socle d'ocre, sept feux.
import * as THREE from "three";
import { NOIR, KAOLIN, OCRE, ROUGE, JAUNE } from "./textures.js";
import { creerFeu, ciel } from "./village.js";
import { creerCavalier, animerCavalier } from "./cheval.js";

const S = 100, CX = 520, CY = 387, HAUT = .22;

function points(d) {
  const nb = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const pts = [];
  for (let i = 0; i < nb.length; i += 2) pts.push(new THREE.Vector2((nb[i] - CX) / S, -(nb[i + 1] - CY) / S));
  return pts;
}

export function versMonde(x, y) { return new THREE.Vector3((x - CX) / S, HAUT, (y - CY) / S); }

export function creerCarte(CARTE, CONTES, VOYAGE) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NOIR);
  scene.fog = new THREE.Fog(NOIR, 14, 34);
  scene.add(new THREE.HemisphereLight(KAOLIN, NOIR, .55));
  const lune = new THREE.DirectionalLight(KAOLIN, .9);
  lune.position.set(-6, 12, -4);
  scene.add(lune);
  ciel(scene, 1200, 60);

  // socle du pays
  const contour = new THREE.Shape(points(CARTE.contour));
  const socle = new THREE.Mesh(new THREE.ExtrudeGeometry(contour, { depth: .55, bevelEnabled: false }),
    [new THREE.MeshStandardMaterial({ color: NOIR, roughness: 1 }), new THREE.MeshStandardMaterial({ color: OCRE, roughness: 1 })]);
  socle.rotation.x = -Math.PI / 2;
  socle.position.y = -.55;
  scene.add(socle);

  // régions
  const regions = [];
  const matCote = new THREE.MeshStandardMaterial({ color: OCRE, roughness: 1 });
  const matTrait = new THREE.LineBasicMaterial({ color: OCRE });
  CARTE.regions.forEach((r) => {
    const pts = points(r.d);
    const forme = new THREE.Shape(pts);
    const dessus = new THREE.MeshStandardMaterial({ color: KAOLIN, roughness: .92 });
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(forme, { depth: HAUT, bevelEnabled: false }), [dessus, matCote]);
    m.rotation.x = -Math.PI / 2;
    m.userData = { region: r, dessus, hauteur: 0 };
    const trait = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, HAUT + .004))), matTrait);
    m.add(trait);
    scene.add(m);
    regions.push(m);
  });
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: NOIR, roughness: 1 }));
  sol.rotation.x = -Math.PI / 2; sol.position.y = -.56;
  scene.add(sol);

  // feux des contes
  const p = CARTE.projection;
  const lieux = {};
  const feux = CONTES.map((c) => {
    const x = (c.lon - p.minLon) * p.k * p.echelle + p.marge, y = (p.maxLat - c.lat) * p.echelle + p.marge;
    const pos = versMonde(x, y);
    lieux[c.id] = pos;
    const f = creerFeu(scene, .3, true, 2.2, 3.2);
    f.groupe.position.copy(pos);
    return f;
  });

  // chemin du voyage, révélé au fil des contes
  const pts = VOYAGE.map((id) => lieux[id]);
  const chemin = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const courbe = new THREE.QuadraticBezierCurve3(a.clone().setY(HAUT + .02), a.clone().lerp(b, .5).setY(HAUT + .02 + a.distanceTo(b) * .28), b.clone().setY(HAUT + .02));
    chemin.push(...courbe.getPoints(40));
  }
  const geoChemin = new THREE.BufferGeometry().setFromPoints(chemin);
  const ligne = new THREE.Line(geoChemin, new THREE.LineDashedMaterial({ color: JAUNE, dashSize: .12, gapSize: .08 }));
  ligne.computeLineDistances();
  geoChemin.setDrawRange(0, 0);
  scene.add(ligne);

  // le cavalier : il part du feu précédent et marche jusqu'au feu du conte
  const cavalier = creerCavalier();
  cavalier.scale.setScalar(.34);
  scene.add(cavalier);
  const sonde = new THREE.Raycaster(), bas = new THREE.Vector3(0, -1, 0);
  const posCavalier = new THREE.Vector3(), visee = new THREE.Vector3();
  let allure = 0;
  // point d'arrêt : un peu avant le feu, pour ne pas marcher dans les flammes
  const arret = (a, b) => b.clone().sub(a).setY(0).normalize().multiplyScalar(-.38).add(b);
  function placerCavalier(n, t, dt) {
    const b = lieux[VOYAGE[n]];
    const a = n > 0 ? lieux[VOYAGE[n - 1]] : b.clone().add(new THREE.Vector3(-.9, 0, 1));
    const depart = n > 0 ? arret(b, a).lerp(a, .4) : a, but = arret(a, b);
    const avant = posCavalier.clone();
    posCavalier.lerpVectors(depart, but, t);
    // il pose les sabots sur la région qu'il traverse
    sonde.set(posCavalier.clone().setY(5), bas);
    const sol = sonde.intersectObjects(regions, false)[0];
    posCavalier.y = sol ? sol.point.y : HAUT;
    cavalier.position.copy(posCavalier);
    visee.copy(but).setY(posCavalier.y);
    if (t < .999) cavalier.lookAt(visee); else cavalier.lookAt(b.clone().setY(posCavalier.y));
    const vitesse = dt > 0 ? avant.distanceTo(posCavalier) / dt : 0;
    allure += (Math.min(1, vitesse * 1.6) - allure) * Math.min(1, dt * 6);
    animerCavalier(cavalier, dt, allure);
  }

  // survol
  let survolee = null;
  function survoler(m) {
    if (survolee === m) return;
    if (survolee) survolee.userData.dessus.color.set(KAOLIN);
    survolee = m;
    if (m) m.userData.dessus.color.set(ROUGE);
  }

  return {
    scene, regions, lieux,
    survoler,
    etiquettes: CARTE.regions.map((r) => ({ nom: r.nom, pos: versMonde(r.lx, r.ly) })),
    vueEnsemble: { pos: [0, 9.5, 8.2], vise: [0, -.2, .5] },
    vueConte(id) { const l = lieux[id]; return { pos: [l.x + 1.4, 2.5, l.z + 3.1], vise: [l.x, .1, l.z] }; },
    placerCavalier,
    montrerChemin(etape) { geoChemin.setDrawRange(0, Math.round(Math.max(0, etape) * 41)); },
    animer(t, dt) {
      feux.forEach((f) => f.animer(t, dt));
      regions.forEach((m) => {
        const cible = m === survolee ? .12 : 0;
        m.position.y += (cible - m.position.y) * Math.min(1, dt * 8);
      });
    },
  };
}
