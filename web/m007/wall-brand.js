import * as THREE from 'three';

// Use the supplied vector artwork unchanged, rendered once at high resolution.
const LOGO_ASPECT = 99.395 / 23.229;
const LOGO_URL = new URL('./assets/branding/logo.svg', import.meta.url).href;

export class WallBranding {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 2048;
    this.canvas.height = Math.round(this.canvas.width / LOGO_ASPECT);
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.userData.shared = true;
    this.texture.userData.source = LOGO_URL;
    this.ink = new THREE.MeshStandardMaterial({
      map: this.texture, color: '#ffffff', transparent: true, depthWrite: false,
      roughness: .65, metalness: .08,
      emissive: '#ffffff', emissiveMap: this.texture, emissiveIntensity: .06
    });
    this.ink.name = 'uploaded-wall-logo';
    this.ink.userData.shared = true;
    this.board = new THREE.MeshStandardMaterial({color: '#171b1d', roughness: .72, metalness: .18});
    this.board.userData.shared = true;
  }

  async load(anisotropy = 4) {
    const image = document.createElement('img');
    image.width = this.canvas.width;
    image.height = this.canvas.height;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('墙面 Logo 加载失败，请刷新页面重试。'));
      image.src = LOGO_URL;
    });
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
    this.texture.anisotropy = Math.min(8, anisotropy);
    this.texture.needsUpdate = true;
  }

  sign(parent, x, y, z, width = 2.4, height = 1.2) {
    const group = new THREE.Group();
    group.name = 'wall-brand-sign';
    group.position.set(x, y, z);
    group.rotation.y = Math.PI / 2;
    const board = new THREE.Mesh(new THREE.BoxGeometry(width, height, .045), this.board);
    board.castShadow = true;
    board.receiveShadow = true;
    group.add(board);
    const logoWidth = Math.min(width * .82, height * .7 * LOGO_ASPECT);
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(logoWidth, logoWidth / LOGO_ASPECT), this.ink);
    logo.name = 'wall-brand-logo';
    logo.position.z = .024;
    group.add(logo);
    parent.add(group);
    return group;
  }
}
