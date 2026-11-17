import * as THREE from "./three.module.js";
export const componentAnchors = {
  battery: [0, 0.96, 0],
  bms: [0.2, 1.18, -0.62],
  motor: [1.92, 0.9, 0.24],
  inverter: [1.9, 1.4, -0.18],
  charge: [-2.15, 1.08, 0],
  lowvoltage: [2.2, 1.15, -0.67],
  interlock: [-0.87, 1.12, 0.87],
};
export function createEVModel({ workshop = true } = {}) {
  const root = new THREE.Group();
  root.name = "EDU_EV_INTERACTIVE_MODEL";
  const vehicle = new THREE.Group();
  vehicle.name = "vehicle";
  vehicle.position.y = workshop ? 1 : 0;
  root.add(vehicle);
  const pickables = [],
    groups = {},
    bolts = [],
    modules = [],
    links = {},
    flow = [],
    wires = [];
  const materials = new Set(),
    geometries = new Set();
  const material = (
    color,
    metalness = 0.35,
    roughness = 0.5,
    extra = {},
  ) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      ...extra,
    });
    materials.add(m);
    return m;
  };
  const silver = material(0xaeb4b2, 0.65, 0.34),
    dark = material(0x343d3e, 0.4, 0.48),
    rubber = material(0x252c2b, 0.03, 0.95),
    orange = material(0xde8266, 0.35, 0.42),
    moduleMat = material(0x94a8a6, 0.45, 0.4),
    blue = material(0x728b92, 0.55, 0.36),
    pale = material(0xd7d9d0, 0.3, 0.5),
    ivory = material(0xe9e6dd, 0.15, 0.6);
  function mesh(parent, geo, mat, x = 0, y = 0, z = 0, data = null) {
    geometries.add(geo);
    const o = new THREE.Mesh(geo, mat);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    if (data) {
      o.userData = { ...data };
      o.name = data.target ?? data.component;
      pickables.push(o);
    }
    return o;
  }
  const box = (p, w, h, d, x, y, z, m = silver, data = null) =>
    mesh(p, new THREE.BoxGeometry(w, h, d), m, x, y, z, data);
  const cylinder = (
    p,
    r,
    h,
    x,
    y,
    z,
    m = silver,
    axis = "y",
    data = null,
    n = 28,
  ) => {
    const o = mesh(
      p,
      new THREE.CylinderGeometry(r, r, h, n),
      m,
      x,
      y,
      z,
      data,
    );
    if (axis === "z") o.rotation.x = Math.PI / 2;
    if (axis === "x") o.rotation.z = Math.PI / 2;
    return o;
  };
  function tube(p, points, r = 0.025, m = orange) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((a) => new THREE.Vector3(...a)),
    );
    const o = mesh(p, new THREE.TubeGeometry(curve, 28, r, 7, false), m);
    return { mesh: o, curve };
  }
  const tag = (id) => ({ kind: "component", component: id });
  for (const id of Object.keys(componentAnchors)) {
    groups[id] = new THREE.Group();
    groups[id].name = id;
    vehicle.add(groups[id]);
  }
  const frame = new THREE.Group();
  vehicle.add(frame);
  // Open chassis rails leave the battery and its mounting points visible.
  box(frame, 5.25, 0.17, 0.13, 0, 0.58, 0.94, dark);
  box(frame, 5.25, 0.17, 0.13, 0, 0.58, -0.94, dark);
  for (const x of [-2.38, -1.72, 1.73, 2.38])
    box(frame, 0.13, 0.14, 1.84, x, 0.58, 0, silver);
  for (const x of [-1.85, 1.85]) {
    cylinder(frame, 0.065, 2.1, x, 0.49, 0, silver, "z");
    for (const z of [-1.08, 1.08]) {
      cylinder(frame, 0.44, 0.25, x, 0.45, z, rubber, "z");
      cylinder(frame, 0.29, 0.258, x, 0.45, z, silver, "z");
      cylinder(frame, 0.23, 0.266, x, 0.45, z, dark, "z");
      cylinder(frame, 0.068, 0.285, x, 0.45, z, pale, "z");
      for (let k = 0; k < 7; k++) {
        const a = (k * Math.PI * 2) / 7;
        const o = box(
          frame,
          0.052,
          0.4,
          0.27,
          x + Math.sin(a) * 0.13,
          0.45 + Math.cos(a) * 0.13,
          z,
          silver,
        );
        o.rotation.z = -a;
      }
      cylinder(
        frame,
        0.225,
        0.022,
        x,
        0.45,
        z + (z > 0 ? -0.15 : 0.15),
        pale,
        "z",
      );
      box(
        frame,
        0.1,
        0.2,
        0.07,
        x + 0.17,
        0.45,
        z + (z > 0 ? -0.17 : 0.17),
        orange,
      );
      tube(
        frame,
        [
          [x - 0.26, 0.51, z * 0.78],
          [x, 0.84, z * 0.7],
          [x + 0.26, 0.51, z * 0.78],
        ],
        0.027,
        dark,
      );
      cylinder(frame, 0.055, 0.35, x, 0.88, z * 0.75, dark);
      for (let k = 0; k < 7; k++)
        cylinder(
          frame,
          0.071,
          0.012,
          x,
          0.75 + k * 0.035,
          z * 0.75,
          silver,
        );
    }
  }
  const pack = groups.battery;
  box(pack, 3.29, 0.14, 1.69, 0, 0.66, 0, silver, tag("battery"));
  box(pack, 3.14, 0.1, 1.55, 0, 0.76, 0, dark, tag("battery"));
  for (const z of [-0.78, 0.78])
    box(pack, 3.23, 0.16, 0.055, 0, 0.81, z, silver, tag("battery"));
  for (const x of [-1.59, 1.59])
    box(pack, 0.055, 0.16, 1.56, x, 0.81, 0, silver, tag("battery"));
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++) {
      const x = -1.18 + i * 0.785,
        z = -0.48 + j * 0.48;
      const m = material(0x94a8a6, 0.45, 0.4),
        block = box(
          pack,
          0.715,
          0.22,
          0.414,
          x,
          0.91,
          z,
          m,
          tag("battery"),
        );
      block.name = `module-${i * 3 + j + 1}`;
      modules.push(block);
      for (let k = 0; k < 5; k++)
        box(
          pack,
          0.012,
          0.229,
          0.4,
          x - 0.29 + k * 0.145,
          0.913,
          z,
          silver,
        );
      for (const dx of [-0.25, 0.25]) {
        box(pack, 0.065, 0.025, 0.043, x + dx, 1.034, z + 0.14, orange);
        cylinder(pack, 0.013, 0.03, x + dx, 1.048, z + 0.14, dark);
      }
    }
  const cover = new THREE.Group();
  cover.name = "battery-observation-cover";
  pack.add(cover);
  const transparent = material(0xc6ceca, 0.3, 0.32, {
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
  });
  box(cover, 3.25, 0.045, 1.6, 0, 1.08, 0, transparent);
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(3.25, 0.045, 1.6)),
    new THREE.LineBasicMaterial({
      color: 0x93a3a0,
      transparent: true,
      opacity: 0.28,
    }),
  );
  edge.position.y = 1.08;
  cover.add(edge);
  geometries.add(edge.geometry);
  materials.add(edge.material);
  const boltHomes = Array.from({ length: 8 }, (_, i) => [
    -1.43 + (i % 4) * 0.95,
    0.85,
    i < 4 ? 0.86 : -0.86,
  ]);
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group();
    g.position.set(...boltHomes[i]);
    g.name = `bolt-${i + 1}`;
    vehicle.add(g);
    cylinder(
      g,
      0.031,
      0.12,
      0,
      -0.055,
      0,
      dark,
      "y",
      { kind: "mechanical", component: "battery", target: g.name },
      16,
    );
    cylinder(
      g,
      0.066,
      0.045,
      0,
      0.018,
      0,
      silver,
      "y",
      { kind: "mechanical", component: "battery", target: g.name },
      6,
    );
    cylinder(
      g,
      0.029,
      0.048,
      0,
      0.022,
      0,
      dark,
      "y",
      { kind: "mechanical", component: "battery", target: g.name },
      6,
    );
    bolts.push(g);
  }
  const connectorHomes = {
    hv: [-1.68, 0.94, 0.48],
    lv: [-1.68, 0.92, -0.12],
    coolant: [-1.68, 0.88, -0.56],
  };
  for (const [id, xyz] of Object.entries(connectorHomes)) {
    const g = new THREE.Group();
    g.position.set(...xyz);
    g.name = id + "-link";
    pack.add(g);
    links[id] = g;
    const data = {
      kind: "mechanical",
      component: "battery",
      target: g.name,
    };
    box(
      g,
      0.22,
      0.13,
      0.16,
      0,
      0,
      0,
      id === "hv" ? orange : id === "lv" ? dark : blue,
      data,
    );
    box(g, 0.14, 0.055, 0.18, 0, 0.094, 0, pale, data);
    cylinder(g, 0.048, 0.065, -0.14, 0, 0, dark, "x", data);
  }
  const bms = groups.bms;
  box(
    bms,
    0.57,
    0.07,
    0.28,
    0.22,
    1.16,
    -0.63,
    material(0x4f7064, 0.1, 0.65),
    tag("bms"),
  );
  for (let i = 0; i < 5; i++)
    box(bms, 0.058, 0.04, 0.09, 0.02 + i * 0.1, 1.215, -0.63, dark);
  tube(
    bms,
    [
      [0.22, 1.2, -0.63],
      [0.68, 1.06, -0.74],
      [1.3, 1.02, -0.5],
    ],
    0.012,
    pale,
  );
  const motor = groups.motor;
  cylinder(motor, 0.28, 0.68, 1.93, 0.82, 0.12, blue, "z", tag("motor"));
  for (let k = 0; k < 9; k++)
    cylinder(
      motor,
      0.3,
      0.022,
      1.93,
      0.82,
      -0.2 + k * 0.08,
      silver,
      "z",
      tag("motor"),
    );
  box(motor, 0.43, 0.43, 0.38, 2.23, 0.76, 0.3, dark, tag("motor"));
  cylinder(motor, 0.05, 1.7, 1.94, 0.76, 0, silver, "z");
  for (const z of [-0.65, 0.65])
    cylinder(motor, 0.1, 0.14, 1.94, 0.76, z, rubber, "z");
  const inv = groups.inverter;
  box(inv, 0.77, 0.24, 0.6, 1.9, 1.27, -0.17, silver, tag("inverter"));
  box(inv, 0.71, 0.03, 0.56, 1.9, 1.405, -0.17, pale, tag("inverter"));
  for (let k = 0; k < 12; k++)
    box(inv, 0.02, 0.08, 0.5, 1.57 + k * 0.059, 1.448, -0.17, dark);
  box(inv, 0.13, 0.08, 0.12, 1.62, 1.28, 0.19, orange, tag("inverter"));
  box(inv, 0.13, 0.08, 0.12, 1.82, 1.28, 0.19, orange, tag("inverter"));
  const charge = groups.charge;
  box(charge, 0.56, 0.24, 0.91, -2.13, 0.85, 0, silver, tag("charge"));
  for (let k = 0; k < 8; k++)
    box(charge, 0.035, 0.04, 0.8, -2.36 + k * 0.064, 1, 0, dark);
  box(charge, 0.18, 0.07, 0.14, -2.2, 1.04, 0.22, orange, tag("charge"));
  box(charge, 0.18, 0.07, 0.14, -2.2, 1.04, -0.2, orange, tag("charge"));
  const aux = groups.lowvoltage;
  box(aux, 0.47, 0.3, 0.35, 2.2, 0.95, -0.67, dark, tag("lowvoltage"));
  box(aux, 0.46, 0.045, 0.34, 2.2, 1.12, -0.67, pale, tag("lowvoltage"));
  for (const x of [2.04, 2.35])
    cylinder(aux, 0.024, 0.04, x, 1.16, -0.67, x < 2.2 ? orange : dark);
  const inter = groups.interlock;
  box(inter, 0.27, 0.14, 0.2, -0.87, 1.03, 0.87, orange, tag("interlock"));
  box(inter, 0.13, 0.07, 0.16, -0.87, 1.14, 0.87, dark, tag("interlock"));
  const cablePaths = [
    [
      [-2.2, 1.02, 0.4],
      [-1.8, 1.08, 0.91],
      [-0.87, 1.09, 0.87],
      [0.5, 1.06, 0.9],
      [1.35, 1.12, 0.55],
      [1.62, 1.3, 0.23],
    ],
    [
      [1.85, 1.28, 0.23],
      [2.1, 1.08, 0.43],
      [2, 0.86, 0.42],
    ],
    [
      [-2.13, 0.98, -0.35],
      [-1.7, 1.1, -0.85],
      [0.8, 1.08, -0.85],
      [1.55, 1.29, -0.4],
    ],
  ];
  for (const pts of cablePaths) {
    const m = material(0xde8266, 0.3, 0.5);
    const w = tube(vehicle, pts, 0.03, m);
    wires.push(w);
    for (let k = 0; k < 3; k++) {
      const o = mesh(
        vehicle,
        new THREE.SphereGeometry(0.045, 9, 6),
        material(0xf0b69b, 0.2, 0.25),
      );
      flow.push({ o, curve: w.curve, offset: k / 3 });
    }
  }
  const body = new THREE.Group();
  body.name = "observation-body";
  vehicle.add(body);
  const shape = new THREE.Shape();
  shape.moveTo(-2.8, 0.72);
  shape.quadraticCurveTo(-2.75, 1.09, -2.38, 1.11);
  shape.lineTo(-1.55, 1.25);
  shape.quadraticCurveTo(-0.75, 2.04, -0.5, 2.05);
  shape.lineTo(0.72, 2.02);
  shape.quadraticCurveTo(1.02, 1.98, 1.57, 1.29);
  shape.lineTo(2.44, 1.11);
  shape.quadraticCurveTo(2.8, 1.08, 2.81, 0.77);
  shape.lineTo(2.65, 0.64);
  shape.lineTo(-2.65, 0.64);
  shape.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.82,
    steps: 1,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 2,
  });
  bodyGeo.translate(0, 0, -0.91);
  const bodyMat = material(0xb0b9b7, 0.35, 0.32, {
    transparent: true,
    opacity: 0.065,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  mesh(body, bodyGeo, bodyMat);
  const bodyEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(bodyGeo, 35),
    new THREE.LineBasicMaterial({
      color: 0x84928d,
      transparent: true,
      opacity: 0.28,
    }),
  );
  body.add(bodyEdge);
  geometries.add(bodyEdge.geometry);
  materials.add(bodyEdge.material);
  for (const z of [-0.92, 0.92]) {
    tube(
      body,
      [
        [-1.5, 1.26, z],
        [-0.6, 2.03, z],
        [0.68, 2.01, z],
        [1.58, 1.28, z],
      ],
      0.009,
      pale,
    );
    tube(
      body,
      [
        [0.15, 1.05, z],
        [0.15, 2.02, z],
      ],
      0.01,
      pale,
    );
    box(body, 0.26, 0.025, 0.012, -0.35, 1.27, z, pale);
  }
  let support = null;
  if (workshop) {
    const room = new THREE.Group();
    root.add(room);
    room.name = "teaching-workshop";
    box(room, 24, 0.08, 20, 0, -0.08, 0, material(0xe9e7df, 0.02, 0.85));
    const grid = new THREE.GridHelper(20, 40, 0xd0d1c8, 0xdeddd5);
    grid.position.y = -0.033;
    room.add(grid);
    materials.add(grid.material);
    geometries.add(grid.geometry);
    box(room, 16, 3.7, 0.12, 0, 1.8, -5.6, material(0xe2e1d8, 0.02, 0.85));
    box(room, 7, 0.015, 4.7, 0, 0.001, 0, material(0xe3e3d9, 0.1, 0.75));
    for (const z of [-2.1, 2.1]) {
      box(room, 0.38, 3.2, 0.38, -0.2, 1.56, z, ivory);
      box(room, 0.42, 0.09, 0.42, -0.2, 3.22, z, orange);
      box(room, 0.51, 0.08, 0.61, -0.2, 0.04, z, dark);
      box(
        room,
        0.22,
        1.7,
        0.05,
        -0.2,
        1.5,
        z + (z > 0 ? -0.22 : 0.22),
        dark,
      );
      for (const x of [-1.15, 1.15]) {
        box(room, 1.05, 0.13, 0.15, x * 0.5 - 0.2, 1.47, z * 0.83, silver);
        const arm = box(room, 0.14, 0.13, 0.68, x, 1.47, z * 0.58, dark);
        arm.rotation.y = x > 0 ? -0.35 : 0.35;
      }
    }
    const trolley = new THREE.Group();
    trolley.position.set(3.4, 0, -2.7);
    room.add(trolley);
    box(trolley, 0.9, 0.78, 0.53, 0, 0.52, 0, dark);
    box(trolley, 0.96, 0.07, 0.59, 0, 0.94, 0, silver);
    for (let k = 0; k < 4; k++) {
      box(trolley, 0.82, 0.11, 0.02, 0, 0.3 + k * 0.16, 0.277, ivory);
      box(trolley, 0.32, 0.018, 0.023, 0, 0.32 + k * 0.16, 0.294, dark);
    }
    for (const x of [-0.32, 0.32])
      for (const z of [-0.18, 0.18])
        cylinder(trolley, 0.07, 0.045, x, 0.075, z, rubber, "z");
    box(room, 1.24, 0.045, 0.72, 3.45, 0.62, 1.46, ivory);
    for (const x of [2.94, 3.96])
      for (const z of [1.22, 1.7])
        box(room, 0.035, 0.6, 0.035, x, 0.3, z, silver);
    const tray = box(room, 0.72, 0.04, 0.35, 3.37, 0.67, 1.46, dark);
    tray.name = "removed-parts-tray";
    box(
      room,
      2.6,
      1.1,
      0.07,
      2.8,
      1.95,
      -5.49,
      material(0x59635b, 0.1, 0.7),
    );
    for (let k = 0; k < 9; k++)
      box(room, 0.028, 0.28, 0.03, 1.72 + k * 0.25, 2.06, -5.44, silver);
    box(room, 2.4, 0.8, 0.07, -2.8, 2.1, -5.49, dark);
    box(
      room,
      2.19,
      0.58,
      0.02,
      -2.8,
      2.1,
      -5.43,
      material(0x849b92, 0.1, 0.5),
    );
    support = new THREE.Group();
    support.name = "battery-support-table";
    root.add(support);
    const supportData = {
      kind: "mechanical",
      component: "battery",
      target: "support-on",
    };
    box(support, 3.05, 0.09, 1.45, 0, 0.7, 0, dark, supportData);
    box(support, 2.7, 0.06, 1.2, 0, 0.1, 0, silver, supportData);
    for (const z of [-0.4, 0.4])
      for (const sign of [-1, 1]) {
        const arm = box(
          support,
          0.06,
          0.62,
          0.05,
          0,
          0.4,
          z,
          orange,
          supportData,
        );
        arm.rotation.z = sign * 0.96;
      }
    for (const x of [-1.1, 1.1])
      for (const z of [-0.5, 0.5])
        cylinder(support, 0.065, 0.04, x, 0.05, z, rubber, "z");
  }
  // Measurement terminals are actual pickable meshes, attached to the selected component.
  const terminals = new THREE.Group();
  vehicle.add(terminals);
  terminals.name = "measurement-terminals";
  const terminalNodes = {};
  for (const [id, x, color] of [
    ["pos", 0.13, 0xd86c58],
    ["neg", -0.13, 0x344145],
  ]) {
    terminalNodes[id] = cylinder(
      terminals,
      0.058,
      0.065,
      x,
      0,
      0,
      material(color, 0.2, 0.35),
      "y",
      { kind: "terminal", terminal: id },
      20,
    );
    const ring = mesh(
      terminals,
      new THREE.TorusGeometry(0.076, 0.008, 7, 28),
      material(color, 0.2, 0.4),
      x,
      0.042,
      0,
    );
    ring.rotation.x = Math.PI / 2;
  }
  const pointBeacon = mesh(
    terminals,
    new THREE.ConeGeometry(0.06, 0.13, 3),
    orange,
    0,
    0.22,
    0,
  );
  pointBeacon.rotation.z = Math.PI;
  const meter = new THREE.Group();
  meter.name = "3d-multimeter";
  root.add(meter);
  meter.position.set(3.1, 1.55, 2.05);
  meter.rotation.y = -0.35;
  meter.rotation.x = -0.2;
  box(meter, 0.46, 0.66, 0.12, 0, 0, 0, orange);
  box(
    meter,
    0.36,
    0.22,
    0.025,
    0,
    0.16,
    0.076,
    material(0xc5d1b5, 0.05, 0.8),
  );
  cylinder(meter, 0.105, 0.028, 0, -0.1, 0.082, dark, "z");
  for (const x of [-0.12, 0.12])
    cylinder(
      meter,
      0.032,
      0.03,
      x,
      -0.26,
      0.085,
      x > 0 ? orange : dark,
      "z",
    );
  const leadObjects = [];
  for (const [lead, color, side] of [
    ["red", 0xd66b55, 0.11],
    ["black", 0x364448, -0.11],
  ]) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(33 * 3), 3),
    );
    geometries.add(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color });
    materials.add(lineMaterial);
    const line = new THREE.Line(geometry, lineMaterial);
    line.frustumCulled = false;
    root.add(line);
    const tip = mesh(
      root,
      new THREE.CylinderGeometry(0.018, 0.014, 0.16, 8),
      material(color, 0.1, 0.5),
    );
    leadObjects.push({ lead, side, line, tip });
  }
  let latest = null,
    selected = "battery",
    expanded = false,
    thermal = false,
    viewShell = true,
    showMeter = false,
    currentPoint = null;
  function setPoint(point) {
    if (!point) {
      terminals.visible = false;
      return;
    }
    const anchor =
      componentAnchors[point.component] ?? componentAnchors.battery;
    terminals.position.set(anchor[0], anchor[1] + 0.08, anchor[2] + 0.18);
    terminals.userData.component = point.component;
    terminals.visible = true;
    terminals.userData.point = point.id;
    for (const node of Object.values(terminalNodes)) {
      node.userData.point = point.id;
      node.userData.component = point.component;
    }
  }
  function updateLeads(session, point) {
    for (const { lead, side, line, tip } of leadObjects) {
      line.visible = tip.visible = !!meter.visible;
      if (!meter.visible || !point) continue;
      const start = meter.localToWorld(
        new THREE.Vector3(side, -0.28, 0.09),
      );
      const connected =
        session?.probes?.point === point.id ? session.probes[lead] : null;
      const end = connected
        ? terminalNodes[connected].getWorldPosition(new THREE.Vector3())
        : new THREE.Vector3(2.5, 1.15, 1.65 + side);
      const mid = start.clone().lerp(end, 0.5);
      mid.y = Math.max(0.2, Math.min(start.y, end.y) - 0.6);
      mid.z += 0.28;
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end),
        array = line.geometry.attributes.position,
        p = new THREE.Vector3();
      for (let k = 0; k < 33; k++) {
        curve.getPoint(k / 32, p);
        array.setXYZ(k, p.x, p.y, p.z);
      }
      array.needsUpdate = true;
      tip.position.set(end.x, end.y + 0.08, end.z);
    }
  }
  function setState(session, opts = {}) {
    latest = session;
    selected = opts.selected ?? selected;
    expanded = opts.expanded ?? expanded;
    thermal = opts.thermal ?? thermal;
    viewShell = opts.shell ?? viewShell;
    showMeter = opts.measure ?? false;
    const point = session?.task.points.find((p) => p.id === opts.point);
    currentPoint = point ?? null;
    setPoint(showMeter ? point : null);
    meter.visible =
      showMeter && point && ["volt", "ohm"].includes(point.tool);
    if (session?.mechanics && support)
      support.traverse((o) => {
        if (o.userData.kind === "mechanical")
          o.userData.target = session.mechanics.support
            ? "support-off"
            : "support-on";
      });
  }
  for (const g of Object.values(groups))
    g.traverse((o) => {
      if (o.isMesh) {
        o.material = o.material.clone();
        o.userData.baseColor = o.material.color.getHex();
        materials.add(o.material);
      }
    });
  const targetPos = new THREE.Vector3();
  function tick(time = 0, instant = false) {
    const m = latest?.mechanics;
    const rate = instant ? 1 : 0.12;
    const packY = m?.lowered ? -0.85 : expanded && !m?.support ? 0.2 : 0;
    pack.position.y = THREE.MathUtils.lerp(pack.position.y, packY, rate);
    const separation = {
      bms: 1.05,
      motor: 0.7,
      inverter: 1.35,
      charge: 0.35,
      lowvoltage: 0.35,
      interlock: 0.4,
    };
    for (const [id, g] of Object.entries(groups)) {
      if (id === "battery") continue;
      let y = expanded ? (separation[id] ?? 0) : 0;
      if (id === "bms") y += pack.position.y;
      g.position.y = THREE.MathUtils.lerp(g.position.y, y, rate);
    }
    cover.position.y = THREE.MathUtils.lerp(
      cover.position.y,
      expanded ? 0.65 : 0,
      rate,
    );
    body.position.y = THREE.MathUtils.lerp(
      body.position.y,
      expanded ? 1.5 : 0,
      rate,
    );
    body.visible = viewShell;
    for (let i = 0; i < bolts.length; i++) {
      const mounted = m ? m.bolts[i] : true;
      targetPos.set(...boltHomes[i]);
      if (!mounted)
        targetPos.set(
          3.14 + (i % 4) * 0.15,
          -0.3,
          1.36 + Math.floor(i / 4) * 0.17,
        );
      bolts[i].position.lerp(targetPos, rate);
      bolts[i].rotation.y = THREE.MathUtils.lerp(
        bolts[i].rotation.y,
        mounted ? 0 : Math.PI * 5,
        rate,
      );
    }
    for (const [id, g] of Object.entries(links)) {
      const home = connectorHomes[id],
        closed = m ? m.links[id] : true;
      g.position.x = THREE.MathUtils.lerp(
        g.position.x,
        home[0] - (closed ? 0 : 0.23),
        rate,
      );
      g.rotation.z = THREE.MathUtils.lerp(
        g.rotation.z,
        closed ? 0 : -0.3,
        rate,
      );
    }
    if (support) {
      const on = m && (m.support || m.lowered);
      support.position.x = THREE.MathUtils.lerp(
        support.position.x,
        on ? 0 : -3.85,
        rate,
      );
      support.position.z = THREE.MathUtils.lerp(
        support.position.z,
        on ? 0 : 1.35,
        rate,
      );
    }
    const active = latest?.state.energized && latest?.state.verified;
    for (const { mesh: o } of wires)
      o.material.color.set(
        latest?.state.isolate && !latest.state.energized
          ? 0x8f9b91
          : 0xde8266,
      );
    for (const f of flow) {
      f.o.visible = !!active;
      f.o.position.copy(f.curve.getPoint((time * 0.12 + f.offset) % 1));
    }
    const normal = latest?.state.repaired && latest?.state.energized;
    const t = latest?.task.points.find((p) => p.id === "bmsTemp");
    modules.forEach((o, i) => {
      const temperature = thermal
        ? normal
          ? 26
          : t && i === 2
            ? Number(t.abnormal)
            : 26
        : null;
      o.material.color.set(
        temperature === null
          ? 0x94a8a6
          : temperature > 50
            ? 0xd88165
            : 0x82ada4,
      );
    });
    const motorTemp = latest?.task.points.find((p) => p.id === "motorTemp");
    groups.motor.traverse((o) => {
      if (o.isMesh)
        o.material.color.set(
          thermal && motorTemp
            ? normal
              ? 0x82ada4
              : 0xd88165
            : o.userData.baseColor,
        );
    });
    for (const [id, g] of Object.entries(groups))
      g.traverse((o) => {
        if (o.isMesh && o.material.emissive) {
          o.material.emissive.set(id === selected ? 0x17120c : 0x000000);
          o.material.emissiveIntensity = id === selected ? 0.38 : 0;
        }
      });
    if (currentPoint && showMeter) {
      const a =
        componentAnchors[currentPoint.component] ??
        componentAnchors.battery;
      terminals.position.y =
        a[1] + 0.08 + (groups[currentPoint.component]?.position.y ?? 0);
    }
    pointBeacon.position.y = 0.22 + Math.sin(time * 2) * 0.02;
    root.updateMatrixWorld(true);
    updateLeads(latest, currentPoint);
  }
  const anchor = (component) => {
    const p = new THREE.Vector3(
      ...(componentAnchors[component] ?? componentAnchors.battery),
    );
    const g = groups[component];
    if (g) p.y += g.position.y;
    return vehicle.localToWorld(p);
  };
  const targetAnchor = (target) => {
    const o = pickables.find((o) => o.userData.target === target);
    return o ? o.getWorldPosition(new THREE.Vector3()) : anchor("battery");
  };
  function dispose() {
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
  }
  setState(null);
  tick(0, true);
  return {
    root,
    vehicle,
    groups,
    bolts,
    modules,
    links,
    pickables,
    terminals,
    terminalNodes,
    meter,
    leads: leadObjects,
    flow,
    anchor,
    targetAnchor,
    setState,
    tick,
    dispose,
  };
}
