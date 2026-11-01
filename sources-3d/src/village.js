// La concession de Tiébélé, de nuit, autour du feu de la veillée.
import * as THREE from "three";
import { NOIR, KAOLIN, OCRE, JAUNE, ROUGE, texturePeinte, textureFlamme, texturePoint, textureAnneaux, textureFrise } from "./textures.js";
import { personneAssise, conteur as creerConteur, natte, animerPersonnes, TISSUS } from "./personnages.js";

export function creerFeu(scene, echelle = 1, avecBraises = true, force = 24, portee = 26) {
  const groupe = new THREE.Group();
  const bois = new THREE.MeshStandardMaterial({ color: NOIR, roughness: 1 });
  for (let i = 0; i < 4; i++) {
    const buche = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, 1, 6), bois);
    buche.rotation.z = Math.PI / 2;
    buche.rotation.y = i * Math.PI / 4;
    buche.position.y = .06;
    groupe.add(buche);
  }
  const pierres = new THREE.MeshStandardMaterial({ color: OCRE, roughness: 1 });
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.DodecahedronGeometry(.11, 0), pierres);
    p.position.set(Math.cos(a) * .62, .05, Math.sin(a) * .62);
    groupe.add(p);
  }
  const tex = textureFlamme();
  const flammes = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const s = new THREE.Sprite(m);
    s.center.set(.5, 0);
    s.scale.set(.55, 1.1, 1);
    s.position.set((i - 1.5) * .12, .05, (i % 2) * .08 - .04);
    s.userData.phase = Math.random() * 10;
    groupe.add(s); flammes.push(s);
  }
  const lumiere = new THREE.PointLight(JAUNE, force, portee, 1.6);
  lumiere.position.y = .9;
  groupe.add(lumiere);
  // braises qui montent
  let braises = null;
  if (avecBraises) {
    const n = 140, pos = new Float32Array(n * 3), vit = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * .5; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = (Math.random() - .5) * .5; vit[i] = .5 + Math.random() * 1.1; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    braises = new THREE.Points(geo, new THREE.PointsMaterial({ color: JAUNE, size: .06, map: texturePoint(JAUNE), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    braises.userData.vit = vit;
    groupe.add(braises);
  }
  groupe.scale.setScalar(echelle);
  scene.add(groupe);
  return {
    groupe, lumiere,
    animer(t, dt) {
      flammes.forEach((s, i) => {
        const k = Math.sin(t * 9 + s.userData.phase) * .08 + Math.sin(t * 23 + i) * .05;
        s.scale.set(.5 + k, 1.05 + k * 2.4, 1);
        s.material.rotation = Math.sin(t * 5 + i) * .08;
      });
      lumiere.intensity = force * (1 + Math.sin(t * 13) * .12 + Math.sin(t * 31) * .08);
      if (braises) {
        const p = braises.geometry.attributes.position, v = braises.userData.vit;
        for (let i = 0; i < v.length; i++) {
          let y = p.getY(i) + v[i] * dt;
          let x = p.getX(i) + Math.sin(t * 2 + i) * dt * .25;
          if (y > 7) { y = .2; x = (Math.random() - .5) * .4; }
          p.setY(i, y); p.setX(i, x);
        }
        p.needsUpdate = true;
      }
    },
  };
}

export function ciel(scene, nombre = 1600, rayon = 120) {
  const pos = new Float32Array(nombre * 3);
  for (let i = 0; i < nombre; i++) {
    const u = Math.random(), v = Math.random() * .48 + .02;
    const th = u * Math.PI * 2, ph = Math.acos(1 - v);
    pos[i * 3] = rayon * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = rayon * Math.cos(ph) - 6;
    pos[i * 3 + 2] = rayon * Math.sin(ph) * Math.sin(th);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const etoiles = new THREE.Points(geo, new THREE.PointsMaterial({ color: KAOLIN, size: .55, map: texturePoint(KAOLIN), transparent: true, depthWrite: false, fog: false }));
  scene.add(etoiles);
  const lune = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureAnneaux(KAOLIN), transparent: true, depthWrite: false, fog: false }));
  lune.scale.set(16, 16, 1);
  lune.position.set(-38, 46, -70);
  scene.add(lune);
  return etoiles;
}

