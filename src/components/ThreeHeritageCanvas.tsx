import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LightingMode, PoseType, AccessoryId } from '../types';
import { RotateCw, ZoomIn, ZoomOut, Compass, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';

export interface ThreeHeritageCanvasRef {
  captureSnapshot: () => string;
  resetView: () => void;
  updateFaceTexture: (imageUrl: string) => void;
  updateSkinColor: (hex: string) => void;
  focusPart: (part: 'all' | 'face' | 'torso' | 'skirt') => void;
  updateClothTexture: (canvas: HTMLCanvasElement) => void;
  zoom: (delta: number) => void;
  toggleWalk: () => boolean;
  toggleAutoRotate: () => boolean;
  adjustModelScale: (delta: number) => void;
  getModelScale: () => number;
  isWalking: () => boolean;
  isRotating: () => boolean;
}

interface ThreeHeritageCanvasProps {
  textureCanvas: HTMLCanvasElement | null;
  textureVersion: number;
  activeAccessories: Record<AccessoryId, boolean>;
  lightingMode: LightingMode;
  currentPose: PoseType;
  skinColor: string;
  faceTextureUrl?: string;
  showTunicFlap: boolean;
  characterScale?: number;
}

// Unit constant: 1 unit = 0.28m
const U = 0.28;

/**
 * Creates custom box geometry with explicit 6-face UV mapping
 */
function createBoxUVGeometry(
  width: number,
  height: number,
  depth: number,
  uvRects: {
    right: [number, number, number, number];
    left: [number, number, number, number];
    top: [number, number, number, number];
    bottom: [number, number, number, number];
    front: [number, number, number, number];
    back: [number, number, number, number];
  }
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const uvAttr = geo.attributes.uv;
  const faceOrder = ['right', 'left', 'top', 'bottom', 'front', 'back'] as const;

  for (let f = 0; f < 6; f++) {
    const key = faceOrder[f];
    const [u0, v0, u1, v1] = uvRects[key];
    const baseIdx = f * 8;

    uvAttr.setXY(baseIdx / 2 + 0, u0, v1);
    uvAttr.setXY(baseIdx / 2 + 1, u1, v1);
    uvAttr.setXY(baseIdx / 2 + 2, u0, v0);
    uvAttr.setXY(baseIdx / 2 + 3, u1, v0);
  }

  uvAttr.needsUpdate = true;
  return geo;
}

/**
 * Generates default friendly humanoid face texture
 */
export function createDefaultFaceCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);
  const cx = 256;
  const cy = 256;

  // Eyes
  ctx.fillStyle = '#111113';
  ctx.beginPath();
  ctx.ellipse(cx - 56, cy - 35, 15, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 56, cy - 35, 15, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx - 61, cy - 43, 5.5, 0, Math.PI * 2);
  ctx.arc(cx + 51, cy - 43, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Friendly Smile
  ctx.strokeStyle = '#111113';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy + 26, 58, 0.22 * Math.PI, 0.78 * Math.PI, false);
  ctx.stroke();

  return canvas;
}

