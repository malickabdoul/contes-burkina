// Veillées du Faso, version immersive : une nuit de contes, pilotée par le défilement.
import * as THREE from "three";
import { creerVillage } from "./village.js";
import { creerCarte } from "./carte3d.js";
import { creerDecors, FOV } from "./decors.js";

const { CARTE, CONTES, VOYAGE } = window;
const $ = (s, el = document) => el.querySelector(s);
const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
const parId = (id) => CONTES.find((c) => c.id === id);
const echapper = (t) => String(t).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const borne = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ---------------------------------------------------------------- WebGL disponible ?
function webglOk() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}
if (!webglOk()) { location.replace("simple.html"); throw new Error("WebGL indisponible"); }

// ---------------------------------------------------------------- chapitres des contes
const recit = $("#recit");
const final = $("#final");
VOYAGE.forEach((id, n) => {
  const c = parId(id);
  const sec = document.createElement("section");
  sec.className = "chapitre conte";
  sec.id = "c-" + id;
  sec.setAttribute("aria-labelledby", "t-" + id);
  let h = `<div class="etape" data-scene="carte" data-conte="${id}" data-voix="${id}-titre">
      <div class="cartel cartel-titre">
        <p class="numero">Conte ${n + 1} sur ${VOYAGE.length}</p>
        <h2 id="t-${id}">${echapper(c.titre)}</h2>
        <p class="lieu">${echapper(c.genre)}, ${echapper(c.lieu)}, région du ${echapper(c.region)}</p>
      </div>
    </div>`;
  c.scenes.forEach((s, i) => {
    h += `<div class="etape" data-scene="decor" data-conte="${id}" data-i="${i}" data-voix="${id}-${i + 1}">
      <div class="cartel cartel-scene"><p>${echapper(s.texte)}</p></div>
    </div>`;
  });
  const suivant = n < VOYAGE.length - 1 ? `<a class="bouton-discret clair" href="#c-${VOYAGE[n + 1]}">Conte suivant</a>` : `<a class="bouton-discret clair" href="#final">Finir la veillée</a>`;
  h += `<div class="etape" data-scene="decor" data-conte="${id}" data-i="${c.scenes.length - 1}" data-fin="1" data-voix="${id}-fin">
      <div class="cartel cartel-fin">
        <h3>Ce que le conte nous apprend</h3>
        <p>${echapper(c.lecon)}</p>
        <div class="boutons">
          <button type="button" class="bouton-feu" data-ouvrir="${id}">Écouter les voix et répondre au quiz</button>
          ${suivant}
        </div>
      </div>
    </div>`;
  sec.innerHTML = h;
  recit.insertBefore(sec, final);
});

// menu des contes
$("#menu-liste").innerHTML = VOYAGE.map((id, n) => `<li><a href="#c-${id}"><span>${n + 1}</span><b>${echapper(parId(id).titre)} <em>(${echapper(parId(id).region)})</em></b></a></li>`).join("");
const menu = $("#menu-contes"), boutonMenu = $("#bouton-menu");
function fermerMenu() { menu.hidden = true; boutonMenu.setAttribute("aria-expanded", "false"); }
boutonMenu.addEventListener("click", () => { const o = menu.hidden; menu.hidden = !o; boutonMenu.setAttribute("aria-expanded", String(o)); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { fermerMenu(); boutonMenu.focus(); } });
document.addEventListener("click", (e) => { if (!menu.hidden && !e.target.closest(".entete")) fermerMenu(); });

// sections de fin : régions, lexique, sources
$("#grille-regions").innerHTML = CARTE.regions.map((r) => `<div><dt>${echapper(r.nom)}${r.chefLieu ? `<span>${echapper(r.chefLieu)}</span>` : ""}</dt><dd>${echapper(r.sens)}</dd></div>`).join("");
$("#liste-lexique").innerHTML = window.LEXIQUE.map((m) => `<div><dt>${echapper(m.mot)}<span>${echapper(m.langue)}</span></dt><dd>${echapper(m.sens)}</dd></div>`).join("");
const lien = (s) => s.url ? `<li><a href="${s.url}" target="_blank" rel="noopener">${echapper(s.titre)}</a></li>` : `<li>${echapper(s.titre)}</li>`;
$("#liste-sources").innerHTML = CONTES.map((c) => `<div><h3>${echapper(c.titre)}</h3><ul>${c.sources.map(lien).join("")}</ul></div>`).join("")
  + `<div><h3>La cour royale de Tiébélé</h3><ul>${(window.SOURCES_TIEBELE || []).map(lien).join("")}</ul></div>`
  + `<div><h3>Carte et noms des régions</h3><ul>${window.SOURCES_GENERALES.map(lien).join("")}</ul></div>`;