function maisonRonde(rayon, hauteur, variante) {
  const g = new THREE.Group();
  const murs = new THREE.Mesh(new THREE.CylinderGeometry(rayon, rayon * 1.04, hauteur, 40, 1, true),
    new THREE.MeshStandardMaterial({ map: texturePeinte(variante, true, Math.max(1, Math.round(rayon))), roughness: .95, side: THREE.DoubleSide }));
  murs.position.y = hauteur / 2;
  g.add(murs);
  const toit = new THREE.Mesh(new THREE.CylinderGeometry(rayon * 1.02, rayon * 1.02, .08, 40), new THREE.MeshStandardMaterial({ color: OCRE, roughness: 1 }));
  toit.position.y = hauteur;
  g.add(toit);
  const parapet = new THREE.Mesh(new THREE.CylinderGeometry(rayon * 1.05, rayon * 1.05, .22, 40, 1, true), new THREE.MeshStandardMaterial({ color: NOIR, roughness: 1, side: THREE.DoubleSide }));
  parapet.position.y = hauteur + .1;
  g.add(parapet);
  return g;
}

function maisonCarree(l, p, h, variante) {
  const g = new THREE.Group();
  const matMur = new THREE.MeshStandardMaterial({ map: texturePeinte(variante, true, 1), roughness: .95 });
  const matCote = new THREE.MeshStandardMaterial({ map: texturePeinte(variante + 1, false, 1), roughness: .95 });
  const corps = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), [matCote, matCote, new THREE.MeshStandardMaterial({ color: OCRE }), new THREE.MeshStandardMaterial({ color: OCRE }), matMur, matCote]);
  corps.position.y = h / 2;
  g.add(corps);
  const rebord = new THREE.Mesh(new THREE.BoxGeometry(l + .12, .2, p + .12), new THREE.MeshStandardMaterial({ color: NOIR }));
  rebord.position.y = h + .08;
  g.add(rebord);
  return g;
}

