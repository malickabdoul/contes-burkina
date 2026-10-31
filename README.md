# Veillées du Faso

Plateforme web multimédia sur les contes et légendes du Burkina Faso.

On entre de nuit dans une cour peinte de Tiébélé, en 3D, autour du feu. Puis on survole la carte des 17 régions en relief. On voyage d'un feu à l'autre pour écouter sept contes, scène par scène, dans des décors à plusieurs plans. Tout avance au défilement de la page, avec des ambiances sonores et des voix en langues nationales.

Projet Web Multimédia, Master 1 Informatique, IBAM, 2026.
Groupe : OUOBA Youmanli William Arnaud, OUEDRAOGO Pégué Judicaël, NIKIEMA Abdoul Fatahou, KOMPAORE Abdoul Malick.

## Deux versions

- `index.html` : la version immersive, en 3D (Three.js). C'est la page d'accueil.
- `simple.html` : la version simple, sans 3D, pour les téléphones modestes ou les connexions lentes. Elle a le même contenu : carte en 2D, contes illustrés, sons, voix et quiz. La version immersive y renvoie aussi d'elle-même si le navigateur ne gère pas la 3D (WebGL).

## Ce que contient le site

- La cour royale de Tiébélé en 3D : maisons rondes et carrées peintes de motifs (le dora), feu, braises, ciel étoilé.
- Une carte des 17 régions du Burkina Faso (découpage de juillet 2025), en relief, avec le sens du nom de chaque région au survol.
- Sept récits : le faux départ du Moogho Naaba, Yennenga, Diaba Lompo, un conte peul, les crocodiles de Sabou, les silures de Dafra et les murs de Loropéni.
- Pour chaque récit : des décors en plusieurs plans qui glissent et se fondent d'une scène à l'autre, une ambiance sonore, des voix par langue, ce que le conte nous apprend, un petit quiz et les sources.
- Un petit lexique (mooré, dioula, fulfulde, gulmancema) et la liste des sources.

## Les couleurs

Des aplats, sans dégradés : le rouge `#EF2B2D`, le vert `#009E49` et le jaune `#FCD116` du drapeau, avec le noir `#14100D`, le kaolin `#F1E8D8` et l'ocre `#A2402A` des maisons peintes de Tiébélé.

## Lancer le site sur son ordinateur

Il suffit d'un petit serveur local :

```bash
cd contes-burkina
python -m http.server 8000
```

Puis ouvrir http://localhost:8000 dans le navigateur.

## Organisation des fichiers

```
index.html              la version immersive (3D)
simple.html             la version simple (2D)
css/style.css           la mise en forme commune
css/experience.css      la mise en forme de la version immersive
js/contes.js            le contenu : textes des contes, quiz, lexique, sources
js/illustrations.js     les dessins des scènes (SVG), aussi utilisés comme plans des décors 3D
js/carte-donnees.js     les contours des 17 régions (fichier produit, ne pas modifier)
js/lecteur.js           le lecteur de contes : scènes, voix, ambiance, quiz
js/app.js               la carte 2D de la version simple
js/experience.js        la version immersive, assemblée depuis sources-3d (ne pas modifier à la main)
sources-3d/src/         le code des scènes 3D (village, carte, décors, défilement, sons)
audio/ambiances/        les ambiances sonores
audio/voix/             les enregistrements en langues nationales
polices/                les polices Unbounded et Alegreya
img/                    l'icône du site
```

## Modifier les scènes 3D

Le code 3D se trouve dans `sources-3d/src/`. Après une modification, il faut reconstruire `js/experience.js` (Node.js 18 ou plus) :

```bash
cd sources-3d
npm install
npm run build
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

Tout se passe dans `js/contes.js`. Chaque conte a un titre, un lieu (latitude et longitude), une région, une liste de scènes, une leçon, un quiz et ses sources. Chaque scène choisit un ciel (`aube`, `jour`, `midi`, `crepuscule`, `nuit`), un sol et des éléments dessinés dans `js/illustrations.js`. Les deux versions du site lisent le même fichier : rien à reconstruire.

## Sources et licences

- Contours des provinces : geoBoundaries, d'après la Banque mondiale (2017), licence CC BY 4.0. Les 17 régions sont reconstituées en regroupant les provinces.
- Noms des régions et leur sens : Sidwaya, 8 juillet 2025, d'après le Service d'information du gouvernement.
- Cour royale de Tiébélé et peinture dora : Centre du patrimoine mondial de l'UNESCO ; Sidwaya, 6 novembre 2023 et 26 juillet 2024.
- Les sources de chaque conte sont citées sur le site, dans la partie « Sources et crédits ».
- Three.js : licence MIT.
- Polices Unbounded et Alegreya : licence SIL Open Font License (fichiers dans `polices/`).
- Scènes 3D, illustrations et ambiances sonores : créées pour ce site.
