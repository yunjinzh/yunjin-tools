"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type {
  InteractionMode,
  LoadedModel,
  Measurement,
  SelectionInfo,
  StandardView,
  ViewerSettings,
} from "../lib/model-types";

export interface ModelViewportHandle {
  fit: () => void;
  setView: (view: StandardView) => void;
  focusObject: (object: THREE.Object3D) => void;
  selectObject: (object: THREE.Object3D | null) => void;
  hideSelected: () => void;
  isolateSelected: () => void;
  showAll: () => void;
  rotateModel: (axis: "x" | "y" | "z") => void;
  clearMeasurements: () => void;
  screenshot: () => Promise<Blob>;
}

interface Props {
  model: LoadedModel | null;
  settings: ViewerSettings;
  interactionMode: InteractionMode;
  onSelect: (selection: SelectionInfo | null) => void;
  onMeasure: (measurement: Measurement) => void;
}

interface Runtime {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  perspective: THREE.PerspectiveCamera;
  orthographic: THREE.OrthographicCamera;
  activeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  controls: OrbitControls;
  modelLayer: THREE.Group;
  helperLayer: THREE.Group;
  grid: THREE.GridHelper;
  axes: THREE.AxesHelper;
  sun: THREE.DirectionalLight;
  animationFrame: number;
  resizeObserver: ResizeObserver;
}

const VIEW_DIRECTIONS: Record<StandardView, THREE.Vector3> = {
  iso: new THREE.Vector3(1, 0.78, 1),
  top: new THREE.Vector3(0, 1, 0),
  front: new THREE.Vector3(0, 0, 1),
  back: new THREE.Vector3(0, 0, -1),
  right: new THREE.Vector3(1, 0, 0),
  left: new THREE.Vector3(-1, 0, 0),
};