export function creerVillage() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NOIR);
  scene.fog = new THREE.FogExp2(NOIR, .024);
  scene.add(new THREE.HemisphereLight(KAOLIN, OCRE, .5));
  const luneLumiere = new THREE.DirectionalLight(KAOLIN, .8);
  luneLumiere.position.set(-20, 30, -30);
  scene.add(luneLumiere);

  // sol de terre battue
  const sol = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ color: OCRE, roughness: 1 }));
  sol.rotation.x = -Math.PI / 2;
  scene.add(sol);
  const cour = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.32, 48), new THREE.MeshBasicMaterial({ color: NOIR }));
  cour.rotation.x = -Math.PI / 2; cour.position.y = .01;
  scene.add(cour);

  // maisons peintes, porte tournée vers le feu
  const maisons = [
    [maisonRonde(1.45, 2.4, 0), -4.2, -3],
    [maisonCarree(3.2, 2.2, 2.3, 1), 3.4, -4.6],
    [maisonRonde(1.1, 2.0, 2), 5.2, 1.4],
    [maisonRonde(1.0, 2.1, 1), -5.6, 2.3],
    [maisonRonde(.95, 2.05, 0), -4.3, 3.6],
    [maisonCarree(2.6, 2, 2.1, 2), -.4, -6.8],
    [maisonRonde(1.25, 2.3, 2), 6.6, -2.4],
  ];
  maisons.forEach(([m, x, z]) => {
    m.position.set(x, 0, z);
    m.lookAt(0, 0, 0);
    if (m.children[0].geometry.type === "CylinderGeometry") m.rotateY(Math.PI); // la porte (u = 0,5) regarde -Z
    scene.add(m);
  });

  // mur bas de la concession, avec frise
  const frise = textureFrise();
  frise.repeat.set(18, 1);
  const enceinte = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 10.5, .9, 96, 1, true, .5, Math.PI * 1.75),
    new THREE.MeshStandardMaterial({ map: frise, roughness: 1, side: THREE.DoubleSide }));
  enceinte.position.y = .45;
  scene.add(enceinte);

  // les auditeurs, assis autour du feu, et le conteur debout
  const conteur = creerConteur({ habit: TISSUS[3]() });
  conteur.position.set(-1.35, 0, -1.7);
  conteur.lookAt(.9, 0, 1.6);
  scene.add(conteur);
  const tapis = natte(1.3, .8);
  tapis.position.set(-.72, .012, 2.05); tapis.rotation.z = .35;
  scene.add(tapis);
  const kaolinBonnet = new THREE.MeshStandardMaterial({ color: KAOLIN, roughness: .9 });
  const rougeBonnet = new THREE.MeshStandardMaterial({ color: ROUGE, roughness: .9 });
  const auditeurs = [
    { x: -1.9, z: .8, o: { siege: "tabouret", coiffe: "bonnet", matCoiffe: rougeBonnet, pose: "genoux", habit: TISSUS[0](), peau: "#4B2C1B" } },
    { x: -1.05, z: 1.95, o: { siege: "sol", femme: true, coiffe: "foulard", pose: "genoux", habit: TISSUS[1](), bas: TISSUS[5](), peau: "#5C3722" } },
    { x: -.35, z: 2.2, e: .62, o: { siege: "sol", pose: "bras", habit: TISSUS[4](), peau: "#6A4029" } },
    { x: .65, z: 2.1, o: { siege: "tabouret", coiffe: "bonnet", matCoiffe: kaolinBonnet, pose: "menton", habit: TISSUS[2](), peau: "#3E2416" } },
    { x: 1.75, z: 1.3, o: { siege: "tabouret", femme: true, coiffe: "foulard", pose: "genoux", habit: TISSUS[4](), bas: TISSUS[0](), peau: "#4B2C1B" } },
    { x: 2.2, z: .15, e: .6, o: { siege: "sol", pose: "bras", habit: TISSUS[1](), peau: "#5C3722" } },
    { x: -2.2, z: -.75, o: { siege: "tabouret", pose: "genoux", habit: TISSUS[5](), peau: "#6A4029" } },
  ];
  const personnes = [conteur];
  auditeurs.forEach(({ x, z, e = 1, o }) => {
    const p = personneAssise(o);
    p.position.set(x, 0, z);
    p.scale.setScalar(e);
    p.userData.echelle = e;
    p.lookAt(0, 0, 0);
    scene.add(p);
    // la tête se tourne vers le conteur
    p.updateMatrixWorld();
    const v = p.worldToLocal(conteur.position.clone().setY(1.5));
    p.userData.regard = THREE.MathUtils.clamp(Math.atan2(v.x, v.z), -.75, .75);
    personnes.push(p);
  });

  // arbre au fond
  const matOmbre = new THREE.MeshStandardMaterial({ color: NOIR, roughness: 1 });
  const tronc = new THREE.Mesh(new THREE.CylinderGeometry(.5, .9, 4.5, 10), matOmbre);
  tronc.position.set(-9, 2.25, -9);
  scene.add(tronc);
  [[-9, 5.2, -9, 2.4], [-7.6, 4.6, -8.6, 1.6], [-10.4, 4.7, -9.4, 1.7]].forEach(([x, y, z, r]) => {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), matOmbre);
    f.position.set(x, y, z); scene.add(f);
  });

  const feu = creerFeu(scene, 1.2);
  const etoiles = ciel(scene);

  // trajet de la caméra pendant l'ouverture (p de 0 à 1)
  const cles = [
    { p: 0, pos: [-4, 11, 24], vise: [-6.5, 1.5, 0] },
    { p: .35, pos: [7, 5, 12], vise: [0, 1, 0] },
    { p: .6, pos: [2.4, 1.5, 4.2], vise: [-.9, 1, -.6] },
    { p: .82, pos: [1.5, 1.2, 3.3], vise: [-1.3, 1.15, -1.6] },
    { p: 1, pos: [.8, 2.4, 2.6], vise: [0, 14, -2] },
  ];
  return {
    scene, cles,
    animer(t, dt) { feu.animer(t, dt); etoiles.rotation.y = t * .004; animerPersonnes(personnes, t); },
  };
}
