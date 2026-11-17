"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type PartDefinition = {
  id: string;
  code: string;
  name: string;
  group: string;
  description: string;
  position: [number, number, number];
  explode: [number, number, number];
  color: number;
};

const PARTS: PartDefinition[] = [
  {
    id: "feet",
    code: "RB-01",
    name: "足部稳定组件",
    group: "运动系统",
    description: "宽型复合足底与减震踝关节，为机器人提供稳定支撑。",
    position: [0, 0, 0],
    explode: [0, -1.8, 0.4],
    color: 0x242a32,
  },
  {
    id: "calves",
    code: "RB-02",
    name: "小腿驱动模组",
    group: "运动系统",
    description: "集成双轴伺服、电机编码器与碳纤维承力结构。",
    position: [0, 0, 0],
    explode: [0, -1.2, 0.8],
    color: 0xd9dde1,
  },
  {
    id: "thighs",
    code: "RB-03",
    name: "大腿执行组件",
    group: "运动系统",
    description: "高扭矩关节执行器负责步态输出和姿态调整。",
    position: [0, 0, 0],
    explode: [0, -0.5, 1.4],
    color: 0xe5e8ea,
  },
  {
    id: "pelvis",
    code: "RB-04",
    name: "骨盆核心框架",
    group: "承载系统",
    description: "连接双腿与躯干的主承力节点，内置惯性测量单元。",
    position: [0, 0, 0],
    explode: [0, 0.2, 1.8],
    color: 0x343a43,
  },
  {
    id: "torso",
    code: "RB-05",
    name: "躯干计算舱",
    group: "感知与计算",
    description: "容纳主控计算单元、冷却回路与全身通信总线。",
    position: [0, 0, 0],
    explode: [0, 0.9, 2.1],
    color: 0xe8eaeb,
  },
  {
    id: "left-arm",
    code: "RB-06L",
    name: "左臂作业模组",
    group: "作业系统",
    description: "六自由度轻量机械臂，支持末端力控与快速换装。",
    position: [0, 0, 0],
    explode: [-2.4, 0.5, 0.5],
    color: 0xd7dadd,
  },
  {
    id: "right-arm",
    code: "RB-06R",
    name: "右臂作业模组",
    group: "作业系统",
    description: "六自由度轻量机械臂，具备碰撞检测与柔顺控制。",
    position: [0, 0, 0],
    explode: [2.4, 0.5, 0.5],
    color: 0xd7dadd,
  },
  {
    id: "head",
    code: "RB-07",
    name: "头部感知阵列",
    group: "感知与计算",
    description: "融合双目相机、深度传感器、麦克风阵列与状态灯。",
    position: [0, 0, 0],
    explode: [0, 2.2, 0.8],
    color: 0xf0f2f3,
  },
  {
    id: "battery",
    code: "RB-08",
    name: "背部能源模块",
    group: "能源系统",
    description: "可快拆高密度电池包，配置热管理与安全隔离单元。",
    position: [0, 0, 0],
    explode: [0, 0.8, -2.4],
    color: 0xb9272e,
  },
];