$(".astuce-carte").textContent = matchMedia("(hover: none)").matches ? "Touchez une région pour lire l'histoire de son nom." : "Survolez une région pour lire l'histoire de son nom.";

// ---------------------------------------------------------------- rendu
const toile = $("#scene3d");
const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, powerPreference: "high-performance" });
rendu.setPixelRatio(Math.min(devicePixelRatio, 1.6));
rendu.outputColorSpace = THREE.SRGBColorSpace;
const camera = new THREE.PerspectiveCamera(42, 1, .05, 400);

const village = creerVillage();
const carte = creerCarte(CARTE, CONTES, VOYAGE);
const decors = creerDecors();
const SCENES = { village: village.scene, carte: carte.scene, decor: decors.scene };
const brouillard = { pres: carte.scene.fog.near, loin: carte.scene.fog.far };

let sceneAffichee = "village", conteAffiche = null, enTransition = false, saut = false;
let aspect = 1;
const recul = () => borne(1.25 / aspect, 1, 2.6);
function taille() {
  const l = toile.clientWidth || innerWidth, h = toile.clientHeight || innerHeight;
  rendu.setSize(l, h, false);
  aspect = l / h;
  camera.aspect = aspect;
  decors.ajuster(aspect);
  // écran en hauteur : on recule au-dessus de la carte pour la voir en entier
  const k = recul();
  carte.scene.fog.near = brouillard.pres * k;
  carte.scene.fog.far = brouillard.loin * k;
  regleObjectif();
}

// objectif de la caméra selon la scène et la forme de l'écran
function regleObjectif() {
  camera.clearViewOffset();
  if (sceneAffichee === "decor") {
    if (aspect < 1.3) {
      // écran étroit : on garde presque toute la largeur du tableau et on le remonte au-dessus du texte
      const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * (16 / 9) * .86 / aspect;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(t));
      const l = rendu.domElement.width, h = rendu.domElement.height;
      camera.setViewOffset(l, h, 0, h * .17, l, h);
    } else camera.fov = FOV;
  } else camera.fov = aspect < 1 ? 52 : 42;
  camera.updateProjectionMatrix();
}

// ---------------------------------------------------------------- étapes et défilement
let etapes = [], etapeActive = null;
function mesurer() {
  if (etapeActive) etapeActive.el.classList.remove("actif");
  etapeActive = null;
  etapes = [...document.querySelectorAll(".etape")].map((el) => {
    const r = el.getBoundingClientRect();
    return { el, haut: r.top + scrollY, hauteur: r.height, scene: el.dataset.scene, conte: el.dataset.conte, i: +el.dataset.i || 0, fin: !!el.dataset.fin, cle: el.dataset.cle, section: el.closest(".chapitre") };
  });
}

const lerp = THREE.MathUtils.lerp;
const lisse = (q) => q * q * (3 - 2 * q);
function interpoler(cles, p) {
  let a = cles[0], b = cles[cles.length - 1];
  for (let k = 0; k < cles.length - 1; k++) if (p >= cles[k].p && p <= cles[k + 1].p) { a = cles[k]; b = cles[k + 1]; break; }
  const q = b.p === a.p ? 0 : lisse((p - a.p) / (b.p - a.p));
  return { pos: a.pos.map((v, i) => lerp(v, b.pos[i], q)), vise: a.vise.map((v, i) => lerp(v, b.vise[i], q)) };
}

// l'étape au milieu de l'écran, et l'avancée dans cette étape (de 0 à 1)
function etat() {
  const milieu = scrollY + innerHeight * .5;
  let e = etapes[0];
  for (const x of etapes) if (milieu >= x.haut) e = x;
  return { e, q: borne((milieu - e.haut) / e.hauteur) };
}

const CLES_FINAL = [{ p: 0, pos: [.8, 2.4, 2.6], vise: [0, 1.2, 0] }, { p: .55, pos: [5, 4, 10], vise: [0, 1, 0] }, { p: 1, pos: [0, 14, 27], vise: [0, 1, 0] }];
function avecRecul(v, k) {
  if (k === 1) return v;
  return { pos: v.pos.map((x, i) => v.vise[i] + (x - v.vise[i]) * k), vise: v.vise };
}

