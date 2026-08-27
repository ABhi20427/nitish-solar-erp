'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type CameraMode = 'AERIAL' | '3D' | 'SOLAR';

interface Solar3DEngineProps {
  stage: number; // 1 to 10
  cameraMode: CameraMode;
  panelCount: number; // 8, 12, 18, 24, 30
  sunPosition: number; // 0 (morning) to 1 (evening)
  isScanning: boolean;
  scanProgress: number; // 0 to 1
}

export function Solar3DEngine({
  stage,
  cameraMode,
  panelCount,
  sunPosition,
  isScanning,
  scanProgress,
}: Solar3DEngineProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const roofBorderRef = useRef<THREE.LineSegments | null>(null);
  const scanLineRef = useRef<THREE.Mesh | null>(null);
  const panelsGroupRef = useRef<THREE.Group | null>(null);

  // Camera Target States for Lerp
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 30, 30));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Mouse Orbit State
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const orbitSpherical = useRef({ radius: 24, phi: Math.PI / 3, theta: Math.PI / 4 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070A0F');
    scene.fog = new THREE.FogExp2('#070A0F', 0.012);
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 150, 150);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = -25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Visual Sun Mesh
    const sunGeom = new THREE.SphereGeometry(1.2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbcb43 });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Hemisphere light for sky glow
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.4);
    scene.add(hemiLight);

    // 5. ENVIRONMENT & GROUND DIGITAL TWIN
    // Grid ground plane
    const groundSize = 120;
    const groundGeom = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0b1329,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // High-tech circular map HUD ring
    const gridHelper = new THREE.GridHelper(80, 40, 0xf59e0b, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Surrounding neighborhood dummy buildings
    const surroundMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const createNeighbor = (x: number, z: number, w: number, h: number, d: number) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, surroundMat);
      m.position.set(x, h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    };

    createNeighbor(-22, -18, 12, 8, 14);
    createNeighbor(20, -20, 14, 10, 12);
    createNeighbor(-24, 18, 10, 7, 16);
    createNeighbor(22, 20, 15, 9, 14);

    // Trees surrounding property
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3f2a1d });
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6 });
    const createTree = (x: number, z: number) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.5, 8), treeTrunkMat);
      trunk.position.set(x, 1.25, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const foliage = new THREE.Mesh(new THREE.ConeGeometry(2, 4.5, 8), treeFoliageMat);
      foliage.position.set(x, 4.5, z);
      foliage.castShadow = true;
      scene.add(foliage);
    };

    createTree(-12, -10);
    createTree(-14, 8);
    createTree(13, -12);
    createTree(15, 10);

    // 6. MAIN PROPERTY (THE DIGITAL TWIN HOUSE)
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    // House Main Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.1 });
    const wallGeom = new THREE.BoxGeometry(12, 5, 9);
    const wallMesh = new THREE.Mesh(wallGeom, wallMat);
    wallMesh.position.y = 2.5;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    buildingGroup.add(wallMesh);

    // House Windows with warm glowing interior
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const createWindow = (x: number, y: number, z: number, w: number, h: number, rotY = 0) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(w, h), windowMat);
      win.position.set(x, y, z);
      win.rotation.y = rotY;
      buildingGroup.add(win);
    };
    createWindow(0, 2.8, 4.52, 2.5, 1.2);
    createWindow(-3.5, 2.8, 4.52, 1.5, 1.2);
    createWindow(3.5, 2.8, 4.52, 1.5, 1.2);

    // Roof Structure (Gable roof angled for optimal solar yield facing South/front)
    const roofWidth = 12.6;
    const roofDepth = 9.8;
    const roofHeight = 2.5;

    // Roof geometry
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-roofWidth / 2, 0);
    roofShape.lineTo(0, roofHeight);
    roofShape.lineTo(roofWidth / 2, 0);
    roofShape.closePath();

    const extrudeSettings = { depth: roofDepth, bevelEnabled: false };
    const roofGeom = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    roofGeom.center();
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.2,
    });
    const roofMesh = new THREE.Mesh(roofGeom, roofMat);
    roofMesh.position.set(0, 5 + roofHeight / 2, 0);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    buildingGroup.add(roofMesh);

    // Roof Surface Highlight Line (Glowing Border for STAGE 3+)
    const roofEdgeGeom = new THREE.EdgesGeometry(roofGeom);
    const roofLineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    const roofBorder = new THREE.LineSegments(roofEdgeGeom, roofLineMat);
    roofBorder.position.copy(roofMesh.position);
    buildingGroup.add(roofBorder);
    roofBorderRef.current = roofBorder;

    // Laser Scan plane for STAGE 4
    const scanGeom = new THREE.BoxGeometry(roofWidth + 1, 0.1, 0.4);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const scanLine = new THREE.Mesh(scanGeom, scanMat);
    scanLine.position.set(0, 6.2, 0);
    scanLine.visible = false;
    buildingGroup.add(scanLine);
    scanLineRef.current = scanLine;

    // 7. SOLAR PANELS GROUP
    const panelsGroup = new THREE.Group();
    panelsGroup.position.set(0, 5.5, 0);
    buildingGroup.add(panelsGroup);
    panelsGroupRef.current = panelsGroup;

    // Mouse Interaction Handlers for Inertial Orbit Controls
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMouse.current.x;
      const deltaY = e.clientY - previousMouse.current.y;
      previousMouse.current = { x: e.clientX, y: e.clientY };

      orbitSpherical.current.theta -= deltaX * 0.005;
      orbitSpherical.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orbitSpherical.current.phi - deltaY * 0.005));
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      orbitSpherical.current.radius = Math.max(8, Math.min(60, orbitSpherical.current.radius + e.deltaY * 0.02));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Lerp Orbit camera position based on spherical coordinates
      const spherical = orbitSpherical.current;
      const x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      const y = spherical.radius * Math.cos(spherical.phi);
      const z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);

      if (cameraRef.current) {
        cameraRef.current.position.lerp(new THREE.Vector3(targetCamPos.current.x + x, targetCamPos.current.y + y, targetCamPos.current.z + z), 0.08);
        currentLookAt.current.lerp(targetLookAt.current, 0.08);
        cameraRef.current.lookAt(currentLookAt.current);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update Sun Position
  useEffect(() => {
    if (!sunLightRef.current || !sunMeshRef.current) return;
    // Angle from Morning (E) -> Noon (Top) -> Evening (W)
    const angle = (sunPosition - 0.5) * Math.PI * 0.8;
    const radius = 45;
    const sunX = Math.sin(angle) * radius;
    const sunY = Math.cos(angle) * radius;
    const sunZ = 20;

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunMeshRef.current.position.set(sunX * 1.5, sunY * 1.5, sunZ * 1.5);
  }, [sunPosition]);

  // Update Camera Target based on Mode / Stage
  useEffect(() => {
    if (stage === 2) {
      // Stage 2: Cinematic fly-in from space down to neighborhood
      targetCamPos.current.set(0, 10, 0);
      targetLookAt.current.set(0, 3, 0);
      orbitSpherical.current = { radius: 32, phi: Math.PI / 3.5, theta: Math.PI / 4 };
      return;
    }

    if (cameraMode === 'AERIAL') {
      targetCamPos.current.set(0, 0, 0);
      targetLookAt.current.set(0, 0, 0);
      orbitSpherical.current = { radius: 34, phi: 0.05, theta: 0 };
    } else if (cameraMode === 'SOLAR') {
      targetCamPos.current.set(0, 2, 0);
      targetLookAt.current.set(0, 6, 0);
      orbitSpherical.current = { radius: 14, phi: Math.PI / 4, theta: Math.PI / 3 };
    } else {
      // 3D Perspective
      targetCamPos.current.set(0, 0, 0);
      targetLookAt.current.set(0, 3, 0);
      orbitSpherical.current = { radius: 24, phi: Math.PI / 3, theta: Math.PI / 4 };
    }
  }, [cameraMode, stage]);

  // Handle Scanning Beam (Stage 4)
  useEffect(() => {
    if (!scanLineRef.current) return;
    if (isScanning || stage === 4) {
      scanLineRef.current.visible = true;
      // Animate Z position along roof depth (-4 to +4)
      const zPos = (scanProgress - 0.5) * 8.5;
      scanLineRef.current.position.z = zPos;
    } else {
      scanLineRef.current.visible = false;
    }
  }, [isScanning, scanProgress, stage]);

  // Update Solar Panels Array (Stage 5+)
  useEffect(() => {
    if (!panelsGroupRef.current) return;
    const group = panelsGroupRef.current;

    // Clear old panels
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (stage < 5) return;

    // Panel Geometry & Materials
    const panelWidth = 1.4;
    const panelLength = 2.2;
    const panelThickness = 0.08;

    const panelFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const panelCellMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Deep solar silicon blue
      metalness: 0.8,
      roughness: 0.15,
      emissive: 0x0369a1,
      emissiveIntensity: 0.15,
    });

    // Compute grid layout based on count (e.g. 8, 12, 18, 24, 30)
    let cols = 4;
    if (panelCount >= 24) cols = 6;
    else if (panelCount >= 18) cols = 6;
    else if (panelCount >= 12) cols = 4;
    else cols = 4;

    const rows = Math.ceil(panelCount / cols);
    const spacingX = 1.55;
    const spacingZ = 2.35;

    const startX = -((cols - 1) * spacingX) / 2;
    const startZ = -((rows - 1) * spacingZ) / 2;

    for (let i = 0; i < panelCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = startX + col * spacingX;
      const z = startZ + row * spacingZ;

      const singlePanelGroup = new THREE.Group();

      // Outer Frame
      const frameGeom = new THREE.BoxGeometry(panelWidth, panelThickness, panelLength);
      const frameMesh = new THREE.Mesh(frameGeom, panelFrameMat);
      frameMesh.castShadow = true;
      singlePanelGroup.add(frameMesh);

      // Inner Photovoltaic Surface
      const cellGeom = new THREE.BoxGeometry(panelWidth - 0.1, panelThickness + 0.02, panelLength - 0.1);
      const cellMesh = new THREE.Mesh(cellGeom, panelCellMat);
      singlePanelGroup.add(cellMesh);

      // Angled pitch matching South roof slope (approx 20 deg)
      singlePanelGroup.rotation.x = -Math.PI / 8;
      singlePanelGroup.position.set(x, 1.2 - row * 0.4, z);

      group.add(singlePanelGroup);
    }
  }, [panelCount, stage]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
