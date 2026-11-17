import * as THREE from 'three';
import {HDRLoader} from './vendor/addons/loaders/HDRLoader.js';
import {RectAreaLightUniformsLib} from './vendor/addons/lights/RectAreaLightUniformsLib.js';
import {EffectComposer} from './vendor/addons/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/addons/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/addons/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/addons/postprocessing/OutputPass.js';
import {ShaderPass} from './vendor/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from './vendor/addons/shaders/FXAAShader.js';

export class RenderPipeline {
  constructor(world) {
    this.world=world; this.renderer=world.renderer; this.scene=world.scene;
    this.settings={quality:'balanced',lighting:'day',exposure:1.05,ao:true};
    this.headless=world.headless;
    this.hemi=new THREE.HemisphereLight('#d9e6f2','#50463a',.45);
    this.sun=new THREE.DirectionalLight('#fff2da',3.4);
    this.sun.position.set(-3.5,7.5,-6.5);this.sun.castShadow=true;
    this.sun.shadow.mapSize.set(2048,2048);
    Object.assign(this.sun.shadow.camera,{left:-10,right:10,top:9,bottom:-9,near:.5,far:35});
    this.sun.shadow.bias=-.00015;this.sun.shadow.normalBias=.018;
    this.sun.shadow.radius=3;
    this.fill=new THREE.DirectionalLight('#bacde3',.35);this.fill.position.set(8,5,3);
    this.scene.add(this.hemi,this.sun,this.fill);
    this.scene.background=new THREE.Color('#c7c9ca');
    this.scene.environmentIntensity=.7;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.05;
    if(this.headless)return;
    RectAreaLightUniformsLib.init();
    this.composer=new EffectComposer(this.renderer);
    this.renderPass=new RenderPass(this.scene,world.camera);
    this.aoPass=new SSAOPass(this.scene,world.camera,800,600,16);
    // Geometry is in metres: keep occlusion local to feet, furniture edges and
    // panel seams. Depth thresholds are normalized over the camera's far range.
    this.aoPass.kernelRadius=.38;this.aoPass.minDistance=.00005;this.aoPass.maxDistance=.009;
    this.output=new OutputPass();this.fxaa=new ShaderPass(FXAAShader);
    this.composer.addPass(this.renderPass);this.composer.addPass(this.aoPass);
    this.composer.addPass(this.output);this.composer.addPass(this.fxaa);
    this.apply();
  }
  async load() {
    if(this.headless)return;
    const hdr=await new HDRLoader().loadAsync('./assets/environment/studio_small_09_1k.hdr');
    const generator=new THREE.PMREMGenerator(this.renderer);
    this.environmentTarget=generator.fromEquirectangular(hdr);
    this.scene.environment=this.environmentTarget.texture;
    hdr.dispose();generator.dispose();
  }
  configure(change={}) {
    const s=this.settings;
    if(['balanced','high','performance'].includes(change.quality))s.quality=change.quality;
    if(['day','warm','night'].includes(change.lighting))s.lighting=change.lighting;
    if(Number.isFinite(change.exposure))s.exposure=THREE.MathUtils.clamp(change.exposure,.65,1.65);
    if(typeof change.ao==='boolean')s.ao=change.ao;
    this.apply();return {...s};
  }
  sceneChanged(id) {this.sceneId=id;this.apply();}
  apply() {
    const s=this.settings,night=s.lighting==='night',warm=s.lighting==='warm';
    const restaurant=this.sceneId==='restaurant';
    this.sun.color.set(warm?'#ffc283':night?'#9bb9ef':'#fff2dc');
    this.sun.intensity=night?.32:warm?2.3:2.9;
    this.hemi.intensity=night?.22:.43;this.fill.intensity=night?.18:.35;
    this.scene.environmentIntensity=night?.38:.72;
    this.scene.background.set(night?'#202834':warm?'#b8b0a4':'#c7c9ca');
    this.renderer.toneMappingExposure=s.exposure;
    this.scene.traverse(o=>{if(o.userData.fixture){o.color.set(restaurant||warm?'#ffd09b':'#e7edff');o.intensity=night?6:restaurant?3.5:2.2;}});
    if(this.headless)return;
    const high=s.quality==='high',fast=s.quality==='performance';
    const ratio=Math.min(window.devicePixelRatio||1,high?2:fast?1:1.5);
    this.renderer.setPixelRatio(ratio);this.composer.setPixelRatio(ratio);
    const size=high?4096:fast?1024:2048;
    if(this.sun.shadow.mapSize.x!==size){this.sun.shadow.mapSize.set(size,size);this.sun.shadow.map?.dispose();this.sun.shadow.map=null;}
    // SSAOPass multiplies its occlusion into the existing beauty buffer.
    // It never replaces the initial RenderPass.
    this.renderPass.enabled=true;this.aoPass.enabled=!fast&&s.ao;
    if(this.width)this.resize(this.width,this.height);
  }
  resize(w,h) {
    this.width=w;this.height=h;if(this.headless)return;
    this.composer.setSize(w,h);
    const ratio=this.renderer.getPixelRatio();
    this.fxaa.uniforms.resolution.value.set(1/(w*ratio),1/(h*ratio));
  }
  render() {if(this.headless)this.renderer.render(this.scene,this.world.camera);else this.composer.render();}
}
