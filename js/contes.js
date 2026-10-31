// Contenu du site : contes, lexique et sources.
// Pour ajouter un enregistrement : déposer le fichier dans audio/voix/ sous le nom
// <id du conte>-<langue>.mp3 (exemple : yennenga-moore.mp3), puis ajouter le code de la
// langue dans la liste « voix » du conte (exemple : voix: ["moore"]).

window.LANGUES = {
  moore: "Mooré",
  dioula: "Dioula",
  fulfulde: "Fulfulde",
  gulmancema: "Gulmancema",
  francais: "Français",
};

window.CONTES = [
  {
    id: "yennenga",
    titre: "Yennenga, la princesse cavalière",
    genre: "Légende",
    lieu: "Tenkodogo",
    region: "Nakambé",
    lat: 11.78, lon: -0.37,
    langue: "moore",
    ambiance: "savane",
    voix: [], // langues déjà enregistrées, par exemple ["moore", "francais"]
    resume: "La fuite d'une princesse guerrière, et la naissance du peuple mossi.",
    scenes: [
      { decor: "jour", sol: "palais", elements: ["guerriere"],
        texte: "Il y a très longtemps, au royaume de Dagbon, au sud de l'actuel Burkina Faso, vivait une princesse nommée Yennenga. Elle était la fille du roi Nedega. Dès quatorze ans, elle montait à cheval et se battait aux côtés de l'armée de son père, avec la lance, le javelot et l'arc." },
      { decor: "midi", sol: "champ", elements: ["guerriere-triste"],
        texte: "Les années passèrent. Yennenga voulait se marier, mais son père refusait : il ne voulait pas perdre sa meilleure guerrière. Pour lui montrer sa peine, elle planta un champ et laissa la récolte pourrir sans la cueillir. Le roi ne voulut rien entendre et la fit enfermer." },
      { decor: "nuit", sol: "savane", elements: ["cavaliere"],
        texte: "Une nuit, aidée par un cavalier du roi, Yennenga s'enfuit sur son étalon, habillée en homme. En chemin, des ennemis les attaquèrent et son compagnon fut tué. Yennenga continua seule, vers le nord." },
      { decor: "crepuscule", sol: "foret", elements: ["cavaliere-pas", "chasseur"],
        texte: "Épuisée, après avoir traversé une rivière, elle laissa son cheval choisir la route. Il l'emmena au fond d'une forêt, jusqu'à Rialé, un chasseur d'éléphants qui vivait seul. Rialé comprit vite que ce cavalier était une femme. Ils s'aimèrent." },
      { decor: "aube", sol: "village", elements: ["famille"],
        texte: "De leur union naquit un fils. Ils l'appelèrent Ouédraogo, « l'étalon », en souvenir du cheval qui avait mené sa mère jusqu'à Rialé. Le roi Nedega, heureux de retrouver sa fille, accueillit la famille et donna à son petit-fils des cavaliers et du bétail." },
      { decor: "jour", sol: "savane", elements: ["cavaliers"],
        texte: "Avec eux, Ouédraogo bâtit la ville de Tenkodogo et posa les bases des royaumes mossi. Les Mossi voient en Yennenga la mère de leur peuple. Aujourd'hui, le grand prix du FESPACO s'appelle l'Étalon de Yennenga, et l'équipe nationale de football, les Étalons." },
    ],
    lecon: "Yennenga a choisi sa vie avec courage, sans renier les siens. La légende montre aussi d'où vient le nom Ouédraogo, porté aujourd'hui par des milliers de Burkinabè.",
    note: "Il existe plusieurs versions de la fuite de Yennenga, et les dates varient entre le XIe et le XVe siècle.",
    quiz: [
      { q: "De quel royaume Yennenga était-elle la princesse ?", choix: ["Le Dagbon", "Le Yatenga", "Le Gulmu"], bonne: 0 },
      { q: "Que veut dire le nom Ouédraogo ?", choix: ["Le chasseur", "L'étalon", "Le roi"], bonne: 1 },
      { q: "Quel prix porte aujourd'hui le nom de Yennenga ?", choix: ["Le grand prix du FESPACO", "La coupe du Faso", "Le prix du SIAO"], bonne: 0 },
    ],
    sources: [
      { titre: "Yennenga, Wikipédia (en anglais)", url: "https://en.wikipedia.org/wiki/Yennenga" },
      { titre: "Mossi Kingdoms, Wikipédia (en anglais)", url: "https://en.wikipedia.org/wiki/Mossi_Kingdoms" },
    ],
  },
  {
    id: "faux-depart",
    titre: "Le faux départ du Moogho Naaba",
    genre: "Rite et récit",
    lieu: "Ouagadougou",
    region: "Kadiogo",
    lat: 12.37, lon: -1.52,
    langue: "moore",
    ambiance: "cour",
    voix: [], // langues déjà enregistrées, par exemple ["moore", "francais"]
    resume: "Chaque vendredi, un roi fait mine de partir en guerre, et choisit la paix.",
    scenes: [
      { decor: "aube", sol: "cour", elements: ["ministres"],
        texte: "Chaque vendredi matin, vers huit heures, une foule silencieuse se réunit derrière le palais du Moogho Naaba, le roi des Mossi de Ouagadougou. Les ministres du royaume arrivent un à un. Le Ouidi Naaba, le premier d'entre eux, ouvre la cérémonie." },
      { decor: "aube", sol: "cour", elements: ["roi-rouge", "canon"],
        texte: "Le roi apparaît, vêtu de rouge, au son des tambours. Un coup de canon retentit : le roi fait mine de partir en guerre." },
      { decor: "jour", sol: "cour", elements: ["roi-rouge", "ministres-devant"],
        texte: "Ses ministres et ses conseillers se placent devant lui et le supplient de rester. Ils lui rappellent que la guerre ne doit venir qu'en dernier recours." },
      { decor: "jour", sol: "cour", elements: ["roi-blanc", "canon"],
        texte: "Le roi les écoute. Il entre dans la case sacrée, puis ressort vêtu de blanc : il a choisi la paix. Un second coup de canon met fin à la cérémonie, qui dure une trentaine de minutes." },
      { decor: "crepuscule", sol: "palais", elements: ["cavalier-loin"],
        texte: "D'où vient ce rite ? Les récits varient. Une version raconte qu'un frère du roi aurait emporté les insignes royaux, avec l'aide d'un homme de la cour. Le roi voulut partir les reprendre, mais on le retint. Chaque vendredi, la cour rejoue ce départ qui n'a jamais lieu." },
    ],
    lecon: "Les grandes décisions se prennent avec réflexion, en écoutant ses conseillers, et pas sous le coup de la colère.",
    note: "La cérémonie se déroule toujours aujourd'hui. Les photos y sont interdites.",
    quiz: [
      { q: "Quel jour a lieu le faux départ ?", choix: ["Le lundi", "Le vendredi", "Le dimanche"], bonne: 1 },
      { q: "Que montre le blanc que porte le roi à la fin ?", choix: ["La guerre", "Le deuil", "La paix"], bonne: 2 },
      { q: "Qui retient le roi ?", choix: ["Ses ministres et ses conseillers", "Son frère", "Les soldats ennemis"], bonne: 0 },
    ],
    sources: [
      { titre: "« Le faux départ du Mogho Naaba, un rituel entre mémoire et paix », AllAfrica, avril 2025", url: "https://fr.allafrica.com/stories/202504140540.html" },
      { titre: "Reportage sur le faux départ, Fraternité Matin, 2025", url: "https://www.fratmat.info/article/2633114/culture/reportagele-faux-depart-du-mogho-naaba-un-rite-oscillant-entre-memoire-et-serenite-en-plein-centre-de-ouagadougou" },
    ],
  },
  {
    id: "sabou",
    titre: "Kaboré et les crocodiles de Sabou",
    genre: "Légende",
    lieu: "Sabou",
    region: "Nando",
    lat: 12.07, lon: -2.23,
    langue: "moore",
    ambiance: "eau",
    voix: [], // langues déjà enregistrées, par exemple ["moore", "francais"]
    resume: "Un chasseur perdu, un crocodile qui montre le chemin, et une promesse tenue.",
    scenes: [
      { decor: "midi", sol: "savane-seche", elements: ["chasseur-marche"],
        texte: "Il y a longtemps, un chasseur nommé Kaboré partit chasser dans la brousse, près de l'actuel village de Sabou. La saison sèche était dure et le soleil brûlait." },
      { decor: "midi", sol: "savane-seche", elements: ["chasseur-assoiffe"],
        texte: "Après des heures de marche, Kaboré n'avait plus une goutte d'eau. Sa gorge était sèche, ses jambes tremblaient, et il ne savait plus où aller." },
      { decor: "crepuscule", sol: "savane-seche", elements: ["crocodile-guide", "chasseur-suit"],
        texte: "Un crocodile sortit alors des herbes. Au lieu de l'attaquer, l'animal avança lentement devant lui, comme pour lui montrer le chemin. Kaboré le suivit." },
      { decor: "crepuscule", sol: "mare", elements: ["chasseur-boit", "crocodile-eau"],
        texte: "Le crocodile le mena jusqu'à un point d'eau. Kaboré but et retrouva ses forces. Pour le remercier, il promit que ses descendants protégeraient toujours les crocodiles." },
      { decor: "jour", sol: "mare", elements: ["crocodiles", "guide-poulet"],
        texte: "Depuis, les habitants de Sabou respectent les crocodiles de la mare et les voient comme des esprits protecteurs. Des guides, issus des familles fondatrices, les font sortir de l'eau avec un poulet offert par les visiteurs." },
    ],
    lecon: "On n'oublie pas celui qui nous a aidés, même quand c'est un animal. La légende rappelle aussi que l'homme peut vivre en paix avec la nature qui l'entoure.",
    note: "D'autres villages, comme Bazoulé près de Ouagadougou, ont aussi leurs crocodiles sacrés.",
    quiz: [
      { q: "Comment s'appelait le chasseur ?", choix: ["Kaboré", "Rialé", "Nedega"], bonne: 0 },
      { q: "Qu'a fait le crocodile ?", choix: ["Il a attaqué le chasseur", "Il l'a guidé vers l'eau", "Il s'est enfui"], bonne: 1 },
      { q: "Que promit Kaboré ?", choix: ["De quitter la région", "De protéger les crocodiles", "De devenir roi"], bonne: 1 },
    ],
    sources: [
      { titre: "P. F. Sawadogo, « Sabou, entre foi ancestrale et attraction touristique : le pacte sacré des crocodiles », Infos Culture du Faso, 29 mai 2025", url: "https://www.infosculturedufaso.net/sabou-entre-foi-ancestrale-et-attraction-touristique-le-pacte-sacre-des-crocodiles/" },
    ],
  },
  {
    id: "dafra",
    titre: "Les silures sacrés de Dafra",
    genre: "Récit sacré",
    lieu: "Dafra, près de Bobo-Dioulasso",
    region: "Guiriko",
    lat: 11.14, lon: -4.26,
    langue: "dioula",
    ambiance: "eau",
    voix: [], // langues déjà enregistrées, par exemple ["moore", "francais"]
    resume: "Des poissons géants que l'on traite comme des ancêtres.",
    scenes: [
      { decor: "jour", sol: "ravin", elements: ["silures-calmes"],
        texte: "Au sud-est de Bobo-Dioulasso, au fond d'un ravin entouré de rochers, se trouve la mare de Dafra. Ses eaux abritent d'énormes silures, des poissons à moustaches que personne n'a le droit de pêcher." },
      { decor: "aube", sol: "ravin", elements: ["fondateur", "silure-montre"],
        texte: "Les Bobo Mandarè racontent que le silure fut le premier animal que rencontra le fondateur de Sya, l'ancienne Bobo-Dioulasso. C'est lui qui lui montra où trouver de l'eau." },
      { decor: "crepuscule", sol: "ravin", elements: ["silures-calmes"],
        texte: "Depuis, les silures sont vus comme des ancêtres. On ne les tue pas et on ne les mange pas. Quand un silure meurt, il est enterré comme un être humain." },
      { decor: "jour", sol: "ravin", elements: ["sacrificateur", "silures-sautent"],
        texte: "Ceux qui ont un souci viennent demander l'aide des ancêtres. Seuls des sacrificateurs bobo initiés peuvent faire l'offrande, souvent un poulet. Ils jettent les entrailles dans l'eau, et les silures surgissent pour les avaler. Si le vœu se réalise, il faut revenir dire merci." },
      { decor: "crepuscule", sol: "ravin", elements: ["visiteurs"],
        texte: "Sur le site, la couleur rouge et les bijoux en or sont interdits, et un guide accompagne toujours les visiteurs." },
    ],
    lecon: "Respecter les ancêtres et les lieux sacrés, et tenir parole : quand on a reçu, on revient remercier.",
    note: "Le nom Dafra serait lié au mot bobo qui désigne le grand-père, l'ancêtre.",
    quiz: [
      { q: "Pourquoi le silure est-il respecté ?", choix: ["Il a montré l'eau au fondateur de Sya", "Il est très bon à manger", "Il protège des voleurs"], bonne: 0 },
      { q: "Qui peut faire l'offrande aux silures ?", choix: ["N'importe quel visiteur", "Les sacrificateurs bobo initiés", "Le chef de l'État"], bonne: 1 },
      { q: "Qu'est-ce qui est interdit sur le site ?", choix: ["Le blanc et l'argent", "Le rouge et l'or", "Le vert et le bois"], bonne: 1 },
    ],
    sources: [
      { titre: "« Les silures sacrés de Dafra », Visite Burkina", url: "https://visiteburkina.com/lieux/paysages/les-silures-sacres-de-dafra" },
      { titre: "« La mare aux poissons sacrés de Dafra », Tourisme au Burkina, 2016", url: "https://tourismeburkinabe.blogspot.com/2016/04/la-mare-aux-poissons-sacres-de-dafra.html" },
    ],
  },
  {
    id: "diaba-lompo",
    titre: "Diaba Lompo, l'ancêtre venu du ciel",
    genre: "Récit d'origine",
    lieu: "Pama",
    region: "Goulmou",
    lat: 11.25, lon: 0.70,
    langue: "gulmancema",
    ambiance: "ciel",
    voix: [], // langues déjà enregistrées, par exemple ["moore", "francais"]
    resume: "Comment, selon la tradition, est arrivé le premier roi des Gourmantché.",
    scenes: [
      { decor: "nuit", sol: "ciel-seul", elements: ["etoiles-vives"],
        texte: "Les Gourmantché racontent qu'un jour, il y a environ huit siècles, un homme descendit du ciel, tout armé. Il s'appelait Diaba Lompo." },
      { decor: "nuit", sol: "rocher", elements: ["descente"],
        texte: "Il n'était pas seul. Sa femme Kombari et son cheval l'accompagnaient, ainsi qu'un couple de chaque animal." },
      { decor: "aube", sol: "rocher", elements: ["empreintes"],
        texte: "Il se posa à Kankangou, entre Pama et Porga. Aujourd'hui encore, on montre sur le rocher de Koudiaboangou les traces de ses pieds." },
      { decor: "crepuscule", sol: "caverne", elements: ["feu-caverne"],
        texte: "Diaba Lompo vécut dans une caverne. Il imposa son autorité et fit régner l'ordre, et les habitants se mirent à cultiver la terre." },
      { decor: "jour", sol: "village", elements: ["cavaliers"],
        texte: "Ses descendants organisèrent le royaume du Gulmu. Plus tard, Fada N'Gourma, que l'on appelle Nungu en gulmancema, en devint la capitale. D'autres traditions font de Diaba Lompo un chasseur ou un devin venu de l'est, ou encore un fils de Ouédraogo." },
    ],
    lecon: "Les récits d'origine donnent des racines à un peuple : ils disent d'où l'on vient et ce qui fait son unité. Qu'il soit venu du ciel ou de l'est, Diaba Lompo reste l'ancêtre commun des rois gourmantché.",
    note: "Selon la tradition rapportée par G. Nassouri Bourdia, Diaba Lompo aurait vécu au XIIIe siècle.",
    quiz: [
      { q: "D'où vient Diaba Lompo, selon la tradition céleste ?", choix: ["Du ciel", "De la mer", "D'une forêt"], bonne: 0 },
      { q: "Comment s'appelait sa femme ?", choix: ["Yennenga", "Kombari", "Pouiriketa"], bonne: 1 },
      { q: "Quel est le nom gulmancema de Fada N'Gourma ?", choix: ["Sya", "Wogdgo", "Nungu"], bonne: 2 },
    ],
    sources: [
      { titre: "« L'origine des Gourmantché », Bruits d'Afrique, 2009, d'après G. Nassouri Bourdia, Histoire du royaume gourmantché selon les traditions orales", url: "https://burkinafaso.over-blog.net/article-l-origine-des-gourmantche-41336799.html" },
      { titre: "« Les Gourmantché (Gurma) », Visite Burkina", url: "https://visiteburkina.com/culture/ethnies/ethnies-gourmantche" },
      { titre: "Mossi Kingdoms, Wikipédia (en anglais)", url: "https://en.wikipedia.org/wiki/Mossi_Kingdoms" },
    ],
  },
  {
    id: "loropeni",
    titre: "Le mystère des murs de Loropéni",
    genre: "Récit historique",
    lieu: "Loropéni",
    region: "Djôrô",
    lat: 10.31, lon: -3.58,
    langue: "dioula",
    ambiance: "pierres",
    voix: [], // langues déjà enregistrées, par exemple ["moore", "francais"]
    resume: "Des murs de pierre vieux de mille ans, et des questions encore ouvertes.",
    scenes: [
      { decor: "jour", sol: "ruines", elements: [],
        texte: "Dans le sud-ouest du pays, près de Loropéni, se dressent de grands murs de pierre de latérite, hauts parfois de six mètres. Ils entourent un vaste espace aujourd'hui abandonné." },
      { decor: "aube", sol: "ruines", elements: ["herbes"],
        texte: "Ces murs sont très anciens : les fouilles montrent que l'enceinte existait déjà au XIe siècle. Le lieu a connu sa plus grande activité entre le XIVe et le XVIIe siècle." },
      { decor: "midi", sol: "sahel", elements: ["caravane"],
        texte: "Qui vivait là ? On pense aux Lohron ou aux Koulango. La région était alors liée au commerce de l'or, qui traversait le Sahara jusqu'en Afrique du Nord." },
      { decor: "crepuscule", sol: "ruines", elements: ["chercheurs"],
        texte: "Loropéni est la mieux conservée de dix forteresses semblables du pays lobi. Mais une grande partie du site n'a jamais été fouillée, et son rôle exact reste en partie un mystère." },
      { decor: "nuit", sol: "ruines", elements: ["herbes"],
        texte: "Le lieu a été abandonné peu à peu, jusqu'au début du XIXe siècle. En 2009, il est devenu le premier site du Burkina Faso inscrit au patrimoine mondial de l'UNESCO." },
    ],
    lecon: "Les pierres aussi racontent des histoires. Protéger le patrimoine, c'est laisser aux chercheurs de demain la chance de répondre aux questions d'aujourd'hui.",
    note: "Ce récit s'appuie sur la fiche du site au patrimoine mondial de l'UNESCO.",
    quiz: [
      { q: "En quelle pierre sont bâtis les murs ?", choix: ["En granite", "En latérite", "En marbre"], bonne: 1 },
      { q: "À quel commerce le site était-il lié ?", choix: ["Le commerce de l'or", "Le commerce du sel", "Le commerce du coton"], bonne: 0 },
      { q: "En quelle année le site a-t-il été inscrit à l'UNESCO ?", choix: ["1991", "2009", "2019"], bonne: 1 },
    ],
    sources: [
      { titre: "Ruines de Loropéni, Centre du patrimoine mondial de l'UNESCO", url: "https://whc.unesco.org/fr/list/1225" },
    ],
  },
  {
    id: "petite-querelle",
    titre: "Il n'y a pas de petite querelle",
    genre: "Conte peul",
    lieu: "Dori",
    region: "Liptako",
    lat: 14.03, lon: -0.03,
    langue: "fulfulde",
    ambiance: "veillee",
    voix: [], // langues déjà enregistrées, par exemple ["moore", "francais"]
    resume: "Deux lézards se disputent une mouche, et personne ne veut s'en mêler.",
    scenes: [
      { decor: "nuit", sol: "concession", elements: ["mere", "animaux"],
        texte: "Un grand voyageur était parti loin de chez lui. Dans sa case, il avait laissé sa vieille mère. Dans la cour vivaient un chien, un coq, un mouton, un cheval et un bœuf." },
      { decor: "nuit", sol: "case", elements: ["lezards", "chien"],
        texte: "Un soir, dans la case, deux lézards se disputèrent une mouche morte. Le chien, gardien de la maison, s'inquiéta. Il alla voir le coq : « Viens m'aider à les séparer. » Le coq secoua ses plumes : « Une querelle de lézards ? Ce n'est pas mon affaire. »" },
      { decor: "nuit", sol: "concession", elements: ["animaux"],
        texte: "Le chien alla voir le mouton, puis le cheval, puis le bœuf. Tous lui répondirent la même chose : « C'est une trop petite querelle pour nous. »" },
      { decor: "nuit", sol: "concession", elements: ["case-feu"],
        texte: "Pendant ce temps, les lézards se battaient toujours. Ils renversèrent un pot d'huile dans le feu. La case s'enflamma, et la vieille mère ne put être sauvée." },
      { decor: "aube", sol: "sahel", elements: ["cheval-court"],
        texte: "Le cheval courut prévenir le voyageur et mourut d'épuisement en chemin. Pour les funérailles, on sacrifia le bœuf, le mouton et le coq. Seul le chien, qui avait voulu agir, fut épargné." },
    ],
    lecon: "Il n'y a pas de petite querelle. Quand le feu prend chez le voisin, il faut aider à l'éteindre, car il peut atteindre sa propre maison.",
    note: "Ce conte peul a été raconté par Amadou Hampâté Bâ à l'UNESCO en 1969. Le Liptako, autour de Dori, est un ancien royaume peul.",
    quiz: [
      { q: "Pourquoi les lézards se disputent-ils ?", choix: ["Pour une mouche morte", "Pour un grain de mil", "Pour une place au soleil"], bonne: 0 },
      { q: "Quel animal a voulu agir ?", choix: ["Le coq", "Le chien", "Le bœuf"], bonne: 1 },
      { q: "Que nous apprend ce conte ?", choix: ["Il vaut mieux ne pas se mêler des affaires des autres", "Une petite dispute peut causer un grand malheur", "Les lézards sont dangereux"], bonne: 1 },
    ],
    sources: [
      { titre: "P. Kouraogo, « Les contes moose du Burkina Faso : une tradition orale au service du développement », Culture & Démocratie, 2020", url: "https://www.cultureetdemocratie.be/articles/les-contes-moose/" },
      { titre: "List of rulers of Liptako, Wikipédia (en anglais)", url: "https://en.wikipedia.org/wiki/List_of_rulers_of_Liptako" },
    ],
  },
];

