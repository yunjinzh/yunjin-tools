import {DT} from './core.js';
export class FixedClock{
  constructor(step){this.step=step;this.accumulator=0;this.droppedSeconds=0;}
  advance(seconds){
    if(!Number.isFinite(seconds)||seconds<0)throw Error('Invalid frame time');
    this.droppedSeconds+=Math.max(0,seconds-.25);this.accumulator+=Math.min(seconds,.25);
    let n=0;while(this.accumulator>=DT-1e-10&&n<32){this.step();this.accumulator-=DT;n++;}return n;
  }
  reset(){this.accumulator=0;}
}
