// Carte du Burkina Faso en relief : 17 régions en argile kaolin sur un socle d'ocre, sept feux.
import * as THREE from "three";
import { NOIR, KAOLIN, OCRE, ROUGE, JAUNE } from "./textures.js";
import { creerFeu, ciel } from "./village.js";

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
