// Illustrations des contes en SVG, à la manière d'une affiche peinte : des aplats aux
// couleurs du Burkina (rouge, vert et jaune du drapeau, noir, kaolin et ocre de Tiébélé),
// des silhouettes noires. Chaque scène = un ciel (decor) + un sol + des éléments.
(function () {
  "use strict";
  let compteur = 0;
  const SOL = 392; // ligne du sol au premier plan

  const NOIR = "#14100D", KAOLIN = "#F1E8D8", OCRE = "#A2402A", ROUGE = "#EF2B2D", VERT = "#009E49", JAUNE = "#FCD116";
  const CIELS = {
    aube:       { ciel: JAUNE,  astre: "soleil-bas",      astreC: KAOLIN, terre: ROUGE, mur: KAOLIN, roche: KAOLIN, arbre: VERT, eau: KAOLIN, bloc: KAOLIN },
    jour:       { ciel: KAOLIN, astre: "soleil-haut",     astreC: JAUNE,  terre: OCRE,  mur: OCRE,   roche: KAOLIN, arbre: VERT, eau: KAOLIN, bloc: ROUGE },
    midi:       { ciel: JAUNE,  astre: "soleil-blanc",    astreC: KAOLIN, terre: OCRE,  mur: KAOLIN, roche: KAOLIN, arbre: VERT, eau: KAOLIN, bloc: ROUGE },
    crepuscule: { ciel: ROUGE,  astre: "soleil-couchant", astreC: JAUNE,  terre: OCRE,  mur: KAOLIN, roche: NOIR,   arbre: NOIR, eau: JAUNE,  bloc: KAOLIN },
    nuit:       { ciel: NOIR,   astre: "lune",            astreC: KAOLIN, terre: OCRE,  mur: KAOLIN, roche: KAOLIN, arbre: NOIR, eau: KAOLIN, bloc: KAOLIN },
  };
  let P = CIELS.jour; // palette de la scène en cours

  const OMBRE = NOIR;
  const g = (t, contenu, cls, style) => `<g${t ? ` transform="${t}"` : ""}${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""}>${contenu}</g>`;
  const alea = (graine) => () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
  const anneaux = (cx, cy, r, couleur) => `<circle cx="${cx}" cy="${cy}" r="${r * 2.6}" fill="${couleur}" opacity=".14"/><circle cx="${cx}" cy="${cy}" r="${r * 1.7}" fill="${couleur}" opacity=".2"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${couleur}"/>`;

  // ---------- ciel ----------
  function ciel(d) {
    const c = CIELS[d];
    let s = `<rect width="800" height="450" fill="${c.ciel}"/>`;
    if (c.astre === "soleil-bas") s += anneaux(560, 300, 40, c.astreC);
    if (c.astre === "soleil-haut") s += anneaux(640, 92, 32, c.astreC);
    if (c.astre === "soleil-blanc") s += g("", anneaux(400, 82, 46, c.astreC), "anim-chaleur");
    if (c.astre === "soleil-couchant") s += anneaux(200, 300, 42, c.astreC);
    if (c.astre === "lune") {
      const r = alea(7);
      let etoiles = "";
      for (let i = 0; i < 70; i++) {
        const x = r() * 800, y = r() * 260, t = r() * 1.6 + .4;
        etoiles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${t.toFixed(1)}" fill="${KAOLIN}" opacity="${(.35 + r() * .6).toFixed(2)}"${i % 7 === 0 ? ' class="anim-scintille" style="animation-delay:' + (r() * 4).toFixed(1) + 's"' : ""}/>`;
      }
      s += etoiles + anneaux(650, 80, 22, KAOLIN);
    }
    return s;
  }

  // ---------- éléments de décor ----------
  let avecCollines = true; // les décors 3D séparent les collines du reste
  const collines = (c) => avecCollines ? `<path d="M0 310 C120 270 210 285 300 298 C390 312 470 268 560 280 C650 292 720 268 800 284 L800 450 L0 450Z" fill="${c.terre}"/>` : "";
  const solPres = (c, y = SOL) => `<path d="M0 ${y} C150 ${y - 8} 300 ${y + 6} 450 ${y - 3} C600 ${y - 10} 700 ${y + 3} 800 ${y - 4} L800 450 L0 450Z" fill="${c.terre}" stroke="${NOIR}" stroke-width="2.5"/>`;
  const touffe = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`, g("", `<path d="M0 0 L-6 -16 L-2 -2 L0 -22 L2 -2 L7 -15 L3 0Z" fill="${OMBRE}"/>`, "anim-herbe"));
  const herbes = (y, n = 14, graine = 3) => { const r = alea(graine); let s = ""; for (let i = 0; i < n; i++) s += touffe(r() * 800, y + r() * 26, .7 + r() * .8); return s; };
  const acacia = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<path d="M-3 0 L-2 -60 L-24 -82 L-20 -84 L0 -66 L14 -92 L18 -90 L4 -62 L3 0Z" fill="${NOIR}"/>
     <path d="M-80 -88 C-60 -104 60 -108 86 -92 C60 -82 -50 -78 -80 -88Z" fill="${P.arbre}"/>`);
  const baobab = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<path d="M-30 0 C-24 -40 -26 -80 -18 -110 L-46 -150 L-40 -154 L-12 -122 L-10 -160 L-2 -160 L2 -124 L26 -158 L33 -152 L14 -116 C22 -80 24 -40 30 0Z" fill="${NOIR}"/>
     <circle cx="-44" cy="-158" r="14" fill="${P.arbre}"/><circle cx="-6" cy="-168" r="16" fill="${P.arbre}"/><circle cx="32" cy="-160" r="13" fill="${P.arbre}"/>`);
  const arbreRond = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<rect x="-4" y="-50" width="8" height="50" fill="${NOIR}"/><circle cx="0" cy="-70" r="34" fill="${P.arbre}"/><circle cx="-26" cy="-56" r="22" fill="${P.arbre}"/><circle cx="26" cy="-58" r="24" fill="${P.arbre}"/>`);
  const case_ = (x, y, s = 1, couleur = OMBRE) => g(`translate(${x} ${y}) scale(${s})`,
    `<rect x="-34" y="-46" width="68" height="46" fill="${couleur}"/><path d="M-44 -44 L0 -96 L44 -44Z" fill="${couleur}"/>
     <path d="M-10 0 L-10 -26 Q0 -34 10 -26 L10 0Z" fill="#000" opacity=".35"/>`);
  const grenier = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`,
    `<rect x="-18" y="-50" width="36" height="42" rx="12" fill="${OMBRE}"/><path d="M-24 -48 L0 -78 L24 -48Z" fill="${OMBRE}"/><rect x="-14" y="-8" width="4" height="8" fill="${OMBRE}"/><rect x="10" y="-8" width="4" height="8" fill="${OMBRE}"/>`);
  const murPalais = (c, x, y, l, h = 70) => {
    let creneaux = "";
    for (let i = 0; i < l; i += 30) creneaux += `<path d="M${i} ${-h} L${i + 8} ${-h - 14} L${i + 16} ${-h}Z" fill="${c.mur}" stroke="${NOIR}" stroke-width="2"/>`;
    return g(`translate(${x} ${y})`, `${creneaux}<rect x="0" y="${-h}" width="${l}" height="${h}" fill="${c.mur}" stroke="${NOIR}" stroke-width="2.5"/>
      <path d="M${l / 2 - 26} 0 L${l / 2 - 26} ${-h * .62} Q${l / 2} ${-h * .9} ${l / 2 + 26} ${-h * .62} L${l / 2 + 26} 0Z" fill="${NOIR}"/>
      <rect x="-20" y="${-h - 26}" width="40" height="${h + 26}" rx="16" fill="${c.mur}" stroke="${NOIR}" stroke-width="2.5"/><rect x="${l - 20}" y="${-h - 26}" width="40" height="${h + 26}" rx="16" fill="${c.mur}" stroke="${NOIR}" stroke-width="2.5"/>`);
  };
  const murBas = (c, y) => `<path d="M0 ${y} L800 ${y - 6} L800 ${y - 50} Q600 ${y - 58} 400 ${y - 52} Q200 ${y - 46} 0 ${y - 54}Z" fill="${c.mur}" stroke="${NOIR}" stroke-width="2.5"/>`;
  const rochers = (x, y, s = 1, flip = false) => g(`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`,
    `<path d="M0 0 L10 -90 L40 -150 L90 -170 L130 -140 L160 -150 L190 -90 L230 -60 L240 0Z" fill="${OMBRE}"/>`);
  const eau = (id, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.eau}" stroke="${NOIR}" stroke-width="2.5"/>
    ${g("", `<ellipse cx="${cx - rx * .3}" cy="${cy}" rx="${rx * .25}" ry="${ry * .2}" fill="none" stroke="${NOIR}" stroke-opacity=".5"/>
      <ellipse cx="${cx + rx * .35}" cy="${cy + ry * .25}" rx="${rx * .18}" ry="${ry * .16}" fill="none" stroke="${NOIR}" stroke-opacity=".45"/>`, "anim-rides")}`;
  const roseaux = (x, y, n = 6) => { let s = ""; for (let i = 0; i < n; i++) s += `<path d="M${x + i * 7} ${y} q${(i % 2 ? 4 : -3)} -30 ${(i % 2 ? 8 : -2)} -${46 + (i % 3) * 10}" stroke="${OMBRE}" stroke-width="3" fill="none"/>`; return g("", s, "anim-herbe"); };

  function sol(nom, d, id) {
    const c = CIELS[d];
    switch (nom) {
      case "savane": return collines(c) + acacia(130, SOL - 22, 1.05) + baobab(680, SOL - 12, .85) + solPres(c) + herbes(SOL + 4);
      case "savane-seche": return collines(c) + acacia(680, SOL - 30, .9) + solPres(c)
        + `<path d="M120 ${SOL + 30} l30 10 l-10 18 M420 ${SOL + 44} l40 -8 l18 14 M600 ${SOL + 22} l26 16" stroke="${NOIR}" stroke-opacity=".5" fill="none" stroke-width="2"/>` + herbes(SOL + 6, 6, 11);
      case "foret": return collines(c) + arbreRond(70, SOL - 6, 1.35) + arbreRond(470, SOL - 30, 1) + arbreRond(740, SOL - 4, 1.45) + baobab(600, SOL - 34, .62) + solPres(c) + herbes(SOL + 6, 10, 5);
      case "champ": {
        let tiges = "";
        for (let r = 0; r < 3; r++) for (let i = 0; i < 17; i++) {
          const x = 20 + i * 48 + r * 14, y = SOL + 8 + r * 20;
          tiges += `<path d="M${x} ${y} q2 -24 ${14 + (i % 3) * 4} -${18 + r * 3}" stroke="${OMBRE}" stroke-width="${2 + r * .6}" fill="none"/>`;
        }
        return collines(c) + solPres(c) + tiges;
      }
      case "palais": return collines(c) + baobab(110, SOL - 8, .8) + murPalais(c, 250, SOL - 22, 330) + solPres(c) + herbes(SOL + 8, 8, 13);
      case "cour": return collines(c) + murPalais(c, 60, SOL - 34, 680, 92) + case_(720, SOL - 30, .7, NOIR) + solPres(c);
      case "village": return collines(c) + case_(90, SOL - 2, 1) + grenier(178, SOL - 2, .9) + baobab(600, SOL - 22, .6) + case_(690, SOL - 4, .9) + case_(765, SOL, 1.05) + solPres(c) + herbes(SOL + 10, 8, 17);
      case "concession": return collines(c) + arbreRond(60, SOL - 50, .85) + case_(760, SOL - 44, .9) + murBas(c, SOL + 4) + solPres(c, SOL + 2) + herbes(SOL + 14, 6, 19);
      case "mare": return collines(c) + acacia(710, SOL - 40, .8) + solPres(c) + eau(id, 480, SOL + 26, 240, 26) + roseaux(238, SOL + 26) + roseaux(712, SOL + 30, 5);
      case "ravin": return collines(c) + rochers(-80, SOL + 14, 1) + rochers(880, SOL + 18, 1.05, true) + arbreRond(40, 250, .65) + arbreRond(770, 240, .7)
        + solPres(c) + eau(id, 400, SOL + 26, 230, 26);
      case "baobab-genie": return collines(c) + acacia(110, SOL - 24, .8) + baobab(560, SOL - 6, 1.55)
        + g("translate(560 " + (SOL - 50) + ")", `<path d="M-30 40 L-30 -6 Q0 -50 30 -6 L30 40Z" fill="${OCRE}" stroke="${KAOLIN}" stroke-width="3"/>`
          + `<g class="anim-lueur"><ellipse cx="-11" cy="-2" rx="6" ry="4" fill="${JAUNE}"/><ellipse cx="11" cy="-2" rx="6" ry="4" fill="${JAUNE}"/></g>`)
        + solPres(c) + `<path d="M120 ${SOL + 30} l30 10 l-10 18 M300 ${SOL + 40} l36 -6 l14 12 M660 ${SOL + 26} l26 14" stroke="${NOIR}" stroke-opacity=".5" fill="none" stroke-width="2"/>`;
      case "ciel-seul": return `<path d="M0 405 C200 390 600 395 800 402 L800 450 L0 450Z" fill="${c.terre}"/>`;
      case "rocher": return collines(c) + solPres(c) + `<path d="M500 ${SOL + 6} C510 ${SOL - 60} 580 ${SOL - 98} 660 ${SOL - 92} C730 ${SOL - 86} 778 ${SOL - 44} 790 ${SOL + 6}Z" fill="${c.roche}" stroke="${NOIR}" stroke-width="2.5"/>
        <path d="M540 ${SOL - 40} q40 -20 80 -6 M700 ${SOL - 60} q30 10 50 34" stroke="${NOIR}" stroke-opacity=".5" stroke-width="2.5" fill="none"/>` + herbes(SOL + 8, 6, 23);
      case "caverne": return collines(c) + `<path d="M120 ${SOL + 4} L150 210 L250 140 L420 122 L560 150 L660 220 L700 ${SOL + 4}Z" fill="${NOIR}"/>
        ${anneaux(410, 330, 46, JAUNE)}<path d="M320 ${SOL + 4} L330 300 Q410 238 490 300 L500 ${SOL + 4}Z" fill="${JAUNE}" opacity=".5"/>` + solPres(c, SOL + 4);
      case "ruines": {
        const r = alea(31); let blocs = "";
        const mur = (x0, y0, l, h) => { for (let yy = 0; yy < h; yy += 13) { let xx = (yy / 13) % 2 ? 9 : 0; while (xx < l) {
          const w = 15 + r() * 12;
          if (!(r() < .12 && yy > h - 30)) blocs += `<rect x="${(x0 + xx).toFixed(0)}" y="${y0 - yy - 12}" width="${w.toFixed(0)}" height="${(10 + r() * 3).toFixed(0)}" rx="3" fill="${c.bloc}" stroke="${NOIR}" stroke-width="1.6"/>`;
          xx += w + 3;
        } } };
        mur(40, SOL + 6, 320, 104); mur(420, SOL, 340, 78); mur(320, SOL - 40, 130, 44);
        return collines(c) + solPres(c) + `<g class="mur">${blocs}</g>`;
      }
      case "sahel": return (avecCollines ? `<path d="M0 320 C160 290 260 330 400 312 C540 294 640 330 800 300 L800 450 L0 450Z" fill="${c.terre}"/>` : "")
        + `<path d="M0 ${SOL} C200 ${SOL - 26} 350 ${SOL + 10} 520 ${SOL - 12} C650 ${SOL - 28} 720 ${SOL - 4} 800 ${SOL - 10} L800 450 L0 450Z" fill="${c.terre}" stroke="${NOIR}" stroke-width="2.5"/>` + acacia(650, SOL - 16, .7) + touffe(120, SOL + 16) + touffe(480, SOL + 6, .8);
      case "case": return `<rect width="800" height="450" fill="${OCRE}"/>
        <rect x="560" y="110" width="90" height="230" rx="45" fill="${NOIR}"/>
        <circle cx="590" cy="160" r="1.6" fill="${KAOLIN}"/><circle cx="620" cy="200" r="1.2" fill="${KAOLIN}"/><circle cx="600" cy="250" r="1.4" fill="${KAOLIN}"/>
        <path d="M0 0 L800 0 L800 40 Q400 90 0 40Z" fill="${NOIR}"/>
        <ellipse cx="400" cy="430" rx="460" ry="90" fill="${ROUGE}" stroke="${NOIR}" stroke-width="2.5"/>
        ${anneaux(660, 400, 60, JAUNE).replace(/<circle[^>]*r="60"[^>]*\/>$/, "")}`;
    }
    return "";
  }

  // ---------- personnages et animaux (silhouettes articulées) ----------
  // ---------- les personnes : peau, visage de profil, vêtements en pagne rayé ----------
  const PEAUX = ["#5C3722", "#4B2C1B", "#6A4029", "#3E2416"];
  const HABITS = [[ROUGE, NOIR], [VERT, JAUNE], [JAUNE, NOIR], [OCRE, KAOLIN], [KAOLIN, ROUGE], [NOIR, KAOLIN]];
  const BOIS = "#2A1A10", CHEVEUX = "#120C08";
  let idTissu = 0;
  const choix = (x, y) => Math.abs(Math.round(x * 7 + y * 13 + x * y * .01));
  // une étoffe : la forme, ses rayures, un contour noir
  function etoffe(d, couleur, rayure) {
    const id = "tissu" + (++idTissu);
    let r = "";
    for (let i = -60; i < 60; i += 7) r += `<rect x="${i}" y="-140" width="2.2" height="150" fill="${rayure}"/>`;
    return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${couleur}"/><g clip-path="url(#${id})" opacity=".8">${r}</g><path d="${d}" fill="none" stroke="${NOIR}" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  // un membre cerné de noir
  const trait = (x1, y1, x2, y2, couleur, l) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${NOIR}" stroke-width="${l + 2.6}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${couleur}" stroke-width="${l}" stroke-linecap="round"/>`;
  const pied = (x, y, peau) => `<path d="M${x - 3} ${y} L${x - 3} ${y - 3} Q${x + 2} ${y - 5} ${x + 7} ${y - 1} L${x + 7} ${y}Z" fill="${peau}" stroke="${NOIR}" stroke-width="1.3"/>`;
  // tête de profil, tournée vers la droite
  function tete(cx, cy, r, peau, coiffe, couleur) {
    let s = `<ellipse cx="${cx}" cy="${cy}" rx="${(r * .92).toFixed(1)}" ry="${(r * 1.06).toFixed(1)}" fill="${peau}" stroke="${NOIR}" stroke-width="1.4"/>
      <path d="M${cx + r * .82} ${cy - r * .15} L${cx + r * 1.2} ${cy + r * .22} L${cx + r * .82} ${cy + r * .32}Z" fill="${peau}" stroke="${NOIR}" stroke-width="1.1" stroke-linejoin="round"/>
      <circle cx="${cx + r * .45}" cy="${cy - r * .2}" r="${(r * .14).toFixed(1)}" fill="${NOIR}"/>
      <path d="M${cx + r * .5} ${cy + r * .5} q${r * .2} ${r * .06} ${r * .35} -${r * .04}" stroke="${NOIR}" stroke-width=".9" fill="none"/>`;
    if (coiffe === "bonnet") s += `<path d="M${cx - r * .98} ${cy - r * .4} L${cx - r * .8} ${cy - r * 1.5} L${cx + r * .82} ${cy - r * 1.5} L${cx + r * .98} ${cy - r * .4} Q${cx} ${cy - r * .62} ${cx - r * .98} ${cy - r * .4}Z" fill="${couleur}" stroke="${NOIR}" stroke-width="1.3" stroke-linejoin="round"/>`;
    else if (coiffe === "foulard") s += `<circle cx="${cx - r * 1.05}" cy="${cy - r * .75}" r="${(r * .5).toFixed(1)}" fill="${couleur}" stroke="${NOIR}" stroke-width="1.2"/>
      <path d="M${cx - r * 1.05} ${cy + r * .2} Q${cx - r * 1.25} ${cy - r * 1.65} ${cx + r * .35} ${cy - r * 1.4} Q${cx + r * 1.05} ${cy - r * 1.1} ${cx + r * .8} ${cy - r * .5} Q${cx + r * .1} ${cy - r * .78} ${cx - r * .5} ${cy - r * .25} Q${cx - r * .75} ${cy + r * .05} ${cx - r * 1.05} ${cy + r * .2}Z" fill="${couleur}" stroke="${NOIR}" stroke-width="1.3" stroke-linejoin="round"/>`;
    else s += `<path d="M${cx - r * .95} ${cy + r * .15} Q${cx - r * 1.05} ${cy - r * 1.2} ${cx + r * .6} ${cy - r * .98} Q${cx + r * .25} ${cy - r * .55} ${cx - r * .25} ${cy - r * .5} Q${cx - r * .62} ${cy - r * .25} ${cx - r * .95} ${cy + r * .15}Z" fill="${CHEVEUX}"/>`;
    return s;
  }
  // bras en deux parties : manche en tissu, avant-bras et main en peau
  function bras(ax, ay, bx, by, manche, peau, plie = 1) {
    const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, n = Math.hypot(dx, dy) || 1;
    const cx = mx - dy / n * 4 * plie, cy = my + dx / n * 4 * plie;
    return trait(ax, ay, cx, cy, manche, 6.5) + trait(cx, cy, bx, by, peau, 5) + `<circle cx="${bx}" cy="${by}" r="3.3" fill="${peau}" stroke="${NOIR}" stroke-width="1.1"/>`;
  }
  function objetTenu(objet, lx, ly) {
    if (objet === "lance") return `<line x1="${lx + 2}" y1="${ly + 30}" x2="${lx + 8}" y2="-150" stroke="${BOIS}" stroke-width="3"/><path d="M${lx + 8} -164 L${lx + 3} -148 L${lx + 13} -148Z" fill="${NOIR}"/>`;
    if (objet === "arc") return `<path d="M${lx - 4} ${ly - 46} Q${lx + 26} ${ly} ${lx - 4} ${ly + 46}" fill="none" stroke="${BOIS}" stroke-width="3"/><line x1="${lx - 4}" y1="${ly - 46}" x2="${lx - 4}" y2="${ly + 46}" stroke="${NOIR}" stroke-width="1"/>`;
    if (objet === "baton") return `<line x1="${lx}" y1="${ly - 6}" x2="${lx + 6}" y2="0" stroke="${BOIS}" stroke-width="3.2"/>`;
    if (objet === "poulet") return poulet(lx + 8, ly + 8, .55);
    if (objet === "calebasse") return calebasse(lx + 6, ly + 6, .55);
    return "";
  }

  const jambeDebout = (peau, femme) => trait(-5, -32, -7, -4, femme ? peau : "#3A2A1E", 7) + pied(-8, 0, peau) + trait(5, -32, 7, -4, femme ? peau : "#3A2A1E", 7) + pied(6, 0, peau);
  // djembé : (x, y) = posé au sol
  function djembe(x, y, s = 1) {
    let cordes = "";
    for (let i = -12; i <= 12; i += 6) cordes += `<path d="M${i} -46 L${i * .35} -24" stroke="${KAOLIN}" stroke-width="1.4"/>`;
    return g(`translate(${x} ${y}) scale(${s})`, `<path d="M-15 -46 Q-14 -30 -5 -24 L-5 -18 Q-12 -6 -11 0 L11 0 Q12 -6 5 -18 L5 -24 Q14 -30 15 -46Z" fill="${OCRE}" stroke="${NOIR}" stroke-width="1.8" stroke-linejoin="round"/>
      ${cordes}<ellipse cx="0" cy="-46" rx="15" ry="4" fill="${KAOLIN}" stroke="${NOIR}" stroke-width="1.6"/><path d="M-11 0 L11 0" stroke="${NOIR}" stroke-width="2"/>`);
  }

  function personne(x, y, s = 1, o = {}) {
    const k = choix(x, y);
    const peau = o.peau || PEAUX[k % PEAUX.length];
    const [tissu, rayure] = o.robe ? [o.robe, o.liseré || (o.robe === KAOLIN ? ROUGE : NOIR)] : HABITS[k % HABITS.length];
    const femme = o.coiffe === "foulard";
    const [pagne, rayurePagne] = HABITS[(k + 2) % HABITS.length];
    const coiffeC = o.bonnet || (femme ? pagne : ROUGE);
    const coiffe = o.coiffe || (k % 3 === 0 ? "bonnet" : "");
    const manche = o.manches || tissu;
    const pose = o.pose || "debout";
    const sens = (corps) => g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`, corps, o.cls);

    if (pose === "assis") {
      const corps = trait(-2, -12, 22, -14, femme ? pagne : "#3A2A1E", 9) + trait(22, -14, 24, -2, peau, 6) + pied(25, 0, peau)
        + etoffe("M-12 -50 Q0 -54 11 -50 L15 -12 Q0 -8 -15 -12Z", tissu, rayure)
        + trait(0, -54, 1, -50, peau, 5) + tete(2, -62, 8, peau, coiffe, coiffeC)
        + bras(7, -46, 21, -20, manche, peau);
      return sens(corps);
    }
    if (pose === "agenouille") {
      const p = o.penche || 18;
      const corps = trait(-16, -3, 8, -3, femme ? pagne : "#3A2A1E", 8) + trait(8, -3, -4, -20, femme ? pagne : "#3A2A1E", 9) + pied(-18, 0, peau)
        + g(`rotate(${p} -4 -22)`, etoffe("M-12 -60 Q-2 -64 9 -60 L11 -20 Q-2 -16 -14 -20Z", tissu, rayure)
          + trait(-1, -63, -1, -59, peau, 5) + tete(1, -72, 8, peau, coiffe, coiffeC))
        + bras(4, -50, 34, -30, manche, peau, -1)
        + (o.objet === "poulet" ? poulet(38, -24, .6) : o.objet === "calebasse" ? calebasse(40, -26, .6) : o.objet === "pinceau" ? `<line x1="34" y1="-30" x2="50" y2="-18" stroke="${BOIS}" stroke-width="3"/>` : "");
      return sens(corps);
    }
    if (pose === "tambour" || pose === "salut") {
      const tambour = pose === "tambour";
      const brasAvant = tambour
        ? `<g class="anim-frappe" style="transform-origin:11px -77px">${bras(11, -77, 30, -50, manche, peau)}</g>`
        : `<g class="anim-salue" style="transform-origin:11px -77px">${bras(11, -77, 24, -116, manche, peau, -1)}</g>`;
      const corps = jambeDebout(peau, femme) + (tambour ? djembe(30, 0, .95) : "")
        + `${bras(-11, -77, tambour ? 22 : -18, tambour ? -48 : -44, manche, peau, -1)}${femme ? etoffe("M-16 -48 L16 -48 L19 -8 Q0 -5 -19 -8Z", pagne, rayurePagne) : ""}
        ${etoffe("M-12 -80 Q0 -84 12 -80 L19 -30 Q0 -26 -19 -30Z", tissu, rayure)}
        ${trait(0, -84, 0, -79, peau, 6)}${tete(0, -91, 8.4, peau, coiffe, coiffeC)}${brasAvant}`;
      return sens(corps);
    }
    const marche = pose === "marche";
    const jambeG = trait(-5, -32, -7, -4, femme ? peau : "#3A2A1E", 7) + pied(-8, 0, peau);
    const jambeD = trait(5, -32, 7, -4, femme ? peau : "#3A2A1E", 7) + pied(6, 0, peau);
    const jambes = marche
      ? `<g class="anim-jambe-a">${trait(-4, -32, -12, -4, femme ? peau : "#3A2A1E", 7)}${pied(-13, 0, peau)}</g><g class="anim-jambe-b">${trait(4, -32, 12, -4, femme ? peau : "#3A2A1E", 7)}${pied(11, 0, peau)}</g>`
      : jambeG + jambeD;
    const penche = pose === "penche" ? 'transform="rotate(22 0 -32)"' : "";
    const brasL = pose === "bras-leves" ? [-24, -112] : pose === "penche" ? [-14, -50] : [-20, -46];
    const [lx, ly] = pose === "bras-leves" ? [24, -112] : o.objet === "lance" ? [22, -60] : [20, -46];
    const robeLongue = femme ? etoffe("M-16 -48 L16 -48 L19 -8 Q0 -5 -19 -8Z", pagne, rayurePagne) : "";
    const garniture = o.liseré && o.robe ? `<path d="M-1 -80 L-1 -30 M1 -80 L1 -30" stroke="${o.liseré}" stroke-width="2"/>` : "";
    const corps = `${jambes}<g ${penche}>${bras(-11, -77, brasL[0], brasL[1], manche, peau, -1)}${robeLongue}
      ${etoffe("M-12 -80 Q0 -84 12 -80 L19 -30 Q0 -26 -19 -30Z", tissu, rayure)}${garniture}
      ${trait(0, -84, 0, -79, peau, 6)}${tete(0, -91, 8.4, peau, coiffe, coiffeC)}
      ${bras(11, -77, lx, ly, manche, peau, pose === "bras-leves" ? -1 : 1)}${objetTenu(o.objet, lx, ly)}</g>`;
    return sens(corps);
  }

  // cheval : (x, y) = sabots au sol, à gauche de la silhouette
  function cheval(x, y, s = 1, o = {}) {
    const allure = o.allure || "galop";
    const arret = allure === "debout" ? "-arret" : "";
    const coul = o.couleur || "#5A3720", contour = ` stroke="${NOIR}" stroke-width="2.2"`;
    const jambe = (x1, y1, ang, cls) => {
      const x2 = (x1 + Math.sin(ang) * 32).toFixed(1), y2 = (y1 + Math.cos(ang) * 32).toFixed(1);
      return `<g class="${cls}${arret}" style="transform-origin:${x1}px ${y1}px"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${NOIR}" stroke-width="9.5" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${coul}" stroke-width="6" stroke-linecap="round"/></g>`;
    };
    const k = allure === "galop" ? 1 : allure === "pas" ? .4 : 0;
    const jambes = jambe(96, 54, .6 * k, "anim-patte-av") + jambe(88, 56, .2 * k, "anim-patte-av2") + jambe(48, 54, -.6 * k, "anim-patte-ar") + jambe(40, 52, -.2 * k, "anim-patte-ar2");
    const kc = choix(x, y), peauC = PEAUX[kc % PEAUX.length], [tissuC, rayureC] = o.robe ? [o.robe, NOIR] : HABITS[(kc + 1) % HABITS.length];
    const cavalier = o.cavalier ? `<g class="cavalier">${trait(64, 34, 58, 58, "#3A2A1E", 5)}${etoffe("M60 36 L68 6 Q75 3 82 8 L76 38Z", tissuC, rayureC)}
      ${tete(76, -4, 7, peauC, kc % 2 ? "bonnet" : "", ROUGE)}${bras(74, 12, 104, 22, tissuC, peauC)}
      ${o.lance ? `<line x1="60" y1="40" x2="128" y2="-16" stroke="${OMBRE}" stroke-width="3"/><path d="M134 -21 L122 -16 L128 -10Z" fill="${OMBRE}"/>` : ""}</g>` : "";
    const corps = `<g class="${allure === "galop" ? "anim-galop" : allure === "pas" ? "anim-pas" : ""}">${jambes}
      <path d="M34 38 C18 40 14 56 10 70 C22 60 30 52 36 46Z" fill="${coul}"${contour} class="anim-queue"/>
      <path d="M92 36 L106 10 L114 6 L130 16 L128 24 L114 22 L106 48Z" fill="${coul}"${contour}/><path d="M110 8 L112 -2 L116 7Z" fill="${coul}"${contour}/>
      <ellipse cx="70" cy="44" rx="38" ry="16" fill="${coul}"${contour}/>
      <path d="M100 14 L94 26 L104 22 L98 34 L106 28Z" fill="${OMBRE}"/>${cavalier}</g>`;
    return g(`translate(${x} ${(y - 86 * s).toFixed(1)}) scale(${o.flip ? -s : s} ${s})`, corps, o.cls);
  }

  function quadrupede(x, y, s, type, o = {}) {
    const coul = { boeuf: "#7A4A2A", mouton: KAOLIN, chien: "#8A5A30" }[type], bord = ` stroke="${NOIR}" stroke-width="1.6"`;
    const [rx, ry, h] = { boeuf: [46, 18, 1.15], mouton: [30, 14, .8], chien: [30, 9, .7] }[type];
    const pattes = [-rx * .6, -rx * .35, rx * .45, rx * .7].map((px, i) =>
      `<line x1="${px}" y1="0" x2="${px + (i % 2 ? 2 : -2)}" y2="${26 * h}" stroke="${NOIR}" stroke-width="${type === "boeuf" ? 8.5 : 6.5}" stroke-linecap="round"/><line x1="${px}" y1="0" x2="${px + (i % 2 ? 2 : -2)}" y2="${26 * h}" stroke="${coul}" stroke-width="${type === "boeuf" ? 6 : 4}" stroke-linecap="round"/>`).join("");
    let tete;
    if (type === "boeuf") tete = `<path d="M${rx - 6} -10 L${rx + 22} -14 L${rx + 26} 2 L${rx + 4} 6Z" fill="${coul}"${bord}/><path d="M${rx + 8} -14 Q${rx - 2} -40 ${rx + 14} -44 M${rx + 16} -14 Q${rx + 34} -38 ${rx + 24} -46" stroke="${OMBRE}" stroke-width="4" fill="none"/><path d="M-6 -${ry} q14 -14 26 0Z" fill="${coul}"${bord}/>`;
    else if (type === "mouton") tete = `<ellipse cx="${rx + 6}" cy="-6" rx="10" ry="7" fill="${coul}"${bord}/><path d="M${rx} -12 q-8 4 -4 10" stroke="${OMBRE}" stroke-width="3" fill="none"/>`;
    else tete = `<g class="anim-aboie"><path d="M${rx - 6} -4 L${rx + 4} -18 L${rx + 20} -14 L${rx + 18} -6 L${rx + 4} -2Z" fill="${coul}"${bord}/><path d="M${rx + 2} -16 L${rx + 4} -26 L${rx + 9} -16Z" fill="${coul}"${bord}/></g><path d="M${-rx} -4 q-12 -8 -8 -20" stroke="${OMBRE}" stroke-width="4" fill="none"/>`;
    const corps = type === "mouton"
      ? `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${coul}"${bord}/><circle cx="-16" cy="-10" r="9" fill="${coul}"${bord}/><circle cx="2" cy="-13" r="9" fill="${coul}"${bord}/><circle cx="18" cy="-9" r="8" fill="${coul}"${bord}/>`
      : `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${coul}"${bord}/>`;
    return g(`translate(${x} ${(y - 26 * h * s).toFixed(1)}) scale(${o.flip ? -s : s} ${s})`, pattes + corps + tete, o.cls);
  }

  function coq(x, y, s = 1, o = {}) {
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`,
      `<line x1="-2" y1="-14" x2="-4" y2="0" stroke="${OMBRE}" stroke-width="2.5"/><line x1="4" y1="-14" x2="5" y2="0" stroke="${OMBRE}" stroke-width="2.5"/>
       <ellipse cx="0" cy="-22" rx="14" ry="10" fill="#8A4A20" stroke="${NOIR}" stroke-width="1.4"/><path d="M-12 -24 Q-30 -46 -16 -52 Q-22 -36 -6 -30Z" fill="${NOIR}"/>
       <g class="anim-picore"><circle cx="12" cy="-36" r="6" fill="#8A4A20" stroke="${NOIR}" stroke-width="1.2"/><path d="M9 -42 l3 -6 l3 6 l3 -5 l1 6Z" fill="${o.crete || ROUGE}"/><path d="M17 -36 l6 2 l-6 2Z" fill="${OMBRE}"/></g>`, o.cls);
  }
  const poulet = (x, y, s = 1) => coq(x, y, s, { crete: ROUGE });

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
       <circle cx="110" cy="16" r="2" fill="${KAOLIN}"/></g>`, o.cls);
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
      ${o.charge ? `<rect x="10" y="-70" width="22" height="16" rx="4" fill="${JAUNE}"/>` : ""}</g>`, o.cls);
  }

  // calebasse : (x, y) = posée au sol ; o.to = remplie de tô ; o.fumee = encore chaude
  function calebasse(x, y, s = 1, o = {}) {
    return g(`translate(${x} ${y}) scale(${s})`,
      (o.to ? `<path d="M-19 -16 Q0 -38 19 -16Z" fill="${KAOLIN}" stroke="${NOIR}" stroke-width="2.5"/>` : "")
      + `<path d="M-26 -16 Q-24 0 0 0 Q24 0 26 -16Z" fill="${OCRE}" stroke="${NOIR}" stroke-width="2.5"/>`
      + (o.fumee ? g("translate(0 -40) scale(.7)", [0, 1, 2].map((i) => `<circle cx="${i * 6 - 6}" cy="0" r="12" fill="${KAOLIN}" class="anim-fumee" style="animation-delay:${i * .9}s"/>`).join("")) : ""));
  }

  // araignée : (x, y) = pattes au sol ; o.sac = sac sur le dos ; o.piqures = couverte de piqûres
  function araignee(x, y, s = 1, o = {}) {
    let pattes = "";
    for (let i = 0; i < 4; i++) {
      pattes += `<path d="M10 -40 L${34 + i * 10} ${-70 + i * 6} L${44 + i * 16} 0" stroke="${OMBRE}" stroke-width="4.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
      pattes += `<path d="M-6 -40 L${-26 - i * 12} ${-72 + i * 6} L${-40 - i * 16} 0" stroke="${OMBRE}" stroke-width="4.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    const corps = `<ellipse cx="-10" cy="-48" rx="34" ry="27" fill="${OMBRE}"/><circle cx="24" cy="-40" r="13" fill="${OMBRE}"/>
      <circle cx="29" cy="-44" r="2.6" fill="${KAOLIN}"/><circle cx="33" cy="-39" r="2.2" fill="${KAOLIN}"/>`;
    const sac = o.sac ? `<path d="M-36 -66 C-40 -90 -4 -96 0 -72 C2 -62 -32 -58 -36 -66Z" fill="${OCRE}" stroke="${NOIR}" stroke-width="2.5"/><path d="M-6 -88 l8 -8 l4 6Z" fill="${OCRE}" stroke="${NOIR}" stroke-width="2"/>` : "";
    const piqures = o.piqures ? [[-24, -56], [-4, -36], [-18, -30], [8, -58], [22, -48]].map(([px, py]) => `<circle cx="${px}" cy="${py}" r="3.4" fill="${ROUGE}"/>`).join("") : "";
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`, `<g class="${o.anim || ""}">${pattes}${corps}${sac}${piqures}</g>`, o.cls);
  }

  // lièvre : (x, y) = au sol, tourné vers la droite
  function lievre(x, y, s = 1, o = {}) {
    const gris = "#8A6A4E", bord = ` stroke="${NOIR}" stroke-width="1.4"`;
    const corps = o.pose === "court"
      ? `<ellipse cx="0" cy="-24" rx="30" ry="13" fill="${gris}"${bord}/><line x1="18" y1="-16" x2="36" y2="-6" stroke="${gris}" stroke-width="5" stroke-linecap="round"/><line x1="-18" y1="-16" x2="-40" y2="-4" stroke="${gris}" stroke-width="6" stroke-linecap="round"/>
         <circle cx="30" cy="-36" r="10" fill="${gris}"${bord}/><ellipse cx="22" cy="-58" rx="5" ry="18" fill="${gris}"${bord} transform="rotate(-50 22 -46)"/><ellipse cx="28" cy="-60" rx="5" ry="18" fill="${gris}"${bord} transform="rotate(-36 28 -48)"/>`
      : `<ellipse cx="-6" cy="-22" rx="22" ry="20" fill="${gris}"${bord}/><ellipse cx="-14" cy="-6" rx="18" ry="7" fill="${gris}"${bord}/><line x1="10" y1="-16" x2="14" y2="0" stroke="${gris}" stroke-width="5" stroke-linecap="round"/>
         <circle cx="12" cy="-44" r="11" fill="${gris}"${bord}/><ellipse cx="6" cy="-74" rx="5" ry="20" fill="${gris}"${bord} transform="rotate(-10 6 -56)"/><ellipse cx="16" cy="-72" rx="5" ry="19" fill="${gris}"${bord} transform="rotate(12 16 -54)"/>`;
    const queue = o.pose === "court" ? `<circle cx="-30" cy="-30" r="5" fill="${KAOLIN}" stroke="${NOIR}" stroke-width="1.5"/>` : `<circle cx="-28" cy="-16" r="5" fill="${KAOLIN}" stroke="${NOIR}" stroke-width="1.5"/>`;
    const oeil = o.pose === "court" ? `<circle cx="34" cy="-38" r="2" fill="${NOIR}"/>` : `<circle cx="16" cy="-46" r="2" fill="${NOIR}"/>`;
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`, `<g class="${o.anim || ""}">${corps}${queue}${oeil}</g>`, o.cls);
  }

  // biche : (x, y) = sabots au sol, tournée vers la droite
  function biche(x, y, s = 1, o = {}) {
    const fauve = "#B07A45", bord = ` stroke="${NOIR}" stroke-width="1.5"`;
    const pattes = [-22, -14, 14, 22].map((px) => trait(px, -44, px + (px < 0 ? -2 : 2), 0, fauve, 3.5)).join("");
    return g(`translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`,
      `${pattes}<ellipse cx="0" cy="-48" rx="30" ry="12" fill="${fauve}"${bord}/><path d="M20 -54 L32 -84 L40 -82 L34 -50Z" fill="${fauve}"${bord}/>
       <path d="M30 -84 L50 -80 L48 -74 L34 -76Z" fill="${fauve}"${bord}/><path d="M33 -86 L30 -98 L38 -88Z" fill="${fauve}"${bord}/>
       <path d="M-28 -54 L-36 -60 L-32 -48Z" fill="${fauve}"${bord}/><circle cx="40" cy="-80" r="1.6" fill="${KAOLIN}"/>`, o.cls);
  }

  // essaim de guêpes, du trou vers la gauche
  function guepes(x, y, n = 26) {
    const r = alea(53); let s = "";
    for (let i = 0; i < n; i++) {
      const t = r(), px = x - t * 300 - r() * 40, py = y - 30 + Math.sin(t * 9 + i) * 40 + (r() - .5) * 50;
      s += `<g transform="translate(${px.toFixed(0)} ${py.toFixed(0)}) rotate(${(r() * 50 - 25).toFixed(0)})"><ellipse cx="-3" cy="-7" rx="5" ry="3" fill="${KAOLIN}" stroke="${NOIR}" stroke-width="1"/><ellipse cx="0" cy="0" rx="8" ry="4.5" fill="${JAUNE}" stroke="${NOIR}" stroke-width="1.6"/><line x1="-2" y1="-4" x2="-2" y2="4" stroke="${NOIR}" stroke-width="2"/><line x1="3" y1="-4" x2="3" y2="4" stroke="${NOIR}" stroke-width="2"/></g>`;
    }
    return g("", s, "anim-flotte");
  }

  function feu(x, y, s = 1, id) {
    return g(`translate(${x} ${y}) scale(${s})`, `<g class="anim-lueur"><circle cx="0" cy="-20" r="80" fill="${JAUNE}" opacity=".14"/><circle cx="0" cy="-20" r="46" fill="${JAUNE}" opacity=".18"/></g>
      <path d="M-26 0 L26 0 L20 6 L-20 6Z" fill="${OMBRE}"/><path d="M-22 2 L18 -6 M-18 -6 L22 2" stroke="${NOIR}" stroke-width="5"/>
      <g class="anim-flamme"><path d="M-14 0 C-18 -16 -6 -22 -8 -40 C4 -30 12 -20 14 0Z" fill="${ROUGE}"/>
      <path d="M-6 0 C-10 -14 0 -20 0 -32 C8 -22 10 -12 8 0Z" fill="${JAUNE}"/><path d="M2 0 C0 -10 10 -14 10 -26 C16 -16 16 -8 14 0Z" fill="${JAUNE}"/></g>`);
  }

  function fumee(x, y) {
    return g(`translate(${x} ${y})`, [0, 1, 2].map((i) => `<circle cx="0" cy="0" r="16" fill="${KAOLIN}" class="anim-fumee" style="animation-delay:${i * .9}s"/>`).join(""));
  }

  function canon(x, y, s = 1) {
    return g(`translate(${x} ${y}) scale(${s})`, `<g class="anim-recul"><rect x="-10" y="-30" width="90" height="20" rx="9" fill="${OMBRE}" transform="rotate(-14 0 -20)"/>
      <circle cx="10" cy="-10" r="16" fill="none" stroke="${OMBRE}" stroke-width="5"/><circle cx="10" cy="-10" r="3" fill="${OMBRE}"/></g>
      <g transform="translate(86 -46)"><circle r="20" fill="${JAUNE}" class="anim-eclair"/>${[0, 1, 2].map((i) => `<circle r="18" cx="${i * 12}" cy="${-i * 8}" fill="${KAOLIN}" class="anim-fumee-canon" style="animation-delay:${.15 + i * .15}s"/>`).join("")}</g>`);
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
      case "ministres": { let s = ""; for (let i = 0; i < 6; i++) s += personne(170 + i * 76, S + 22, 1, { pose: "assis", coiffe: "bonnet", bonnet: ROUGE }); return g("", s, "entree"); }
      case "ministres-devant": { let s = ""; for (let i = 0; i < 4; i++) s += personne(500 + i * 56, S + 20, 1, { pose: i % 2 ? "bras-leves" : "debout", flip: true }); return g("", s, "entree"); }
      case "roi-rouge": return personne(330, S + 22, 1.5, { robe: ROUGE, manches: ROUGE, liseré: JAUNE, coiffe: "bonnet", bonnet: ROUGE, cls: "entree" });
      case "roi-blanc": return personne(330, S + 22, 1.5, { robe: KAOLIN, manches: KAOLIN, coiffe: "bonnet", bonnet: KAOLIN, liseré: NOIR, cls: "entree" });
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
      case "etoiles-vives": return `<path d="M120 60 L380 160" stroke="${KAOLIN}" stroke-width="2.5" stroke-linecap="round" class="anim-filante"/>`
        + g("", anneaux(400, 200, 10, KAOLIN), "anim-lueur");
      case "descente": return `<path d="M250 0 L390 0 L470 ${S + 10} L170 ${S + 10}Z" fill="${KAOLIN}" opacity=".32"/>`
        + g("", cheval(240, S + 6, 1, { cavalier: true, lance: true, allure: "debout" }) + personne(390, S + 10, .9, { coiffe: "foulard" })
          + quadrupede(215, S + 12, .5, "boeuf") + quadrupede(440, S + 14, .45, "mouton"), "anim-descend");
      case "empreintes": return g(`translate(650 ${S - 86})`, `<g class="anim-lueur-douce"><ellipse cx="-14" cy="0" rx="7" ry="14" fill="#000" opacity=".45" transform="rotate(-8)"/><ellipse cx="14" cy="-6" rx="7" ry="14" fill="#000" opacity=".45" transform="rotate(8)"/>
        ${[-19, -16, -13, -10].map((dx) => `<circle cx="${dx}" cy="-17" r="2.2" fill="#000" opacity=".45"/>`).join("")}${[10, 13, 16, 19].map((dx) => `<circle cx="${dx}" cy="-23" r="2.2" fill="#000" opacity=".45"/>`).join("")}</g>`)
        + personne(420, S + 12, 1.05, { objet: "lance" });
      case "feu-caverne": return feu(420, S + 4, .9, id) + personne(376, S + 6, .8, { pose: "assis" });
      case "herbes": return herbes(S - 4, 22, 41);
      case "caravane": return g("", chameau(300, S + 12, .9, { cavalier: true }) + chameau(160, S + 10, .8, { charge: true }) + chameau(10, S + 14, .85, { cavalier: true, charge: true }), "anim-traverse-lent");
      case "chercheurs": return personne(230, S + 14, 1, { pose: "agenouille", objet: "pinceau", penche: 30 }) + personne(300, S + 14, 1.05)
        + `<line x1="370" y1="${S + 14}" x2="374" y2="${S - 40}" stroke="${NOIR}" stroke-width="3"/><rect x="373" y="${S - 40}" width="14" height="10" fill="${JAUNE}"/>`;
      case "mere": return feu(690, S + 26, .8, id) + personne(625, S + 28, 1.05, { pose: "assis", coiffe: "foulard" });
      case "animaux": return quadrupede(105, S + 30, 1, "boeuf") + quadrupede(228, S + 30, .9, "mouton") + cheval(272, S + 28, .85, { allure: "debout" }) + coq(430, S + 30, 1.15) + quadrupede(510, S + 30, 1, "chien", { flip: true });
      case "lezards": return lezard(330, 372, 1.4) + lezard(470, 372, 1.4, { flip: true }) + `<circle cx="400" cy="366" r="3.5" fill="${OMBRE}"/>` + feu(680, 420, .7, id);
      case "chien": return quadrupede(170, 420, 1.15, "chien", { cls: "entree" });
      case "case-feu": return g(`translate(400 ${S + 4}) scale(1.3)`, `<g class="anim-lueur"><circle cx="0" cy="-50" r="110" fill="${JAUNE}" opacity=".16"/><circle cx="0" cy="-50" r="70" fill="${JAUNE}" opacity=".2"/></g>`) + case_(400, S + 4, 1.3)
        + g(`translate(400 ${S - 70}) scale(1.6)`, `<g class="anim-flamme"><path d="M-30 0 C-36 -24 -10 -34 -16 -64 C8 -46 22 -30 26 0Z" fill="${ROUGE}"/><path d="M-14 0 C-18 -20 2 -30 0 -48 C14 -34 16 -16 12 0Z" fill="${JAUNE}"/></g>`)
        + fumee(420, 200) + quadrupede(620, S + 30, 1, "chien", { flip: true });
      case "cheval-court": return g("", cheval(0, S + 6, 1.2, { allure: "galop" }), "anim-traverse");
      // Yemboado
      case "yemboado-partage": return personne(250, S + 10, 1.1, { objet: "calebasse", cls: "entree" }) + personne(318, S + 12, .62, { flip: true }) + personne(352, S + 12, .7, { coiffe: "foulard", flip: true })
        + personne(560, S + 14, 1, { pose: "bras-leves", flip: true }) + personne(612, S + 16, 1.05, { flip: true }) + personne(660, S + 14, .95, { pose: "bras-leves", flip: true });
      case "chef-epreuve": return personne(140, S + 14, 1.35, { coiffe: "bonnet", liseré: JAUNE, objet: "baton", cls: "entree" })
        + personne(330, S + 12, 1.05, { objet: "arc", pose: "marche" }) + personne(410, S + 12, 1.1, { objet: "arc", pose: "marche" }) + personne(490, S + 12, 1, { objet: "arc", pose: "marche" })
        + personne(660, S + 14, 1, { objet: "arc", flip: true });
      case "vieille-repoussee": return personne(600, S + 14, 1, { pose: "assis", coiffe: "foulard" }) + calebasse(640, S + 14, .5)
        + personne(300, S + 12, 1.05, { objet: "arc", pose: "bras-leves" }) + personne(370, S + 12, 1.1, { objet: "arc" }) + personne(220, S + 12, 1, { objet: "arc", pose: "marche" });
      case "yemboado-offre": return g("", anneaux(600, S - 30, 40, KAOLIN).replace(/<circle[^>]*r="40"[^>]*\/>$/, ""), "anim-lueur-douce")
        + personne(600, S + 14, 1, { pose: "assis", coiffe: "foulard" }) + personne(520, S + 14, 1.1, { pose: "agenouille", objet: "calebasse", penche: 14 });
      case "etalon-biche": return g("", anneaux(400, S - 46, 34, KAOLIN).replace(/<circle[^>]*r="34"[^>]*\/>$/, ""), "anim-lueur-douce")
        + cheval(220, S + 10, 1.15, { allure: "debout", couleur: KAOLIN }) + biche(430, S + 12, 1.1, { flip: true }) + personne(120, S + 12, 1.1, { objet: "arc" });
      case "retour-yemboado": return cheval(170, S + 10, 1.15, { allure: "pas", couleur: KAOLIN, cavalier: true }) + biche(360, S + 14, .85)
        + personne(470, S + 14, 1.35, { coiffe: "bonnet", liseré: JAUNE, objet: "baton", flip: true })
        + personne(560, S + 14, 1, { pose: "bras-leves", flip: true }) + personne(610, S + 16, .95, { coiffe: "foulard", flip: true }) + personne(660, S + 14, 1.05, { flip: true });
      // L'Araignée et le Lièvre
      case "araignee-gemit": return araignee(330, S + 12, 1.2, { anim: "anim-hoche" });
      case "famille-faim": return personne(600, S + 14, 1, { pose: "assis", coiffe: "foulard" }) + personne(650, S + 14, .55) + personne(680, S + 14, .5) + calebasse(560, S + 14, .45);
      case "araignee-ecoute": return araignee(330, S + 12, 1.1, { sac: true });
      case "araignee-mange": return araignee(400, S + 12, 1.15) + calebasse(470, S + 14, .8, { to: true, fumee: true });
      case "trainee-cendre": return `<path d="M0 ${S + 26} C140 ${S + 40} 250 ${S + 14} 420 ${S + 22}" stroke="${KAOLIN}" stroke-width="6" stroke-dasharray="3 12" stroke-linecap="round" fill="none"/>`
        + araignee(500, S + 18, 1, { sac: true }) + lievre(150, S + 30, 1, { pose: "court" });
      case "lievre-mange": return lievre(420, S + 14, 1.15) + calebasse(490, S + 14, .8, { to: true, fumee: true });
      case "guepes": return guepes(560, S - 50) + araignee(170, S + 14, 1, { sac: true, piqures: true, flip: true }) + lievre(650, S + 14, 1, { flip: true, anim: "anim-hoche" });
    }
    return "";
  }

  window.dessinerScene = function (scene, alt) {
    const id = ++compteur;
    P = CIELS[scene.decor];
    avecCollines = true;
    const contenu = ciel(scene.decor) + sol(scene.sol, scene.decor, id) + (scene.elements || []).map((e) => element(e, scene.decor, id)).join("");
    return `<svg viewBox="0 0 800 450" role="img" aria-label="${alt.replace(/"/g, "&quot;")}" class="scene-svg decor-${scene.decor}" preserveAspectRatio="xMidYMax slice">${contenu}</svg>`;
  };

  // Pour les décors 3D : trois couches séparées (ciel, collines, décor du sol, personnages)
  window.couchesScene = function (scene) {
    const id = ++compteur;
    P = CIELS[scene.decor];
    const enveloppe = (contenu) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="1600" height="900">${contenu}</svg>`;
    avecCollines = true;
    const collinesSeules = scene.sol === "case" ? "" : (scene.sol === "sahel" ? `<path d="M0 320 C160 290 260 330 400 312 C540 294 640 330 800 300 L800 450 L0 450Z" fill="${P.terre}"/>` : collines(P));
    avecCollines = false;
    const couches = {
      ciel: enveloppe(ciel(scene.decor)),
      collines: enveloppe(collinesSeules),
      sol: enveloppe(sol(scene.sol, scene.decor, id)),
      elements: enveloppe((scene.elements || []).map((e) => element(e, scene.decor, id)).join("")),
      couleurs: { ciel: P.ciel, terre: P.terre },
    };
    avecCollines = true;
    return couches;
  };
  // Scène d'accueil : les tambours de la veillée, un garde à cheval, et quelqu'un qui arrive pour saluer.
  window.dessinerAccueil = function () {
    P = CIELS.nuit;
    const c = P, S = SOL;
    const r = alea(11); let etoiles = "";
    for (let i = 0; i < 40; i++) etoiles += `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 220).toFixed(0)}" r="${(r() * 1.4 + .5).toFixed(1)}" fill="${KAOLIN}" opacity="${(.4 + r() * .5).toFixed(2)}"${i % 6 === 0 ? ' class="anim-scintille"' : ""}/>`;
    const contenu = etoiles + anneaux(735, 70, 20, KAOLIN)
      + collines(c) + case_(250, S - 4, 1.15) + grenier(325, S - 4, .9) + solPres(c) + herbes(S + 8, 10, 7)
      + cheval(808, S + 14, 1.08, { allure: "debout", cavalier: true, lance: true, flip: true, robe: ROUGE })
      + feu(556, S + 22, 1.45, 0)
      + personne(384, S + 24, 1.4, { pose: "tambour", coiffe: "bonnet", bonnet: ROUGE, robe: JAUNE, liseré: NOIR })
      + personne(466, S + 28, 1.35, { pose: "tambour", robe: VERT, liseré: JAUNE })
      + g("", personne(632, S + 30, 1.4, { pose: "salut", flip: true, coiffe: "foulard", robe: KAOLIN, liseré: ROUGE }), "anim-arrivee");
    return `<svg role="img" aria-label="Deux joueurs de djembé près du feu, un garde à cheval, et une femme qui arrive pour saluer" viewBox="0 0 800 450" class="scene-accueil" preserveAspectRatio="xMaxYMax slice">${contenu}</svg>`;
  };
  window.PALETTE = { NOIR, KAOLIN, OCRE, ROUGE, VERT, JAUNE };
})();