export const ThreeHeritageCanvas = forwardRef<ThreeHeritageCanvasRef, ThreeHeritageCanvasProps>(
  (
    {
      textureCanvas,
      textureVersion,
      activeAccessories,
      lightingMode,
      currentPose,
      skinColor,
      faceTextureUrl,
      showTunicFlap,
      characterScale = 1.0,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null);
    const clothMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const skinMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const faceDecalRef = useRef<THREE.Mesh | null>(null);
    const frontFlapRef = useRef<THREE.Mesh | null>(null);
    const backFlapRef = useRef<THREE.Mesh | null>(null);
    const frontFlapPivotRef = useRef<THREE.Group | null>(null);
    const backFlapPivotRef = useRef<THREE.Group | null>(null);
    const avatarRootRef = useRef<THREE.Group | null>(null);

    const pivotsRef = useRef<{
      leftShoulder: THREE.Group;
      rightShoulder: THREE.Group;
      leftHip: THREE.Group;
      rightHip: THREE.Group;
      neck: THREE.Group;
      torso: THREE.Group;
      head: THREE.Group;
      headAttachment: THREE.Group;
      backAttachment: THREE.Group;
      frontFlap: THREE.Group;
      backFlap: THREE.Group;
    } | null>(null);

    const accessoriesMeshesRef = useRef<Record<AccessoryId, THREE.Object3D | null>>({
      non_la: null,
      man_doi_dau: null,
      kieng_bac: null,
      khan_pieu: null,
      khan_dong: null,
      quat_cung_dinh: null,
    });

    const [isAutoRotate, setIsAutoRotate] = useState(false);
    const [isWalkAnimation, setIsWalkAnimation] = useState(false);
    const [modelScale, setModelScale] = useState(characterScale || 1.0);
    const isWalkAnimationRef = useRef(false);

    useEffect(() => {
      isWalkAnimationRef.current = isWalkAnimation;
    }, [isWalkAnimation]);

    useEffect(() => {
      if (characterScale) {
        setModelScale(characterScale);
      }
    }, [characterScale]);

    useEffect(() => {
      if (avatarRootRef.current) {
        avatarRootRef.current.scale.set(modelScale, modelScale, modelScale);
      }
    }, [modelScale]);

    useImperativeHandle(ref, () => ({
      captureSnapshot: () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      },
      resetView: () => {
        if (cameraRef.current && controlsRef.current && pivotsRef.current) {
          cameraRef.current.position.set(0, 1.35, 3.85);
          controlsRef.current.target.set(0, 1.1, 0);
          pivotsRef.current.torso.rotation.set(0, 0, 0);
          controlsRef.current.update();
          setIsAutoRotate(false);
        }
      },
      focusPart: (part: 'all' | 'face' | 'torso' | 'skirt') => {
        if (!cameraRef.current || !controlsRef.current) return;
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        switch (part) {
          case 'face':
            cam.position.set(0, 1.82, 1.5);
            ctrl.target.set(0, 1.78, 0);
            break;
          case 'torso':
            cam.position.set(0, 1.45, 2.1);
            ctrl.target.set(0, 1.40, 0);
            break;
          case 'skirt':
            cam.position.set(0, 0.75, 2.4);
            ctrl.target.set(0, 0.70, 0);
            break;
          case 'all':
          default:
            cam.position.set(0, 1.35, 3.85);
            ctrl.target.set(0, 1.1, 0);
            break;
        }
        ctrl.update();
      },
      updateClothTexture: (canvas: HTMLCanvasElement) => {
        if (!canvasTextureRef.current) return;
        canvasTextureRef.current.image = canvas;
        canvasTextureRef.current.needsUpdate = true;
        if (clothMaterialRef.current) {
          clothMaterialRef.current.map = canvasTextureRef.current;
          clothMaterialRef.current.needsUpdate = true;
        }
      },
      updateFaceTexture: (imgUrl: string) => {
        if (!faceDecalRef.current) return;
        const loader = new THREE.TextureLoader();
        loader.load(imgUrl, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          (faceDecalRef.current!.material as THREE.MeshBasicMaterial).map = tex;
          (faceDecalRef.current!.material as THREE.MeshBasicMaterial).needsUpdate = true;
        });
      },
      updateSkinColor: (hex: string) => {
        if (skinMaterialRef.current) {
          skinMaterialRef.current.color.set(hex);
        }
      },
      zoom: (delta: number) => {
        handleZoom(delta);
      },
      toggleWalk: () => {
        const next = !isWalkAnimation;
        setIsWalkAnimation(next);
        return next;
      },
      toggleAutoRotate: () => {
        const next = !isAutoRotate;
        setIsAutoRotate(next);
        return next;
      },
      adjustModelScale: (delta: number) => {
        handleAdjustModelScale(delta);
      },
      getModelScale: () => modelScale,
      isWalking: () => isWalkAnimation,
      isRotating: () => isAutoRotate,
    }));

    // Setup function for studio lighting: balanced, bright, no black spots
    const setupLighting = (scene: THREE.Scene, mode: LightingMode) => {
      const lightsToRemove = scene.children.filter((c) => c instanceof THREE.Light);
      lightsToRemove.forEach((l) => scene.remove(l));

      // 1. Omnidirectional ambient and hemisphere fill ensures character is NEVER dark
      const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#3F3F46', 1.25);
      scene.add(hemiLight);

      const ambientLight = new THREE.AmbientLight('#FFFFFF', 1.15);
      scene.add(ambientLight);

      // 2. Main Key Directional Light from front-top-right
      const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.0);
      keyLight.position.set(2.2, 4.5, 3.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 14;
      keyLight.shadow.camera.left = -2.5;
      keyLight.shadow.camera.right = 2.5;
      keyLight.shadow.camera.top = 3.5;
      keyLight.shadow.camera.bottom = -0.5;
      keyLight.shadow.bias = -0.0008;
      keyLight.shadow.normalBias = 0.02;
      scene.add(keyLight);

      // 3. Front-left fill light eliminating harsh shadows
      const fillLight = new THREE.DirectionalLight('#F4F4F5', 1.35);
      fillLight.position.set(-2.8, 3.0, 2.8);
      scene.add(fillLight);

      // 4. Accent Rim / Mood Light
      switch (mode) {
        case 'museum': {
          scene.background = new THREE.Color('#0E0E12');
          const rim = new THREE.DirectionalLight('#DC2626', 1.35);
          rim.position.set(-2.5, 3.5, -3.2);
          scene.add(rim);
          break;
        }

        case 'daylight': {
          scene.background = new THREE.Color('#141418');
          const directSun = new THREE.DirectionalLight('#FFFFFF', 1.5);
          directSun.position.set(0, 5.0, 2.5);
          scene.add(directSun);
          break;
        }

        case 'hoi_an_lantern': {
          scene.background = new THREE.Color('#0F0E13');
          const redLantern = new THREE.PointLight('#DC2626', 3.2, 8);
          redLantern.position.set(-2.2, 2.6, 1.6);
          scene.add(redLantern);

          const warmSpot = new THREE.DirectionalLight('#FDE68A', 1.35);
          warmSpot.position.set(1.5, 3.2, 2.5);
          scene.add(warmSpot);
          break;
        }

        case 'sunset': {
          scene.background = new THREE.Color('#141018');
          const sunsetRim = new THREE.DirectionalLight('#F43F5E', 2.2);
          sunsetRim.position.set(-2.5, 3.2, -2.5);
          scene.add(sunsetRim);
          break;
        }
      }
    };

    // Helper to apply static poses to pivots
    const applyStaticPose = (pose: PoseType) => {
      if (!pivotsRef.current) return;
      const { leftShoulder, rightShoulder, leftHip, rightHip } = pivotsRef.current;

      leftShoulder.rotation.set(0, 0, 0);
      rightShoulder.rotation.set(0, 0, 0);
      leftHip.rotation.set(0, 0, 0);
      rightHip.rotation.set(0, 0, 0);

      switch (pose) {
        case 'court_greeting': {
          leftShoulder.rotation.set(-0.6, 0.2, 0.4);
          rightShoulder.rotation.set(-0.6, -0.2, -0.4);
          break;
        }

        case 'xoe_dance': {
          leftShoulder.rotation.set(-0.2, 0, 0.85);
          rightShoulder.rotation.set(-0.2, 0, -0.85);
          break;
        }

        case 'proud_stand': {
          leftShoulder.rotation.set(0, 0, 0.45);
          rightShoulder.rotation.set(0.1, 0, -0.1);
          break;
        }

        case 'idle':
        default: {
          leftShoulder.rotation.set(0, 0, 0.05);
          rightShoulder.rotation.set(0, 0, -0.05);
          break;
        }
      }
    };

    // MOUNT THREE.JS SCENE ONCE ON MOUNT
    useEffect(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // 1. Scene Setup - Clean dark slate studio without fog
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color('#0E0E12');
      // No scene.fog to ensure character never darkens at any camera distance or motion

      // 2. Camera Setup
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      camera.position.set(0, 1.35, 3.85);
      cameraRef.current = camera;

      // 3. Renderer Setup
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Initial Lighting Setup
      setupLighting(scene, lightingMode);

      // 4. Orbit Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 1.1, 0);
      controls.minDistance = 1.4;
      controls.maxDistance = 6.0;
      controls.maxPolarAngle = Math.PI / 2 + 0.02;
      controlsRef.current = controls;

      // 5. Studio Pedestal
      const stageGeo = new THREE.CylinderGeometry(1.35, 1.45, 0.06, 48);
      const stageMat = new THREE.MeshStandardMaterial({
        color: '#15151A',
        roughness: 0.85,
        metalness: 0.15,
      });
      const stage = new THREE.Mesh(stageGeo, stageMat);
      stage.position.y = -0.03;
      stage.receiveShadow = true;
      scene.add(stage);

      const rimGeo = new THREE.TorusGeometry(1.37, 0.012, 16, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: '#DC2626',
        emissive: '#7F1D1D',
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.8,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.002;
      scene.add(rim);

      // 6. Clothing Canvas Texture
      const initialCanvas = document.createElement('canvas');
      initialCanvas.width = 1024;
      initialCanvas.height = 1024;
      const initialCtx = initialCanvas.getContext('2d')!;
      initialCtx.fillStyle = '#DC2626';
      initialCtx.fillRect(0, 0, 1024, 1024);

      const canvasTexture = new THREE.CanvasTexture(textureCanvas || initialCanvas);
      canvasTexture.colorSpace = THREE.SRGBColorSpace;
      canvasTexture.minFilter = THREE.LinearMipMapLinearFilter;
      canvasTexture.magFilter = THREE.LinearFilter;
      canvasTextureRef.current = canvasTexture;

      const clothMaterial = new THREE.MeshStandardMaterial({
        map: canvasTexture,
        roughness: 0.58,
        metalness: 0.08,
      });
      clothMaterialRef.current = clothMaterial;

      const skinMat = new THREE.MeshStandardMaterial({
        color: skinColor || '#F5CBAB',
        roughness: 0.45,
        metalness: 0.05,
      });
      skinMaterialRef.current = skinMat;

      const u = (x: number) => x / 1024;
      const v = (y: number) => (1024 - y) / 1024;

      // 7. HUMANOID CHARACTER (TALLER STATURE + DISTINCT ROUND JOINTS)
      const avatarRoot = new THREE.Group();
      avatarRoot.scale.set(modelScale, modelScale, modelScale);
      scene.add(avatarRoot);
      avatarRootRef.current = avatarRoot;

      // TALL PROPORTIONS: Torso 2.28 * U, Legs 2.85 * U, Arms 2.38 * U
      const torsoW = 2.0 * U; // 0.56m
      const torsoH = 2.28 * U; // 0.638m
      const torsoD = 0.98 * U; // 0.274m

      const legW = 0.96 * U; // 0.268m
      const legH = 2.85 * U; // 0.798m (Tall statuesque legs)
      const legD = 0.96 * U; // 0.268m

      const armW = 0.96 * U; // 0.268m
      const armH = 2.38 * U; // 0.666m
      const armD = 0.96 * U; // 0.268m

      // Elevated torso root position so feet land on top of the pedestal
      const baseY = legH + 0.04; // ~0.84m from ground + height offset
      const torsoGroup = new THREE.Group();
      torsoGroup.position.set(0, 1.45, 0);
      avatarRoot.add(torsoGroup);

      // Torso Mesh (6 Distinct Unfolded Faces Căn Chuẩn)
      const torsoGeo = createBoxUVGeometry(torsoW, torsoH, torsoD, {
        front: [u(352), v(410), u(512), v(90)],
        back: [u(592), v(410), u(752), v(90)],
        left: [u(512), v(410), u(592), v(90)],
        right: [u(272), v(410), u(352), v(90)],
        top: [u(352), v(90), u(512), v(20)],
        bottom: [u(352), v(480), u(512), v(410)],
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, clothMaterial);
      torsoMesh.castShadow = true;
      torsoMesh.receiveShadow = false; // avoid self-shadow acne
      torsoGroup.add(torsoMesh);

      // Back Attachment
      const backAttachment = new THREE.Group();
      backAttachment.position.set(0, 0, -0.55 * U);
      torsoGroup.add(backAttachment);

      // --- NECK & HEAD ---
      const neckPivot = new THREE.Group();
      neckPivot.position.set(0, 1.16 * U, 0);
      torsoGroup.add(neckPivot);

      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.65 * U, 0);
      neckPivot.add(headGroup);

      const headSize = 1.25 * U; // 0.35m
      const headGeo = new THREE.CapsuleGeometry(headSize * 0.46, headSize * 0.28, 20, 32);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.castShadow = true;
      headMesh.receiveShadow = false;
      headGroup.add(headMesh);

      const neckStudGeo = new THREE.CylinderGeometry(headSize * 0.28, headSize * 0.28, 0.1, 24);
      const neckStud = new THREE.Mesh(neckStudGeo, skinMat);
      neckStud.position.y = -headSize * 0.42;
      headGroup.add(neckStud);

      // Face Decal on Front (+Z)
      const defaultFaceCanvas = createDefaultFaceCanvas();
      const faceTex = new THREE.CanvasTexture(defaultFaceCanvas);
      faceTex.colorSpace = THREE.SRGBColorSpace;

      const facePlaneGeo = new THREE.PlaneGeometry(headSize * 0.78, headSize * 0.78);
      const facePlaneMat = new THREE.MeshBasicMaterial({
        map: faceTex,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
      });
      const faceDecal = new THREE.Mesh(facePlaneGeo, facePlaneMat);
      faceDecal.position.set(0, 0.01, headSize * 0.46 + 0.002);
      headGroup.add(faceDecal);
      faceDecalRef.current = faceDecal;

      const headAttachment = new THREE.Group();
      headAttachment.position.set(0, 0.62 * U, 0);
      headGroup.add(headAttachment);

      // --- ARMS (6 DISTINCT UNWRAPPED FACES: FRONT, BACK, OUTER, INNER, TOP, BOTTOM) ---
      const handGeo = new THREE.BoxGeometry(armW * 0.9, 0.12, armD * 0.9);

      // 1. Left Arm Pivot
      const leftShoulderPivot = new THREE.Group();
      leftShoulderPivot.position.set(-1.5 * U, 1.14 * U, 0);
      torsoGroup.add(leftShoulderPivot);

      const leftArmGeo = createBoxUVGeometry(armW, armH, armD, {
        front: [u(69), v(410), u(114), v(90)],
        back: [u(159), v(410), u(204), v(90)],
        left: [u(24), v(410), u(69), v(90)], // Outer
        right: [u(114), v(410), u(159), v(90)], // Inner
        top: [u(69), v(90), u(114), v(20)],
        bottom: [u(69), v(480), u(114), v(410)],
      });
      const leftArmMesh = new THREE.Mesh(leftArmGeo, clothMaterial);
      leftArmMesh.position.set(0, -armH / 2, 0);
      leftArmMesh.castShadow = true;
      leftArmMesh.receiveShadow = false;
      leftShoulderPivot.add(leftArmMesh);

      // Clean skin hand
      const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
      leftHandMesh.position.set(0, -armH - 0.02, 0);
      leftShoulderPivot.add(leftHandMesh);

      // 2. Right Arm Pivot
      const rightShoulderPivot = new THREE.Group();
      rightShoulderPivot.position.set(1.5 * U, 1.14 * U, 0);
      torsoGroup.add(rightShoulderPivot);

      const rightArmGeo = createBoxUVGeometry(armW, armH, armD, {
        front: [u(910), v(410), u(955), v(90)],
        back: [u(820), v(410), u(865), v(90)],
        left: [u(865), v(410), u(910), v(90)], // Inner
        right: [u(955), v(410), u(1000), v(90)], // Outer
        top: [u(910), v(90), u(955), v(20)],
        bottom: [u(910), v(480), u(955), v(410)],
      });
      const rightArmMesh = new THREE.Mesh(rightArmGeo, clothMaterial);
      rightArmMesh.position.set(0, -armH / 2, 0);
      rightArmMesh.castShadow = true;
      rightArmMesh.receiveShadow = false;
      rightShoulderPivot.add(rightArmMesh);

      // Clean skin hand
      const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
      rightHandMesh.position.set(0, -armH - 0.02, 0);
      rightShoulderPivot.add(rightHandMesh);

      // --- LEGS (6 DISTINCT UNWRAPPED FACES: FRONT, BACK, OUTER, INNER, TOP, BOTTOM) ---
      // 1. Left Hip Pivot
      const leftHipPivot = new THREE.Group();
      leftHipPivot.position.set(-0.5 * U, -1.14 * U, 0);
      torsoGroup.add(leftHipPivot);

      const leftLegGeo = createBoxUVGeometry(legW, legH, legD, {
        front: [u(69), v(945), u(114), v(575)],
        back: [u(159), v(945), u(204), v(575)],
        left: [u(24), v(945), u(69), v(575)], // Outer
        right: [u(114), v(945), u(159), v(575)], // Inner
        top: [u(69), v(575), u(114), v(520)],
        bottom: [u(69), v(1000), u(114), v(945)],
      });
      const leftLegMesh = new THREE.Mesh(leftLegGeo, clothMaterial);
      leftLegMesh.position.set(0, -legH / 2, 0);
      leftLegMesh.castShadow = true;
      leftLegMesh.receiveShadow = false;
      leftHipPivot.add(leftLegMesh);

      // Shoe
      const shoeGeo = new THREE.BoxGeometry(legW, 0.08, legD * 1.15);
      const shoeMat = new THREE.MeshStandardMaterial({ color: '#141418', roughness: 0.65 });
      const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
      leftShoe.position.set(0, -legH + 0.035, 0.02);
      leftHipPivot.add(leftShoe);

      // 2. Right Hip Pivot
      const rightHipPivot = new THREE.Group();
      rightHipPivot.position.set(0.5 * U, -1.14 * U, 0);
      torsoGroup.add(rightHipPivot);

      const rightLegGeo = createBoxUVGeometry(legW, legH, legD, {
        front: [u(910), v(945), u(955), v(575)],
        back: [u(820), v(945), u(865), v(575)],
        left: [u(865), v(945), u(910), v(575)], // Inner
        right: [u(955), v(945), u(1000), v(575)], // Outer
        top: [u(910), v(575), u(955), v(520)],
        bottom: [u(910), v(1000), u(955), v(945)],
      });
      const rightLegMesh = new THREE.Mesh(rightLegGeo, clothMaterial);
      rightLegMesh.position.set(0, -legH / 2, 0);
      rightLegMesh.castShadow = true;
      rightLegMesh.receiveShadow = false;
      rightHipPivot.add(rightLegMesh);

      const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
      rightShoe.position.set(0, -legH + 0.035, 0.02);
      rightHipPivot.add(rightShoe);

      // --- TRADITIONAL TUNIC FLAPS (TÀ TRƯỚC & TÀ SAU) ---
      // Perfectly aligned with torso width (2.02 * U) and draping to ankles with zero leg clipping
      const flapW = 2.02 * U;
      const flapH = 2.72 * U;
      const flapThick = 0.016;

      // 1. TÀ TRƯỚC (Front Flap) - UV Mapped to skirt_front [272..502, 520..1000]
      const frontFlapGeo = createBoxUVGeometry(flapW, flapH, flapThick, {
        front: [u(272), v(1000), u(502), v(520)],
        back: [u(272), v(1000), u(502), v(520)],
        left: [u(272), v(1000), u(278), v(520)],
        right: [u(496), v(1000), u(502), v(520)],
        top: [u(272), v(526), u(502), v(520)],
        bottom: [u(272), v(1000), u(502), v(994)],
      });
      const frontFlapPivot = new THREE.Group();
      // Waist anchor: flush with bottom edge of torso, clearance z = 0.52 * U in front of legs
      frontFlapPivot.position.set(0, -1.13 * U, 0.52 * U);
      frontFlapPivot.rotation.x = 0.038; // Drapes outward forward, eliminating leg clipping
      torsoGroup.add(frontFlapPivot);
      frontFlapPivotRef.current = frontFlapPivot;

      const frontFlap = new THREE.Mesh(frontFlapGeo, clothMaterial);
      frontFlap.position.set(0, -flapH / 2, 0);
      frontFlap.castShadow = false;
      frontFlap.receiveShadow = false;
      frontFlapPivot.add(frontFlap);
      frontFlapRef.current = frontFlap;

      // 2. TÀ SAU (Back Flap) - UV Mapped to skirt_back [522..752, 520..1000]
      const backFlapGeo = createBoxUVGeometry(flapW, flapH, flapThick, {
        front: [u(522), v(1000), u(752), v(520)],
        back: [u(522), v(1000), u(752), v(520)],
        left: [u(522), v(1000), u(528), v(520)],
        right: [u(746), v(1000), u(752), v(520)],
        top: [u(522), v(526), u(752), v(520)],
        bottom: [u(522), v(1000), u(752), v(994)],
      });
      const backFlapPivot = new THREE.Group();
      // Waist anchor: flush with bottom edge of torso, clearance z = -0.52 * U behind legs
      backFlapPivot.position.set(0, -1.13 * U, -0.52 * U);
      backFlapPivot.rotation.x = -0.038; // Drapes outward backward, fully visible from back & side
      torsoGroup.add(backFlapPivot);
      backFlapPivotRef.current = backFlapPivot;

      const backFlap = new THREE.Mesh(backFlapGeo, clothMaterial);
      backFlap.position.set(0, -flapH / 2, 0);
      backFlap.castShadow = false;
      backFlap.receiveShadow = false;
      backFlapPivot.add(backFlap);
      backFlapRef.current = backFlap;

      pivotsRef.current = {
        leftShoulder: leftShoulderPivot,
        rightShoulder: rightShoulderPivot,
        leftHip: leftHipPivot,
        rightHip: rightHipPivot,
        neck: neckPivot,
        torso: torsoGroup,
        head: headGroup,
        headAttachment,
        backAttachment,
        frontFlap: frontFlapPivot,
        backFlap: backFlapPivot,
      };

      // --- ATTACH ACCESSORIES (PRECISE HEAD & HAND ANCHORS) ---
      // 1. Nón Lá
      const nonLaGroup = new THREE.Group();
      const nonLaH = headSize * 0.68;
      const nonLaGeo = new THREE.ConeGeometry(headSize * 1.35, nonLaH, 32, 1, true);
      const nonLaMat = new THREE.MeshStandardMaterial({
        color: '#EFE6D8',
        roughness: 0.8,
        side: THREE.DoubleSide,
      });
      const nonLaMesh = new THREE.Mesh(nonLaGeo, nonLaMat);
      nonLaMesh.position.y = nonLaH / 2; // cone rim base sits flush at y = 0
      nonLaMesh.rotation.x = -0.15; // tilted back gracefully to show face
      nonLaGroup.add(nonLaMesh);

      // Red silk chin strap
      const strapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-headSize * 0.52, 0.02, 0),
        new THREE.Vector3(-headSize * 0.22, -headSize * 0.55, 0.04),
        new THREE.Vector3(headSize * 0.22, -headSize * 0.55, 0.04),
        new THREE.Vector3(headSize * 0.52, 0.02, 0),
      ]);
      const strapGeo = new THREE.TubeGeometry(strapCurve, 16, 0.012, 8, false);
      const strapMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.5 });
      const strapMesh = new THREE.Mesh(strapGeo, strapMat);
      nonLaGroup.add(strapMesh);

      // Sits on top of the head at y = 0.20m
      nonLaGroup.position.set(0, 0.20, -0.01);
      headGroup.add(nonLaGroup);
      nonLaGroup.visible = false;
      accessoriesMeshesRef.current.non_la = nonLaGroup;

      // 2. Mấn Đội Đầu
      const manGroup = new THREE.Group();
      const manGeo = new THREE.TorusGeometry(headSize * 0.48, 0.038, 16, 40);
      const manMat = new THREE.MeshStandardMaterial({
        color: '#DC2626',
        roughness: 0.45,
        metalness: 0.15,
      });
      const manMesh = new THREE.Mesh(manGeo, manMat);
      manMesh.rotation.x = Math.PI / 2 - 0.28;
      manGroup.add(manMesh);

      manGroup.position.set(0, 0.15, -0.01);
      headGroup.add(manGroup);
      manGroup.visible = false;
      accessoriesMeshesRef.current.man_doi_dau = manGroup;

      // 3. Kiềng Bạc
      const kiengGroup = new THREE.Group();
      const kiengGeo = new THREE.TorusGeometry(0.165, 0.013, 16, 40);
      const kiengMat = new THREE.MeshStandardMaterial({
        color: '#E2E8F0',
        metalness: 0.95,
        roughness: 0.15,
      });
      const kiengMesh = new THREE.Mesh(kiengGeo, kiengMat);
      kiengMesh.rotation.x = Math.PI / 2 + 0.12;
      kiengGroup.add(kiengMesh);

      kiengGroup.position.set(0, 0.04, 0.035);
      neckPivot.add(kiengGroup);
      kiengGroup.visible = false;
      accessoriesMeshesRef.current.kieng_bac = kiengGroup;

      // 4. Khăn Piêu
      const pieuGroup = new THREE.Group();
      const pieuBandGeo = new THREE.TorusGeometry(headSize * 0.49, 0.032, 12, 32, Math.PI * 1.5);
      const pieuBandMat = new THREE.MeshStandardMaterial({ color: '#18181D', roughness: 0.8 });
      const pieuBand = new THREE.Mesh(pieuBandGeo, pieuBandMat);
      pieuBand.rotation.x = Math.PI / 2 - 0.15;
      pieuBand.rotation.z = 0.2;
      pieuGroup.add(pieuBand);

      const pieuEndGeo = new THREE.BoxGeometry(0.08, 0.25, 0.012);
      const pieuEndMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.7 });
      const pieuEnd = new THREE.Mesh(pieuEndGeo, pieuEndMat);
      pieuEnd.position.set(0.18, -0.15, -0.03);
      pieuGroup.add(pieuEnd);

      pieuGroup.position.set(0, 0.16, -0.01);
      headGroup.add(pieuGroup);
      pieuGroup.visible = false;
      accessoriesMeshesRef.current.khan_pieu = pieuGroup;

      // 5. Khăn Đóng
      const khanDongGroup = new THREE.Group();
      for (let layer = 0; layer < 4; layer++) {
        const kdGeo = new THREE.TorusGeometry(headSize * 0.47 + layer * 0.005, 0.02, 12, 32);
        const kdMat = new THREE.MeshStandardMaterial({
          color: layer % 2 === 0 ? '#18181B' : '#27272A',
          roughness: 0.65,
        });
        const kdMesh = new THREE.Mesh(kdGeo, kdMat);
        kdMesh.rotation.x = Math.PI / 2 - 0.15;
        kdMesh.position.y = layer * 0.016;
        khanDongGroup.add(kdMesh);
      }
      khanDongGroup.position.set(0, 0.12, -0.01);
      headGroup.add(khanDongGroup);
      khanDongGroup.visible = false;
      accessoriesMeshesRef.current.khan_dong = khanDongGroup;

      // 6. Quạt Cung Đình (held naturally in right hand)
      const quatGroup = new THREE.Group();
      const fanBladeGeo = new THREE.CylinderGeometry(0.18, 0.02, 0.008, 16, 1, false, 0, Math.PI);
      const fanBladeMat = new THREE.MeshStandardMaterial({
        color: '#DC2626',
        roughness: 0.5,
        side: THREE.DoubleSide,
      });
      const fanBlade = new THREE.Mesh(fanBladeGeo, fanBladeMat);
      fanBlade.rotation.x = Math.PI / 2;
      quatGroup.add(fanBlade);

      const fanHandleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8);
      const fanHandleMat = new THREE.MeshStandardMaterial({ color: '#27272A', roughness: 0.6 });
      const fanHandle = new THREE.Mesh(fanHandleGeo, fanHandleMat);
      fanHandle.position.y = -0.08;
      quatGroup.add(fanHandle);

      quatGroup.scale.set(0.85, 0.85, 0.85);
      quatGroup.position.set(0, -armH - 0.02, 0.08);
      quatGroup.rotation.y = -0.3;
      rightShoulderPivot.add(quatGroup); // Natural hand grip!
      quatGroup.visible = false;
      accessoriesMeshesRef.current.quat_cung_dinh = quatGroup;

      // 8. ANIMATION LOOP
      let animationId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        if (controlsRef.current) {
          if (isAutoRotate) {
            avatarRoot.rotation.y += delta * 0.45;
          }
          controlsRef.current.update();
        }

        if (pivotsRef.current) {
          const { leftShoulder, rightShoulder, leftHip, rightHip, head, frontFlap, backFlap } = pivotsRef.current;

          if (isWalkAnimationRef.current) {
            // Forward Kinematics Walk Cycle with natural balance
            const walkSpeed = 5.2;
            const walkAmplitude = 0.44;
            const armAmplitude = 0.38;

            rightShoulder.rotation.x = Math.sin(time * walkSpeed) * armAmplitude;
            leftHip.rotation.x = Math.sin(time * walkSpeed) * walkAmplitude;

            leftShoulder.rotation.x = -Math.sin(time * walkSpeed) * armAmplitude;
            rightHip.rotation.x = -Math.sin(time * walkSpeed) * walkAmplitude;

            // Flaps sway naturally with movement outward from legs
            if (frontFlap) frontFlap.rotation.x = 0.038 + Math.sin(time * walkSpeed) * 0.05;
            if (backFlap) backFlap.rotation.x = -0.038 - Math.sin(time * walkSpeed) * 0.05;

            // Stable subtle bounce
            torsoGroup.position.y = 1.45 + Math.abs(Math.sin(time * walkSpeed * 2)) * 0.015;
            torsoGroup.rotation.y = Math.sin(time * walkSpeed) * 0.035;
          } else {
            // Natural idle breathing & gentle sway
            head.rotation.y = Math.cos(time * 0.5) * 0.035;
            torsoGroup.position.y = 1.45 + Math.sin(time * 1.5) * 0.002;
            if (frontFlap) frontFlap.rotation.x = 0.038;
            if (backFlap) backFlap.rotation.x = -0.038;
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        controls.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []); // Runs once on mount

    // Update texture when canvas changes
    useEffect(() => {
      if (!canvasTextureRef.current || !textureCanvas) return;
      if (canvasTextureRef.current.image !== textureCanvas) {
        canvasTextureRef.current.image = textureCanvas;
      }
      canvasTextureRef.current.needsUpdate = true;
      if (clothMaterialRef.current) {
        clothMaterialRef.current.map = canvasTextureRef.current;
        clothMaterialRef.current.needsUpdate = true;
      }
    }, [textureCanvas, textureVersion]);

    // Update skin tone
    useEffect(() => {
      if (skinMaterialRef.current && skinColor) {
        skinMaterialRef.current.color.set(skinColor);
        skinMaterialRef.current.needsUpdate = true;
      }
    }, [skinColor]);

    // Update face texture
    useEffect(() => {
      if (!faceDecalRef.current || !faceTextureUrl) return;
      const loader = new THREE.TextureLoader();
      loader.load(faceTextureUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        (faceDecalRef.current!.material as THREE.MeshBasicMaterial).map = tex;
        (faceDecalRef.current!.material as THREE.MeshBasicMaterial).needsUpdate = true;
      });
    }, [faceTextureUrl]);

    // Update tunic flap visibility for both front and back flaps
    useEffect(() => {
      if (frontFlapRef.current) {
        frontFlapRef.current.visible = showTunicFlap;
      }
      if (backFlapRef.current) {
        backFlapRef.current.visible = showTunicFlap;
      }
    }, [showTunicFlap]);

    // Update accessories visibility
    useEffect(() => {
      (Object.keys(activeAccessories) as AccessoryId[]).forEach((accId) => {
        const mesh = accessoriesMeshesRef.current[accId];
        if (mesh) {
          mesh.visible = !!activeAccessories[accId];
        }
      });
    }, [activeAccessories]);

    // Update lighting whenever lightingMode prop changes
    useEffect(() => {
      if (!sceneRef.current) return;
      setupLighting(sceneRef.current, lightingMode);
    }, [lightingMode]);

    // Update poses & reset smoothly when walking stops
    useEffect(() => {
      if (!pivotsRef.current) return;
      const { leftHip, rightHip, torso } = pivotsRef.current;

      if (!isWalkAnimation) {
        leftHip.rotation.set(0, 0, 0);
        rightHip.rotation.set(0, 0, 0);
        torso.rotation.set(0, 0, 0);
        torso.position.y = 1.45;
        applyStaticPose(currentPose);
      }
    }, [currentPose, isWalkAnimation]);

    const handleZoom = (delta: number) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const cam = cameraRef.current;
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      cam.position.addScaledVector(dir, delta * 0.4);
      controlsRef.current.update();
    };

    const handleAdjustModelScale = (delta: number) => {
      setModelScale((prev) => Math.min(1.6, Math.max(0.65, Number((prev + delta).toFixed(2)))));
    };

    return (
      <div className="relative w-full h-full bg-[#0E0E12] select-none overflow-hidden">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>
    );
  }
);

ThreeHeritageCanvas.displayName = 'ThreeHeritageCanvas';
