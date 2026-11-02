// Lecteur de contes partagé : scènes, lexique, sons, voix, quiz.
// Utilisé par la version simple (simple.html) et par la version immersive (index.html).
(function () {
  "use strict";

  const CONTES = window.CONTES, LANGUES = window.LANGUES, VOYAGE = window.VOYAGE;
  const $ = (s, el = document) => el.querySelector(s);
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const parId = (id) => CONTES.find((c) => c.id === id);
  const echapper = (t) => String(t).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const stockage = {
    lire(k, d) { try { const v = localStorage.getItem("veillees-" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    ecrire(k, v) { try { localStorage.setItem("veillees-" + k, JSON.stringify(v)); } catch (e) { /* navigation privée */ } },
  };
  window.Outils = { $, reduit, parId, echapper, stockage };

  // la page peut se brancher sur ces fonctions
  const Lecteur = window.Lecteur = {
    onSuivant: null,   // (idActuel) => ... quand on clique sur « Conte suivant »
    onFermer: null,    // () => ...
    onLu: null,        // (id) => ...
    etape: null,       // (id) => texte affiché avant le genre, ou ""
    libelleSuivant: null, // (id) => texte du bouton de fin
  };

  function marquerLu(id) {
    const lus = stockage.lire("lus", []);
    if (!lus.includes(id)) { lus.push(id); stockage.ecrire("lus", lus); }
    if (Lecteur.onLu) Lecteur.onLu(id);
  }

  // ---------------------------------------------------------------- lecteur
  const dialog = $("#lecteur"), zoneScene = $("#lecteur-scene"), texte = $("#scene-texte");
  const corps = $("#lecteur-corps"), fin = $("#lecteur-fin");
  const btnPrec = $("#scene-prec"), btnSuiv = $("#scene-suiv");
  let actuel = null, index = 0;

  const mots = window.LEXIQUE.map((m) => m.mot).sort((a, b) => b.length - a.length);
  const motifMots = new RegExp(`(?<![\\p{L}])(${mots.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}])`, "gu");
  const enrichir = (t) => echapper(t).replace(motifMots, (m) => `<button type="button" class="mot" data-mot="${m}">${m}</button>`);

  function ouvrir(id) {
    actuel = parId(id);
    if (!actuel) return;
    const etape = Lecteur.etape ? Lecteur.etape(id) : "";
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
    // une voix enregistrée part d'elle-même : la langue nationale si elle existe, sinon le français
    const enregistrees = (actuel.voix || []).filter((l) => LANGUES[l]);
    const premiere = enregistrees.find((l) => l !== "francais") || enregistrees[0];
    if (premiere) { const b = zoneVoix.querySelector(`[data-langue="${premiere}"]`); if (b) b.click(); }
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
    $("#fin-sources").innerHTML = actuel.sources.map((s) => s.url ? `<li><a href="${s.url}" target="_blank" rel="noopener">${echapper(s.titre)}</a></li>` : `<li>${echapper(s.titre)}</li>`).join("");
    construireQuiz();
    const prochain = parId(VOYAGE[(VOYAGE.indexOf(actuel.id) + 1) % VOYAGE.length]);
    $("#fin-suivant").textContent = Lecteur.libelleSuivant ? Lecteur.libelleSuivant(actuel.id) : `Conte suivant : ${prochain.titre}`;
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
    const id = actuel.id;
    if (Lecteur.onSuivant) { dialog.close(); Lecteur.onSuivant(id); return; }
    ouvrir(VOYAGE[(VOYAGE.indexOf(id) + 1) % VOYAGE.length]);
  });

  $("#lecteur-fermer").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    arreterAmbiance();
    arreterVoix();
    arreterLecture();
    masquerDefinition();
    if (location.hash.startsWith("#conte-")) history.replaceState(null, "", location.pathname + location.search);
    if (Lecteur.onFermer) Lecteur.onFermer();
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
    langueEnCours = null;
    // seules les voix enregistrées sont proposées : les langues nationales d'abord, puis le français.
    // Sans aucun enregistrement, on garde le français lu par le navigateur.
    const enregistrees = Object.keys(LANGUES).filter((code) => (actuel.voix || []).includes(code));
    const codes = enregistrees.length ? enregistrees : syntheseFr ? ["francais"] : [];
    zoneVoix.innerHTML = codes.map((code) =>
      `<button type="button" data-langue="${code}" aria-pressed="false">${LANGUES[code]}</button>`).join("");
    zoneVoix.closest(".voix").hidden = !codes.length;
    zoneVoix.querySelectorAll("button").forEach((b) => verifierVoix(actuel.id, b));
    majBoutonsVoix();
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
      aVoix.play().catch(() => { langueEnCours = null; majBoutonsVoix(); });
    } else { lectureFr = true; lireScene(); }
    majBoutonsVoix();
    if (ambianceActive) fondu(aAmb, .1, 600);
  });
  aVoix.addEventListener("ended", () => { langueEnCours = null; majBoutonsVoix(); if (ambianceActive) fondu(aAmb, .34, 1200); });
  const conteur = document.createElement("span");
  conteur.className = "voix-conteur";
  conteur.setAttribute("aria-live", "polite");
  zoneVoix.after(conteur);
  function majBoutonsVoix() {
    zoneVoix.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.langue === langueEnCours)));
    const nom = actuel && actuel.conteurs && langueEnCours && voixConnues[`${actuel.id}-${langueEnCours}`] ? actuel.conteurs[langueEnCours] : "";
    conteur.textContent = nom ? `Raconté par ${nom}` : "";
  }
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

  // crédits : qui raconte quel conte, dans quelle langue
  const zoneCredits = $("#credits-voix");
  if (zoneCredits) {
    const lignes = [];
    CONTES.forEach((c) => (c.voix || []).forEach((l) => { if (c.conteurs && c.conteurs[l]) lignes.push(`${c.titre} en ${LANGUES[l].toLowerCase()} : ${c.conteurs[l]}`); }));
    zoneCredits.textContent = lignes.length ? `Voix déjà enregistrées. ${lignes.join(". ")}.` : "";
  }

  Lecteur.ouvrir = ouvrir;
  Lecteur.estOuvert = () => dialog.open;
  Lecteur.actuel = () => actuel && actuel.id;
  function suivreAncre() {
    const ancre = decodeURIComponent(location.hash);
    if (ancre.startsWith("#conte-") && parId(ancre.slice(7)) && !(dialog.open && actuel && actuel.id === ancre.slice(7))) ouvrir(ancre.slice(7));
  }
  window.addEventListener("hashchange", suivreAncre);
  Lecteur.suivreAncre = suivreAncre;
})();
