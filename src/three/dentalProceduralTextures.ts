import * as THREE from 'three';

/**
 * Generates an anatomical porcelain enamel albedo texture:
 * warm ivory-dentin cervical transition at base -> luminous pearl body -> subtle opalescent incisal tip.
 */
export function createEnamelAlbedoTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Vertical natural ceramic shade gradient (bottom = cervical neck v=0, top = occlusal v=1)
    // Canvas Y=0 is top (v=1), Y=h is bottom (v=0)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, '#EBF2FA'); // Opalescent translucent incisal/cusp edge
    grad.addColorStop(0.18, '#FAFBFD'); // Pure luminous pearl enamel
    grad.addColorStop(0.62, '#F7F5F0'); // Natural porcelain body warmth
    grad.addColorStop(0.86, '#EFE7D8'); // Subtle warm cervical dentin reflection
    grad.addColorStop(1.0, '#E6DCC8'); // Cervical finishing margin
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle vertical developmental mamelon & lobe shading
    for (let i = 0; i < 16; i++) {
      const x = (i / 16) * w;
      const lobeGrad = ctx.createLinearGradient(x, 0, x + w / 16, 0);
      lobeGrad.addColorStop(0, 'rgba(255,255,255,0)');
      lobeGrad.addColorStop(0.5, i % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(218,228,242,0.14)');
      lobeGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lobeGrad;
      ctx.fillRect(x, 0, w / 16, h * 0.72);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates fine horizontal perikymata micro-ridges + glaze micro-texture (linear bump map).
 */
export function createEnamelMicroBumpTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);

    // Fine horizontal enamel growth lines (perikymata)
    for (let y = 0; y < h; y += 3) {
      const wave = Math.sin(y * 0.35) * 14 + Math.cos(y * 0.9) * 6;
      const v = Math.max(95, Math.min(165, Math.round(128 + wave)));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, w, 2);
    }

    // Subtle vertical enamel micro-striations
    ctx.globalAlpha = 0.2;
    for (let x = 0; x < w; x += 4) {
      const v = x % 8 === 0 ? 150 : 110;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, 0, 1, h);
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates warm organic dentin-zirconia substructure texture with fine tubule striations.
 */
export function createDentinCoreTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, '#F5F0E6');
    grad.addColorStop(0.45, '#ECE1CE');
    grad.addColorStop(1.0, '#DECBAE');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle organic dentin layer rings
    for (let y = 0; y < h; y += 6) {
      ctx.fillStyle = y % 12 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(160,135,95,0.06)';
      ctx.fillRect(0, y, w, 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates CNC-lathe brushed titanium bump & roughness variation (linear data map).
 */
export function createBrushedTitaniumTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y++) {
      const n =
        Math.sin(y * 1.9) * 18 +
        Math.cos(y * 5.3) * 10 +
        Math.sin(y * 0.43) * 12;
      const v = Math.max(70, Math.min(185, Math.round(128 + n)));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, w, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates SLActive micro-sandblasted & acid-etched titanium surface texture (linear data map).
 */
export function createMicroEtchedTitaniumTexture(maxAnisotropy = 4): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  // Deterministic PRNG so texture looks rich & crisp without Math.random variance
  let seed = 1337;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < size * size; i++) {
    const grain = Math.round(105 + nextRand() * 65);
    data[i * 4] = grain;
    data[i * 4 + 1] = grain;
    data[i * 4 + 2] = grain;
    data[i * 4 + 3] = 255;
  }

  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
    grad.addColorStop(0, 'rgba(11, 19, 36, 0.28)');
    grad.addColorStop(0.45, 'rgba(11, 19, 36, 0.09)');
    grad.addColorStop(1, 'rgba(11, 19, 36, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
