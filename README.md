# Veillées du Faso

Plateforme web multimédia sur les contes et légendes du Burkina Faso. On parcourt le pays sur une carte interactive (à plat ou en relief), on choisit un feu, et le conte s'ouvre scène par scène, avec des illustrations animées, une ambiance sonore et des voix en langues nationales.

Projet Web Multimédia, Master 1 Informatique, IBAM, 2026.
Groupe : OUOBA Youmanli William Arnaud, OUEDRAOGO Pégué Judicaël, NIKIEMA Abdoul Fatahou, KOMPAORE Abdoul Malick.

## Ce que contient le site

- Une carte des 17 régions du Burkina Faso (découpage de juillet 2025), avec le sens du nom de chaque région.
- Sept récits : Yennenga, le faux départ du Moogho Naaba, les crocodiles de Sabou, les silures de Dafra, Diaba Lompo, les murs de Loropéni et un conte peul.
- Pour chaque récit : des scènes illustrées et animées, une ambiance sonore, des voix par langue, ce que le conte nous apprend, un petit quiz et les sources.
- Un mode « voyage » qui enchaîne les sept récits d'un bout à l'autre du pays.
- Un petit lexique (mooré, dioula, fulfulde, gulmancema).

## Lancer le site sur son ordinateur

Le site est fait en HTML, CSS et JavaScript, sans outil à installer. Il suffit d'un petit serveur local :

```bash
cd contes-burkina
python -m http.server 8000
```

Puis ouvrir http://localhost:8000 dans le navigateur.

## Organisation des fichiers

```
index.html              la page
css/style.css           la mise en forme
js/contes.js            le contenu : textes des contes, quiz, lexique, sources
js/illustrations.js     les dessins des scènes (SVG)
js/carte-donnees.js     les contours des 17 régions (fichier produit, ne pas modifier)
js/app.js               la carte, le lecteur de contes, les sons, le quiz
audio/ambiances/        les ambiances sonores
audio/voix/             les enregistrements en langues nationales
polices/                les polices Alegreya et Alegreya Sans
img/                    l'icône du site
```

## Ajouter un enregistrement

1. Enregistrer le conte au téléphone, dans un endroit calme, en MP3 si possible (1 à 3 minutes).
2. Nommer le fichier `<conte>-<langue>.mp3` et le mettre dans `audio/voix/`.
   Contes : `yennenga`, `faux-depart`, `sabou`, `dafra`, `diaba-lompo`, `loropeni`, `petite-querelle`.
   Langues : `moore`, `dioula`, `fulfulde`, `gulmancema`, `francais`.
   Exemple : `audio/voix/yennenga-moore.mp3`.
3. Dans `js/contes.js`, ajouter la langue dans la liste `voix` du conte. Exemple : `voix: ["moore"]`.

Tant qu'une langue n'est pas enregistrée, son bouton reste en pointillés. Pour le français, sans enregistrement, le site utilise la voix de lecture du navigateur.

## Modifier ou ajouter un conte

Tout se passe dans `js/contes.js`. Chaque conte a un titre, un lieu (latitude et longitude), une région, une liste de scènes, une leçon, un quiz et ses sources. Chaque scène choisit un ciel (`aube`, `jour`, `midi`, `crepuscule`, `nuit`), un sol et des éléments dessinés dans `js/illustrations.js`.

## Sources et licences

- Contours des provinces : geoBoundaries, d'après la Banque mondiale (2017), licence CC BY 4.0. Les 17 régions sont reconstituées en regroupant les provinces.
- Noms des régions et leur sens : Sidwaya, 8 juillet 2025, d'après le Service d'information du gouvernement.
- Les sources de chaque conte sont citées sur le site, dans la partie « Sources et crédits ».
- Polices Alegreya et Alegreya Sans : licence SIL Open Font License (fichiers dans `polices/`).
- Illustrations et ambiances sonores : créées pour ce site.
