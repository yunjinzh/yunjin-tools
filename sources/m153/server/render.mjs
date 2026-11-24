import {createInterface} from 'node:readline';
import {once} from 'node:events';
import {softwareStage} from '../dist/figure.mjs';
const [w,h]=process.argv.slice(2,4).map(Number),bg=process.argv[4];let pixels;
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:image=>{pixels=image.data;}};
const stage=softwareStage({getContext:()=>context},w,h,false,1);
for await(const line of createInterface({input:process.stdin})){
  stage.draw([JSON.parse(line)],bg);
  if(!process.stdout.write(Buffer.from(pixels.buffer)))await once(process.stdout,'drain');
}
