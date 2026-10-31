// Version simple de Veillées du Faso : carte 2D, listes, voyage. Le lecteur est dans lecteur.js.
(function () {
  "use strict";

  const C = window.CARTE, CONTES = window.CONTES, LANGUES = window.LANGUES, VOYAGE = window.VOYAGE;
  const { $, reduit, parId, echapper, stockage } = window.Outils;
  const Lecteur = window.Lecteur;
  const ouvrir = (id) => Lecteur.ouvrir(id);
  let enVoyage = false;
  const VW = C.viewBox[2], VH = C.viewBox[3];

  function projeter(lon, lat) {
    const p = C.projection;
    return [(lon - p.minLon) * p.k * p.echelle + p.marge, (p.maxLat - lat) * p.echelle + p.marge];
  }

  // ---------------------------------------------------------------- carte
  const FONDS = ["#4a3226", "#55382a", "#44302a", "#503b2c", "#5a3a2a", "#47322a"];
  const scene = $("#carte-scene"), plateau = $("#plateau"), svg = $("#carte-svg");
  const info = $("#info-region"), boutonVueEntiere = $("#vue-entiere");
  let zoom = { z: 1, tx: 0, ty: 0 };

  function dessinerCarte() {
    svg.setAttribute("viewBox", C.viewBox.join(" "));
    const regionsAvecConte = new Set(CONTES.map((c) => c.region));
    let h = `<g class="regions">`;
    C.regions.forEach((r, i) => {
      h += `<path class="region${regionsAvecConte.has(r.nom) ? " a-conte" : ""}" d="${r.d}" data-region="${echapper(r.nom)}" style="--fond:${FONDS[i % FONDS.length]}"><title>${echapper(r.nom)}</title></path>`;
    });
    h += `</g><path class="contour" d="${C.contour}"/>`;
    // un nom de région trop proche d'un feu est décalé vers le bas
    const feux = CONTES.map((c) => projeter(c.lon, c.lat));
    h += `<g class="noms" aria-hidden="true">` + C.regions.map((r) => {
      const proche = feux.some(([x, y]) => Math.hypot(x - r.lx, y - r.ly) < 70);
      return `<text class="nom-region" x="${r.lx}" y="${proche ? r.ly + 40 : r.ly}">${echapper(r.nom)}</text>`;
    }).join("") + `</g>`;
    // trajet du voyage
    const pts = VOYAGE.map((id) => { const c = parId(id); return projeter(c.lon, c.lat); });
    h += `<g id="trajet">`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const mx = (x1 + x2) / 2 + (y2 - y1) * .18, my = (y1 + y2) / 2 - (x2 - x1) * .18;
      const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      h += `<path class="trajet" d="${d}"/><path class="trajet-fait" data-etape="${i}" d="${d}"/>`;
    }
    h += `</g>`;
    svg.innerHTML = h;
    svg.querySelectorAll(".trajet-fait").forEach((p) => {
      const l = p.getTotalLength();
      p.style.strokeDasharray = l;
      p.style.strokeDashoffset = l;
      p.style.transition = reduit ? "none" : "stroke-dashoffset 1.1s ease-in-out";
    });

    // épaisseur pour la vue en relief
    const ep = $("#epaisseur");
    for (let i = 1; i <= 12; i++) {
      ep.insertAdjacentHTML("beforeend", `<svg viewBox="${C.viewBox.join(" ")}" style="transform:translateZ(${-i * 2.4}px)"><path d="${C.contour}" fill="#14100D" stroke="#A2402A" stroke-width="1.5"/></svg>`);
    }

    // feux des contes
    const zoneMarqueurs = $("#marqueurs");
    const lus = stockage.lire("lus", []);
    CONTES.forEach((c) => {
      const [x, y] = projeter(c.lon, c.lat);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "marqueur" + (lus.includes(c.id) ? " lu" : "");
      b.dataset.id = c.id;
      b.style.left = (x / VW * 100) + "%";
      b.style.top = (y / VH * 100) + "%";
      b.setAttribute("aria-label", `Écouter « ${c.titre} », ${c.lieu}`);
      b.innerHTML = `<svg viewBox="0 0 46 58" aria-hidden="true">
          <circle class="halo" cx="23" cy="40" r="20" fill="#FCD116" opacity=".3"/>
          <path d="M11 52 L35 46 M11 46 L35 52" stroke="#14100D" stroke-width="4" stroke-linecap="round"/>
          <path d="M23 49 C12 45 12 33 19 25 C20 31 23 33 24 31 C23 22 28 14 33 10 C32 20 38 27 36 38 C35 45 30 49 23 49Z" fill="#EF2B2D" stroke="#14100D" stroke-width="1.5"/>
          <path class="flamme-coeur" d="M23 48 C18 45 18 39 22 35 C23 39 26 39 26 36 C29 40 29 46 23 48Z" fill="#FCD116"/>
        </svg><span class="etiquette">${echapper(c.titre)}</span>`;
      b.addEventListener("click", () => ouvrirDepuisCarte(c.id));
      zoneMarqueurs.append(b);
    });

    svg.addEventListener("pointerover", (e) => { const p = e.target.closest(".region"); if (p) montrerRegion(p.dataset.region); });
    svg.addEventListener("click", (e) => { const p = e.target.closest(".region"); if (p) montrerRegion(p.dataset.region); });
    info.addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (b) ouvrirDepuisCarte(b.dataset.id); });
  }

  function montrerRegion(nom) {
    const r = C.regions.find((x) => x.nom === nom);
    if (!r) return;
    svg.querySelectorAll(".region.active").forEach((p) => p.classList.remove("active"));
    const p = svg.querySelector(`.region[data-region="${CSS.escape(nom)}"]`);
    if (p) p.classList.add("active");
    const contes = CONTES.filter((c) => c.region === nom);
    info.innerHTML = `<h3>${echapper(r.nom)}</h3>`
      + (r.chefLieu ? `<p class="info-meta">Chef-lieu : ${echapper(r.chefLieu)}</p>` : "")
      + `<p>${echapper(r.sens)}</p>`
      + contes.map((c) => `<button type="button" class="bouton-discret petit lien-conte" data-id="${c.id}">Écouter : ${echapper(c.titre)}</button>`).join(" ");
  }

  function appliquerPlateau() {
    const relief = scene.classList.contains("relief");
    plateau.style.setProperty("--z", zoom.z);
    plateau.style.transform = `${relief ? "rotateX(50deg) rotateZ(-5deg) translateY(-6%) scale(1.06) " : ""}scale(${zoom.z}) translate(${zoom.tx}%, ${zoom.ty}%)`;
    boutonVueEntiere.hidden = zoom.z === 1;
  }
  function zoomerSur(id, z = 1.9) {
    const c = parId(id);
    const [x, y] = projeter(c.lon, c.lat);
    zoom = { z, tx: 50 - x / VW * 100, ty: 50 - y / VH * 100 };
    appliquerPlateau();
  }
  function vueEntiere() { zoom = { z: 1, tx: 0, ty: 0 }; appliquerPlateau(); }
  boutonVueEntiere.addEventListener("click", vueEntiere);

  function choisirVue(v) {
    scene.classList.toggle("relief", v === "relief");
    document.querySelectorAll(".bascule button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vue === v)));
    stockage.ecrire("vue", v);
    appliquerPlateau();
  }
  document.querySelectorAll(".bascule button").forEach((b) => b.addEventListener("click", () => choisirVue(b.dataset.vue)));

  // ---------------------------------------------------------------- listes
  function remplirListes() {
    const lus = stockage.lire("lus", []);
    $("#liste-contes").innerHTML = CONTES.map((c) => `
      <li class="conte-item">
        <p class="genre">${echapper(c.genre)}</p>
        <h3>${echapper(c.titre)}</h3>
        <p class="lieu">${echapper(c.lieu)}, région du ${echapper(c.region)}. Langue d'origine : ${LANGUES[c.langue]}</p>
        <p class="resume">${echapper(c.resume)}</p>
        <button type="button" class="bouton-discret petit ouvrir" data-id="${c.id}">Écouter le conte</button><span class="etat" data-etat="${c.id}">${lus.includes(c.id) ? "Déjà écouté" : ""}</span>
      </li>`).join("");
    $("#liste-contes").addEventListener("click", (e) => { const b = e.target.closest(".ouvrir"); if (b) { enVoyage = false; ouvrir(b.dataset.id); } });

    $("#grille-regions").innerHTML = C.regions.map((r) =>
      `<div><dt>${echapper(r.nom)}${r.chefLieu ? `<span>${echapper(r.chefLieu)}</span>` : ""}</dt><dd>${echapper(r.sens)}</dd></div>`).join("");

    $("#liste-lexique").innerHTML = window.LEXIQUE.map((m) =>
      `<div><dt>${echapper(m.mot)}<span>${echapper(m.langue)}</span></dt><dd>${echapper(m.sens)}</dd></div>`).join("");

    const lien = (s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${echapper(s.titre)}</a></li>`;
    $("#liste-sources").innerHTML = CONTES.map((c) => `<div><h3>${echapper(c.titre)}</h3><ul>${c.sources.map(lien).join("")}</ul></div>`).join("")
      + `<div><h3>Carte et noms des régions</h3><ul>${window.SOURCES_GENERALES.map(lien).join("")}</ul></div>`;
  }

  Lecteur.onLu = function (id) {
    const m = document.querySelector(`.marqueur[data-id="${id}"]`);
    if (m) m.classList.add("lu");
    const e = document.querySelector(`[data-etat="${id}"]`);
    if (e) e.textContent = "Déjà écouté";
  };


  function ouvrirDepuisCarte(id) {
    const c = parId(id);
    montrerRegion(c.region);
    if (reduit) { ouvrir(id); return; }
    zoomerSur(id);
    setTimeout(() => ouvrir(id), 800);
  }

  // ---------------------------------------------------------------- voyage
  Lecteur.etape = (id) => enVoyage ? `Étape ${VOYAGE.indexOf(id) + 1} sur ${VOYAGE.length}. ` : "";
  Lecteur.libelleSuivant = (id) => {
    const i = VOYAGE.indexOf(id);
    if (enVoyage && i === VOYAGE.length - 1) return "Fin du voyage : revenir à la carte";
    return `Conte suivant : ${parId(VOYAGE[(i + 1) % VOYAGE.length]).titre}`;
  };
  Lecteur.onSuivant = (id) => {
    const i = VOYAGE.indexOf(id);
    if (enVoyage && i === VOYAGE.length - 1) { enVoyage = false; vueEntiere(); return; }
    if (enVoyage) tracerEtape(i);
    setTimeout(() => ouvrirDepuisCarte(VOYAGE[(i + 1) % VOYAGE.length]), reduit ? 0 : 700);
  };
  function tracerEtape(i) {
    const p = svg.querySelector(`.trajet-fait[data-etape="${i}"]`);
    if (p) p.style.strokeDashoffset = "0";
  }
  $("#btn-voyage").addEventListener("click", () => {
    enVoyage = true;
    const t = svg.querySelector("#trajet");
    t.classList.add("visible");
    t.querySelectorAll(".trajet-fait").forEach((p) => { p.style.strokeDashoffset = p.style.strokeDasharray; });
    $("#carte").scrollIntoView({ behavior: reduit ? "auto" : "smooth" });
    setTimeout(() => ouvrirDepuisCarte(VOYAGE[0]), reduit ? 0 : 500);
  });

  // ---------------------------------------------------------------- démarrage
  dessinerCarte();
  remplirListes();
  choisirVue(stockage.lire("vue", "plat"));
  Lecteur.suivreAncre();
})();
