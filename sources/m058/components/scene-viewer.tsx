"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { AlertTriangle, Box, Expand, Home, RotateCcw } from "lucide-react";

type Props = {
  root: THREE.Group;
  visibility: Record<string, boolean>;
};

export function SceneViewer({ root, visibility }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [renderInfo, setRenderInfo] = useState({ triangles: 0, calls: 0 });
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const fit = useCallback((animated = true) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const span = Math.max(size.x, size.z, size.y * 2, 50);
    const position = center.clone().add(new THREE.Vector3(span * 0.72, span * 0.72, span * 0.72));
    if (animated) {
      camera.position.lerp(position, 0.85);
      controls.target.lerp(center, 0.85);
    } else {
      camera.position.copy(position);
      controls.target.copy(center);
    }
    camera.near = Math.max(0.1, span / 10_000);
    camera.far = span * 15;
    camera.updateProjectionMatrix();
    controls.update();
  }, [root]);

  useEffect(() => {
    if (!hostRef.current) return;
    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9edf0);
    scene.fog = new THREE.Fog(0xe9edf0, 2500, 16000);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50_000);
    cameraRef.current = camera;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setWebglUnavailable(true);
      return;
    }
    setWebglUnavailable(false);
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minDistance = 5;
    controls.maxDistance = 40_000;

    scene.add(root);
    const hemisphere = new THREE.HemisphereLight(0xe8f1ff, 0xb7aa91, 1.7);
    scene.add(hemisphere);
    const sun = new THREE.DirectionalLight(0xfff4da, 3.2);
    sun.position.set(-3500, 5200, 2600);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -4500;
    sun.shadow.camera.right = 4500;
    sun.shadow.camera.top = 4500;
    sun.shadow.camera.bottom = -4500;
    sun.shadow.bias = -0.0001;
    scene.add(sun);
    fit(false);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    let frame = 0;
    let samples = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
      samples += 1;
      if (samples % 90 === 0) setRenderInfo({ triangles: renderer.info.render.triangles, calls: renderer.info.render.calls });
    };
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      scene.remove(root);
      renderer.dispose();
      renderer.domElement.remove();
      cameraRef.current = null;
      controlsRef.current = null;
      rendererRef.current = null;
    };
  }, [fit, root]);

  useEffect(() => {
    const mapping: Record<string, string> = {
      terrain: "layer-terrain", buildings: "layer-buildings", roads: "layer-roads",
      water: "layer-water", green: "layer-green", rail: "layer-rail",
    };
    for (const [key, groupName] of Object.entries(mapping)) {
      const object = root.getObjectByName(groupName);
      if (object) object.visible = visibility[key] !== false;
    }
  }, [root, visibility]);

  const topView = () => {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const span = Math.max(size.x, size.z, 50);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.set(center.x, center.y + span * 1.35, center.z + 0.01);
    controls.target.copy(center);
    controls.update();
  };

  const fullscreen = () => hostRef.current?.parentElement?.requestFullscreen?.();

  return (
    <div className="viewer-wrap">
      <div ref={hostRef} className="scene-canvas" />
      {webglUnavailable && <div className="webgl-fallback"><div className="fallback-grid" /><AlertTriangle size={28} /><strong>当前环境未启用 WebGL</strong><span>模型已生成，可继续导出 GLB / FBX。请使用已启用硬件加速的 Chrome 或 Edge 查看三维场景。</span></div>}
      {!webglUnavailable && <div className="viewer-tools">
        <button onClick={() => fit()} title="适配场景"><Home size={17} /></button>
        <button onClick={topView} title="俯视"><Box size={17} /></button>
        <button onClick={() => controlsRef.current?.reset()} title="重置视角"><RotateCcw size={17} /></button>
        <button onClick={fullscreen} title="全屏"><Expand size={17} /></button>
      </div>}
      {!webglUnavailable && <><div className="viewer-stats">{renderInfo.triangles.toLocaleString()} 三角面 · {renderInfo.calls} 批次</div><div className="viewer-help">左键旋转 · 右键平移 · 滚轮缩放</div></>}
    </div>
  );
}
