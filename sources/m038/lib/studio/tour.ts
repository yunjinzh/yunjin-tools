import * as THREE from 'three';

export type Vector3Tuple = [number, number, number];
export type AnnotationInfo = {
  id: string;
  meshId: string;
  partName: string;
  anchor: Vector3Tuple;
  text: string;
  color: string;
  visible: boolean;
  offset: [number, number];
};
export type SceneView = {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
  zoom: number;
  explosion: number;
  background: string;
  exposure: number;
  grid: boolean;
  annotations: AnnotationInfo[];
  parts?: {id:string;visible:boolean;opacity:number}[];
};
export type TourKeyframe = {
  id: string;
  name: string;
  hold: number;
  transition: number;
  thumbnail: string;
  view: SceneView;
};
export type TourPlayback = {
  status: 'stopped' | 'playing' | 'paused';
  time: number;
  duration: number;
  frameIndex: number;
};
export const MAX_KEYFRAMES = 30;
export const MAX_TOUR_SECONDS = 180;
export const EMPTY_PLAYBACK: TourPlayback = {status:'stopped', time:0, duration:0, frameIndex:0};

export function cloneAnnotations(items: AnnotationInfo[]): AnnotationInfo[] {
  return items.map(item => ({...item, anchor:[...item.anchor], offset:[...item.offset]}));
}
export function cloneView(view: SceneView): SceneView {
  return {...view, position:[...view.position], target:[...view.target], annotations:cloneAnnotations(view.annotations),parts:view.parts?.map(p=>({...p}))};
}
export function tourDuration(frames: TourKeyframe[]): number {
  return frames.reduce((sum, frame, i) => sum + frame.hold + (i < frames.length-1 ? frame.transition : 0), 0);
}
export function frameTime(frames: TourKeyframe[], index: number): number {
  return frames.slice(0, index).reduce((sum, frame) => sum+frame.hold+frame.transition, 0);
}
export function sampleTour(frames: TourKeyframe[], seconds: number) {
  if (!frames.length) throw new Error('请先添加关键帧。');
  let time = Math.max(0, seconds);
  for (let i=0; i<frames.length; i++) {
    const frame = frames[i];
    if (time <= frame.hold || i === frames.length-1) return {from:frame, to:frame, mix:0, index:i};
    time -= frame.hold;
    if (time < frame.transition) {
      const t=THREE.MathUtils.clamp(time/frame.transition, 0, 1);
      // Quintic easing has zero velocity and acceleration at both ends.
      const mix=t*t*t*(t*(t*6-15)+10);
      return {from:frame, to:frames[i+1], mix, index:i};
    }
    time -= frame.transition;
  }
  const last=frames[frames.length-1];
  return {from:last, to:last, mix:0, index:frames.length-1};
}

export function interpolateView(from: SceneView, to: SceneView, mix: number): SceneView {
  const t=THREE.MathUtils.clamp(mix,0,1);
  if(t===0) return cloneView(from);
  if(t===1) return cloneView(to);
  const aTarget=new THREE.Vector3(...from.target), bTarget=new THREE.Vector3(...to.target);
  const a=new THREE.Spherical().setFromVector3(new THREE.Vector3(...from.position).sub(aTarget));
  const b=new THREE.Spherical().setFromVector3(new THREE.Vector3(...to.position).sub(bTarget));
  // Use the shortest orbit rather than a straight chord through the product.
  const turn=Math.atan2(Math.sin(b.theta-a.theta),Math.cos(b.theta-a.theta));
  const radius=Math.exp(THREE.MathUtils.lerp(Math.log(Math.max(a.radius,.01)),Math.log(Math.max(b.radius,.01)),t));
  const target=aTarget.lerp(bTarget,t);
  const position=new THREE.Vector3().setFromSphericalCoords(radius,THREE.MathUtils.lerp(a.phi,b.phi,t),a.theta+turn*t).add(target);
  return {
    position:position.toArray() as Vector3Tuple, target:target.toArray() as Vector3Tuple,
    fov:THREE.MathUtils.lerp(from.fov,to.fov,t), zoom:THREE.MathUtils.lerp(from.zoom,to.zoom,t),
    explosion:THREE.MathUtils.lerp(from.explosion,to.explosion,t),
    background:'#'+new THREE.Color(from.background).lerp(new THREE.Color(to.background),t).getHexString(),
    exposure:THREE.MathUtils.lerp(from.exposure,to.exposure,t), grid:t<.5?from.grid:to.grid,
    annotations:cloneAnnotations(t<.5?from.annotations:to.annotations),
    parts:(t<.5?from.parts:to.parts)?.map(p=>({...p})),
  };
}

export type AnnotationPaint = {annotation:AnnotationInfo; opacity:number};
export function annotationCrossfade(from:AnnotationInfo[],to:AnnotationInfo[],mix:number):AnnotationPaint[] {
  const t=THREE.MathUtils.clamp(mix,0,1);
  if(t===0)return from.map(annotation=>({annotation,opacity:1}));
  if(t===1)return to.map(annotation=>({annotation,opacity:1}));
  const result:AnnotationPaint[]=[];
  const matched=new Set<string>();
  for(const a of from){
    const b=to.find(b=>b.id===a.id);
    if(b&&a.text===b.text&&a.meshId===b.meshId&&a.color===b.color&&a.visible===b.visible){
      matched.add(b.id);
      result.push({annotation:{...a,anchor:a.anchor.map((n,i)=>THREE.MathUtils.lerp(n,b.anchor[i],t)) as Vector3Tuple,offset:[THREE.MathUtils.lerp(a.offset[0],b.offset[0],t),THREE.MathUtils.lerp(a.offset[1],b.offset[1],t)]},opacity:1});
    }else result.push({annotation:a,opacity:1-t});
  }
  for(const b of to)if(!matched.has(b.id))result.push({annotation:b,opacity:t});
  return result;
}
