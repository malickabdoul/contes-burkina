// Illustrations des contes, dessinées en SVG dans l'esprit d'un théâtre d'ombres :
// un ciel lumineux, des silhouettes sombres, quelques couleurs pour les habits royaux,
// le feu et l'eau. Chaque scène = un ciel (decor) + un sol + des éléments.
(function () {
  "use strict";
  let compteur = 0;
  const SOL = 392; // ligne du sol au premier plan

  const CIELS = {
    aube:       { haut: "#2b3a6b", milieu: "#c9708a", bas: "#f3b26b", loin: "#7a4a52", pres: "#3e2723", mur: "#6a4448", roche: "#a07a72", astre: "soleil-bas" },
    jour:       { haut: "#4f80bd", milieu: "#a7c6df", bas: "#f0dcb0", loin: "#9b7a58", pres: "#5a3d26", mur: "#7d5a3e", roche: "#b39a7c", astre: "soleil-haut" },
    midi:       { haut: "#d9c48e", milieu: "#f3e2b2", bas: "#fff3d2", loin: "#c39a66", pres: "#7a5634", mur: "#9b7650", roche: "#cdb08a", astre: "soleil-blanc" },
    crepuscule: { haut: "#272152", milieu: "#b2476a", bas: "#f0944a", loin: "#6a3446", pres: "#3a1f26", mur: "#5a2e3c", roche: "#8e5560", astre: "soleil-couchant" },
    nuit:       { haut: "#0b1030", milieu: "#18214d", bas: "#2c386b", loin: "#283266", pres: "#161b3a", mur: "#2a3262", roche: "#3a4478", astre: "lune" },
  };

  const OMBRE = "var(--ombre)";
  const g = (t, contenu, cls, style) => `<g${t ? ` transform="${t}"` : ""}${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""}>${contenu}</g>`;
  const alea = (graine) => () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };

  // ---------- ciel ----------
  function ciel(d, id) {
    const c = CIELS[d];
    let s = `<defs>
      <linearGradient id="ciel${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c.haut}"/><stop offset=".62" stop-color="${c.milieu}"/><stop offset="1" stop-color="${c.bas}"/>
      </linearGradient>
      <radialGradient id="halo${id}"><stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
      <radialGradient id="feu${id}"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></radialGradient>
      <linearGradient id="eau${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bas}"/><stop offset="1" stop-color="${c.milieu}"/></linearGradient>
      <linearGradient id="rayon${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8e0" stop-opacity=".85"/><stop offset="1" stop-color="#fff8e0" stop-opacity=".05"/></linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#ciel${id})"/>`;
    if (c.astre === "soleil-bas") s += `<circle cx="560" cy="300" r="120" fill="url(#halo${id})"/><circle cx="560" cy="300" r="34" fill="#ffd690"/>`;
    if (c.astre === "soleil-haut") s += `<circle cx="640" cy="90" r="110" fill="url(#halo${id})" opacity=".7"/><circle cx="640" cy="90" r="30" fill="#fff3c8"/>`;
    if (c.astre === "soleil-blanc") s += `<circle cx="400" cy="80" r="190" fill="url(#halo${id})"/><circle cx="400" cy="80" r="46" fill="#fffbea" class="anim-chaleur"/>`;
    if (c.astre === "soleil-couchant") s += `<circle cx="200" cy="310" r="140" fill="url(#halo${id})" opacity=".8"/><circle cx="200" cy="310" r="40" fill="#ffb15c"/>`;
    if (c.astre === "lune") {
      const r = alea(7);
      let etoiles = "";
      for (let i = 0; i < 70; i++) {
        const x = r() * 800, y = r() * 260, t = r() * 1.6 + .4;
        etoiles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${t.toFixed(1)}" fill="#fff" opacity="${(.35 + r() * .6).toFixed(2)}"${i % 7 === 0 ? ' class="anim-scintille" style="animation-delay:' + (r() * 4).toFixed(1) + 's"' : ""}/>`;
      }
      s += etoiles + `<circle cx="650" cy="80" r="70" fill="url(#halo${id})" opacity=".35"/><circle cx="650" cy="80" r="22" fill="#f3ead2"/>`;
    }
    if (d === "jour" || d === "aube") {
      s += g("", `<ellipse cx="160" cy="90" rx="70" ry="14" fill="#fff" opacity=".35"/><ellipse cx="200" cy="80" rx="46" ry="12" fill="#fff" opacity=".3"/>
        <ellipse cx="470" cy="130" rx="60" ry="10" fill="#fff" opacity=".25"/>`, "anim-nuages");
    }
    return s;
  }

  // ---------- éléments de décor ----------
  const collines = (c) => `<path d="M0 310 C120 270 210 285 300 298 C390 312 470 268 560 280 C650 292 720 268 800 284 L800 450 L0 450Z" fill="${c.loin}"/>`;
  const solPres = (c, y = SOL) => `<path d="M0 ${y} C150 ${y - 8} 300 ${y + 6} 450 ${y - 3} C600 ${y - 10} 700 ${y + 3} 800 ${y - 4} L800 450 L0 450Z" fill="${c.pres}"/>`;
  const touffe = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`, g("", `<path d="M0 0 L-6 -16 L-2 -2 L0 -22 L2 -2 L7 -15 L3 0Z" fill="${OMBRE}"/>`, "anim-herbe"));
  const herbes = (y, n = 14, graine = 3) => { const r = alea(graine); let s = ""; for (let i = 0; i < n; i++) s += touffe(r() * 800, y + r() * 26, .7 + r() * .8); return s; };
  const acacia = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<path d="M-3 0 L-2 -60 L-24 -82 L-20 -84 L0 -66 L14 -92 L18 -90 L4 -62 L3 0Z" fill="${OMBRE}"/>
     <path d="M-80 -88 C-60 -104 60 -108 86 -92 C60 -82 -50 -78 -80 -88Z" fill="${OMBRE}"/>`);
  const baobab = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<path d="M-30 0 C-24 -40 -26 -80 -18 -110 L-46 -150 L-40 -154 L-12 -122 L-10 -160 L-2 -160 L2 -124 L26 -158 L33 -152 L14 -116 C22 -80 24 -40 30 0Z" fill="${OMBRE}"/>
     <circle cx="-44" cy="-158" r="14" fill="${OMBRE}"/><circle cx="-6" cy="-168" r="16" fill="${OMBRE}"/><circle cx="32" cy="-160" r="13" fill="${OMBRE}"/>`);
  const arbreRond = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<rect x="-4" y="-50" width="8" height="50" fill="${OMBRE}"/><circle cx="0" cy="-70" r="34" fill="${OMBRE}"/><circle cx="-26" cy="-56" r="22" fill="${OMBRE}"/><circle cx="26" cy="-58" r="24" fill="${OMBRE}"/>`);
  const case_ = (x, y, s = 1, couleur = OMBRE) => g(`translate(${x} ${y}) scale(${s})`,
    `<rect x="-34" y="-46" width="68" height="46" fill="${couleur}"/><path d="M-44 -44 L0 -96 L44 -44Z" fill="${couleur}"/>
     <path d="M-10 0 L-10 -26 Q0 -34 10 -26 L10 0Z" fill="#000" opacity=".35"/>`);
  const grenier = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<rect x="-18" y="-50" width="36" height="42" rx="12" fill="${OMBRE}"/><path d="M-24 -48 L0 -78 L24 -48Z" fill="${OMBRE}"/><rect x="-14" y="-8" width="4" height="8" fill="${OMBRE}"/><rect x="10" y="-8" width="4" height="8" fill="${OMBRE}"/>`);
  const murPalais = (c, x, y, l, h = 70) => {
    let creneaux = "";
    for (let i = 0; i < l; i += 30) creneaux += `<path d="M${i} ${-h} L${i + 8} ${-h - 14} L${i + 16} ${-h}Z" fill="${c.mur}"/>`;
    return g(`translate(${x} ${y})`, `<rect x="0" y="${-h}" width="${l}" height="${h}" fill="${c.mur}"/>${creneaux}
      <path d="M${l / 2 - 26} 0 L${l / 2 - 26} ${-h * .62} Q${l / 2} ${-h * .9} ${l / 2 + 26} ${-h * .62} L${l / 2 + 26} 0Z" fill="#000" opacity=".3"/>
      <rect x="-20" y="${-h - 26}" width="40" height="${h + 26}" rx="16" fill="${c.mur}"/><rect x="${l - 20}" y="${-h - 26}" width="40" height="${h + 26}" rx="16" fill="${c.mur}"/>`);
  };
  const murBas = (c, y) => `<path d="M0 ${y} L800 ${y - 6} L800 ${y - 50} Q600 ${y - 58} 400 ${y - 52} Q200 ${y - 46} 0 ${y - 54}Z" fill="${c.mur}"/>`;
  const rochers = (x, y, s = 1, flip = false) => g(`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`,
    `<path d="M0 0 L10 -90 L40 -150 L90 -170 L130 -140 L160 -150 L190 -90 L230 -60 L240 0Z" fill="${OMBRE}"/>
     <path d="M40 -150 L70 -120 L90 -170" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>`);
  const eau = (id, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#eau${id})"/>
    ${g("", `<ellipse cx="${cx - rx * .3}" cy="${cy}" rx="${rx * .25}" ry="${ry * .2}" fill="none" stroke="#fff" stroke-opacity=".4"/>
      <ellipse cx="${cx + rx * .35}" cy="${cy + ry * .25}" rx="${rx * .18}" ry="${ry * .16}" fill="none" stroke="#fff" stroke-opacity=".35"/>`, "anim-rides")}`;
  const roseaux = (x, y, n = 6) => { let s = ""; for (let i = 0; i < n; i++) s += `<path d="M${x + i * 7} ${y} q${(i % 2 ? 4 : -3)} -30 ${(i % 2 ? 8 : -2)} -${46 + (i % 3) * 10}" stroke="${OMBRE}" stroke-width="3" fill="none"/>`; return g("", s, "anim-herbe"); };

  function sol(nom, d, id) {
    const c = CIELS[d];
    switch (nom) {
      case "savane": return collines(c) + acacia(130, SOL - 22, 1.05) + baobab(680, SOL - 12, .85) + solPres(c) + herbes(SOL + 4);
      case "savane-seche": return collines(c) + acacia(680, SOL - 30, .9) + solPres(c)
        + `<path d="M120 ${SOL + 30} l30 10 l-10 18 M420 ${SOL + 44} l40 -8 l18 14 M600 ${SOL + 22} l26 16" stroke="#000" stroke-opacity=".25" fill="none" stroke-width="2"/>` + herbes(SOL + 6, 6, 11);
      case "foret": return collines(c) + arbreRond(70, SOL - 6, 1.35) + arbreRond(470, SOL - 30, 1) + arbreRond(740, SOL - 4, 1.45) + baobab(600, SOL - 34, .62) + solPres(c) + herbes(SOL + 6, 10, 5);
      case "champ": {
        let tiges = "";
        for (let r = 0; r < 3; r++) for (let i = 0; i < 17; i++) {
          const x = 20 + i * 48 + r * 14, y = SOL + 8 + r * 20;
          tiges += `<path d="M${x} ${y} q2 -24 ${14 + (i % 3) * 4} -${18 + r * 3}" stroke="${OMBRE}" stroke-width="${2 + r * .6}" fill="none" opacity="${.55 + r * .15}"/>`;
        }
        return collines(c) + solPres(c) + tiges;
      }
      case "palais": return collines(c) + baobab(110, SOL - 8, .8) + murPalais(c, 250, SOL - 22, 330) + solPres(c) + herbes(SOL + 8, 8, 13);
      case "cour": return collines(c) + murPalais(c, 60, SOL - 34, 680, 92) + case_(720, SOL - 30, .7, c.mur) + solPres(c) + `<ellipse cx="400" cy="${SOL + 34}" rx="330" ry="22" fill="#000" opacity=".12"/>`;
      case "village": return collines(c) + case_(90, SOL - 2, 1) + grenier(178, SOL - 2, .9) + baobab(600, SOL - 22, .6) + case_(690, SOL - 4, .9) + case_(765, SOL, 1.05) + solPres(c) + herbes(SOL + 10, 8, 17);
      case "concession": return collines(c) + arbreRond(60, SOL - 50, .85) + case_(760, SOL - 44, .9) + murBas(c, SOL + 4) + solPres(c, SOL + 2) + herbes(SOL + 14, 6, 19);
      case "mare": return collines(c) + acacia(710, SOL - 40, .8) + solPres(c) + eau(id, 480, SOL + 26, 240, 26) + roseaux(238, SOL + 26) + roseaux(712, SOL + 30, 5);
      case "ravin": return collines(c) + rochers(-80, SOL + 14, 1) + rochers(880, SOL + 18, 1.05, true) + arbreRond(40, 250, .65) + arbreRond(770, 240, .7)
        + solPres(c) + eau(id, 400, SOL + 26, 230, 26);
      case "ciel-seul": return `<path d="M0 405 C200 390 600 395 800 402 L800 450 L0 450Z" fill="${c.loin}"/>`;
      case "rocher": return collines(c) + solPres(c) + `<path d="M500 ${SOL + 6} C510 ${SOL - 60} 580 ${SOL - 98} 660 ${SOL - 92} C730 ${SOL - 86} 778 ${SOL - 44} 790 ${SOL + 6}Z" fill="${c.roche}"/>
        <path d="M540 ${SOL - 40} q40 -20 80 -6 M700 ${SOL - 60} q30 10 50 34" stroke="#000" stroke-opacity=".18" stroke-width="3" fill="none"/>` + herbes(SOL + 8, 6, 23);
      case "caverne": return collines(c) + `<path d="M120 ${SOL + 4} L150 210 L250 140 L420 122 L560 150 L660 220 L700 ${SOL + 4}Z" fill="${c.roche}"/>
        <path d="M120 ${SOL + 4} L150 210 L250 140 L420 122 L560 150 L660 220 L700 ${SOL + 4}" fill="none" stroke="${OMBRE}" stroke-width="6"/>
        <path d="M320 ${SOL + 4} L330 300 Q410 238 490 300 L500 ${SOL + 4}Z" fill="#0b0605"/>` + solPres(c, SOL + 4);
      case "ruines": {
        const r = alea(31); let blocs = "";
        const mur = (x0, y0, l, h) => { for (let yy = 0; yy < h; yy += 13) { let xx = (yy / 13) % 2 ? 9 : 0; while (xx < l) {
          const w = 15 + r() * 12;
          if (!(r() < .12 && yy > h - 30)) blocs += `<rect x="${(x0 + xx).toFixed(0)}" y="${y0 - yy - 12}" width="${w.toFixed(0)}" height="${(10 + r() * 3).toFixed(0)}" rx="4" fill="var(--laterite)" opacity="${(.7 + r() * .3).toFixed(2)}"/>`;
          xx += w + 3;
        } } };
        mur(40, SOL + 6, 320, 104); mur(420, SOL, 340, 78); mur(320, SOL - 40, 130, 44);
        return collines(c) + solPres(c) + `<g class="mur">${blocs}</g>`;
      }
      case "sahel": return `<path d="M0 320 C160 290 260 330 400 312 C540 294 640 330 800 300 L800 450 L0 450Z" fill="${c.loin}"/>
        <path d="M0 ${SOL} C200 ${SOL - 26} 350 ${SOL + 10} 520 ${SOL - 12} C650 ${SOL - 28} 720 ${SOL - 4} 800 ${SOL - 10} L800 450 L0 450Z" fill="${c.pres}"/>` + acacia(650, SOL - 16, .7) + touffe(120, SOL + 16) + touffe(480, SOL + 6, .8);
      case "case": return `<rect width="800" height="450" fill="#4a2c1a"/>
        <rect x="560" y="110" width="90" height="230" rx="45" fill="${CIELS.nuit.milieu}"/>
        <circle cx="590" cy="160" r="1.4" fill="#fff"/><circle cx="620" cy="200" r="1" fill="#fff"/><circle cx="600" cy="250" r="1.2" fill="#fff"/>
        <path d="M0 0 L800 0 L800 40 Q400 90 0 40Z" fill="#2c180d"/>
        <ellipse cx="400" cy="430" rx="460" ry="90" fill="#6a4128"/>
        <circle cx="660" cy="400" r="180" fill="url(#feu${id})" opacity=".8"/>`;
    }
    return "";
  }

  // ---------- personnages et animaux (silhouettes articulées) ----------
  function personne(x, y, s = 1, o = {}) {
    const robe = o.robe || OMBRE;
    const tete = o.coiffe === "bonnet" ? `<path d="M-9 -98 Q0 -112 9 -98Z" fill="${o.bonnet || robe}"/>` :
      o.coiffe === "foulard" ? `<path d="M-10 -92 Q0 -108 10 -92 L12 -86 L-12 -86Z" fill="${OMBRE}"/>` : "";
    const pose = o.pose || "debout";
    let corps;
    if (pose === "assis") {
      corps = `<circle cx="0" cy="-56" r="8" fill="${OMBRE}"/>${o.coiffe === "bonnet" ? `<path d="M-8 -62 Q0 -74 8 -62Z" fill="${o.bonnet || OMBRE}"/>` : o.coiffe === "foulard" ? `<path d="M-9 -58 Q0 -72 9 -58 L10 -54 L-10 -54Z" fill="${OMBRE}"/>` : ""}
        <path d="M-13 -48 L13 -48 L20 -10 L-20 -10Z" fill="${robe}"/><ellipse cx="0" cy="-6" rx="26" ry="7" fill="${robe}"/>`;
      return g(`translate(${x} ${y}) scale(${s})`, corps, o.cls);
    }
    if (pose === "agenouille") {
      corps = `<circle cx="6" cy="-66" r="8" fill="${OMBRE}"/><path d="M-6 -58 L14 -58 L18 -24 L-10 -24Z" fill="${robe}" transform="rotate(${o.penche || 18} 4 -24)"/>
        <path d="M-12 -24 L18 -24 L22 0 L-18 0Z" fill="${robe}"/><line x1="10" y1="-50" x2="34" y2="-30" stroke="${OMBRE}" stroke-width="5" stroke-linecap="round"/>`;
      const objet = o.objet === "poulet" ? poulet(38, -24, .6) : o.objet === "pinceau" ? `<line x1="34" y1="-30" x2="50" y2="-18" stroke="${OMBRE}" stroke-width="3"/>` : "";
      return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`, corps + objet, o.cls);
    }
    const marche = pose === "marche";
    const jambes = marche
      ? `<g class="anim-jambe-a"><line x1="-4" y1="-32" x2="-12" y2="0" stroke="${OMBRE}" stroke-width="5" stroke-linecap="round"/></g>
         <g class="anim-jambe-b"><line x1="4" y1="-32" x2="12" y2="0" stroke="${OMBRE}" stroke-width="5" stroke-linecap="round"/></g>`
      : `<line x1="-6" y1="-32" x2="-7" y2="0" stroke="${OMBRE}" stroke-width="5" stroke-linecap="round"/><line x1="6" y1="-32" x2="7" y2="0" stroke="${OMBRE}" stroke-width="5" stroke-linecap="round"/>`;
    const penche = pose === "penche" ? 'transform="rotate(22 0 -32)"' : "";
    const brasL = pose === "bras-leves" ? [-24, -112] : pose === "penche" ? [-14, -50] : [-20, -46];
    const [lx, ly] = pose === "bras-leves" ? [24, -112] : o.objet === "lance" ? [22, -60] : [20, -46];
    let objet = "";
    if (o.objet === "lance") objet = `<line x1="${lx + 2}" y1="${ly + 30}" x2="${lx + 8}" y2="-150" stroke="${OMBRE}" stroke-width="3"/><path d="M${lx + 8} -164 L${lx + 3} -148 L${lx + 13} -148Z" fill="${OMBRE}"/>`;
    if (o.objet === "arc") objet = `<path d="M${lx - 4} ${ly - 46} Q${lx + 26} ${ly} ${lx - 4} ${ly + 46}" fill="none" stroke="${OMBRE}" stroke-width="3"/><line x1="${lx - 4}" y1="${ly - 46}" x2="${lx - 4}" y2="${ly + 46}" stroke="${OMBRE}" stroke-width="1"/>`;
    if (o.objet === "baton") objet = `<line x1="${lx}" y1="${ly}" x2="${lx + 6}" y2="0" stroke="${OMBRE}" stroke-width="3"/>`;
    if (o.objet === "poulet") objet = poulet(lx + 8, ly + 8, .55);
    const garniture = o.liseré ? `<path d="M-12 -80 L12 -80 L19 -30 L-19 -30Z" fill="none" stroke="${o.liseré}" stroke-width="2.5"/>` : "";
    corps = `${jambes}<g ${penche}><circle cx="0" cy="-90" r="8" fill="${OMBRE}"/>${tete}
      <path d="M-12 -80 L12 -80 L19 -30 L-19 -30Z" fill="${robe}"/>${garniture}
      <line x1="-12" y1="-78" x2="${brasL[0]}" y2="${brasL[1]}" stroke="${o.manches || OMBRE}" stroke-width="5" stroke-linecap="round"/>
      <line x1="12" y1="-78" x2="${lx}" y2="${ly}" stroke="${o.manches || OMBRE}" stroke-width="5" stroke-linecap="round"/>${objet}</g>`;
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`, corps, o.cls);
  }

  // cheval : (x, y) = sabots au sol, à gauche de la silhouette
  function cheval(x, y, s = 1, o = {}) {
    const allure = o.allure || "galop";
    const arret = allure === "debout" ? "-arret" : "";
    const jambe = (x1, y1, ang, cls) => `<g class="${cls}${arret}" style="transform-origin:${x1}px ${y1}px"><line x1="${x1}" y1="${y1}" x2="${(x1 + Math.sin(ang) * 32).toFixed(1)}" y2="${(y1 + Math.cos(ang) * 32).toFixed(1)}" stroke="${OMBRE}" stroke-width="6" stroke-linecap="round"/></g>`;
    const k = allure === "galop" ? 1 : allure === "pas" ? .4 : 0;
    const jambes = jambe(96, 54, .6 * k, "anim-patte-av") + jambe(88, 56, .2 * k, "anim-patte-av2") + jambe(48, 54, -.6 * k, "anim-patte-ar") + jambe(40, 52, -.2 * k, "anim-patte-ar2");
    const cavalier = o.cavalier ? `<g class="cavalier"><path d="M62 34 L70 6 L80 8 L74 36Z" fill="${o.robe || OMBRE}"/><circle cx="76" cy="-2" r="7" fill="${OMBRE}"/>
      <line x1="76" y1="16" x2="104" y2="22" stroke="${OMBRE}" stroke-width="4" stroke-linecap="round"/>
      <path d="M64 34 L58 58" stroke="${OMBRE}" stroke-width="5" stroke-linecap="round"/>
      ${o.lance ? `<line x1="60" y1="40" x2="128" y2="-16" stroke="${OMBRE}" stroke-width="3"/><path d="M134 -21 L122 -16 L128 -10Z" fill="${OMBRE}"/>` : ""}</g>` : "";
    const corps = `<g class="${allure === "galop" ? "anim-galop" : allure === "pas" ? "anim-pas" : ""}">${jambes}
      <ellipse cx="70" cy="44" rx="38" ry="16" fill="${OMBRE}"/>
      <path d="M92 36 L106 10 L114 6 L130 16 L128 24 L114 22 L106 48Z" fill="${OMBRE}"/><path d="M110 8 L112 -2 L116 7Z" fill="${OMBRE}"/>
      <path d="M100 14 L94 26 L104 22 L98 34 L106 28Z" fill="${OMBRE}"/>
      <path d="M34 38 C18 40 14 56 10 70 C22 60 30 52 36 46Z" fill="${OMBRE}" class="anim-queue"/>${cavalier}</g>`;
    return g(`translate(${x} ${(y - 86 * s).toFixed(1)}) scale(${o.flip ? -s : s} ${s})`, corps, o.cls);
  }

  function quadrupede(x, y, s, type, o = {}) {
    const [rx, ry, h] = { boeuf: [46, 18, 1.15], mouton: [30, 14, .8], chien: [30, 9, .7] }[type];
    const pattes = [-rx * .6, -rx * .35, rx * .45, rx * .7].map((px, i) =>
      `<line x1="${px}" y1="0" x2="${px + (i % 2 ? 2 : -2)}" y2="${26 * h}" stroke="${OMBRE}" stroke-width="${type === "boeuf" ? 6 : 4}" stroke-linecap="round"/>`).join("");
    let tete;
    if (type === "boeuf") tete = `<path d="M${rx - 6} -10 L${rx + 22} -14 L${rx + 26} 2 L${rx + 4} 6Z" fill="${OMBRE}"/><path d="M${rx + 8} -14 Q${rx - 2} -40 ${rx + 14} -44 M${rx + 16} -14 Q${rx + 34} -38 ${rx + 24} -46" stroke="${OMBRE}" stroke-width="4" fill="none"/><path d="M-6 -${ry} q14 -14 26 0Z" fill="${OMBRE}"/>`;
    else if (type === "mouton") tete = `<ellipse cx="${rx + 6}" cy="-6" rx="10" ry="7" fill="${OMBRE}"/><path d="M${rx} -12 q-8 4 -4 10" stroke="${OMBRE}" stroke-width="3" fill="none"/>`;
    else tete = `<g class="anim-aboie"><path d="M${rx - 6} -4 L${rx + 4} -18 L${rx + 20} -14 L${rx + 18} -6 L${rx + 4} -2Z" fill="${OMBRE}"/><path d="M${rx + 2} -16 L${rx + 4} -26 L${rx + 9} -16Z" fill="${OMBRE}"/></g><path d="M${-rx} -4 q-12 -8 -8 -20" stroke="${OMBRE}" stroke-width="4" fill="none"/>`;
    const corps = type === "mouton"
      ? `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${OMBRE}"/><circle cx="-16" cy="-10" r="9" fill="${OMBRE}"/><circle cx="2" cy="-13" r="9" fill="${OMBRE}"/><circle cx="18" cy="-9" r="8" fill="${OMBRE}"/>`
      : `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${OMBRE}"/>`;
    return g(`translate(${x} ${(y - 26 * h * s).toFixed(1)}) scale(${o.flip ? -s : s} ${s})`, pattes + corps + tete, o.cls);
  }

  function coq(x, y, s = 1, o = {}) {
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`,
      `<line x1="-2" y1="-14" x2="-4" y2="0" stroke="${OMBRE}" stroke-width="2.5"/><line x1="4" y1="-14" x2="5" y2="0" stroke="${OMBRE}" stroke-width="2.5"/>
       <ellipse cx="0" cy="-22" rx="14" ry="10" fill="${OMBRE}"/><path d="M-12 -24 Q-30 -46 -16 -52 Q-22 -36 -6 -30Z" fill="${OMBRE}"/>
       <g class="anim-picore"><circle cx="12" cy="-36" r="6" fill="${OMBRE}"/><path d="M9 -42 l3 -6 l3 6 l3 -5 l1 6Z" fill="${o.crete || OMBRE}"/><path d="M17 -36 l6 2 l-6 2Z" fill="${OMBRE}"/></g>`, o.cls);
  }
  const poulet = (x, y, s = 1) => coq(x, y, s, { crete: "#b8322a" });

  // crocodile : (x, y) = ventre au sol (ou ligne de l'eau)
  function crocodile(x, y, s = 1, o = {}) {
    let ecailles = "";
    for (let i = 40; i < 120; i += 9) ecailles += `<path d="M${i} ${10 - (i > 80 ? 1 : 0)} l4 -6 l4 6Z" fill="${OMBRE}"/>`;
    const pattes = o.nage ? "" : `<path d="M58 24 l-8 10 l10 0Z M100 24 l-6 10 l10 0Z" fill="${OMBRE}"/>`;
    const corps = `<path d="M0 20 C20 18 40 12 80 10 C100 8 118 8 130 10 L166 14 L166 18 L132 22 C110 26 80 26 40 24 C24 23 10 22 0 20Z" fill="${OMBRE}"/>
      ${ecailles}<circle cx="128" cy="8" r="3.5" fill="${OMBRE}"/>${pattes}`;
    return g(`translate(${x} ${(y - (o.nage ? 18 : 34) * s).toFixed(1)}) scale(${o.flip ? -s : s} ${s})`, `<g class="${o.anim || ""}">${corps}</g>`, o.cls);
  }

  function silure(x, y, s = 1, o = {}) {
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`,
      `<g class="${o.anim || ""}" style="transform-origin:60px 20px"><path d="M0 8 L18 20 L0 32 L8 20Z" fill="${OMBRE}"/>
       <path d="M14 20 C30 8 70 4 104 10 C116 12 122 16 124 20 C122 26 116 30 104 32 C70 36 30 32 14 20Z" fill="${OMBRE}"/>
       <path d="M122 18 q14 -10 26 -6 M122 22 q16 4 24 14 M118 26 q8 10 4 18" stroke="${OMBRE}" stroke-width="2" fill="none"/>
       <circle cx="110" cy="16" r="2" fill="#fff" opacity=".6"/></g>`, o.cls);
  }

  function lezard(x, y, s = 1, o = {}) {
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`,
      `<path d="M-60 -2 C-40 -6 -20 -6 0 -6 L20 -8 L34 -14 L40 -10 L32 -2 L20 0 C0 2 -30 2 -60 -2Z" fill="${OMBRE}"/>
       <g class="anim-hoche"><path d="M20 -8 L34 -14 L40 -10 L32 -2 L20 0Z" fill="${OMBRE}"/></g>
       <path d="M-8 -2 l-6 10 M10 -2 l6 10 M-20 -2 l-8 -10 M6 -6 l8 -12" stroke="${OMBRE}" stroke-width="3" fill="none"/>`, o.cls);
  }

  function chameau(x, y, s = 1, o = {}) {
    return g(`translate(${x} ${y}) scale(${s})`, `<g class="anim-pas">
      <line x1="-30" y1="-40" x2="-32" y2="0" stroke="${OMBRE}" stroke-width="5"/><line x1="-20" y1="-40" x2="-16" y2="0" stroke="${OMBRE}" stroke-width="5"/>
      <line x1="22" y1="-40" x2="20" y2="0" stroke="${OMBRE}" stroke-width="5"/><line x1="32" y1="-40" x2="36" y2="0" stroke="${OMBRE}" stroke-width="5"/>
      <path d="M-40 -40 C-40 -60 -20 -60 -10 -74 C0 -60 20 -58 40 -50 L56 -80 L66 -84 L74 -78 L70 -74 L62 -74 L50 -42 C30 -36 -20 -34 -40 -40Z" fill="${OMBRE}"/>
      ${o.cavalier ? `<circle cx="-10" cy="-96" r="7" fill="${OMBRE}"/><path d="M-18 -74 L-2 -74 L-6 -90 L-14 -90Z" fill="${OMBRE}"/>` : ""}
      ${o.charge ? `<rect x="10" y="-70" width="22" height="16" rx="4" fill="var(--or)" opacity=".9"/>` : ""}</g>`, o.cls);
  }

  function feu(x, y, s = 1, id) {
    return g(`translate(${x} ${y}) scale(${s})`, `<circle cx="0" cy="-20" r="80" fill="url(#feu${id})" class="anim-lueur"/>
      <path d="M-26 0 L26 0 L20 6 L-20 6Z" fill="${OMBRE}"/><path d="M-22 2 L18 -6 M-18 -6 L22 2" stroke="#3a1d10" stroke-width="5"/>
      <g class="anim-flamme"><path d="M-14 0 C-18 -16 -6 -22 -8 -40 C4 -30 12 -20 14 0Z" fill="#f2762e"/>
      <path d="M-6 0 C-10 -14 0 -20 0 -32 C8 -22 10 -12 8 0Z" fill="#ffc35a"/><path d="M2 0 C0 -10 10 -14 10 -26 C16 -16 16 -8 14 0Z" fill="#f59a3c"/></g>`);
  }

  function fumee(x, y) {
    return g(`translate(${x} ${y})`, [0, 1, 2].map((i) => `<circle cx="0" cy="0" r="16" fill="#d8d0c4" class="anim-fumee" style="animation-delay:${i * .9}s"/>`).join(""));
  }

  function canon(x, y, s = 1) {
    return g(`translate(${x} ${y}) scale(${s})`, `<g class="anim-recul"><rect x="-10" y="-30" width="90" height="20" rx="9" fill="${OMBRE}" transform="rotate(-14 0 -20)"/>
      <circle cx="10" cy="-10" r="16" fill="none" stroke="${OMBRE}" stroke-width="5"/><circle cx="10" cy="-10" r="3" fill="${OMBRE}"/></g>
      <g transform="translate(86 -46)"><circle r="20" fill="#fff4d2" class="anim-eclair"/>${[0, 1, 2].map((i) => `<circle r="18" cx="${i * 12}" cy="${-i * 8}" fill="#e8e1d6" class="anim-fumee-canon" style="animation-delay:${.15 + i * .15}s"/>`).join("")}</g>`);
  }

  function oiseaux() {
    return g("", [0, 1, 2].map((i) => `<path d="M${-10 + i * 26} ${80 + (i % 2) * 16} q8 -8 14 0 q6 -8 14 0" stroke="${OMBRE}" stroke-width="2.5" fill="none"/>`).join(""), "anim-vol");
  }

  // ---------- éléments par nom ----------
  function element(nom, d, id) {
    const S = SOL;
    switch (nom) {
      case "guerriere": return cheval(450, S + 8, 1.1, { allure: "debout", cls: "entree" }) + personne(380, S + 10, 1.15, { objet: "lance", coiffe: "foulard", cls: "entree" });
      case "guerriere-triste": return personne(400, S + 12, 1.2, { pose: "penche", coiffe: "foulard" });
      case "cavaliere": return g("", cheval(0, S + 6, 1.3, { cavalier: true, lance: true }), "anim-traverse");
      case "cavaliere-pas": return g("", cheval(90, S + 8, 1.15, { cavalier: true, allure: "pas" }), "anim-arrive");
      case "chasseur": return personne(540, S + 10, 1.2, { objet: "arc", flip: true, cls: "entree" });
      case "famille": return personne(270, S + 10, 1.1, { objet: "arc" }) + personne(345, S + 10, 1.05, { coiffe: "foulard" }) + personne(308, S + 12, .55) + cheval(400, S + 10, 1, { allure: "debout" });
      case "cavaliers": return g("", cheval(150, S + 6, 1.1, { cavalier: true, lance: true }) + cheval(-30, S + 10, 1, { cavalier: true }) + cheval(-190, S + 4, .9, { cavalier: true }), "anim-traverse-lent") + oiseaux();
      case "ministres": { let s = ""; for (let i = 0; i < 6; i++) s += personne(170 + i * 76, S + 22, 1, { pose: "assis", coiffe: "bonnet", bonnet: "#7a1c1c" }); return g("", s, "entree"); }
      case "ministres-devant": { let s = ""; for (let i = 0; i < 4; i++) s += personne(500 + i * 56, S + 20, 1, { pose: i % 2 ? "bras-leves" : "debout", flip: true }); return g("", s, "entree"); }
      case "roi-rouge": return personne(330, S + 22, 1.5, { robe: "#a3202a", manches: "#a3202a", liseré: "#e2b24a", coiffe: "bonnet", bonnet: "#a3202a", cls: "entree" });
      case "roi-blanc": return personne(330, S + 22, 1.5, { robe: "#f1ece0", manches: "#f1ece0", coiffe: "bonnet", bonnet: "#f1ece0", cls: "entree" });
      case "canon": return canon(600, S + 20, 1.1);
      case "cavalier-loin": return g("", cheval(0, 300, .45, { cavalier: true }), "anim-traverse-lent");
      case "chasseur-marche": return g("", personne(0, S + 12, 1.15, { objet: "arc", pose: "marche" }), "anim-marche");
      case "chasseur-assoiffe": return personne(390, S + 12, 1.2, { pose: "agenouille", penche: 34 });
      case "crocodile-guide": return g("", crocodile(0, S + 14, 1.2, { anim: "anim-ondule" }), "anim-rampe");
      case "chasseur-suit": return g("", personne(0, S + 12, 1.05, { objet: "arc", pose: "marche" }), "anim-suit");
      case "chasseur-boit": return personne(232, S + 20, 1.1, { pose: "agenouille", penche: 40 });
      case "crocodile-eau": return crocodile(600, S + 26, 1, { anim: "anim-flotte", flip: true, nage: true });
      case "crocodiles": return crocodile(30, S + 12, .95) + crocodile(140, S + 18, .8, { flip: false }) + crocodile(620, S + 28, 1, { anim: "anim-flotte", flip: true, nage: true });
      case "guide-poulet": return personne(330, S + 14, 1.05, { objet: "poulet", flip: true });
      case "silures-calmes": return silure(260, S + 12, .8, { anim: "anim-nage" }) + silure(470, S + 22, 1, { anim: "anim-nage", flip: true }) + silure(500, S + 6, .6, { anim: "anim-nage" });
      case "fondateur": return personne(200, S + 12, 1.15, { objet: "baton" });
      case "silure-montre": return silure(380, S + 8, 1, { anim: "anim-saut" });
      case "sacrificateur": return personne(200, S + 14, 1.1, { pose: "agenouille", objet: "poulet", penche: 10 });
      case "silures-sautent": return silure(360, S + 8, 1, { anim: "anim-saut" }) + silure(500, S + 16, .8, { anim: "anim-saut anim-retard", flip: true });
      case "visiteurs": return personne(330, S + 12, 1) + personne(380, S + 12, .95, { coiffe: "foulard" }) + personne(460, S + 12, 1.05, { objet: "baton", flip: true });
      case "etoiles-vives": return `<path d="M120 60 L380 160" stroke="#fff" stroke-width="2" stroke-linecap="round" class="anim-filante"/>`
        + g("translate(400 200)", `<circle r="60" fill="url(#halo${id})"/>`, "anim-lueur");
      case "descente": return `<path d="M250 0 L390 0 L470 ${S + 10} L170 ${S + 10}Z" fill="url(#rayon${id})"/>`
        + g("", cheval(240, S + 6, 1, { cavalier: true, lance: true, allure: "debout" }) + personne(390, S + 10, .9, { coiffe: "foulard" })
          + quadrupede(215, S + 12, .5, "boeuf") + quadrupede(440, S + 14, .45, "mouton"), "anim-descend");
      case "empreintes": return g(`translate(650 ${S - 86})`, `<g class="anim-lueur-douce"><ellipse cx="-14" cy="0" rx="7" ry="14" fill="#000" opacity=".45" transform="rotate(-8)"/><ellipse cx="14" cy="-6" rx="7" ry="14" fill="#000" opacity=".45" transform="rotate(8)"/>
        ${[-19, -16, -13, -10].map((dx) => `<circle cx="${dx}" cy="-17" r="2.2" fill="#000" opacity=".45"/>`).join("")}${[10, 13, 16, 19].map((dx) => `<circle cx="${dx}" cy="-23" r="2.2" fill="#000" opacity=".45"/>`).join("")}</g>`)
        + personne(420, S + 12, 1.05, { objet: "lance" });
      case "feu-caverne": return feu(420, S + 4, .9, id) + personne(376, S + 6, .8, { pose: "assis" });
      case "herbes": return herbes(S - 4, 22, 41);
      case "caravane": return g("", chameau(300, S + 12, .9, { cavalier: true }) + chameau(160, S + 10, .8, { charge: true }) + chameau(10, S + 14, .85, { cavalier: true, charge: true }), "anim-traverse-lent");
      case "chercheurs": return personne(230, S + 14, 1, { pose: "agenouille", objet: "pinceau", penche: 30 }) + personne(300, S + 14, 1.05)
        + `<line x1="370" y1="${S + 14}" x2="374" y2="${S - 40}" stroke="${"var(--ombre)"}" stroke-width="3"/><rect x="373" y="${S - 40}" width="14" height="10" fill="var(--braise)"/>`;
      case "mere": return feu(690, S + 26, .8, id) + personne(625, S + 28, 1.05, { pose: "assis", coiffe: "foulard" });
      case "animaux": return quadrupede(105, S + 30, 1, "boeuf") + quadrupede(228, S + 30, .9, "mouton") + cheval(272, S + 28, .85, { allure: "debout" }) + coq(430, S + 30, 1.15) + quadrupede(510, S + 30, 1, "chien", { flip: true });
      case "lezards": return lezard(330, 372, 1.4) + lezard(470, 372, 1.4, { flip: true }) + `<circle cx="400" cy="366" r="3.5" fill="${OMBRE}"/>` + feu(680, 420, .7, id);
      case "chien": return quadrupede(170, 420, 1.15, "chien", { cls: "entree" });
      case "case-feu": return g(`translate(400 ${S + 4}) scale(1.3)`, `<circle cx="0" cy="-50" r="110" fill="url(#feu${id})" class="anim-lueur"/>`) + case_(400, S + 4, 1.3)
        + g(`translate(400 ${S - 70}) scale(1.6)`, `<g class="anim-flamme"><path d="M-30 0 C-36 -24 -10 -34 -16 -64 C8 -46 22 -30 26 0Z" fill="#f2762e"/><path d="M-14 0 C-18 -20 2 -30 0 -48 C14 -34 16 -16 12 0Z" fill="#ffc35a"/></g>`)
        + fumee(420, 200) + quadrupede(620, S + 30, 1, "chien", { flip: true });
      case "cheval-court": return g("", cheval(0, S + 6, 1.2, { allure: "galop" }), "anim-traverse");
    }
    return "";
  }

  window.dessinerScene = function (scene, alt) {
    const id = ++compteur;
    const contenu = ciel(scene.decor, id) + sol(scene.sol, scene.decor, id) + (scene.elements || []).map((e) => element(e, scene.decor, id)).join("");
    return `<svg viewBox="0 0 800 450" role="img" aria-label="${alt.replace(/"/g, "&quot;")}" class="scene-svg decor-${scene.decor}" preserveAspectRatio="xMidYMax slice">${contenu}</svg>`;
  };
})();
