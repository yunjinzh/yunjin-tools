import {createInterface} from 'node:readline';
import {readFileSync} from 'node:fs';
import {motionTrack} from '../dist/motion-track.mjs';
import {once} from 'node:events';
import {softwareStage} from '../dist/figure.mjs';
const [w,h]=process.argv.slice(2,4).map(Number),bg=process.argv[4];let pixels;
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:image=>{pixels=image.data;}};
const stage=softwareStage({getContext:()=>context},w,h,false,1);
const motion=process.argv[5]?JSON.parse(readFileSync(process.argv[5],'utf8')):null;
const sample=motion?motionTrack(motion.frames,motion.w/motion.h):null;
for await(const line of createInterface({input:process.stdin})){
  const value=JSON.parse(line);stage.draw([sample?sample(value):value],bg);
  if(!process.stdout.write(Buffer.from(pixels.buffer)))await once(process.stdout,'drain');
}
