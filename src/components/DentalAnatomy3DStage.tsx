import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {
  buildAnatomicalCrownHalfGeometry,
  buildButtressThreadGeometry,
  buildDentinCoreGeometry,
} from '../three/dentalGeometry.ts';
import {
  createBrushedTitaniumTexture,
  createContactShadowTexture,
  createDentinCoreTexture,
  createEnamelAlbedoTexture,
  createEnamelMicroBumpTexture,
  createMicroEtchedTitaniumTexture,
} from '../three/dentalProceduralTextures.ts';

interface DentalAnatomy3DStageProps {
  progressRef: React.MutableRefObject<number>;
  highlightLayerRef?: React.MutableRefObject<number>;
  className?: string;
}

function detectSoftwareGl(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Pre-allocated math helpers (zero GC inside animation loop)
const _dummy = new THREE.Object3D();

export const DentalAnatomy3DStage: React.FC<DentalAnatomy3DStageProps> = ({
  progressRef,
  highlightLayerRef,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.18, 9.2);

    // Studio IBL Reflection Environment
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmrem.dispose();

    // Bright Cheerful Studio Lighting Rig
    const hemi = new THREE.HemisphereLight(0xffffff, 0xbae6fd, 1.12);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.35);
    keyLight.position.set(5.5, 7.5, 6.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.05);
    rimLight.position.set(-6.0, 4.2, -4.5);
    scene.add(rimLight);

    const tealAccentLight = new THREE.PointLight(0x10b981, 2.0, 16, 1.4);
    tealAccentLight.position.set(3.2, -1.6, 4.2);
    scene.add(tealAccentLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softboxKey = new THREE.RectAreaLight(0xffffff, 3.8, 4.5, 8.0);
      softboxKey.position.set(4.8, 2.2, 5.2);
      softboxKey.lookAt(0, 0, 0);
      scene.add(softboxKey);

      const softboxRim = new THREE.RectAreaLight(0xcbd5e1, 3.2, 3.5, 7.0);
      softboxRim.position.set(-5.2, 1.5, 3.5);
      softboxRim.lookAt(0, 0, 0);
      scene.add(softboxRim);
    }

    // Procedural Photorealistic Dental Textures
    const enamelAlbedoTex = createEnamelAlbedoTexture(maxAnisotropy);
    const enamelBumpTex = createEnamelMicroBumpTexture(maxAnisotropy);
    const dentinTex = createDentinCoreTexture(maxAnisotropy);
    const brushedTiTex = createBrushedTitaniumTexture(maxAnisotropy);
    const etchedTiTex = createMicroEtchedTitaniumTexture(maxAnisotropy);
    const shadowTex = createContactShadowTexture();

    // Physical Materials (Bright Pediatric Edition)
    const enamelMat = new THREE.MeshPhysicalMaterial({
      map: enamelAlbedoTex,
      bumpMap: enamelBumpTex,
      bumpScale: 0.009,
      color: 0xffffff,
      roughness: 0.09,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      iridescence: 0.35,
      iridescenceIOR: 1.33,
      sheen: 0.6,
      sheenColor: new THREE.Color(0x38bdf8),
      envMapIntensity: 1.55,
    });

    const dentinCoreMat = new THREE.MeshPhysicalMaterial({
      map: dentinTex,
      bumpMap: enamelBumpTex,
      bumpScale: 0.005,
      color: 0xfef3c7,
      roughness: 0.24,
      metalness: 0.02,
      clearcoat: 0.6,
      clearcoatRoughness: 0.14,
      transmission: isSoftwareGl ? 0 : 0.24,
      transparent: true,
      opacity: isSoftwareGl ? 0.94 : 1,
      thickness: 0.85,
      ior: 1.5,
      envMapIntensity: 1.3,
    });

    const pulpOpticalMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      emissive: 0xfb7185,
      emissiveIntensity: 0.55,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
    });

    const polishedTitaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      bumpMap: brushedTiTex,
      bumpScale: 0.008,
      roughnessMap: brushedTiTex,
      metalness: 0.85,
      roughness: 0.15,
      anisotropy: 0.8,
      anisotropyRotation: 0.25,
      clearcoat: 0.45,
      envMapIntensity: 1.6,
    });

    const anodizedScrewMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      metalness: 0.78,
      roughness: 0.14,
      clearcoat: 0.75,
      envMapIntensity: 1.6,
    });

    const slactiveFixtureMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      bumpMap: etchedTiTex,
      bumpScale: 0.015,
      roughnessMap: etchedTiTex,
      metalness: 0.72,
      roughness: 0.26,
      clearcoat: 0.35,
      envMapIntensity: 1.45,
    });

    const emeraldCollarMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      metalness: 0.65,
      roughness: 0.16,
      clearcoat: 0.9,
      envMapIntensity: 1.55,
    });

    const crystalPrismMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.6,
      transparent: true,
      opacity: isSoftwareGl ? 0.55 : 0.72,
      ior: 1.48,
      thickness: 0.35,
      depthWrite: false,
      envMapIntensity: 1.4,
    });

    // =========================================================
    // 1. HERO 8-PART PHOTOREALISTIC DENTAL IMPLANT ASSEMBLY
    // =========================================================
    const assembly = new THREE.Group();
    scene.add(assembly);

    const shadowGeo = new THREE.PlaneGeometry(4.6, 4.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.42;
    assembly.add(shadowPlane);

    // Part 1 & 2: Sculpted Left & Right Anatomical Porcelain Crown Shells
    const crownLeftGeo = buildAnatomicalCrownHalfGeometry(-1);
    const crownRightGeo = buildAnatomicalCrownHalfGeometry(1);
    const crownLeft = new THREE.Mesh(crownLeftGeo, enamelMat);
    const crownRight = new THREE.Mesh(crownRightGeo, enamelMat);
    assembly.add(crownLeft);
    assembly.add(crownRight);

    // Part 3: Sculpted Warm Dentin-Zirconia Core
    const coreGeo = buildDentinCoreGeometry();
    const coreMesh = new THREE.Mesh(coreGeo, dentinCoreMat);
    assembly.add(coreMesh);

    // Part 4: Optical Pulp Chamber & Twin Horn Canals
    const canalGroup = new THREE.Group();
    const pulpChamberGeo = new THREE.SphereGeometry(0.14, 24, 18);
    pulpChamberGeo.scale(1.15, 1.35, 0.95);
    const pulpChamber = new THREE.Mesh(pulpChamberGeo, pulpOpticalMat);
    pulpChamber.position.y = -0.05;
    canalGroup.add(pulpChamber);

    const canalCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, -0.45, 0),
      new THREE.Vector3(-0.14, -0.02, 0.04),
      new THREE.Vector3(-0.11, 0.36, 0.02),
    ]);
    const canalCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, -0.45, 0),
      new THREE.Vector3(0.14, -0.02, -0.04),
      new THREE.Vector3(0.11, 0.36, -0.02),
    ]);
    const canalGeoL = new THREE.TubeGeometry(canalCurveL, 24, 0.036, 12, false);
    const canalGeoR = new THREE.TubeGeometry(canalCurveR, 24, 0.036, 12, false);
    canalGroup.add(new THREE.Mesh(canalGeoL, pulpOpticalMat));
    canalGroup.add(new THREE.Mesh(canalGeoR, pulpOpticalMat));
    assembly.add(canalGroup);

    // Part 5: Anodized Internal Fixation Screw (lifts out mid-scroll)
    const screwGroup = new THREE.Group();
    const screwHeadGeo = new THREE.CylinderGeometry(0.125, 0.11, 0.14, 24);
    const screwHead = new THREE.Mesh(screwHeadGeo, anodizedScrewMat);
    screwHead.position.y = 0.08;
    screwGroup.add(screwHead);

    const screwHexGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 6);
    const screwHex = new THREE.Mesh(screwHexGeo, polishedTitaniumMat);
    screwHex.position.y = 0.15;
    screwGroup.add(screwHex);

    const screwStemGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.62, 18);
    const screwStem = new THREE.Mesh(screwStemGeo, anodizedScrewMat);
    screwStem.position.y = -0.28;
    screwGroup.add(screwStem);
    assembly.add(screwGroup);

    // Part 6: Precision CAD/CAM Hex Titanium Abutment + Emerald Coding Ring
    const abutmentGroup = new THREE.Group();
    const abutmentPts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -0.84),
      new THREE.Vector2(0.28, -0.84),
      new THREE.Vector2(0.42, -0.62),
      new THREE.Vector2(0.43, -0.46),
      new THREE.Vector2(0.35, -0.34),
      new THREE.Vector2(0.25, 0.06),
      new THREE.Vector2(0.0, 0.1),
    ];
    const abutmentGeo = new THREE.LatheGeometry(abutmentPts, 48);
    abutmentGeo.computeVertexNormals();
    abutmentGroup.add(new THREE.Mesh(abutmentGeo, polishedTitaniumMat));

    const hexIndexGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.18, 6);
    const hexIndexMesh = new THREE.Mesh(hexIndexGeo, polishedTitaniumMat);
    hexIndexMesh.position.y = -0.92;
    abutmentGroup.add(hexIndexMesh);

    const collarGeo = new THREE.TorusGeometry(0.435, 0.026, 20, 72);
    const collarMesh = new THREE.Mesh(collarGeo, emeraldCollarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = -0.54;
    abutmentGroup.add(collarMesh);
    assembly.add(abutmentGroup);

    // Part 7: Tapered SLActive Titanium Implant Body + Machined Buttress Threads
    const implantGroup = new THREE.Group();
    const fixturePts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -2.14),
      new THREE.Vector2(0.11, -2.06),
      new THREE.Vector2(0.2, -1.65),
      new THREE.Vector2(0.32, -1.1),
      new THREE.Vector2(0.37, -0.88),
      new THREE.Vector2(0.37, -0.82),
      new THREE.Vector2(0.0, -0.82),
    ];
    const fixtureGeo = new THREE.LatheGeometry(fixturePts, 48);
    fixtureGeo.computeVertexNormals();
    implantGroup.add(new THREE.Mesh(fixtureGeo, slactiveFixtureMat));

    const fixtureCollarGeo = new THREE.CylinderGeometry(0.38, 0.37, 0.11, 48);
    const fixtureCollar = new THREE.Mesh(fixtureCollarGeo, polishedTitaniumMat);
    fixtureCollar.position.y = -0.87;
    implantGroup.add(fixtureCollar);

    const buttressThreadGeo = buildButtressThreadGeometry();
    implantGroup.add(new THREE.Mesh(buttressThreadGeo, polishedTitaniumMat));
    assembly.add(implantGroup);

    // Part 8: Bright Playful Scan Ring & Sunny Orbit Halo
    const scanRingGeo = new THREE.TorusGeometry(1.48, 0.011, 12, 96);
    const scanRingMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      metalness: 0.65,
      roughness: 0.2,
      transparent: true,
      opacity: 0.62,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.set(Math.PI / 2, 0, 0);
    assembly.add(scanRing);

    const outerReticleGeo = new THREE.TorusGeometry(1.78, 0.009, 10, 96);
    const outerReticleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.25,
      transparent: true,
      opacity: 0.45,
    });
    const outerReticle = new THREE.Mesh(outerReticleGeo, outerReticleMat);
    outerReticle.rotation.set(1.25, 0.35, 0);
    assembly.add(outerReticle);

    // =========================================================
    // 2. FLOATING 3D COLORFUL CANDY-CRYSTAL PRISMS IN DEPTH (InstancedMesh)
    // =========================================================
    const shardCount = 16;
    const shardGeo = new THREE.OctahedronGeometry(0.24, 0);
    shardGeo.scale(1, 1.55, 0.52);
    const shardInstanced = new THREE.InstancedMesh(shardGeo, crystalPrismMat, shardCount);
    shardInstanced.frustumCulled = false;

    const shardPalette = [
      new THREE.Color(0x38bdf8), // bright sky
      new THREE.Color(0xfbbf24), // sunny mango
      new THREE.Color(0x34d399), // fresh mint
      new THREE.Color(0xfb7185), // cheerful coral
    ];

    const shardSeeds = Array.from({ length: shardCount }, (_, i) => ({
      x: ((i % 2 === 0 ? 1 : -1) * (2.4 + (i % 5) * 0.95)),
      y: (i - shardCount / 2) * 0.55,
      z: -2.2 - (i % 4) * 1.15,
      rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.22 + (i % 3) * 0.12),
      scale: 0.65 + (i % 4) * 0.28,
      phase: i * 1.15,
    }));

    for (let i = 0; i < shardCount; i++) {
      const s = shardSeeds[i];
      _dummy.position.set(s.x, s.y, s.z);
      _dummy.scale.setScalar(s.scale);
      _dummy.rotation.set(s.phase, s.phase * 0.7, 0);
      _dummy.updateMatrix();
      shardInstanced.setMatrixAt(i, _dummy.matrix);
      shardInstanced.setColorAt(i, shardPalette[i % shardPalette.length]);
    }
    shardInstanced.instanceMatrix.needsUpdate = true;
    if (shardInstanced.instanceColor) shardInstanced.instanceColor.needsUpdate = true;
    shardInstanced.computeBoundingSphere();
    scene.add(shardInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointerRef.current.y = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let isDesktop = width >= 1024;
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      isDesktop = w >= 1024;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let dampedScroll = 0;
    let dampedPointerX = 0;
    let dampedPointerY = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function updateScene(delta: number, elapsed: number) {
      const targetScroll = Math.max(0, Math.min(1, progressRef.current));
      dampedScroll = THREE.MathUtils.damp(dampedScroll, targetScroll, 4.6, delta);
      dampedPointerX = THREE.MathUtils.damp(dampedPointerX, pointerRef.current.x, 3.8, delta);
      dampedPointerY = THREE.MathUtils.damp(dampedPointerY, pointerRef.current.y, 3.8, delta);

      const s = dampedScroll; // full-page scroll 0.0 -> 1.0

      // Full-Page Multi-Act Exploded Anatomy Curve:
      // 0.00-0.06: Closed intact tooth -> 0.06-0.25: Crown opens -> 0.25-0.75: Full 8-part vertical explosion -> 0.85-1.00: Smooth precision re-lock
      const openPhase = smoothstep(0.03, 0.26, s);
      const deepPhase = smoothstep(0.22, 0.64, s);
      const relockPhase = smoothstep(0.84, 0.99, s);

      const crownSplit = openPhase * (1 - 0.65 * relockPhase);
      const mechanicalSpread = deepPhase * (1 - 0.72 * relockPhase);

      // Crown halves split wide & tilt gracefully
      crownLeft.position.set(-1.18 * crownSplit, 0.62 * crownSplit + 0.16 * mechanicalSpread, 0.18 * crownSplit);
      crownLeft.rotation.set(0.06 * crownSplit, 0, 0.26 * crownSplit);

      crownRight.position.set(1.18 * crownSplit, 0.62 * crownSplit + 0.16 * mechanicalSpread, -0.18 * crownSplit);
      crownRight.rotation.set(-0.06 * crownSplit, 0, -0.26 * crownSplit);

      // Dentin-Zirconia Core rises cleanly
      coreMesh.position.y = 0.42 * crownSplit + 0.34 * mechanicalSpread;

      // Optical pulp horns shine and lift inside
      canalGroup.position.y = 0.25 * crownSplit + 0.22 * mechanicalSpread;
      canalGroup.scale.setScalar(0.85 + 0.28 * crownSplit);
      pulpOpticalMat.emissiveIntensity = 0.25 + 0.65 * crownSplit;

      // Internal anodized retention screw lifts above abutment mid-scroll
      screwGroup.position.y = 0.78 * mechanicalSpread;

      // Titanium Hex Abutment separates cleanly below core
      abutmentGroup.position.y = -0.16 * crownSplit - 0.36 * mechanicalSpread;

      // Tapered SLActive Implant Fixture descends to expose buttress screw threads
      implantGroup.position.y = -0.35 * crownSplit - 0.72 * mechanicalSpread;

      // Interactive layer hover feedback (when user hovers/clicks layers 0..3)
      const hl = highlightLayerRef ? highlightLayerRef.current : -1;
      enamelMat.emissive.setHex(hl === 0 ? 0x0ea5e9 : 0x000000);
      enamelMat.emissiveIntensity = hl === 0 ? 0.22 : 0;
      dentinCoreMat.emissive.setHex(hl === 1 ? 0xf59e0b : 0x000000);
      dentinCoreMat.emissiveIntensity = hl === 1 ? 0.25 : 0;
      pulpOpticalMat.emissiveIntensity = hl === 2 ? 0.95 : 0.32 + 0.55 * crownSplit;
      polishedTitaniumMat.emissive.setHex(hl === 3 ? 0x10b981 : 0x000000);
      polishedTitaniumMat.emissiveIntensity = hl === 3 ? 0.25 : 0;
      slactiveFixtureMat.emissive.setHex(hl === 3 ? 0x0284c7 : 0x000000);
      slactiveFixtureMat.emissiveIntensity = hl === 3 ? 0.25 : 0;

      // Horizontal Laser Scan Ring sweeps across implant threads during mid-to-late scroll
      const scanWave = Math.sin((prefersReducedMotion ? 0 : elapsed * 1.4) + s * 8.0);
      scanRing.position.y = -0.4 + scanWave * (0.95 + 0.55 * mechanicalSpread);
      scanRing.scale.setScalar(0.82 + 0.35 * crownSplit);
      scanRingMat.opacity = 0.15 + 0.55 * mechanicalSpread;

      outerReticle.scale.setScalar(0.88 + 0.32 * crownSplit);
      if (!prefersReducedMotion) {
        outerReticle.rotation.z = elapsed * 0.22;
      }

      // Panoramic Stage Choreography across all page sections
      if (isDesktop) {
        // Right (Hero/Anatomy) -> Sweeps Left (Services) -> Returns Right (Tech/Doctors) -> Left (Cases/Reviews) -> Right (Booking)
        const toLeftServices = smoothstep(0.27, 0.39, s) * (1 - smoothstep(0.47, 0.59, s));
        const toLeftCases = smoothstep(0.66, 0.75, s) * (1 - smoothstep(0.83, 0.92, s));
        const xTarget = 1.95 - (toLeftServices + toLeftCases) * 3.85;
        const scaleTarget = 1.04 - 0.1 * mechanicalSpread + 0.08 * smoothstep(0.47, 0.62, s);
        assembly.position.x = xTarget;
        assembly.position.y = 0.18 + Math.sin(s * Math.PI * 3) * 0.12;
        assembly.scale.setScalar(scaleTarget);
      } else {
        // Mobile: stays gracefully centered in upper hero space and subtly frames behind transparent sections
        const mobileY = 0.52 - smoothstep(0.0, 0.18, s) * 0.42;
        assembly.position.x = 0;
        assembly.position.y = mobileY;
        assembly.scale.setScalar(0.74 - 0.08 * mechanicalSpread);
      }

      const idleSpin = prefersReducedMotion ? 0.35 : elapsed * 0.22;
      assembly.rotation.y = idleSpin + s * Math.PI * 2.2 + dampedPointerX * 0.28;
      assembly.rotation.x = 0.16 - 0.12 * mechanicalSpread - dampedPointerY * 0.14;

      shadowPlane.scale.setScalar(1 + 0.35 * crownSplit);
      shadowMat.opacity = Math.max(0.18, 0.62 - 0.3 * mechanicalSpread);

      // Update floating 3D architectural glass shards with scroll parallax
      for (let i = 0; i < shardCount; i++) {
        const seed = shardSeeds[i];
        const driftY = prefersReducedMotion ? 0 : Math.sin(elapsed * 0.6 + seed.phase) * 0.18;
        const scrollShiftY = ((s * 6.5 + seed.y + 4) % 8) - 4;
        _dummy.position.set(
          seed.x * (isDesktop ? 1 : 0.65) + dampedPointerX * 0.2,
          scrollShiftY + driftY,
          seed.z
        );
        const r = prefersReducedMotion ? seed.phase : seed.phase + elapsed * seed.rotSpeed + s * 1.6;
        _dummy.rotation.set(r, r * 0.7, seed.phase);
        _dummy.scale.setScalar(seed.scale * (isDesktop ? 1 : 0.72));
        _dummy.updateMatrix();
        shardInstanced.setMatrixAt(i, _dummy.matrix);
      }
      shardInstanced.instanceMatrix.needsUpdate = true;
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      updateScene(delta, elapsed);
      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      crownLeftGeo.dispose();
      crownRightGeo.dispose();
      coreGeo.dispose();
      pulpChamberGeo.dispose();
      canalGeoL.dispose();
      canalGeoR.dispose();
      screwHeadGeo.dispose();
      screwHexGeo.dispose();
      screwStemGeo.dispose();
      abutmentGeo.dispose();
      hexIndexGeo.dispose();
      collarGeo.dispose();
      fixtureGeo.dispose();
      fixtureCollarGeo.dispose();
      buttressThreadGeo.dispose();
      scanRingGeo.dispose();
      outerReticleGeo.dispose();
      shardGeo.dispose();

      enamelAlbedoTex.dispose();
      enamelBumpTex.dispose();
      dentinTex.dispose();
      brushedTiTex.dispose();
      etchedTiTex.dispose();

      enamelMat.dispose();
      dentinCoreMat.dispose();
      pulpOpticalMat.dispose();
      polishedTitaniumMat.dispose();
      anodizedScrewMat.dispose();
      slactiveFixtureMat.dispose();
      emeraldCollarMat.dispose();
      crystalPrismMat.dispose();
      scanRingMat.dispose();
      outerReticleMat.dispose();
      envTexture.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [progressRef, highlightLayerRef]);

  if (webglFailed) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 z-[5] pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
