import fs from 'node:fs';
import {trial} from '../tests/physics/fixture.js';

fs.mkdirSync('reports',{recursive:true});
for(const kind of ['cup','box']){
  const t=trial({kind,seed:1,record:true});
  try{
    const report=t.run();
    if(report.state!=='SUCCESS')throw new Error(`${kind}: ${report.failures[0]?.code}`);
    fs.writeFileSync(`reports/${kind}-baseline-trace.json`,JSON.stringify(report));
    console.log(`${kind}: ${report.state}; ${report.trace.length} physics steps; attach jump ${report.metrics.attachJump} m`);
  }finally{t.dispose();}
}