// Ordre du voyage : d'est en ouest, en partant de la capitale
window.VOYAGE = ["faux-depart", "yennenga", "diaba-lompo", "petite-querelle", "sabou", "dafra", "loropeni"];

window.LEXIQUE = [
  { mot: "Naaba", langue: "Mooré", sens: "Chef, roi." },
  { mot: "Moogho Naaba", langue: "Mooré", sens: "Le roi des Mossi de Ouagadougou." },
  { mot: "Ouédraogo", langue: "Mooré", sens: "L'étalon. C'est le nom du fils de Yennenga." },
  { mot: "Solmdé", langue: "Mooré", sens: "Le conte." },
  { mot: "Soamba", langue: "Mooré", sens: "Le lièvre, héros rusé de nombreux contes." },
  { mot: "Katré", langue: "Mooré", sens: "L'hyène, souvent gourmande et un peu bête dans les contes." },
  { mot: "Barka", langue: "Mooré", sens: "Merci." },
  { mot: "Kuilsé", langue: "Mooré", sens: "Cours d'eau. C'est aussi le nom d'une région." },
  { mot: "I ni ce", langue: "Dioula", sens: "Bonjour, et aussi merci." },
  { mot: "Dafra", langue: "Bobo", sens: "Mot lié au grand-père, à l'ancêtre." },
  { mot: "Jam", langue: "Fulfulde", sens: "La paix." },
  { mot: "Liptako", langue: "Fulfulde", sens: "« On ne peut pas le terrasser »." },
  { mot: "Nungu", langue: "Gulmancema", sens: "Le nom de Fada N'Gourma." },
  { mot: "Dolo", langue: "Usage courant", sens: "Bière de mil, souvent offerte lors des rites." },
];

