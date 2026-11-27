import * as THREE from 'three';

/**
 * Evaluates a realistic anatomical molar/premolar crown outer surface point at angle `theta` and height `v` [0..1].
 * Includes buccal/lingual natural convexity, cervical shoulder constriction, 4 asymmetric cusps, and occlusal central fossa.
 */
function sampleCrownOuter(theta: number, v: number): [number, number, number] {
  const yBase = -0.46 + v * 1.44;

  // Natural anatomical emergence profile: tight chamfered neck -> lush buccal/lingual height of contour -> rounded occlusal table
  const neckConstriction = 0.44 + 0.14 * Math.min(1, v / 0.14);
  const midBelly = 0.4 * Math.sin(Math.pow(v, 0.82) * Math.PI * 0.88);
  const occlusalTaper = -0.24 * Math.pow(Math.max(0, v - 0.68) / 0.32, 1.55);
  const baseRadius = neckConstriction + midBelly + occlusalTaper;

  // Organic mesial-distal & buccal-lingual asymmetry (not a circle!)
  const squircle =
    1 +
    0.095 * Math.cos(2 * theta) +
    0.045 * Math.cos(4 * theta - 0.25) +
    0.03 * Math.sin(theta);

  // 4 distinct anatomical cusps + developmental grooves on upper crown
  const occlusalMask = Math.pow(Math.max(0, v - 0.48) / 0.52, 1.45);
  const cuspWave =
    0.095 * Math.cos(4 * (theta - 0.12)) +
    0.042 * Math.sin(2 * theta + 0.4) +
    0.025 * Math.cos(6 * theta);

  // Central occlusal fossa depression + cross developmental fissure
  const crownTopMask = Math.max(0, (v - 0.84) / 0.16);
  const fossaDrop =
    -0.19 * Math.pow(crownTopMask, 1.4) * (1 - 0.55 * Math.max(0, Math.cos(4 * (theta - 0.12))));

  // Fine buccal vertical developmental grooves
  const buccalGroove =
    -0.024 * Math.sin(v * Math.PI) * Math.pow(Math.max(0, Math.cos(2 * theta - 1.57)), 4);

  const r = baseRadius * squircle + cuspWave * 0.32 * occlusalMask + buccalGroove;
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r * 0.91;
  const y = yBase + cuspWave * occlusalMask + fossaDrop;

  return [x, y, z];
}

/**
 * Builds a high-poly hollow anatomical porcelain crown half (side = -1 left, +1 right)
 * with clean UV mapping, inner preparation cavity, cervical shoulder rim, and precision cut seam.
 */
export function buildAnatomicalCrownHalfGeometry(side: -1 | 1): THREE.BufferGeometry {
  const uSegs = 44; // high angular density per half (88 total around crown)
  const vSegs = 34; // smooth vertical anatomical profile

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const getInnerPoint = (theta: number, v: number): [number, number, number] => {
    const [ox, oy, oz] = sampleCrownOuter(theta, v);
    const wall = 0.18 + 0.04 * Math.sin(v * Math.PI);
    const r = Math.hypot(ox, oz);
    const scale = r > 0.05 ? Math.max(0.24, (r - wall) / r) : 0.45;
    const topDrop = v > 0.74 ? wall * 1.25 * ((v - 0.74) / 0.26) : 0;
    return [ox * scale, Math.max(-0.45, oy - topDrop), oz * scale];
  };

  const startTheta = side === 1 ? -Math.PI / 2 : Math.PI / 2;
  const endTheta = side === 1 ? Math.PI / 2 : (Math.PI * 3) / 2;
  const stride = uSegs + 1;

  // Grid A: Outer sculpted enamel shell
  const outerOffset = 0;
  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      const theta = startTheta + u * (endTheta - startTheta);
      positions.push(...sampleCrownOuter(theta, v));
      uvs.push(u, v);
    }
  }
  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = outerOffset + iv * stride + iu;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, d, a, d, b);
    }
  }

  // Grid B: Inner hollow cavity (mirrors coping/dentin preparation)
  const innerOffset = positions.length / 3;
  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      const theta = startTheta + u * (endTheta - startTheta);
      positions.push(...getInnerPoint(theta, v));
      uvs.push(u, v * 0.85);
    }
  }
  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = innerOffset + iv * stride + iu;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  // Grid C: Bottom cervical shoulder + Top occlusal apex cap
  for (let iu = 0; iu < uSegs; iu++) {
    const ob1 = outerOffset + iu;
    const ob2 = ob1 + 1;
    const ib1 = innerOffset + iu;
    const ib2 = ib1 + 1;
    indices.push(ob1, ib1, ib2, ob1, ib2, ob2);

    const ot1 = outerOffset + vSegs * stride + iu;
    const ot2 = ot1 + 1;
    const it1 = innerOffset + vSegs * stride + iu;
    const it2 = it1 + 1;
    indices.push(ot1, ot2, it2, ot1, it2, it1);
  }

  // Grid D: Precision laser-cut cross-section walls along split plane (duplicated vertices for crisp seam normals)
  const seamStart = positions.length / 3;
  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    const [ox0, oy0, oz0] = sampleCrownOuter(startTheta, v);
    const [ix0, iy0, iz0] = getInnerPoint(startTheta, v);
    positions.push(ox0, oy0, oz0, ix0, iy0, iz0);
    uvs.push(0.1, v, 0.25, v);
  }
  for (let iv = 0; iv < vSegs; iv++) {
    const a = seamStart + iv * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, d, a, d, c);
  }

  const seamEnd = positions.length / 3;
  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    const [ox1, oy1, oz1] = sampleCrownOuter(endTheta, v);
    const [ix1, iy1, iz1] = getInnerPoint(endTheta, v);
    positions.push(ox1, oy1, oz1, ix1, iy1, iz1);
    uvs.push(0.85, v, 0.95, v);
  }
  for (let iv = 0; iv < vSegs; iv++) {
    const a = seamEnd + iv * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, d, c, a, c, b);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds the inner sculpted Zirconia-Dentin Core mimicking an organic tooth stump preparation.
 */