const CAMERA_START = new THREE.Vector3(7.4, 4.8, 9.2);
const TARGET_START = new THREE.Vector3(0, 2.55, 0);

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function createMaterial(color: number, metalness = 0.62, roughness = 0.32) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function addBox(
  parent: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  color: number,
  radius = 0,
) {
  const geometry = radius > 0
    ? new THREE.CapsuleGeometry(radius, Math.max(0.01, size[1] - radius * 2), 5, 10)
    : new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, createMaterial(color));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCylinder(
  parent: THREE.Group,
  radius: number,
  height: number,
  position: [number, number, number],
  color: number,
  rotation: [number, number, number] = [0, 0, 0],
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 24),
    createMaterial(color),
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makePart(part: PartDefinition) {
  const group = new THREE.Group();
  group.name = part.id;
  group.userData.partId = part.id;
  const red = 0xb9272e;
  const graphite = 0x222831;
  const dark = 0x11151b;
  const steel = part.color;

  if (part.id === "feet") {
    [-0.55, 0.55].forEach((x) => {
      addBox(group, [0.74, 0.22, 1.18], [x, 0.17, 0.18], graphite);
      addBox(group, [0.58, 0.12, 0.64], [x, 0.34, 0.05], red);
      addCylinder(group, 0.22, 0.24, [x, 0.54, 0], dark, [0, 0, Math.PI / 2]);
    });
  }

  if (part.id === "calves") {
    [-0.55, 0.55].forEach((x) => {
      addBox(group, [0.48, 1.25, 0.5], [x, 1.15, 0], steel, 0.2);
      addBox(group, [0.18, 0.7, 0.58], [x, 1.14, -0.18], graphite);
      addCylinder(group, 0.27, 0.6, [x, 1.82, 0], dark, [0, 0, Math.PI / 2]);
      addCylinder(group, 0.11, 0.66, [x, 1.82, 0], red, [0, 0, Math.PI / 2]);
    });
  }

  if (part.id === "thighs") {
    [-0.55, 0.55].forEach((x) => {
      addBox(group, [0.55, 1.38, 0.62], [x, 2.55, 0], steel, 0.23);
      addBox(group, [0.64, 0.35, 0.7], [x, 2.52, 0.03], graphite);
      addCylinder(group, 0.3, 0.65, [x, 3.3, 0], dark, [0, 0, Math.PI / 2]);
      addCylinder(group, 0.11, 0.7, [x, 3.3, 0], red, [0, 0, Math.PI / 2]);
    });
  }

  if (part.id === "pelvis") {
    addBox(group, [1.75, 0.62, 0.8], [0, 3.72, 0], steel);
    addBox(group, [1.15, 0.42, 0.9], [0, 4.06, -0.02], graphite);
    addCylinder(group, 0.28, 0.7, [-0.75, 3.65, 0], dark, [0, 0, Math.PI / 2]);
    addCylinder(group, 0.28, 0.7, [0.75, 3.65, 0], dark, [0, 0, Math.PI / 2]);
    addBox(group, [0.5, 0.1, 0.9], [0, 4.25, 0], red);
  }

  if (part.id === "torso") {
    addBox(group, [2.15, 1.68, 1.05], [0, 5.1, 0], steel);
    addBox(group, [1.38, 1.0, 0.16], [0, 5.15, 0.57], graphite);
    addBox(group, [0.86, 0.46, 0.11], [0, 5.35, 0.67], dark);
    addBox(group, [0.55, 0.12, 0.08], [0, 5.62, 0.73], red);
    addCylinder(group, 0.18, 1.55, [0, 4.43, 0], dark, [0, 0, Math.PI / 2]);
    for (let i = -2; i <= 2; i += 1) {
      addBox(group, [0.12, 0.3, 0.08], [i * 0.24, 4.82, 0.68], 0x636a72);
    }
  }

  if (part.id === "left-arm" || part.id === "right-arm") {
    const side = part.id === "left-arm" ? -1 : 1;
    addCylinder(group, 0.33, 0.5, [side * 1.34, 5.66, 0], dark, [0, 0, Math.PI / 2]);
    addBox(group, [0.5, 1.18, 0.54], [side * 1.4, 4.94, 0], steel, 0.2);
    addCylinder(group, 0.25, 0.54, [side * 1.41, 4.26, 0], graphite, [0, 0, Math.PI / 2]);
    addBox(group, [0.42, 1.0, 0.48], [side * 1.42, 3.65, 0], steel, 0.18);
    addCylinder(group, 0.2, 0.48, [side * 1.42, 3.08, 0], dark, [0, 0, Math.PI / 2]);
    addBox(group, [0.5, 0.38, 0.7], [side * 1.42, 2.82, 0.12], graphite);
    addBox(group, [0.12, 0.36, 0.58], [side * 1.65, 4.95, 0], red);
  }

  if (part.id === "head") {
    addCylinder(group, 0.2, 0.38, [0, 6.13, 0], graphite);
    addBox(group, [1.05, 0.72, 0.78], [0, 6.62, 0.02], steel);
    addBox(group, [0.82, 0.28, 0.1], [0, 6.66, 0.45], dark);
    addBox(group, [0.46, 0.1, 0.06], [0, 6.66, 0.52], 0x5ed8ff);
    addCylinder(group, 0.08, 0.4, [-0.28, 7.06, 0], red);
    addCylinder(group, 0.08, 0.22, [0.3, 6.98, 0], graphite);
  }

  if (part.id === "battery") {
    addBox(group, [1.25, 1.5, 0.48], [0, 5.1, -0.78], steel);
    addBox(group, [0.9, 0.92, 0.12], [0, 5.12, -1.05], graphite);
    addBox(group, [0.56, 0.1, 0.08], [0, 5.5, -1.14], red);
    addBox(group, [0.36, 0.14, 0.08], [0, 4.76, -1.14], 0x5ed8ff);
  }

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.userData.partId = part.id;
      child.userData.baseColor = (child.material as THREE.MeshStandardMaterial).color.getHex();
    }
  });
  return group;
}