// position voulue de la caméra pour une étape
function cible(e, q, scene) {
  if (scene === "village") {
    const r = e.section.getBoundingClientRect();
    const p = borne((innerHeight * .5 - r.top) / r.height);
    return interpoler(e.section.id === "final" ? CLES_FINAL : village.cles, p);
  }
  if (scene === "carte") {
    const k = recul();
    if (!e.conte) {
      const ang = lerp(-.25, .25, e.cle === "chemin" ? .5 + q * .5 : q * .5);
      const v = avecRecul({ pos: [Math.sin(ang) * 8.4, lerp(10.5, 8.8, q), Math.cos(ang) * 8.4], vise: carte.vueEnsemble.vise }, k);
      // écran large : la carte se range à droite du texte
      const dx = aspect > 1.2 ? -1.7 : 0;
      return { pos: [v.pos[0] + dx, v.pos[1], v.pos[2]], vise: [v.vise[0] + dx, v.vise[1], v.vise[2]] };
    }
    // vol depuis le conte précédent (ou la vue d'ensemble) jusqu'au feu du conte
    const n = VOYAGE.indexOf(e.conte);
    const depart = avecRecul(n > 0 ? carte.vueConte(VOYAGE[n - 1]) : carte.vueEnsemble, n > 0 ? Math.sqrt(k) : k);
    const proche = avecRecul(carte.vueConte(e.conte), Math.sqrt(k));
    const dx = aspect > 1.2 ? -.6 : 0; // le feu se place à droite du titre
    const arrivee = { pos: [proche.pos[0] + dx, proche.pos[1], proche.pos[2]], vise: [proche.vise[0] + dx, proche.vise[1], proche.vise[2]] };
    const t = lisse(borne(q * 1.5));
    const bond = Math.sin(t * Math.PI) * 2.2;
    return { pos: depart.pos.map((v, i) => lerp(v, arrivee.pos[i], t) + (i === 1 ? bond : 0)), vise: depart.vise.map((v, i) => lerp(v, arrivee.vise[i], t)) };
  }
  return decors.vue(e.fin ? 1 : q);
}

// ---------------------------------------------------------------- scènes et transitions
const voile = $("#voile");
const pos = new THREE.Vector3(0, 13, 26), vise = new THREE.Vector3(0, 1, 0);
const posCible = new THREE.Vector3(), viseCible = new THREE.Vector3();
let collerCamera = true;

function afficher(nom, conte, i) {
  sceneAffichee = nom; conteAffiche = conte; collerCamera = true;
  if (nom === "decor" && conte) decors.montrer(conte, i);
  regleObjectif();
}
function changerScene(nom, conte) {
  if (enTransition) return;
  if (reduit) { afficher(nom, conte, etat().e.i); return; }
  enTransition = true;
  voile.classList.add("visible");
  setTimeout(() => {
    afficher(nom, conte, etat().e.i);
    voile.classList.remove("visible");
    setTimeout(() => { enTransition = false; }, 300);
  }, 320);
}

// saut direct vers un chapitre (menu, boutons « Conte suivant ») : un fondu, sans traverser les scènes
function allerA(el) {
  fermerMenu();
  const aller = () => { scrollTo(0, el.getBoundingClientRect().top + scrollY); saut = true; };
  if (reduit) { aller(); return; }
  voile.classList.add("visible");
  setTimeout(aller, 320);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute("href").length < 2) return;
  const el = document.getElementById(a.getAttribute("href").slice(1));
  if (!el || !recit.contains(el)) return;
  e.preventDefault();
  allerA(el);
});

// décors du conte en cours, du précédent et du suivant
let dernierPrepare = null;
function preparer(id) {
  if (!id || dernierPrepare === id) return;
  dernierPrepare = id;
  const n = VOYAGE.indexOf(id);
  const garder = [VOYAGE[n - 1], id, VOYAGE[n + 1]].filter(Boolean);
  decors.garder(garder);
  garder.forEach((x) => decors.charger(parId(x)).catch(() => {}));
}