export function buildDentinCoreGeometry(): THREE.BufferGeometry {
  const uSegs = 56;
  const vSegs = 28;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const stride = uSegs + 1;

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    const y = -0.44 + v * 1.12;
    const radialBase =
      v < 0.08
        ? 0.34 + (v / 0.08) * 0.12
        : 0.46 + 0.14 * Math.sin(v * Math.PI * 0.9) - 0.32 * Math.pow(Math.max(0, v - 0.65) / 0.35, 1.8);

    const topCollapse = v === 1 ? 0 : 1;

    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      const theta = u * Math.PI * 2;
      const asym = 1 + 0.08 * Math.cos(2 * theta) + 0.03 * Math.cos(4 * theta);
      const cuspBump = 0.055 * Math.pow(Math.max(0, v - 0.55) / 0.45, 1.4) * Math.cos(4 * (theta - 0.12));
      const r = radialBase * asym * topCollapse;
      positions.push(Math.cos(theta) * r, y + cuspBump, Math.sin(theta) * r * 0.9);
      uvs.push(u, v);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, d, a, d, b);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds a precision-machined trapezoidal buttress screw thread around the conical titanium implant body
 * (looks like authentic Swiss Nobel/Straumann hardware rather than a coiled pipe).
 */
export function buildButtressThreadGeometry(): THREE.BufferGeometry {
  const turns = 7.25;
  const steps = 260;
  const profileSides = 4; // 4-point machined trapezoidal thread cross-section

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2;
    const yCenter = -2.02 + t * 1.1;
    // Conical fixture taper matching implant body
    const baseR = 0.145 + 0.215 * Math.pow(t, 0.85);
    // Smooth fade-in and fade-out at apex and collar
    const envelope = Math.sin(Math.min(1, t * 7) * (Math.PI / 2)) * Math.sin(Math.min(1, (1 - t) * 7) * (Math.PI / 2));
    const depth = 0.058 * envelope;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // 4 vertices defining sharp asymmetric buttress tooth: inner-low, outer-low, outer-high, inner-high
    const pts: Array<[number, number]> = [
      [baseR - 0.015, yCenter - 0.036 * envelope],
      [baseR + depth, yCenter - 0.012 * envelope],
      [baseR + depth, yCenter + 0.014 * envelope],
      [baseR - 0.015, yCenter + 0.032 * envelope],
    ];

    for (let k = 0; k < profileSides; k++) {
      const [pr, py] = pts[k];
      positions.push(cosA * pr, py, sinA * pr);
      uvs.push(t * turns, k / profileSides);
    }
  }

  for (let i = 0; i < steps; i++) {
    const row = i * profileSides;
    const next = (i + 1) * profileSides;
    for (let k = 0; k < profileSides; k++) {
      const kNext = (k + 1) % profileSides;
      const a = row + k;
      const b = next + k;
      const c = next + kNext;
      const d = row + kNext;
      indices.push(a, d, c, a, c, b);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}