function createLabelSprite(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 440;
  canvas.height = 104;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Sprite();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(10, 14, 19, 0.92)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d6363d";
  ctx.lineWidth = 5;
  ctx.strokeRect(2.5, 2.5, canvas.width - 5, canvas.height - 5);
  ctx.font = "600 34px sans-serif";
  ctx.fillStyle = "#f5f7f8";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 28, 52);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
  sprite.scale.set(2.2, 0.52, 1);
  sprite.renderOrder = 20;
  return sprite;
}

type SceneProps = {
  progress: number;
  exploded: number;
  selectedId: string;
  labels: boolean;
  autoRotate: boolean;
  xray: boolean;
  cameraFollow: boolean;
  resetSignal: number;
  onSelect: (id: string) => void;
};

function RobotScene(props: SceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f14);
    scene.fog = new THREE.FogExp2(0x0b0f14, 0.034);

    const camera = new THREE.PerspectiveCamera(39, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.copy(CAMERA_START);

    const showFallback = () => {
      const fallback = document.createElement("div");
      fallback.className = "webgl-fallback";
      fallback.innerHTML = `
        <div class="fallback-scan"><i></i><i></i><i></i></div>
        <div class="fallback-robot" aria-hidden="true">
          <span class="fb-head"></span><span class="fb-neck"></span><span class="fb-torso"></span>
          <span class="fb-core"></span><span class="fb-arm fb-arm-left"></span><span class="fb-arm fb-arm-right"></span>
          <span class="fb-leg fb-leg-left"></span><span class="fb-leg fb-leg-right"></span>
          <span class="fb-foot fb-foot-left"></span><span class="fb-foot fb-foot-right"></span>
        </div>
        <div class="fallback-note"><b>3D</b><span>当前环境未启用图形加速<br>请在支持 WebGL 的浏览器中查看交互模型</span></div>
      `;
      mount.appendChild(fallback);
      return () => {
        if (fallback.parentElement === mount) mount.removeChild(fallback);
      };
    };

    const probe = document.createElement("canvas");
    const webgl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    if (!webgl) {
      return showFallback();
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      return showFallback();
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(TARGET_START);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 4.8;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.update();

    scene.add(new THREE.HemisphereLight(0xb8d9ff, 0x17191c, 1.55));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(6, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -3;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xd6363d, 3.2);
    rimLight.position.set(-7, 5, -6);
    scene.add(rimLight);
    const cyanLight = new THREE.PointLight(0x5ed8ff, 18, 11, 2);
    cyanLight.position.set(3, 4, 4);
    scene.add(cyanLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(9.2, 96),
      new THREE.MeshStandardMaterial({ color: 0x131922, roughness: 0.82, metalness: 0.1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(18, 36, 0x3d4855, 0x202934);
    grid.position.y = 0.012;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.55;
    scene.add(grid);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.1, 0.035, 12, 120),
      new THREE.MeshBasicMaterial({ color: 0xb9272e, transparent: true, opacity: 0.5 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.035;
    scene.add(ring);

    const robotRoot = new THREE.Group();
    robotRoot.rotation.y = -0.22;
    scene.add(robotRoot);
    const partGroups = new Map<string, THREE.Group>();
    const labelsMap = new Map<string, THREE.Sprite>();
    PARTS.forEach((part) => {
      const group = makePart(part);
      group.position.set(...part.position);
      robotRoot.add(group);
      partGroups.set(part.id, group);
      const label = createLabelSprite(`${part.code}  ${part.name}`);
      label.position.set(part.explode[0] * 0.64, 4 + part.explode[1] * 0.6, part.explode[2] * 0.5 + 0.9);
      label.visible = false;
      scene.add(label);
      labelsMap.set(part.id, label);
    });

    const selectionBox = new THREE.BoxHelper(undefined, 0xe33940);
    selectionBox.visible = false;
    scene.add(selectionBox);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...partGroups.values()], true);
      const hitId = hits[0]?.object.userData.partId as string | undefined;
      if (hitId) propsRef.current.onSelect(hitId);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    let resetSeen = propsRef.current.resetSignal;
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const live = propsRef.current;
      const perPart = 100 / PARTS.length;

      PARTS.forEach((part, index) => {
        const group = partGroups.get(part.id);
        if (!group) return;
        const partProgress = clamp((live.progress - index * perPart) / perPart);
        const eased = 1 - Math.pow(1 - partProgress, 3);
        const assemblyOffset = 1 - eased;
        const targetX = part.position[0] + part.explode[0] * (assemblyOffset * 1.28 + live.exploded);
        const targetY = part.position[1] + part.explode[1] * (assemblyOffset * 1.28 + live.exploded);
        const targetZ = part.position[2] + part.explode[2] * (assemblyOffset * 1.28 + live.exploded);
        group.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 1 - Math.pow(0.001, dt));

        const visible = partProgress > 0.012 || live.progress >= 99.9;
        group.visible = visible;
        group.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.transparent = live.xray;
          mat.opacity = live.xray ? (part.id === live.selectedId ? 0.88 : 0.24) : 1;
          mat.depthWrite = !live.xray;
          mat.emissive.setHex(part.id === live.selectedId ? 0x4a090b : 0x000000);
          mat.emissiveIntensity = part.id === live.selectedId ? 0.95 : 0;
        });

        const label = labelsMap.get(part.id);
        if (label) {
          label.visible = live.labels && visible;
          const source = new THREE.Vector3();
          group.getWorldPosition(source);
          source.y += part.id.includes("arm") ? 4.3 : part.id === "head" ? 6.8 : 3.7;
          label.position.lerp(source.add(new THREE.Vector3(part.explode[0] * 0.18, 0.35, 0.9)), 0.16);
        }
      });

      const selected = partGroups.get(live.selectedId);
      if (selected && selected.visible) {
        selectionBox.setFromObject(selected);
        selectionBox.visible = !live.xray;
      } else {
        selectionBox.visible = false;
      }

      if (live.autoRotate) robotRoot.rotation.y += dt * 0.24;
      if (live.cameraFollow && live.progress < 99.8) {
        const idx = Math.min(PARTS.length - 1, Math.max(0, Math.floor(live.progress / perPart)));
        const focus = partGroups.get(PARTS[idx].id);
        if (focus) {
          const world = new THREE.Vector3();
          focus.getWorldPosition(world);
          world.y = clamp(world.y + 3.6, 1.2, 6.2);
          controls.target.lerp(world, 0.035);
        }
      }

      if (live.resetSignal !== resetSeen) {
        resetSeen = live.resetSignal;
        camera.position.copy(CAMERA_START);
        controls.target.copy(TARGET_START);
        robotRoot.rotation.y = -0.22;
        controls.update();
      }

      ring.rotation.z += dt * 0.06;
      controls.update();
      renderer.render(scene, camera);
    });

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(mount);

    return () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="scene-mount" aria-label="三维机器人拆装场景" />;
}

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="button-icon" aria-hidden="true">{children}</span>;
}