// ---------------------------------------------------------------- étiquettes et survol de la carte
const zoneEtiquettes = $("#etiquettes");
zoneEtiquettes.innerHTML = carte.etiquettes.map((x) => `<span>${echapper(x.nom)}</span>`).join("");
const spans = [...zoneEtiquettes.children];
const vTmp = new THREE.Vector3();
// seule : pendant l'arrivée sur un conte, on ne montre que le nom de sa région
function placerEtiquettes(montrer, seule = null) {
  zoneEtiquettes.classList.toggle("visible", montrer);
  zoneEtiquettes.classList.toggle("une", !!seule);
  if (!montrer) return;
  carte.etiquettes.forEach((x, i) => {
    const garder = !seule || x.nom === seule;
    spans[i].classList.toggle("cachee", !garder);
    if (!garder) return;
    vTmp.copy(x.pos).project(camera);
    spans[i].style.transform = `translate(${(vTmp.x * .5 + .5) * innerWidth}px, ${(-vTmp.y * .5 + .5) * innerHeight}px) translate(-50%, -50%)`;
  });
}
// Sur la carte, on peut aussi choisir son conte : un clic sur un feu, ou sur une région qui a un conte.
const rayon = new THREE.Raycaster(), souris = new THREE.Vector2();
const bulle = $("#bulle-region");
const contesDe = (region) => VOYAGE.filter((id) => parId(id).region === region);
const regionDuConte = Object.fromEntries(VOYAGE.map((id) => [id, carte.regions.find((m) => m.userData.region.nom === parId(id).region)]));
const vHaut = new THREE.Vector3();
let bulleFixe = false;

// feu sous le pointeur, en comparant les distances à l'écran
function feuSous(x, y) {
  let meilleur = null, dmin = Infinity;
  for (const id of VOYAGE) {
    const l = carte.lieux[id];
    vTmp.copy(l).setY(l.y + .12).project(camera);
    vHaut.copy(l).setY(l.y + .42).project(camera);
    const px = (vTmp.x * .5 + .5) * innerWidth, py = (-vTmp.y * .5 + .5) * innerHeight;
    const rayonPx = Math.max(20, Math.abs(vHaut.y - vTmp.y) * .5 * innerHeight * 1.1);
    const d = Math.hypot(px - x, py - y);
    if (d < rayonPx && d < dmin) { dmin = d; meilleur = id; }
  }
  return meilleur;
}
function viser(ev) {
  if (sceneAffichee !== "carte" || window.Lecteur.estOuvert() || !(ev.target instanceof Element) || ev.target.closest(".cartel, .entete, .apres, .entree, .bulle-region")) return null;
  const feu = feuSous(ev.clientX, ev.clientY);
  souris.set(ev.clientX / innerWidth * 2 - 1, -ev.clientY / innerHeight * 2 + 1);
  rayon.setFromCamera(souris, camera);
  const t = rayon.intersectObjects(carte.regions, false)[0];
  const region = feu ? carte.regions.find((m) => m.userData.region.nom === parId(feu).region) : t && t.object;
  return region || feu ? { feu, region } : null;
}
function placerBulle(x, y) {
  bulle.hidden = false;
  bulle.style.left = Math.max(8, Math.min(x + 16, innerWidth - bulle.offsetWidth - 8)) + "px";
  bulle.style.top = Math.max(60, Math.min(y + 16, innerHeight - bulle.offsetHeight - 8)) + "px";
}
function fermerBulle() {
  bulleFixe = false;
  bulle.hidden = true;
  bulle.classList.remove("fixe");
  bulle.setAttribute("aria-hidden", "true");
  carte.survoler(null);
  document.body.style.cursor = "";
}
const ligneConte = (id) => { const c = parId(id); return `<span class="conte-ici">Conte ${VOYAGE.indexOf(id) + 1} : ${echapper(c.titre)}</span>`; };
function survol(ev) {
  if (bulleFixe) return;
  const v = viser(ev);
  if (!v) { if (!bulle.hidden) fermerBulle(); return; }
  carte.survoler(v.region || null);
  if (v.feu) {
    const c = parId(v.feu);
    bulle.innerHTML = `<strong>${echapper(c.titre)}</strong><em>${echapper(c.genre)}, ${echapper(c.lieu)}, région du ${echapper(c.region)}</em><span>${echapper(c.resume)}</span><span class="action">Cliquez pour commencer ce conte.</span>`;
    document.body.style.cursor = "pointer";
  } else {
    const r = v.region.userData.region, ici = contesDe(r.nom);
    bulle.innerHTML = `<strong>${echapper(r.nom)}</strong>${r.chefLieu ? `<em>Chef-lieu : ${echapper(r.chefLieu)}</em>` : ""}<span>${echapper(r.sens)}</span>`
      + ici.map(ligneConte).join("") + (ici.length ? `<span class="action">Cliquez pour commencer ${ici.length > 1 ? "un de ces contes" : "ce conte"}.</span>` : "");
    document.body.style.cursor = ici.length ? "pointer" : "";
  }
  placerBulle(ev.clientX, ev.clientY);
}
let typePointeur = "mouse";
addEventListener("pointerdown", (ev) => { typePointeur = ev.pointerType || "mouse"; }, true);
addEventListener("pointermove", (ev) => { if (ev.pointerType === "mouse") survol(ev); });
addEventListener("scroll", () => { if (!bulle.hidden) fermerBulle(); }, { passive: true });

