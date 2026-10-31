// Les contes en décors à plusieurs plans : ciel, collines, sol, personnages.
// Chaque scène du conte devient un tableau. D'une scène à l'autre, les plans glissent
// et se fondent, chacun à sa vitesse : les plans proches bougent plus que le ciel.
import * as THREE from "three";
import { KAOLIN, NOIR, textureSVG, texturePoint } from "./textures.js";

export const CAM_Z = 12, FOV = 34;
const PLANS = [["ciel", -26, .6], ["collines", -15, 1.6], ["sol", -7, 3], ["elements", -2.5, 4.6]];
const MARGE = 1.08; // les plans débordent un peu du cadre

export function creerDecors() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NOIR);
  const contes = new Map(); // id du conte -> { tableaux, fini, promesse }
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  let actif = null, courant = 0, precedent = null, avance = 1, sens = 1, echelle = 1;

  // poussière lumineuse au premier plan
  const n = 160, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 22; pos[i * 3 + 1] = (Math.random() - .5) * 12; pos[i * 3 + 2] = Math.random() * 6 - 1; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const poussiere = new THREE.Points(geo, new THREE.PointsMaterial({ color: KAOLIN, size: .06, map: texturePoint(KAOLIN), transparent: true, opacity: .5, depthWrite: false, depthTest: false }));
  poussiere.renderOrder = 100;
  scene.add(poussiere);

  function charger(conte) {
    if (contes.has(conte.id)) return contes.get(conte.id).promesse;
    const entree = { tableaux: [], fini: false, groupe: new THREE.Group() };
    entree.promesse = (async () => {
      for (let i = 0; i < conte.scenes.length; i++) {
        const couches = window.couchesScene(conte.scenes[i]);
        const tableau = new THREE.Group();
        tableau.visible = false;
        tableau.userData.plans = [];
        for (let k = 0; k < PLANS.length; k++) {
          const [nom, z, vitesse] = PLANS[k];
          const tex = await textureSVG(couches[nom], nom === "ciel" ? 960 : 1280, nom === "ciel" ? 540 : 720);
          const dist = CAM_Z - z;
          const h = 2 * dist * tan * MARGE, l = h * 16 / 9;
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
          const plan = new THREE.Mesh(new THREE.PlaneGeometry(l, h), mat);
          plan.position.z = z;
          plan.scale.setScalar(echelle);
          plan.userData = { nom, rang: k, vitesse };
          tableau.add(plan);
          tableau.userData.plans.push(plan);
        }
        entree.tableaux.push(tableau);
        entree.groupe.add(tableau);
      }
      entree.fini = true;
      if (actif === conte.id) placer();
      return entree;
    })();
    contes.set(conte.id, entree);
    return entree.promesse;
  }

  // affiche un conte, sans transition (un fondu au noir vient d'avoir lieu)
  function montrer(id, i = 0) {
    contes.forEach((e, cle) => { if (cle !== id && e.groupe.parent) scene.remove(e.groupe); });
    const e = contes.get(id);
    if (e && !e.groupe.parent) scene.add(e.groupe);
    actif = id; courant = i; precedent = null; avance = 1;
    placer();
  }

  // passe à la scène i du conte affiché, avec une transition
  function aller(i) {
    if (i === courant) return;
    precedent = courant; courant = i; avance = 0; sens = Math.sign(i - precedent) || 1;
  }

  const doux = (x) => 1 - Math.pow(1 - x, 3);
  function placer() {
    const e = actif && contes.get(actif);
    if (!e || !e.fini) return;
    const a = doux(avance);
    e.tableaux.forEach((t, k) => {
      const entrant = k === courant, sortant = k === precedent && avance < 1;
      t.visible = entrant || sortant;
      if (!t.visible) return;
      t.userData.plans.forEach((p) => {
        const { rang, vitesse, nom } = p.userData;
        if (entrant) {
          p.material.opacity = a;
          p.position.x = (1 - a) * sens * vitesse;
          p.renderOrder = rang * 10 + 1;
        } else {
          p.material.opacity = nom === "ciel" ? 1 : 1 - a;
          p.position.x = -a * sens * vitesse;
          p.renderOrder = rang * 10;
        }
      });
    });
  }

  // libère la mémoire des contes éloignés
  function garder(ids) {
    contes.forEach((e, cle) => {
      if (ids.includes(cle)) return;
      e.groupe.traverse((o) => { if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); o.geometry.dispose(); } });
      if (e.groupe.parent) scene.remove(e.groupe);
      contes.delete(cle);
    });
  }

  return {
    scene, charger, montrer, aller, garder,
    pret: (id) => contes.has(id) && contes.get(id).fini,
    // écran plus large que 16/9 : on agrandit les plans pour ne pas voir leurs bords
    ajuster(aspect) {
      echelle = Math.max(1, aspect / (16 / 9));
      contes.forEach((e) => e.tableaux.forEach((t) => t.userData.plans.forEach((p) => p.scale.setScalar(echelle))));
    },
    // caméra : une lente dérive pendant la lecture de la scène (q de 0 à 1)
    vue(q) {
      const x = THREE.MathUtils.lerp(-.7, .7, q);
      return { pos: [x, THREE.MathUtils.lerp(.22, -.08, q), THREE.MathUtils.lerp(CAM_Z + .2, CAM_Z - .55, q)], vise: [x * .85, 0, -10] };
    },
    animer(t, dt) {
      if (avance < 1) { avance = Math.min(1, avance + dt * 1.25); placer(); }
      poussiere.rotation.z = Math.sin(t * .1) * .05;
      const e = actif && contes.get(actif);
      if (e && e.fini) e.tableaux[courant].userData.plans.forEach((p) => { if (p.userData.nom === "elements") p.position.y = Math.sin(t * 1.4) * .04; });
    },
    suivreCamera(camera) { poussiere.position.x = camera.position.x; },
  };
}