function renderableMaterials(object: THREE.Object3D) {
  const mesh = object as THREE.Mesh;
  if (!mesh.material) return [];
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function disposeHelper(object: THREE.Object3D) {
  object.traverse((child) => {
    const renderable = child as THREE.Mesh;
    renderable.geometry?.dispose();
    for (const material of renderableMaterials(child)) material.dispose();
  });
}

const ModelViewport = forwardRef<ModelViewportHandle, Props>(function ModelViewport(
  { model, settings, interactionMode, onSelect, onMeasure },
  ref,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const modelRef = useRef<LoadedModel | null>(model);
  const selectedRef = useRef<THREE.Object3D | null>(null);
  const selectionHelperRef = useRef<THREE.BoxHelper | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const boundsRef = useRef(new THREE.Box3());
  const measureStartRef = useRef<THREE.Vector3 | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const settingsRef = useRef(settings);
  const modeRef = useRef(interactionMode);
  const onSelectRef = useRef(onSelect);
  const onMeasureRef = useRef(onMeasure);
  const [webglError, setWebglError] = useState("");
  const [measureHint, setMeasureHint] = useState("");

  useEffect(() => { modelRef.current = model; }, [model]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { modeRef.current = interactionMode; }, [interactionMode]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onMeasureRef.current = onMeasure; }, [onMeasure]);

  function modelBox(object: THREE.Object3D | null = modelRef.current?.root || null) {
    return object ? new THREE.Box3().setFromObject(object) : new THREE.Box3();
  }

  function fitBox(box: THREE.Box3, view: StandardView = "iso") {
    const runtime = runtimeRef.current;
    if (!runtime || box.isEmpty()) return;
    const host = hostRef.current;
    const width = Math.max(1, host?.clientWidth || 1);
    const height = Math.max(1, host?.clientHeight || 1);
    const aspect = width / height;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const direction = VIEW_DIRECTIONS[view].clone().normalize();
    const radius = Math.max(size.x, size.y, size.z, 0.01) * 0.62;
    const perspectiveDistance = radius / Math.tan(THREE.MathUtils.degToRad(runtime.perspective.fov * 0.5)) * 1.55;

    runtime.perspective.position.copy(center).add(direction.clone().multiplyScalar(perspectiveDistance));
    runtime.perspective.near = Math.max(0.001, perspectiveDistance / 5000);
    runtime.perspective.far = Math.max(10_000, perspectiveDistance * 100);
    runtime.perspective.up.set(0, 1, 0);
    if (view === "top") runtime.perspective.up.set(0, 0, -1);
    runtime.perspective.updateProjectionMatrix();

    const orthographicRadius = Math.max(radius * 1.45, 0.01);
    runtime.orthographic.left = -orthographicRadius * aspect;
    runtime.orthographic.right = orthographicRadius * aspect;
    runtime.orthographic.top = orthographicRadius;
    runtime.orthographic.bottom = -orthographicRadius;
    runtime.orthographic.near = -Math.max(10_000, perspectiveDistance * 100);
    runtime.orthographic.far = Math.max(10_000, perspectiveDistance * 100);
    runtime.orthographic.position.copy(center).add(direction.clone().multiplyScalar(perspectiveDistance));
    runtime.orthographic.up.set(0, 1, 0);
    if (view === "top") runtime.orthographic.up.set(0, 0, -1);
    runtime.orthographic.updateProjectionMatrix();

    runtime.controls.target.copy(center);
    runtime.activeCamera.lookAt(center);
    runtime.controls.update();
  }

  function setSelected(object: THREE.Object3D | null, point?: THREE.Vector3) {
    const runtime = runtimeRef.current;
    selectedRef.current = object;
    if (selectionHelperRef.current && runtime) {
      runtime.helperLayer.remove(selectionHelperRef.current);
      selectionHelperRef.current.geometry.dispose();
      selectionHelperRef.current.material.dispose();
      selectionHelperRef.current = null;
    }
    if (object) {
      if (runtime) {
        const helper = new THREE.BoxHelper(object, 0xe07563);
        helper.material.depthTest = false;
        helper.renderOrder = 999;
        runtime.helperLayer.add(helper);
        selectionHelperRef.current = helper;
      }
      onSelectRef.current({ object, point });
    } else {
      onSelectRef.current(null);
    }
  }

  function measurementPointRadius() {
    const size = boundsRef.current.getSize(new THREE.Vector3());
    return Math.max(size.x, size.y, size.z, 1) / 240;
  }

  function addMeasurementPoint(point: THREE.Vector3) {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xe07563, depthTest: false });
    const marker = new THREE.Mesh(new THREE.SphereGeometry(measurementPointRadius(), 14, 10), pointMaterial);
    marker.position.copy(point);
    marker.renderOrder = 1000;
    marker.userData.measurement = true;
    runtime.helperLayer.add(marker);

    if (!measureStartRef.current) {
      measureStartRef.current = point.clone();
      setMeasureHint("已设置起点，请点击终点");
      return;
    }

    const start = measureStartRef.current.clone();
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, point]);
    const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xe07563, depthTest: false }));
    line.renderOrder = 1000;
    line.userData.measurement = true;
    runtime.helperLayer.add(line);
    const measurement: Measurement = {
      id: crypto.randomUUID(),
      distance: start.distanceTo(point),
      start: [start.x, start.y, start.z],
      end: [point.x, point.y, point.z],
    };
    measureStartRef.current = null;
    setMeasureHint("测量完成，可继续点击新的起点");
    onMeasureRef.current(measurement);
  }

  function clearMeasurements() {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const helpers = runtime.helperLayer.children.filter((child) => child.userData.measurement);
    for (const helper of helpers) {
      runtime.helperLayer.remove(helper);
      disposeHelper(helper);
    }
    measureStartRef.current = null;
    setMeasureHint("");
  }

  function showAll() {
    modelRef.current?.root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      object.visible = mesh.isMesh ? mesh.userData.__originalVisible !== false : true;
    });
  }

  useImperativeHandle(ref, () => ({
    fit: () => fitBox(modelBox(), "iso"),
    setView: (view) => fitBox(modelBox(), view),
    focusObject: (object) => {
      setSelected(object);
      fitBox(modelBox(object), "iso");
    },
    selectObject: setSelected,
    hideSelected: () => {
      if (!selectedRef.current) return;
      selectedRef.current.visible = false;
      setSelected(null);
    },
    isolateSelected: () => {
      const selected = selectedRef.current;
      if (!selected || !modelRef.current) return;
      modelRef.current.root.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) mesh.visible = false;
      });
      selected.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) mesh.visible = true;
      });
      let parent = selected.parent;
      while (parent) {
        parent.visible = true;
        parent = parent.parent;
      }
    },
    showAll,
    rotateModel: (axis) => {
      const loaded = modelRef.current;
      if (!loaded) return;
      const angle = Math.PI / 2;
      if (axis === "x") loaded.root.rotateX(angle);
      if (axis === "y") loaded.root.rotateY(angle);
      if (axis === "z") loaded.root.rotateZ(angle);
      loaded.root.updateMatrixWorld(true);
      const box = modelBox();
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        loaded.root.position.x -= center.x;
        loaded.root.position.y -= box.min.y;
        loaded.root.position.z -= center.z;
        loaded.root.updateMatrixWorld(true);
        boundsRef.current.copy(modelBox());
      }
      fitBox(boundsRef.current, "iso");
    },
    clearMeasurements,
    screenshot: () => new Promise<Blob>((resolve, reject) => {
      const runtime = runtimeRef.current;
      if (!runtime) return reject(new Error("三维视图尚未初始化"));
      runtime.renderer.render(runtime.scene, runtime.activeCamera);
      runtime.renderer.domElement.toBlob((blob) => blob ? resolve(blob) : reject(new Error("截图生成失败")), "image/png");
    }),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host || runtimeRef.current) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    } catch (error) {
      setWebglError(error instanceof Error ? error.message : "当前浏览器无法创建 WebGL 场景");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    renderer.domElement.className = "model-canvas";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settingsRef.current.background);
    const perspective = new THREE.PerspectiveCamera(42, 1, 0.01, 100000);
    perspective.position.set(8, 6, 8);
    const orthographic = new THREE.OrthographicCamera(-5, 5, 5, -5, -10000, 10000);
    orthographic.position.set(8, 6, 8);
    const activeCamera = settingsRef.current.projection === "orthographic" ? orthographic : perspective;
    const controls = new OrbitControls(activeCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.screenSpacePanning = true;
    controls.zoomToCursor = true;

    const modelLayer = new THREE.Group();
    modelLayer.name = "Model Layer";
    const helperLayer = new THREE.Group();
    helperLayer.name = "Helper Layer";
    scene.add(modelLayer, helperLayer);

    const grid = new THREE.GridHelper(20, 20, 0x89918d, 0xc4c7c2);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.52;
    scene.add(grid);
    const axes = new THREE.AxesHelper(2.6);
    scene.add(axes);

    const hemisphere = new THREE.HemisphereLight(0xf5f0e8, 0x5c625f, 2.5);
    const sun = new THREE.DirectionalLight(0xfff5df, 3.8);
    sun.position.set(7, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 2000;
    const fill = new THREE.DirectionalLight(0xbfd4e1, 1.15);
    fill.position.set(-7, 5, -8);
    scene.add(hemisphere, sun, fill);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const aspect = width / height;
      renderer.setSize(width, height, false);
      perspective.aspect = aspect;
      perspective.updateProjectionMatrix();
      const halfHeight = Math.max(0.001, (orthographic.top - orthographic.bottom) / 2);
      orthographic.left = -halfHeight * aspect;
      orthographic.right = halfHeight * aspect;
      orthographic.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const handlePointerDown = (event: PointerEvent) => {
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, runtimeRef.current?.activeCamera || activeCamera);
      const hits = raycaster.intersectObjects(modelLayer.children, true).filter((hit) => (hit.object as THREE.Mesh).isMesh && hit.object.visible);
      const hit = hits[0];
      if (!hit) {
        if (modeRef.current !== "measure") setSelected(null);
        return;
      }
      if (modeRef.current === "measure") addMeasurementPoint(hit.point);
      else setSelected(hit.object, hit.point);
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const runtime: Runtime = {
      scene,
      renderer,
      perspective,
      orthographic,
      activeCamera,
      controls,
      modelLayer,
      helperLayer,
      grid,
      axes,
      sun,
      animationFrame: 0,
      resizeObserver,
    };
    runtimeRef.current = runtime;
    const clock = new THREE.Clock();
    const animate = () => {
      runtime.animationFrame = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      if (settingsRef.current.animationPlaying) mixerRef.current?.update(delta);
      selectionHelperRef.current?.update();
      controls.update();
      renderer.render(scene, runtime.activeCamera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(runtime.animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      clearMeasurements();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      runtimeRef.current = null;
    };
  // Initialize the WebGL runtime once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.modelLayer.clear();
    setSelected(null);
    clearMeasurements();
    mixerRef.current?.stopAllAction();
    mixerRef.current = null;
    if (!model) {
      boundsRef.current.makeEmpty();
      return;
    }
    runtime.modelLayer.add(model.root);
    model.root.updateMatrixWorld(true);
    boundsRef.current.copy(modelBox(model.root));
    const modelSize = boundsRef.current.getSize(new THREE.Vector3());
    const visualScale = Math.max(modelSize.x, modelSize.y, modelSize.z, 0.01);
    runtime.grid.scale.setScalar(Math.max(visualScale / 14, 0.005));
    runtime.axes.scale.setScalar(Math.max(visualScale / 5, 0.005));
    runtime.sun.shadow.camera.left = -visualScale;
    runtime.sun.shadow.camera.right = visualScale;
    runtime.sun.shadow.camera.top = visualScale;
    runtime.sun.shadow.camera.bottom = -visualScale;
    runtime.sun.shadow.camera.far = Math.max(visualScale * 8, 100);
    runtime.sun.shadow.camera.updateProjectionMatrix();
    if (model.animations.length) {
      const mixer = new THREE.AnimationMixer(model.sourceRoot);
      model.animations.forEach((clip) => mixer.clipAction(clip).play());
      mixerRef.current = mixer;
    }
    window.requestAnimationFrame(() => fitBox(boundsRef.current, "iso"));
  }, [model]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.scene.background = new THREE.Color(settings.background);
    runtime.grid.visible = settings.grid;
    runtime.axes.visible = settings.axes;
    runtime.sun.castShadow = settings.shadows;
    runtime.renderer.shadowMap.enabled = settings.shadows;

    const nextCamera = settings.projection === "orthographic" ? runtime.orthographic : runtime.perspective;
    if (runtime.activeCamera !== nextCamera) {
      const previousPosition = runtime.activeCamera.position.clone();
      nextCamera.position.copy(previousPosition);
      nextCamera.quaternion.copy(runtime.activeCamera.quaternion);
      runtime.activeCamera = nextCamera;
      runtime.controls.object = nextCamera;
      runtime.controls.update();
    }

    const bounds = boundsRef.current;
    if (settings.sectionEnabled && !bounds.isEmpty()) {
      const min = bounds.min.y;
      const max = bounds.max.y;
      const level = min + (max - min) * (settings.sectionPercent / 100);
      runtime.renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), level)];
    } else {
      runtime.renderer.clippingPlanes = [];
    }

    modelRef.current?.root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = settings.shadows;
      mesh.receiveShadow = settings.shadows;
      for (const material of renderableMaterials(mesh)) {
        const displayMaterial = material as THREE.MeshStandardMaterial;
        if (displayMaterial.userData.__gmOpacity == null) {
          displayMaterial.userData.__gmOpacity = displayMaterial.opacity;
          displayMaterial.userData.__gmTransparent = displayMaterial.transparent;
          displayMaterial.userData.__gmDepthWrite = displayMaterial.depthWrite;
          displayMaterial.userData.__gmWireframe = "wireframe" in displayMaterial ? displayMaterial.wireframe : false;
        }
        if ("wireframe" in displayMaterial) {
          displayMaterial.wireframe = settings.wireframe || Boolean(displayMaterial.userData.__gmWireframe);
        }
        displayMaterial.opacity = Number(displayMaterial.userData.__gmOpacity) * settings.opacity;
        displayMaterial.transparent = Boolean(displayMaterial.userData.__gmTransparent) || settings.opacity < 0.999;
        displayMaterial.depthWrite = Boolean(displayMaterial.userData.__gmDepthWrite) && settings.opacity >= 0.999;
        displayMaterial.needsUpdate = true;
      }
    });
  }, [model, settings]);

  useEffect(() => {
    if (interactionMode !== "measure") {
      measureStartRef.current = null;
      setMeasureHint("");
    } else {
      setMeasureHint("点击模型设置测量起点");
    }
  }, [interactionMode]);

  return (
    <div ref={hostRef} className={`viewport-host mode-${interactionMode}`}>
      {!model && !webglError && (
        <div className="viewport-empty" aria-hidden="true">
          <div className="empty-geometry"><span /><i /><b /></div>
          <strong>等待模型</strong>
          <small>拖入文件或点击“打开模型”</small>
        </div>
      )}
      {webglError && (
        <div className="viewport-error">
          <strong>WebGL 不可用</strong>
          <p>请使用已开启硬件加速的新版 Chrome、Edge 或 Firefox。</p>
          <small>{webglError}</small>
        </div>
      )}
      {interactionMode === "measure" && model && <div className="measure-hint">{measureHint || "点击模型开始测量"}</div>}
      <div className="axis-labels" aria-hidden="true"><span className="axis-x">X</span><span className="axis-y">Y</span><span className="axis-z">Z</span></div>
    </div>
  );
});

export default ModelViewport;