// clic sur la carte : un feu lance son conte ; une région propose ses contes
addEventListener("click", (ev) => {
  const bouton = ev.target instanceof Element && ev.target.closest("[data-aller]");
  if (bouton) { const id = bouton.dataset.aller; fermerBulle(); allerA($("#c-" + id)); return; }
  if (bulleFixe && ev.target instanceof Element && ev.target.closest(".bulle-region")) return;
  const v = viser(ev);
  if (!v) { if (bulleFixe) fermerBulle(); return; }
  const tactile = typePointeur !== "mouse";
  if (v.feu && !tactile) { fermerBulle(); allerA($("#c-" + v.feu)); return; }
  const r = v.region.userData.region, ici = v.feu ? [v.feu] : contesDe(r.nom);
  if (ici.length === 1 && !tactile) { fermerBulle(); allerA($("#c-" + ici[0])); return; }
  // au doigt, ou s'il y a plusieurs contes : on affiche la région et un bouton par conte
  carte.survoler(v.region);
  bulle.innerHTML = `<strong>${echapper(r.nom)}</strong>${r.chefLieu ? `<em>Chef-lieu : ${echapper(r.chefLieu)}</em>` : ""}<span>${echapper(r.sens)}</span>`
    + (ici.length ? ici.map((id) => `<button type="button" class="bouton-feu" data-aller="${id}">Écouter : ${echapper(parId(id).titre)}</button>`).join("") : `<span class="action">Pas encore de conte dans cette région.</span>`);
  bulle.classList.add("fixe");
  bulle.setAttribute("aria-hidden", "false");
  bulleFixe = true;
  placerBulle(ev.clientX, ev.clientY);
  document.body.style.cursor = "";
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && bulleFixe) fermerBulle(); });