export default function RobotAssembly() {
  const [progress, setProgress] = useState(100);
  const [exploded, setExploded] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState("torso");
  const [labels, setLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [xray, setXray] = useState(false);
  const [cameraFollow, setCameraFollow] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [partsOpen, setPartsOpen] = useState(false);

  const selectedPart = useMemo(
    () => PARTS.find((part) => part.id === selectedId) ?? PARTS[4],
    [selectedId],
  );
  const completedParts = Math.min(PARTS.length, Math.floor((progress / 100) * PARTS.length + 0.001));
  const activeIndex = Math.min(PARTS.length - 1, Math.floor((progress / 100) * PARTS.length));
  const activePart = PARTS[activeIndex];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + 0.22 * speed);
        if (next >= 100) setPlaying(false);
        return next;
      });
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const togglePlay = useCallback(() => {
    if (progress >= 99.9) {
      setExploded(0);
      setProgress(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  }, [progress]);

  const resetAssembly = useCallback(() => {
    setPlaying(false);
    setProgress(100);
    setExploded(0);
    setSelectedId("torso");
    setResetSignal((value) => value + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault();
        togglePlay();
      }
      if (event.key.toLowerCase() === "r") resetAssembly();
      if (event.key.toLowerCase() === "e") setExploded((value) => value > 0.5 ? 0 : 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resetAssembly, togglePlay]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark"><span>R</span></div>
          <div>
            <p>ROBOT ASSEMBLY LAB</p>
            <h1>具身机器人 · 交互式拆装训练</h1>
          </div>
        </div>
        <div className="top-status">
          <span className="status-dot" />
          <span>训练场景在线</span>
          <span className="status-divider" />
          <span>模型 R-01</span>
          <span className="status-divider" />
          <strong>{Math.round(progress)}%</strong>
        </div>
      </header>

      <section className="workspace">
        <aside className="control-panel">
          <section className="robot-intro">
            <div className="eyebrow"><span /> R-01 / HUMANOID</div>
            <h2>灵枢<br /><em>作业机器人</em></h2>
            <p>面向工业巡检与柔性作业的全尺寸双足机器人</p>
            <div className="spec-grid">
              <span><b>1.72 m</b>机身高度</span>
              <span><b>58 kg</b>整机质量</span>
              <span><b>42 DoF</b>自由度</span>
              <span><b>4.5 h</b>续航时间</span>
            </div>
          </section>

          <section className="panel-section">
            <div className="section-title"><span>01</span><h3>装配流程</h3><i /></div>
            <div className="action-row">
              <button className="primary-action" onClick={togglePlay}>
                <Icon>{playing ? "Ⅱ" : "▶"}</Icon>{playing ? "暂停装配" : progress >= 99.9 ? "重新演示" : "继续装配"}
              </button>
              <button className="secondary-action" onClick={resetAssembly}>复位</button>
            </div>
            <div className="range-heading">
              <span>{playing ? `正在安装 · ${activePart.name}` : progress >= 100 ? "装配已完成" : "装配已暂停"}</span>
              <b>{Math.round(progress)}%</b>
            </div>
            <input
              className="range-control"
              type="range"
              min="0"
              max="100"
              value={progress}
              aria-label="装配进度"
              style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
              onChange={(event) => { setPlaying(false); setProgress(Number(event.target.value)); }}
            />
            <div className="inline-setting">
              <span>播放速度</span>
              <div className="segmented">
                {[0.5, 1, 2].map((value) => (
                  <button key={value} className={speed === value ? "active" : ""} onClick={() => setSpeed(value)}>{value}×</button>
                ))}
              </div>
            </div>
            <label className="toggle-row">
              <span>镜头跟随装配部件</span>
              <input type="checkbox" checked={cameraFollow} onChange={(event) => setCameraFollow(event.target.checked)} />
              <i />
            </label>
          </section>

          <section className="panel-section">
            <div className="section-title"><span>02</span><h3>爆炸视图</h3><i /></div>
            <div className="range-heading"><span>拆解距离</span><b>{Math.round(exploded * 100)}%</b></div>
            <input
              className="range-control"
              type="range"
              min="0"
              max="100"
              value={exploded * 100}
              aria-label="拆解距离"
              style={{ "--range-progress": `${exploded * 100}%` } as React.CSSProperties}
              onChange={(event) => { setPlaying(false); setProgress(100); setExploded(Number(event.target.value) / 100); }}
            />
            <div className="action-row compact">
              <button className="secondary-action" onClick={() => { setProgress(100); setExploded(1); }}>全部拆解</button>
              <button className="secondary-action" onClick={() => setExploded(0)}>收拢模型</button>
            </div>
            <label className="toggle-row">
              <span>显示零件标签</span>
              <input type="checkbox" checked={labels} onChange={(event) => setLabels(event.target.checked)} />
              <i />
            </label>
          </section>

          <section className="panel-section view-section">
            <div className="section-title"><span>03</span><h3>视图与分析</h3><i /></div>
            <label className="toggle-row"><span>自动旋转</span><input type="checkbox" checked={autoRotate} onChange={(event) => setAutoRotate(event.target.checked)} /><i /></label>
            <label className="toggle-row"><span>透视结构</span><input type="checkbox" checked={xray} onChange={(event) => setXray(event.target.checked)} /><i /></label>
            <button className="wide-action" onClick={() => setResetSignal((value) => value + 1)}>⌖　恢复最佳视角</button>
          </section>
        </aside>

        <div className="stage">
          <RobotScene
            progress={progress}
            exploded={exploded}
            selectedId={selectedId}
            labels={labels}
            autoRotate={autoRotate}
            xray={xray}
            cameraFollow={cameraFollow}
            resetSignal={resetSignal}
            onSelect={setSelectedId}
          />

          <div className="assembly-banner">
            <div className="banner-index">{String(activeIndex + 1).padStart(2, "0")}</div>
            <div><span>{playing ? "ASSEMBLING / 正在装配" : "DIGITAL ASSEMBLY / 数字装配"}</span><b>{progress >= 100 ? "全机装配完成" : activePart.name}</b></div>
            <div className="banner-line"><i style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="view-hint">
            <span>◉ 左键选择</span><span>↻ 拖拽旋转</span><span>⌁ 滚轮缩放</span><span>SPACE 播放</span>
          </div>

          <aside className="part-card">
            <div className="part-card-head"><span>当前部件</span><b>{selectedPart.code}</b></div>
            <div className="part-visual"><div className="part-orbit"><span /></div></div>
            <p className="part-group">{selectedPart.group}</p>
            <h3>{selectedPart.name}</h3>
            <p className="part-description">{selectedPart.description}</p>
            <div className="part-meta"><span><b>状态</b>已校准</span><span><b>连接</b>CAN-FD</span></div>
            <button onClick={() => setPartsOpen(true)}>查看部件档案 <span>→</span></button>
          </aside>

          <button className="parts-dock" onClick={() => setPartsOpen(true)}><b>{completedParts}/{PARTS.length}</b><span>已装配部件</span><i>＋</i></button>
        </div>
      </section>

      <div className={`parts-drawer ${partsOpen ? "open" : ""}`} aria-hidden={!partsOpen}>
        <button className="drawer-backdrop" aria-label="关闭部件档案" onClick={() => setPartsOpen(false)} />
        <aside>
          <div className="drawer-head"><div><span>PART DOSSIERS</span><h2>部件装配档案</h2></div><button onClick={() => setPartsOpen(false)}>×</button></div>
          <p className="drawer-summary">选择任意部件，三维场景会同步定位并高亮。装配顺序按照承载、驱动、计算、作业与能源系统展开。</p>
          <div className="parts-list">
            {PARTS.map((part, index) => {
              const complete = progress >= ((index + 1) / PARTS.length) * 100 - 0.1;
              return (
                <button
                  key={part.id}
                  className={selectedId === part.id ? "selected" : ""}
                  onClick={() => { setSelectedId(part.id); setPartsOpen(false); }}
                >
                  <span className="part-number">{String(index + 1).padStart(2, "0")}</span>
                  <span><b>{part.name}</b><small>{part.code} · {part.group}</small></span>
                  <i className={complete ? "done" : ""}>{complete ? "✓" : "○"}</i>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
