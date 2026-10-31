// Textures dessinées dans un canvas : murs peints de Tiébélé, flammes, étoiles.
import * as THREE from "three";

export const NOIR = "#14100D", KAOLIN = "#F1E8D8", OCRE = "#A2402A", ROUGE = "#EF2B2D", VERT = "#009E49", JAUNE = "#FCD116";

function toile(l, h) {
  const c = document.createElement("canvas");
  c.width = l; c.height = h;
  return [c, c.getContext("2d")];
}

function texture(canvas, repeatX = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(repeatX, 1);
  t.anisotropy = 4;
  return t;
}

// Bandes de motifs géométriques, comme sur les maisons kassena de Tiébélé.
const MOTIFS = {
  triangles(x, y, l, h, g, a, b) {
    const n = Math.round(l / h);
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? a : b;
      g.beginPath(); g.moveTo(x + i * h, y + h); g.lineTo(x + i * h + h / 2, y); g.lineTo(x + (i + 1) * h, y + h); g.fill();
      g.fillStyle = i % 2 ? b : a;
      g.beginPath(); g.moveTo(x + i * h + h / 2, y); g.lineTo(x + (i + 1) * h + h / 2, y); g.lineTo(x + (i + 1) * h, y + h); g.fill();
    }
  },
  zigzag(x, y, l, h, g, a, b) {
    g.fillStyle = b; g.fillRect(x, y, l, h);
    g.strokeStyle = a; g.lineWidth = h * .22;
    g.beginPath();
    const pas = h;
    for (let i = 0; i <= l / pas; i++) g.lineTo(x + i * pas, y + (i % 2 ? h * .82 : h * .18));
    g.stroke();
  },
  losanges(x, y, l, h, g, a, b) {
    g.fillStyle = b; g.fillRect(x, y, l, h);
    g.fillStyle = a;
    for (let i = 0; i < l / h; i++) {
      const cx = x + i * h + h / 2;
      g.beginPath(); g.moveTo(cx, y + h * .08); g.lineTo(cx + h * .42, y + h / 2); g.lineTo(cx, y + h * .92); g.lineTo(cx - h * .42, y + h / 2); g.fill();
    }
  },
  damier(x, y, l, h, g, a, b) {
    const c = h / 2;
    for (let i = 0; i < l / c; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(x + i * c, y + j * c, c, c); }
  },
  chevrons(x, y, l, h, g, a, b) {
    g.fillStyle = b; g.fillRect(x, y, l, h);
    g.strokeStyle = a; g.lineWidth = h * .16;
    for (let k = 0; k < 2; k++) {
      g.beginPath();
      for (let i = 0; i <= l / h; i++) g.lineTo(x + i * h, y + h * (.3 + k * .4) + (i % 2 ? -h * .18 : h * .18));
      g.stroke();
    }
  },
};

export function texturePeinte(variante = 0, avecPorte = true, repeatX = 1) {
  const [c, g] = toile(2048, 512);
  const W = c.width, H = c.height;
  // terre ocre en bas, kaolin au milieu, frises noires et blanches
  g.fillStyle = KAOLIN; g.fillRect(0, 0, W, H);
  g.fillStyle = OCRE; g.fillRect(0, H * .74, W, H * .26);
  const ordres = [
    ["triangles", "zigzag", "losanges", "damier"],
    ["losanges", "chevrons", "triangles", "zigzag"],
    ["damier", "triangles", "chevrons", "losanges"],
  ][variante % 3];
  const hauteurs = [H * .12, H * .1, H * .16, H * .1];
  let y = H * .06;
  ordres.forEach((m, i) => {
    MOTIFS[m](0, y, W, hauteurs[i], g, NOIR, i % 2 ? KAOLIN : OCRE);
    y += hauteurs[i];
    g.fillStyle = NOIR; g.fillRect(0, y, W, H * .012); y += H * .03;
  });
  // grands motifs dans la partie ocre : triangles noirs
  for (let i = 0; i < W / 128; i++) {
    g.fillStyle = i % 2 ? NOIR : KAOLIN;
    g.beginPath(); g.moveTo(i * 128 + 20, H); g.lineTo(i * 128 + 64, H * .8); g.lineTo(i * 128 + 108, H); g.fill();
  }
  if (avecPorte) {
    const px = W * .5;
    g.fillStyle = KAOLIN; g.beginPath(); g.ellipse(px, H * .78, 70, 130, 0, Math.PI, 0); g.lineTo(px + 70, H); g.lineTo(px - 70, H); g.fill();
    g.fillStyle = NOIR; g.beginPath(); g.ellipse(px, H * .8, 52, 112, 0, Math.PI, 0); g.lineTo(px + 52, H); g.lineTo(px - 52, H); g.fill();
  }
  return texture(c, repeatX);
}

export function textureFrise() {
  const [c, g] = toile(1024, 128);
  MOTIFS.triangles(0, 0, 1024, 128, g, NOIR, KAOLIN);
  return texture(c, 1);
}

export function textureFlamme() {
  const [c, g] = toile(128, 256);
  const flamme = (couleur, ech) => {
    g.save(); g.translate(64, 250); g.scale(ech, ech);
    g.fillStyle = couleur; g.beginPath();
    g.moveTo(0, 0); g.bezierCurveTo(-60, -10, -50, -120, -6, -230); g.bezierCurveTo(10, -150, 70, -110, 40, -40); g.bezierCurveTo(30, -10, 20, 0, 0, 0); g.fill();
    g.restore();
  };
  flamme(ROUGE, 1); flamme(JAUNE, .62); flamme(KAOLIN, .3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function texturePoint(couleur = KAOLIN) {
  const [c, g] = toile(64, 64);
  g.fillStyle = couleur; g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function textureAnneaux(couleur = KAOLIN) {
  const [c, g] = toile(256, 256);
  [[120, .14], [80, .22], [46, 1]].forEach(([r, a]) => { g.globalAlpha = a; g.fillStyle = couleur; g.beginPath(); g.arc(128, 128, r, 0, Math.PI * 2); g.fill(); });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// SVG -> texture (pour les décors des contes)
export function textureSVG(svg, largeur = 1280, hauteur = 720) {
  return new Promise((ok, ko) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const [c, g] = toile(largeur, hauteur);
      g.drawImage(img, 0, 0, largeur, hauteur);
      URL.revokeObjectURL(url);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      ok(t);
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); ko(e); };
    img.src = url;
  });
}