// ---------------------------------------------------------------- sons d'ambiance
// Chaque ambiance passe par un gain Web Audio : les fondus marchent aussi sur iPhone.
const NOMS_SONS = ["veillee", "ciel", "savane", "cour", "eau", "pierres"];
const SONS = {};
let contexte = null, sonActif = false, ambianceVoulue = "veillee";
function son(nom) {
  if (!SONS[nom]) {
    const a = new Audio(`audio/ambiances/${nom}.mp3`);
    a.loop = true; a.preload = "auto";
    const s = { a, vol: 0 };
    if (contexte) {
      s.gain = contexte.createGain(); s.gain.gain.value = 0;
      contexte.createMediaElementSource(a).connect(s.gain).connect(contexte.destination);
    } else a.volume = 0;
    SONS[nom] = s;
  }
  return SONS[nom];
}
// à appeler pendant un clic : le navigateur n'autorise le son qu'après un geste
function deverrouillerSon() {
  if (!contexte) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) contexte = new AC(); }
  if (contexte && contexte.state === "suspended") contexte.resume();
  NOMS_SONS.forEach((nom) => {
    const s = son(nom);
    if (s.pret) return;
    s.pret = true;
    s.a.play().then(() => { if (nom !== ambianceVoulue) s.a.pause(); }).catch(() => {});
  });
}
function regleSon(dt) {
  const coupe = !sonActif || window.Lecteur.estOuvert() || document.hidden;
  for (const [nom, s] of Object.entries(SONS)) {
    const voulu = !coupe && nom === ambianceVoulue ? (narrationEnCours() ? .2 : .6) : 0;
    s.vol += (voulu - s.vol) * Math.min(1, dt * 1.5);
    if (s.vol < .002 && voulu === 0) s.vol = 0;
    if (s.gain) s.gain.gain.value = s.vol; else s.a.volume = s.vol;
    if (voulu > 0 && s.a.paused) s.a.play().catch(() => {});
    if (voulu === 0 && s.vol === 0 && !s.a.paused) s.a.pause();
  }
}
// ---------------------------------------------------------------- narration en français
// Un fichier par étape, dans audio/narration/ ; js/contes.js liste ceux qui existent déjà.
// La narration existe en français (audio/narration/) et peut exister en mooré (audio/narration/moore/).
const NARRATIONS = { francais: new Set(window.NARRATION || []), moore: new Set(window.NARRATION_MOORE || []) };
let langueVoix = "francais", NARRATION = NARRATIONS.francais;
// en mooré, une étape pas encore enregistrée est dite par la voix française
const fichierVoix = (id) => (langueVoix === "moore" && NARRATIONS.moore.has(id) ? "audio/narration/moore/" : "audio/narration/") + id + ".mp3";
const aUneVoix = (id) => NARRATION.has(id) || NARRATIONS.francais.has(id);
// un court silence, pour débloquer le son pendant un clic
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
let voixActive = true, narr = null, narrCible = null, narrDepuis = 0;
function preparerNarration(id) {
  if (narr || !NARRATION.size) return;
  const a = new Audio();
  a.preload = "auto";
  narr = { a, id: null, vol: 0 };
  if (contexte) { narr.gain = contexte.createGain(); contexte.createMediaElementSource(a).connect(narr.gain).connect(contexte.destination); }
  // pendant le clic d'entrée : on lance tout de suite la première étape
  if (id) { a.src = fichierVoix(id); narr.id = id; narr.vol = 1; a.play().catch(() => {}); }
  // sans étape à lire, on débloque quand même le lecteur pendant le clic (nécessaire sur iPhone)
  else { a.src = SILENCE; a.play().then(() => a.pause()).catch(() => {}); }
}
const narrationEnCours = () => narr && narr.id && !narr.a.paused && !narr.a.ended;
function regleNarration(dt, e, cache) {
  const id = e.el.dataset.voix;
  const voulu = !cache && voixActive && id && aUneVoix(id) ? id : null;
  if (voulu !== narrCible) { narrCible = voulu; narrDepuis = performance.now(); }
  if (!narr) return;
  if (narr.id && narr.id !== narrCible) {
    // on change d'étape : la voix s'éteint vite
    narr.vol = Math.max(0, narr.vol - dt * 5);
    if (narr.vol === 0) { narr.a.pause(); narr.id = null; }
  } else if (!narr.id && narrCible && performance.now() - narrDepuis > 350) {
    // on attend un instant : si on défile vite, on ne lance pas chaque étape
    narr.a.src = fichierVoix(narrCible);
    narr.id = narrCible; narr.vol = 1;
    narr.a.play().catch(() => {});
  }
  if (narr.gain) narr.gain.gain.value = narr.vol; else narr.a.volume = narr.vol;
}
const boutonVoix = $("#bouton-voix");
// bouton du haut : voix en français, en mooré (si elle existe), ou coupée
const etatsVoix = ["francais", ...(NARRATIONS.moore.size ? ["moore"] : []), "coupee"];
const NOMS_VOIX = { francais: "Voix : français", moore: "Voix : mooré", coupee: "Voix coupée" };
function choisirVoix(etat) {
  voixActive = etat !== "coupee";
  if (voixActive && etat !== langueVoix) {
    langueVoix = etat; NARRATION = NARRATIONS[etat];
    if (narr) { narr.a.pause(); narr.id = null; narrCible = null; }
  }
  boutonVoix.textContent = NOMS_VOIX[etat];
  boutonVoix.setAttribute("aria-pressed", String(voixActive));
  boutonVoix.dataset.etat = etat;
}
if (NARRATIONS.francais.size) {
  boutonVoix.hidden = false;
  choisirVoix("francais");
  boutonVoix.addEventListener("click", () => {
    // le clic sert aussi à autoriser le son, si on était entré sans voix
    deverrouillerSon(); preparerNarration(null);
    choisirVoix(etatsVoix[(etatsVoix.indexOf(boutonVoix.dataset.etat) + 1) % etatsVoix.length]);
  });
}

