// Veillées du Faso : carte, lecteur de contes, sons et quiz.
(function () {
  "use strict";

  const C = window.CARTE, CONTES = window.CONTES, LANGUES = window.LANGUES, VOYAGE = window.VOYAGE;
  const $ = (s, el = document) => el.querySelector(s);
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const VW = C.viewBox[2], VH = C.viewBox[3];
  const parId = (id) => CONTES.find((c) => c.id === id);
  const echapper = (t) => String(t).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const stockage = {
    lire(k, d) { try { const v = localStorage.getItem("veillees-" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    ecrire(k, v) { try { localStorage.setItem("veillees-" + k, JSON.stringify(v)); } catch (e) { /* navigation privée */ } },
  };

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
    let h = `<defs>
      <linearGradient id="g-flamme" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e8571f"/><stop offset=".55" stop-color="#f2a33a"/><stop offset="1" stop-color="#ffe08f"/></linearGradient>
      <radialGradient id="g-halo"><stop offset="0" stop-color="#ffc66b" stop-opacity=".55"/><stop offset="1" stop-color="#ffc66b" stop-opacity="0"/></radialGradient>
    </defs><g class="regions">`;
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
      ep.insertAdjacentHTML("beforeend", `<svg viewBox="${C.viewBox.join(" ")}" style="transform:translateZ(${-i * 2.4}px)"><path d="${C.contour}" fill="${i === 12 ? "#0b0705" : "#2b1a11"}" stroke="#3d2517" stroke-width="1.5"/></svg>`);
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
          <circle class="halo" cx="23" cy="40" r="20" fill="url(#g-halo)"/>
          <path d="M11 52 L35 46 M11 46 L35 52" stroke="#2a170c" stroke-width="4" stroke-linecap="round"/>
          <path d="M23 49 C12 45 12 33 19 25 C20 31 23 33 24 31 C23 22 28 14 33 10 C32 20 38 27 36 38 C35 45 30 49 23 49Z" fill="url(#g-flamme)"/>
          <path class="flamme-coeur" d="M23 48 C18 45 18 39 22 35 C23 39 26 39 26 36 C29 40 29 46 23 48Z" fill="#ffe7a6"/>
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

  function marquerLu(id) {
    const lus = stockage.lire("lus", []);
    if (!lus.includes(id)) { lus.push(id); stockage.ecrire("lus", lus); }
    const m = document.querySelector(`.marqueur[data-id="${id}"]`);
    if (m) m.classList.add("lu");
    const e = document.querySelector(`[data-etat="${id}"]`);
    if (e) e.textContent = "Déjà écouté";
  }

  // ---------------------------------------------------------------- lecteur
  const dialog = $("#lecteur"), zoneScene = $("#lecteur-scene"), texte = $("#scene-texte");
  const corps = $("#lecteur-corps"), fin = $("#lecteur-fin");
  const btnPrec = $("#scene-prec"), btnSuiv = $("#scene-suiv");
  let actuel = null, index = 0, enVoyage = false;

  const mots = window.LEXIQUE.map((m) => m.mot).sort((a, b) => b.length - a.length);
  const motifMots = new RegExp(`(?<![\\p{L}])(${mots.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}])`, "gu");
  const enrichir = (t) => echapper(t).replace(motifMots, (m) => `<button type="button" class="mot" data-mot="${m}">${m}</button>`);

  function ouvrirDepuisCarte(id) {
    const c = parId(id);
    montrerRegion(c.region);
    if (reduit) { ouvrir(id); return; }
    zoomerSur(id);
    setTimeout(() => ouvrir(id), 800);
  }

  function ouvrir(id) {
    actuel = parId(id);
    if (!actuel) return;
    const etape = enVoyage ? `Étape ${VOYAGE.indexOf(id) + 1} sur ${VOYAGE.length}. ` : "";
    $("#lecteur-meta").textContent = `${etape}${actuel.genre}, ${actuel.lieu}, région du ${actuel.region}`;
    $("#lecteur-titre").textContent = actuel.titre;
    zoneScene.innerHTML = "";
    corps.hidden = false;
    fin.hidden = true;
    preparerVoix();
    afficherScene(0);
    if (!dialog.open) dialog.showModal();
    btnSuiv.focus();
    demarrerAmbiance();
    history.replaceState(null, "", "#conte-" + id);
  }

  function afficherScene(i) {
    index = i;
    const s = actuel.scenes[i];
    const anciens = [...zoneScene.children];
    zoneScene.insertAdjacentHTML("beforeend", window.dessinerScene(s, `${actuel.titre}, scène ${i + 1}`));
    const nouveau = zoneScene.lastElementChild;
    if (anciens.length && !reduit) {
      nouveau.classList.add("entrante");
      requestAnimationFrame(() => requestAnimationFrame(() => nouveau.classList.remove("entrante")));
      anciens.forEach((a) => { a.classList.add("sortante"); setTimeout(() => a.remove(), 800); });
    } else anciens.forEach((a) => a.remove());
    texte.innerHTML = enrichir(s.texte);
    const n = actuel.scenes.length;
    $("#progression").innerHTML = actuel.scenes.map((_, k) => `<i class="${k <= i ? "vu" : ""}"></i>`).join("") + `<span>Scène ${i + 1} sur ${n}</span>`;
    btnPrec.disabled = i === 0;
    btnSuiv.textContent = i === n - 1 ? "Terminer" : "Suivant";
    if (lectureFr) lireScene();
  }

  function suivant() { if (index < actuel.scenes.length - 1) afficherScene(index + 1); else terminer(); }
  function precedent() { if (index > 0) afficherScene(index - 1); }
  btnSuiv.addEventListener("click", suivant);
  btnPrec.addEventListener("click", precedent);

  function terminer() {
    arreterLecture();
    corps.hidden = true;
    fin.hidden = false;
    $("#fin-lecon").textContent = actuel.lecon;
    $("#fin-note").textContent = actuel.note || "";
    $("#fin-sources").innerHTML = actuel.sources.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${echapper(s.titre)}</a></li>`).join("");
    construireQuiz();
    const i = VOYAGE.indexOf(actuel.id);
    const dernier = enVoyage && i === VOYAGE.length - 1;
    const prochain = parId(VOYAGE[(i + 1) % VOYAGE.length]);
    $("#fin-suivant").textContent = dernier ? "Fin du voyage : revenir à la carte" : `Conte suivant : ${prochain.titre}`;
    marquerLu(actuel.id);
    fin.scrollTop = 0;
    fin.querySelector("h3").setAttribute("tabindex", "-1");
    fin.querySelector("h3").focus();
  }

  function construireQuiz() {
    const zone = $("#quiz-questions");
    $("#quiz-score").textContent = "";
    zone.innerHTML = actuel.quiz.map((q, k) => `
      <fieldset data-q="${k}">
        <legend>${echapper(q.q)}</legend>
        ${q.choix.map((ch, j) => `<label><input type="radio" name="q${k}" value="${j}"> ${echapper(ch)}</label>`).join("")}
        <p class="retour" aria-live="polite"></p>
      </fieldset>`).join("");
  }
  $("#quiz").addEventListener("change", (e) => {
    const fs = e.target.closest("fieldset");
    const q = actuel.quiz[+fs.dataset.q];
    const ok = +e.target.value === q.bonne;
    const retour = fs.querySelector(".retour");
    retour.className = "retour " + (ok ? "bon" : "faux");
    retour.textContent = ok ? "Bonne réponse." : `Pas tout à fait. La bonne réponse : ${q.choix[q.bonne]}.`;
    e.target.closest("label").classList.add("choisi");
    fs.querySelectorAll("label")[q.bonne].classList.add("bonne");
    fs.disabled = true;
    const faits = [...document.querySelectorAll("#quiz fieldset")].filter((f) => f.disabled);
    if (faits.length === actuel.quiz.length) {
      const bons = faits.filter((f) => f.querySelector(".retour.bon")).length;
      $("#quiz-score").textContent = `${bons} bonne${bons > 1 ? "s" : ""} réponse${bons > 1 ? "s" : ""} sur ${actuel.quiz.length}.`;
    }
  });
  $("#quiz").addEventListener("submit", (e) => e.preventDefault());

  $("#fin-relire").addEventListener("click", () => { fin.hidden = true; corps.hidden = false; afficherScene(0); btnSuiv.focus(); });
  $("#fin-suivant").addEventListener("click", () => {
    const i = VOYAGE.indexOf(actuel.id);
    if (enVoyage && i === VOYAGE.length - 1) { enVoyage = false; dialog.close(); vueEntiere(); return; }
    const prochain = VOYAGE[(i + 1) % VOYAGE.length];
    dialog.close();
    if (enVoyage) tracerEtape(i);
    setTimeout(() => ouvrirDepuisCarte(prochain), reduit ? 0 : 700);
  });

  $("#lecteur-fermer").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    arreterAmbiance();
    arreterVoix();
    arreterLecture();
    masquerDefinition();
    if (location.hash.startsWith("#conte-")) history.replaceState(null, "", location.pathname + location.search);
  });
  dialog.addEventListener("keydown", (e) => {
    if (corps.hidden || e.target.matches("input")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); suivant(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); precedent(); }
  });

  // définitions du lexique
  const bulle = $("#definition");
  texte.addEventListener("click", (e) => {
    const b = e.target.closest(".mot");
    if (!b) return;
    const m = window.LEXIQUE.find((x) => x.mot === b.dataset.mot);
    bulle.innerHTML = `<strong>${echapper(m.mot)}</strong> (${echapper(m.langue.toLowerCase())}) : ${echapper(m.sens)}`;
    bulle.hidden = false;
    const r = b.getBoundingClientRect();
    const l = Math.min(Math.max(8, r.left), window.innerWidth - bulle.offsetWidth - 8);
    bulle.style.left = l + "px";
    bulle.style.top = (r.top - bulle.offsetHeight - 8 > 8 ? r.top - bulle.offsetHeight - 8 : r.bottom + 8) + "px";
    e.stopPropagation();
  });
  function masquerDefinition() { bulle.hidden = true; }
  dialog.addEventListener("click", (e) => { if (!e.target.closest(".mot")) masquerDefinition(); });
  $("#lecteur-corps").addEventListener("scroll", masquerDefinition);

  // ---------------------------------------------------------------- sons
  const aAmb = $("#audio-ambiance"), aVoix = $("#audio-voix");
  let ambianceActive = stockage.lire("ambiance", true);
  let minuteurFondu = null;
  const btnAmbiance = $("#ambiance");
  btnAmbiance.setAttribute("aria-pressed", String(ambianceActive));

  function fondu(audio, cible, duree, fin_) {
    clearInterval(minuteurFondu);
    const depart = audio.volume, pas = 40, n = Math.max(1, duree / pas);
    let k = 0;
    minuteurFondu = setInterval(() => {
      k++;
      audio.volume = Math.min(1, Math.max(0, depart + (cible - depart) * (k / n)));
      if (k >= n) { clearInterval(minuteurFondu); if (fin_) fin_(); }
    }, pas);
  }
  const volumeAmbiance = () => (aVoix.paused && !lectureFr ? .34 : .1);
  function demarrerAmbiance() {
    if (!ambianceActive || !actuel) return;
    const src = `audio/ambiances/${actuel.ambiance}.mp3`;
    if (!aAmb.getAttribute("src") || !aAmb.getAttribute("src").endsWith(src)) { aAmb.src = src; aAmb.volume = 0; }
    aAmb.play().then(() => fondu(aAmb, volumeAmbiance(), 1500)).catch(() => { /* lecture refusée par le navigateur */ });
  }
  function arreterAmbiance() { fondu(aAmb, 0, 500, () => aAmb.pause()); }
  btnAmbiance.addEventListener("click", () => {
    ambianceActive = !ambianceActive;
    stockage.ecrire("ambiance", ambianceActive);
    btnAmbiance.setAttribute("aria-pressed", String(ambianceActive));
    if (ambianceActive) demarrerAmbiance(); else arreterAmbiance();
  });

  // voix enregistrées : audio/voix/<conte>-<langue>.mp3
  const voixConnues = {};
  const zoneVoix = $("#voix-choix");
  const syntheseFr = "speechSynthesis" in window;
  let lectureFr = false, langueEnCours = null;

  function preparerVoix() {
    arreterVoix();
    zoneVoix.innerHTML = Object.entries(LANGUES).map(([code, nom]) =>
      `<button type="button" data-langue="${code}" aria-pressed="false">${nom}</button>`).join("");
    zoneVoix.querySelectorAll("button").forEach((b) => verifierVoix(actuel.id, b));
  }
  function verifierVoix(id, bouton) {
    const cle = `${id}-${bouton.dataset.langue}`;
    const maj = () => {
      const dispo = voixConnues[cle];
      const parSynthese = !dispo && bouton.dataset.langue === "francais" && syntheseFr;
      bouton.classList.toggle("absente", !dispo && !parSynthese);
      bouton.title = dispo ? "Écouter l'enregistrement" : parSynthese ? "Lecture par la voix du navigateur" : "Enregistrement à venir";
      bouton.setAttribute("aria-disabled", String(!dispo && !parSynthese));
    };
    voixConnues[cle] = (parId(id).voix || []).includes(bouton.dataset.langue);
    maj();
  }
  zoneVoix.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.getAttribute("aria-disabled") === "true") {
      if (b) b.title = `La voix en ${b.textContent.toLowerCase()} n'est pas encore enregistrée.`;
      return;
    }
    const code = b.dataset.langue, cle = `${actuel.id}-${code}`;
    if (langueEnCours === code) { arreterVoix(); arreterLecture(); majBoutonsVoix(); return; }
    arreterVoix(); arreterLecture();
    langueEnCours = code;
    if (voixConnues[cle]) {
      aVoix.src = `audio/voix/${cle}.mp3`;
      aVoix.play().catch(() => {});
    } else { lectureFr = true; lireScene(); }
    majBoutonsVoix();
    if (ambianceActive) fondu(aAmb, .1, 600);
  });
  aVoix.addEventListener("ended", () => { langueEnCours = null; majBoutonsVoix(); if (ambianceActive) fondu(aAmb, .34, 1200); });
  function majBoutonsVoix() { zoneVoix.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.langue === langueEnCours))); }
  function arreterVoix() { aVoix.pause(); aVoix.removeAttribute("src"); if (!lectureFr) langueEnCours = null; }

  function lireScene() {
    if (!syntheseFr || !actuel) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(actuel.scenes[index].texte);
    u.lang = "fr-FR";
    const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith("fr"));
    if (v) u.voice = v;
    u.rate = .95;
    const i = index;
    u.onend = () => { if (lectureFr && index === i && !corps.hidden) setTimeout(() => { if (lectureFr && index === i) suivant(); }, 1200); };
    speechSynthesis.speak(u);
  }
  function arreterLecture() {
    if (!lectureFr) return;
    lectureFr = false;
    if (syntheseFr) speechSynthesis.cancel();
    langueEnCours = null;
    majBoutonsVoix();
    if (ambianceActive && !aAmb.paused) fondu(aAmb, .34, 1000);
  }

  // ---------------------------------------------------------------- voyage
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
  function suivreAncre() {
    const ancre = decodeURIComponent(location.hash);
    if (ancre.startsWith("#conte-") && parId(ancre.slice(7)) && !(dialog.open && actuel && actuel.id === ancre.slice(7))) ouvrir(ancre.slice(7));
  }
  window.addEventListener("hashchange", suivreAncre);
  suivreAncre();
})();
