import * as THREE from "./three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { components } from "./data.js";
import { createEVModel } from "./model.js";
import { mountFallback } from "./fallback.js";
export function mountScene(
  host,
  {
    onSelect = () => {},
    onInteract = () => {},
    hero = false,
    selected = "battery",
  } = {},
) {
  if (globalThis.__EV_NO_WEBGL__)
    return mountFallback(host, { onSelect, onInteract });
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return mountFallback(host, { onSelect, onInteract });
  }
  let disposed = false,
    frame = 0,
    session = null,
    currentUI = { selected },
    goal = null,
    interaction = "observe",
    clip = null;
  host.innerHTML = "";
  host.classList.remove("scene-fallback");
  host.dataset.source = "webgl";
  host.append(renderer.domElement);
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute(
    "aria-label",
    "三维实训场景：拖动旋转、滚轮缩放；选择工具后点击部件或测量端子。方向键旋转，正负键缩放。",
  );
  const world = new THREE.Scene();
  world.fog = new THREE.Fog(0xe9e7df, 15, 40);
  const camera = new THREE.PerspectiveCamera(hero ? 35 : 42, 1, 0.1, 60);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.minDistance = 2.4;
  controls.maxDistance = 17;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.minPolarAngle = 0.16;
  controls.enablePan = !hero;
  world.add(new THREE.HemisphereLight(0xfff8ec, 0x85928c, 2.3));
  const key = new THREE.DirectionalLight(0xfff5e3, 3.2);
  key.position.set(-3, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  Object.assign(key.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 0.2,
    far: 24,
  });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.025;
  world.add(key);
  const rim = new THREE.DirectionalLight(0xd6e3ed, 1.7);
  rim.position.set(4, 5, -6);
  world.add(rim);
  const model = createEVModel({ workshop: !hero });
  world.add(model.root);
  const bounds = new THREE.BoxHelper(
    model.groups[selected] ?? model.groups.battery,
    0xe07563,
  );
  bounds.material.transparent = true;
  bounds.material.opacity = 0.5;
  bounds.visible = !hero;
  world.add(bounds);
  const labels = document.createElement("div");
  labels.className = "scene-labels";
  host.append(labels);
  const labelIds = hero
    ? ["battery", "motor"]
    : ["battery", "bms", "motor", "charge"];
  for (const id of labelIds) {
    const el = document.createElement("button");
    el.className = "scene-pin";
    el.dataset.component = id;
    el.innerHTML = `<span></span>${components.find((c) => c.id === id).name}`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect(id);
    });
    labels.append(el);
  }
  const terminals = document.createElement("div");
  terminals.className = "terminal-labels";
  labels.append(terminals);
  for (const [id, label] of [
    ["pos", "＋"],
    ["neg", "−"],
  ]) {
    const b = document.createElement("button");
    b.className = "terminal-label " + id;
    b.dataset.terminal = id;
    b.setAttribute(
      "aria-label",
      `连接当前测点的${id === "pos" ? "正" : "负"}端子`,
    );
    b.textContent = label;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      onInteract({
        kind: "terminal",
        terminal: id,
        point: currentUI.point,
      });
    });
    terminals.append(b);
  }
  const tip = document.createElement("div");
  tip.className = "scene-tooltip";
  tip.hidden = true;
  host.append(tip);
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  let down = null;
  const setRay = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
  };
  const pick = (e) => {
    setRay(e);
    return raycaster
      .intersectObjects(model.pickables, false)
      .find((hit) => {
        if (!hit.object.visible) return false;
        let p = hit.object.parent;
        while (p) {
          if (!p.visible) return false;
          p = p.parent;
        }
        return !clip || hit.point.y <= clip.constant + 0.01;
      });
  };
  const onDown = (e) => {
    down = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6)
      return;
    down = null;
    const hit = pick(e);
    if (!hit) return;
    const data = { ...hit.object.userData };
    if (data.kind === "terminal") {
      onInteract(data);
      return;
    }
    if (
      data.kind === "component" &&
      data.component === "battery" &&
      interaction === "operate" &&
      session?.mechanics
    ) {
      const m = session.mechanics;
      if (m.phase === "removed") {
        onInteract({
          kind: "mechanical",
          target: m.inspected ? "pack-raise" : "inspect-pack",
        });
        return;
      }
      if (
        m.phase === "removing" &&
        m.support &&
        m.bolts.every((x) => !x) &&
        Object.values(m.links).every((x) => !x)
      ) {
        onInteract({ kind: "mechanical", target: "pack-lower" });
        return;
      }
    }
    if (
      data.kind === "mechanical" &&
      interaction === "operate" &&
      session?.mechanics
    ) {
      onInteract(data);
      return;
    }
    onSelect(data.component ?? "battery");
  };
  const onMove = (e) => {
    if (down && e.buttons) return;
    const hit = pick(e);
    if (!hit) {
      tip.hidden = true;
      renderer.domElement.style.cursor = "grab";
      return;
    }
    const d = hit.object.userData;
    renderer.domElement.style.cursor = "pointer";
    const component = components.find((c) => c.id === d.component);
    tip.textContent =
      d.kind === "terminal"
        ? d.terminal === "pos"
          ? "正端子 ＋"
          : "负端子 −"
        : d.target?.startsWith("bolt-")
          ? `固定螺栓 B${d.target.slice(5).padStart(2, "0")}`
          : d.target?.endsWith("-link")
            ? {
                hv: "高压连接器",
                lv: "低压采样连接器",
                coolant: "教学冷却接头",
              }[d.target.split("-")[0]]
            : d.target?.startsWith("support")
              ? "电池包支撑托架"
              : (component?.name ?? "教学对象");
    const r = host.getBoundingClientRect();
    tip.style.left =
      Math.min(e.clientX - r.left + 15, r.width - 160) + "px";
    tip.style.top = e.clientY - r.top - 35 + "px";
    tip.hidden = false;
  };
  const onLeave = () => {
    tip.hidden = true;
    down = null;
  };
  const onKey = (e) => {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "-",
        "=",
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    goal = null;
    const offset = camera.position.clone().sub(controls.target),
      sp = new THREE.Spherical().setFromVector3(offset);
    if (e.key === "ArrowLeft") sp.theta -= 0.1;
    if (e.key === "ArrowRight") sp.theta += 0.1;
    if (e.key === "ArrowUp") sp.phi = Math.max(0.2, sp.phi - 0.08);
    if (e.key === "ArrowDown")
      sp.phi = Math.min(Math.PI * 0.51, sp.phi + 0.08);
    if (["+", "="].includes(e.key))
      sp.radius = Math.max(2.4, sp.radius * 0.9);
    if (e.key === "-") sp.radius = Math.min(17, sp.radius * 1.1);
    camera.position
      .copy(controls.target)
      .add(new THREE.Vector3().setFromSpherical(sp));
    controls.update();
  };
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerleave", onLeave);
  renderer.domElement.addEventListener("keydown", onKey);
  controls.addEventListener("start", () => {
    goal = null;
  });
  function focus(id = "all", instant = false) {
    const lift = hero ? 0 : 1;
    const preset = {
      all: [
        [6.8, 5, 7.1],
        [0, 1 + lift * 0.45, 0],
      ],
      battery: [
        [3.4, 4.6 + lift, 4.6],
        [0, 0.86 + lift, 0],
      ],
      underbody: [
        [4.4, 0.78, 4.2],
        [0, 1.4, 0],
      ],
      drive: [
        [4.9, 3.1 + lift, 3.1],
        [1.85, 0.95 + lift, 0],
      ],
      motor: [
        [4.9, 3.1 + lift, 3.1],
        [1.85, 0.95 + lift, 0],
      ],
      inverter: [
        [4.9, 3.1 + lift, 3.1],
        [1.85, 1.1 + lift, 0],
      ],
      charge: [
        [-4, 3.1 + lift, 3.7],
        [-1.9, 0.95 + lift, 0],
      ],
      top: [
        [0.02, 8.2, 0.02],
        [0, 1.4, 0],
      ],
    };
    const [position, target] = preset[id] ?? preset.all;
    if (hero && id === "all") {
      position[0] = 6.1;
      position[1] = 4.8;
      position[2] = 6.3;
    }
    if (instant) {
      camera.position.set(...position);
      controls.target.set(...target);
      controls.update();
      goal = null;
    } else
      goal = {
        position: new THREE.Vector3(...position),
        target: new THREE.Vector3(...target),
      };
  }
  function sync(s, ui = {}) {
    session = s;
    currentUI = { ...currentUI, ...ui };
    interaction = ui.sceneMode ?? interaction;
    model.setState(s, {
      selected: currentUI.selected,
      point: currentUI.point,
      measure: ui.panel === "measure",
      expanded: ui.exploded,
      shell: ui.shell,
      thermal: ui.thermal,
    });
    if (model.groups[currentUI.selected])
      bounds.setFromObject(model.groups[currentUI.selected]);
    terminals.hidden =
      ui.panel !== "measure" ||
      !s?.task.points.some(
        (p) => p.id === ui.point && ["volt", "ohm"].includes(p.tool),
      );
    renderer.domElement.dataset.interaction = interaction;
  }
  const resize = () => {
    if (disposed) return;
    const r = host.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      renderer.setSize(r.width, r.height);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    }
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  focus("all", true);
  sync(null, { selected, shell: true });
  const reduced = globalThis.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const startAt = globalThis.performance?.now?.() ?? Date.now();
  function project(node, p) {
    p.project(camera);
    node.style.left = `${(p.x * 0.5 + 0.5) * 100}%`;
    node.style.top = `${(-p.y * 0.5 + 0.5) * 100}%`;
    node.style.visibility = p.z > 1 || p.z < -1 ? "hidden" : "visible";
  }
  function animate() {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    const t =
      ((globalThis.performance?.now?.() ?? Date.now()) - startAt) / 1000;
    if (goal) {
      camera.position.lerp(goal.position, reduced ? 1 : 0.085);
      controls.target.lerp(goal.target, reduced ? 1 : 0.085);
      if (camera.position.distanceTo(goal.position) < 0.006) goal = null;
    }
    controls.update();
    model.tick(reduced ? 0 : t, reduced);
    if (!hero && model.groups[currentUI.selected])
      bounds.setFromObject(model.groups[currentUI.selected]);
    for (const id of labelIds) {
      const node = labels.querySelector(`[data-component="${id}"]`);
      project(node, model.anchor(id));
      node.classList.toggle("selected", id === currentUI.selected);
    }
    for (const [id, node] of Object.entries(model.terminalNodes)) {
      const b = terminals.querySelector(`[data-terminal="${id}"]`);
      project(b, node.getWorldPosition(new THREE.Vector3()));
      b.classList.toggle(
        "connected",
        session?.probes?.point === currentUI.point &&
          Object.values(session?.probes ?? {}).includes(id),
      );
    }
    renderer.render(world, camera);
  }
  animate();
  return {
    sync,
    select: (id) => sync(session, { ...currentUI, selected: id }),
    focus,
    explode: (v) => sync(session, { ...currentUI, exploded: v }),
    shell: (v) => sync(session, { ...currentUI, shell: v }),
    thermal: (v) => sync(session, { ...currentUI, thermal: v }),
    cut: (value) => {
      clip =
        value === null
          ? null
          : new THREE.Plane(new THREE.Vector3(0, -1, 0), value);
      renderer.clippingPlanes = clip ? [clip] : [];
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      model.dispose();
      bounds.geometry.dispose();
      bounds.material.dispose();
      for (const [type, fn] of [
        ["pointerdown", onDown],
        ["pointerup", onUp],
        ["pointermove", onMove],
        ["pointerleave", onLeave],
        ["keydown", onKey],
      ])
        renderer.domElement.removeEventListener(type, fn);
      renderer.dispose();
      host.innerHTML = "";
    },
  };
}