function ambiancePour(e) {
  if (e.scene === "village") return "veillee";
  if (e.scene === "carte" && !e.conte) return "ciel";
  return parId(e.conte).ambiance;
}
const boutonSon = $("#bouton-son");
function majBoutonSon() { boutonSon.setAttribute("aria-pressed", String(sonActif)); boutonSon.querySelector("span").textContent = sonActif ? "Son activé" : "Son coupé"; }
boutonSon.addEventListener("click", () => { sonActif = !sonActif; if (sonActif) { deverrouillerSon(); preparerNarration(null); } majBoutonSon(); });

// ---------------------------------------------------------------- lecteur (voix et quiz)
const Lecteur = window.Lecteur;
Lecteur.etape = (id) => `Conte ${VOYAGE.indexOf(id) + 1} sur ${VOYAGE.length}. `;
Lecteur.libelleSuivant = (id) => { const n = VOYAGE.indexOf(id); return n < VOYAGE.length - 1 ? `Conte suivant : ${parId(VOYAGE[n + 1]).titre}` : "Finir la veillée"; };
Lecteur.onSuivant = (id) => { const n = VOYAGE.indexOf(id); allerA(n < VOYAGE.length - 1 ? $("#c-" + VOYAGE[n + 1]) : final); };
document.addEventListener("click", (e) => { const b = e.target.closest("[data-ouvrir]"); if (b) Lecteur.ouvrir(b.dataset.ouvrir); });

// ---------------------------------------------------------------- entrée
const entree = $("#entree");
function entrer(avecSon, langue) {
  sonActif = avecSon;
  if (NARRATIONS.francais.size) choisirVoix(langue === "moore" && !NARRATIONS.moore.size ? "coupee" : langue);
  if (avecSon || langue !== "coupee") { deverrouillerSon(); preparerNarration(voixActive && NARRATION.has("ouverture-1") ? "ouverture-1" : null); }
  majBoutonSon();
  entree.classList.add("partie");
  document.body.classList.remove("verrou");
  mesurer();
  setTimeout(() => { entree.hidden = true; }, reduit ? 0 : 900);
  $("#titre-site").focus({ preventScroll: true });
}
// scène d'accueil animée
if (window.dessinerAccueil && !$("#entree-scene").firstChild) $("#entree-scene").innerHTML = window.dessinerAccueil();

// premier choix : avec ou sans le son ; second choix : la voix qui raconte
let avecLeSon = true;
function demanderVoix(son) {
  avecLeSon = son;
  $("#choix-voix").hidden = false;
  $('#choix-voix [data-voix="moore"]').focus();
}
$("#entrer-son").addEventListener("click", () => demanderVoix(true));
$("#entrer-silence").addEventListener("click", () => demanderVoix(false));
// bouton « Accueil » : on revient à l'écran d'entrée pour choisir à nouveau le son et la voix
$("#bouton-accueil").addEventListener("click", () => {
  if (narr) { narr.a.pause(); narr.id = null; narrCible = null; }
  if (Lecteur.estOuvert()) document.querySelector("dialog[open]")?.close();
  $("#menu-contes").hidden = true; $("#bouton-menu").setAttribute("aria-expanded", "false");
  sonActif = false; majBoutonSon();
  scrollTo(0, 0);
  $("#choix-son").hidden = false; $("#choix-voix").hidden = true;
  entree.hidden = false;
  document.body.classList.add("verrou");
  requestAnimationFrame(() => requestAnimationFrame(() => entree.classList.remove("partie")));
  $("#entrer-son").focus({ preventScroll: true });
});

// indice « Faites défiler vers le bas » : visible en haut de la page, il disparaît dès qu'on descend
const indice = $("#indice-defiler");
const majIndice = () => indice.classList.toggle("visible", entree.hidden && scrollY < innerHeight * .25);
addEventListener("scroll", majIndice, { passive: true });
setInterval(majIndice, 500);
indice.addEventListener("click", () => scrollTo({ top: innerHeight * 1.1, behavior: reduit ? "auto" : "smooth" }));

