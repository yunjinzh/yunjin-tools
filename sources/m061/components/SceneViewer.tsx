"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Box, Crosshair, Maximize2, Orbit, Ruler, SunMedium } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { BuildBundle, SceneStyle } from "../lib/types";
import type { FeatureRange } from "../lib/types";
import {
  applyStyleToScene,
  buildScene,
  disposeScene,
  exportFbx,
  exportGlb,
  type SceneBuildResult,
} from "../lib/scene";
import { bboxDimensions } from "../lib/geo";

export interface SceneViewerHandle {
  exportGlb: (includeTextures?: boolean) => Promise<Blob>;
  exportFbx: (textureFile?: string) => Blob;
  fit: () => void;
  screenshot: () => Blob | null;
}

interface SceneViewerProps {
  bundle: BuildBundle | null;
  style: SceneStyle;
  onStats?: (stats: { objects: number; triangles: number }) => void;
  onSelectFeature?: (properties: Record<string, unknown> | null) => void;
}

const SceneViewer = forwardRef<SceneViewerHandle, SceneViewerProps>(function SceneViewer(
  { bundle, style, onStats, onSelectFeature },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentRootRef = useRef<THREE.Group | null>(null);
  const buildResultRef = useRef<SceneBuildResult | null>(null);
  const [building, setBuilding] = useState(false);
  const [viewMode, setViewMode] = useState<"perspective" | "top">("perspective");
  const [sunny, setSunny] = useState(true);
  const [webglError, setWebglError] = useState("");

  function fitScene(mode = viewMode) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !bundle) return;
    const { width, depth } = bboxDimensions(bundle.selection.bbox);
    const size = Math.max(width, depth, 200);
    if (mode === "top") {
      camera.position.set(0, size * 1.45, 0.001);
      camera.up.set(0, 0, -1);
    } else {
      camera.position.set(size * 0.78, size * 0.74, size * 0.86);
      camera.up.set(0, 1, 0);
    }
    camera.near = Math.max(0.1, size / 20_000);
    camera.far = size * 20;
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();
  }

  useImperativeHandle(ref, () => ({
    exportGlb: async (includeTextures = true) => {
      if (!currentRootRef.current) throw new Error("尚未生成场景");
      return exportGlb(currentRootRef.current, includeTextures);
    },
    exportFbx: (textureFile) => {
      if (!currentRootRef.current) throw new Error("尚未生成场景");
      return exportFbx(currentRootRef.current, textureFile);
    },
    fit: () => fitScene(),
    screenshot: () => {
      const renderer = rendererRef.current;
      if (!renderer) return null;
      renderer.render(sceneRef.current!, cameraRef.current!);
      const dataUrl = renderer.domElement.toDataURL("image/png");
      const bytes = atob(dataUrl.split(",")[1]);
      const array = new Uint8Array(bytes.length);
      for (let index = 0; index < bytes.length; index += 1) array[index] = bytes.charCodeAt(index);
      return new Blob([array], { type: "image/png" });
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container || rendererRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#dfe4e7");
    scene.fog = new THREE.FogExp2("#dfe4e7", 0.00009);
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100_000);
    camera.position.set(1000, 900, 1000);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    } catch {
      container.style.display = "none";
      setWebglError("当前浏览器环境未启用 WebGL。地图和数据生成仍可使用；请在已开启硬件加速的 Chrome、Edge 或 Firefox 中进行三维预览。 ");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.015;
    controls.target.set(0, 0, 0);

    const hemisphere = new THREE.HemisphereLight("#f7fbff", "#6d675a", 1.75);
    hemisphere.name = "HemisphereLight";
    scene.add(hemisphere);
    const sun = new THREE.DirectionalLight("#fff3dc", 3.1);
    sun.name = "SunLight";
    sun.position.set(-1200, 1600, 900);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 6000;
    sun.shadow.camera.left = -2500;
    sun.shadow.camera.right = 2500;
    sun.shadow.camera.top = 2500;
    sun.shadow.camera.bottom = -2500;
    scene.add(sun);

    const grid = new THREE.GridHelper(6000, 60, "#9ca4a7", "#c5cbcb");
    grid.name = "ReferenceGrid";
    (grid.material as THREE.Material).opacity = 0.17;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const select = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(currentRootRef.current || scene, true);
      const hit = hits.find((item) => Object.keys(item.object.userData || {}).length > 0);
      if (!hit) {
        onSelectFeature?.(null);
        return;
      }
      const ranges = hit.object.userData.featureRanges as FeatureRange[] | undefined;
      if (ranges && hit.faceIndex != null) {
        let low = 0;
        let high = ranges.length - 1;
        while (low <= high) {
          const middle = Math.floor((low + high) / 2);
          const range = ranges[middle];
          if (hit.faceIndex < range.startFace) high = middle - 1;
          else if (hit.faceIndex >= range.endFace) low = middle + 1;
          else {
            onSelectFeature?.(range.properties);
            return;
          }
        }
      }
      onSelectFeature?.(hit.object.userData || null);
    };
    renderer.domElement.addEventListener("dblclick", select);

    let animationFrame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const resize = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resize.observe(container);

    return () => {
      cancelAnimationFrame(animationFrame);
      resize.disconnect();
      renderer.domElement.removeEventListener("dblclick", select);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      rendererRef.current = null;
      sceneRef.current = null;
    };
  }, [onSelectFeature]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !bundle) return;
    let cancelled = false;
    setBuilding(true);
    buildScene(bundle)
      .then((result) => {
        if (cancelled) {
          disposeScene(result.root);
          return;
        }
        if (currentRootRef.current) {
          scene.remove(currentRootRef.current);
          disposeScene(currentRootRef.current);
        }
        currentRootRef.current = result.root;
        buildResultRef.current = result;
        scene.add(result.root);
        applyStyleToScene(result, style);
        onStats?.({ objects: result.objectCount, triangles: result.triangleCount });
        window.setTimeout(() => fitScene(), 60);
      })
      .finally(() => !cancelled && setBuilding(false));
    return () => {
      cancelled = true;
    };
  // A bundle is immutable for a build; style visibility updates separately.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle]);

  useEffect(() => {
    if (buildResultRef.current) applyStyleToScene(buildResultRef.current, style);
  }, [style]);

  function setCameraMode(mode: "perspective" | "top") {
    setViewMode(mode);
    fitScene(mode);
  }

  function toggleSun() {
    const next = !sunny;
    setSunny(next);
    const sun = sceneRef.current?.getObjectByName("SunLight") as THREE.DirectionalLight | undefined;
    if (sun) sun.intensity = next ? 3.1 : 0.65;
    if (sceneRef.current) sceneRef.current.background = new THREE.Color(next ? "#dfe4e7" : "#56616b");
  }

  return (
    <div className="viewer-shell">
      <div ref={containerRef} className="scene-canvas" />
      {!bundle && !webglError && (
        <div className="viewer-empty">
          <div className="viewer-orb"><Box size={34} /></div>
          <h3>等待生成三维场景</h3>
          <p>在左侧地图框选不超过 10 km² 的区域，然后启动生成任务。</p>
        </div>
      )}
      {building && (
        <div className="viewer-building">
          <span className="spinner" />
          <strong>正在构建网格与材质</strong>
        </div>
      )}
      {webglError && (
        <div className="viewer-empty viewer-webgl-error">
          <div className="viewer-orb"><Box size={34} /></div>
          <h3>WebGL 预览不可用</h3>
          <p>{webglError}</p>
        </div>
      )}
      <div className="viewer-toolbar">
        <button className={viewMode === "perspective" ? "active" : ""} onClick={() => setCameraMode("perspective")} title="透视视图"><Orbit size={17} /></button>
        <button className={viewMode === "top" ? "active" : ""} onClick={() => setCameraMode("top")} title="正射俯视"><Ruler size={17} /></button>
        <button onClick={() => fitScene()} title="适应窗口"><Maximize2 size={17} /></button>
        <button className={sunny ? "active" : ""} onClick={toggleSun} title="切换光照"><SunMedium size={17} /></button>
        <button onClick={() => onSelectFeature?.(null)} title="清除选择"><Crosshair size={17} /></button>
      </div>
      {bundle && (
        <div className="viewer-coordinates">
          <span>WGS 84</span>
          <strong>{bundle.selection.center[1].toFixed(5)}°, {bundle.selection.center[0].toFixed(5)}°</strong>
          <small>本地模型单位：米</small>
        </div>
      )}
      <div className="viewer-help">左键旋转 · 右键平移 · 滚轮缩放 · 双击查看要素</div>
    </div>
  );
});

export default SceneViewer;