window.SOURCES_GENERALES = [
  { titre: "« Les toponymes des 17 régions et leur signification », Sidwaya, 8 juillet 2025 (Service d'information du gouvernement)", url: "https://www.sidwaya.info/reorganisation-administrative-du-territoire-les-toponymes-des-17-regions-et-leur-signification/" },
  { titre: "Contours des provinces : geoBoundaries, d'après la Banque mondiale (2017), licence CC BY 4.0", url: "https://www.geoboundaries.org/" },
];

// La cour de Tiébélé (ouverture de la version immersive).
window.SOURCES_TIEBELE = [
  { titre: "« Royal Court of Tiébélé », Centre du patrimoine mondial de l'UNESCO", url: "https://whc.unesco.org/en/list/1713" },
  { titre: "« Peinture murale Kassena : le dora, une prouesse artistique féminine à l'épreuve du temps », Sidwaya, 6 novembre 2023", url: "https://www.sidwaya.info/peinture-murale-kassena-le-dora-une-prouesse-artistique-feminine-a-lepreuve-du-temps/" },
  { titre: "« UNESCO : la Cour royale de Tiébélé figure désormais sur la Liste du patrimoine mondial », Sidwaya, 26 juillet 2024", url: "https://www.sidwaya.info/unesco-la-cour-royale-de-tiebele-figure-desormais-sur-la-liste-du-patrimoine-mondial/" },
];