// lien vers les références : on entre sans le son et on descend aux sources
$("#vers-sources").addEventListener("click", (e) => {
  e.preventDefault();
  entrer(false, "coupee");
  requestAnimationFrame(() => $("#sources").scrollIntoView());
});
// la fenêtre « Qui raconte ? » : un choix lance l'entrée ; la croix, Échap ou un clic à côté la ferment
function fermerChoixVoix() { $("#choix-voix").hidden = true; $(avecLeSon ? "#entrer-son" : "#entrer-silence").focus(); }
$("#choix-voix").addEventListener("click", (e) => {
  const b = e.target.closest("[data-voix]");
  if (b) { $("#choix-voix").hidden = true; entrer(avecLeSon, b.dataset.voix); }
  else if (e.target.id === "choix-voix" || e.target.closest("#fermer-choix-voix")) fermerChoixVoix();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#choix-voix").hidden) fermerChoixVoix(); });

// ---------------------------------------------------------------- boucle
let avant = performance.now(), t = 0;
const barre = $("#avancement");
function boucle() {
  requestAnimationFrame(boucle);
  const maintenant = performance.now();
  const dt = Math.min(.05, (maintenant - avant) / 1000);
  avant = maintenant; t += dt;
  const { e, q } = etat();
  if (e !== etapeActive) {
    if (etapeActive) etapeActive.el.classList.remove("actif");
    e.el.classList.add("actif");
    etapeActive = e;
  }
  ambianceVoulue = ambiancePour(e);
  const fin = final.getBoundingClientRect().bottom + scrollY;
  regleNarration(dt, e, scrollY > fin || Lecteur.estOuvert() || document.hidden);
  regleSon(dt);
  barre.style.transform = `scaleX(${borne(scrollY / Math.max(1, fin - innerHeight))})`;
  if (scrollY > fin || Lecteur.estOuvert()) return; // la scène est cachée : on ne dessine pas

  if (e.conte) preparer(e.conte);
  const voulue = e.scene === "decor" && !decors.pret(e.conte) ? "carte" : e.scene;
  const conteVoulu = voulue === "decor" ? e.conte : null;
  if (voulue !== sceneAffichee || conteVoulu !== conteAffiche) {
    if (saut) afficher(voulue, conteVoulu, e.i); else changerScene(voulue, conteVoulu);
  }
  if (saut) { saut = false; collerCamera = true; setTimeout(() => voile.classList.remove("visible"), 60); }

  if (sceneAffichee === "decor" && e.scene === "decor" && !enTransition) decors.aller(e.i);
  if (sceneAffichee === "carte") {
    // le cavalier marche pendant le vol vers le conte ; avant le voyage, il attend au premier feu
    const n = e.conte ? VOYAGE.indexOf(e.conte) : 0;
    carte.placerCavalier(n, e.conte ? lisse(borne(q * 1.5)) : 0, dt);
  }
  if (sceneAffichee === "carte") carte.montrerChemin(e.conte ? VOYAGE.length : e.cle === "chemin" ? q * 1.4 * (VOYAGE.length - 1) : 0);
  if (!(enTransition && sceneAffichee !== voulue)) {
    const c = cible(e, q, sceneAffichee);
    posCible.fromArray(c.pos); viseCible.fromArray(c.vise);
    if (collerCamera || reduit) { pos.copy(posCible); vise.copy(viseCible); collerCamera = false; }
    else { const k = Math.min(1, dt * 3.2); pos.lerp(posCible, k); vise.lerp(viseCible, k); }
  }
  camera.position.copy(pos);
  camera.lookAt(vise);
  if (sceneAffichee === "village") village.animer(t, dt);
  else if (sceneAffichee === "carte") carte.animer(t, dt);
  else { decors.animer(t, dt); decors.suivreCamera(camera); }
  if (sceneAffichee !== "carte" && !bulle.hidden) fermerBulle();
  // à l'arrivée sur un conte, sa région est mise en avant, comme au survol
  if (sceneAffichee === "carte" && bulle.hidden) carte.survoler(e.conte && !enTransition ? regionDuConte[e.conte] : null);
  placerEtiquettes(sceneAffichee === "carte" && !enTransition, e.conte ? parId(e.conte).region : null);
  rendu.render(SCENES[sceneAffichee], camera);
}

addEventListener("resize", () => { taille(); mesurer(); });
taille();
mesurer();
document.fonts.ready.then(mesurer);
new ResizeObserver(mesurer).observe(recit);

// prêt : on peut entrer
$("#entrer-son").disabled = false;
$("#entrer-silence").disabled = false;
$("#chargement").textContent = "Le feu est prêt.";
boucle();
