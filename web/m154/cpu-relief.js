const DEM = new URL('./terrain-data/', import.meta.url);
const IMAGERY = new URL('./imagery/', import.meta.url);
const DEG = Math.PI / 180;
const R = 6371008.8;
const clamp = (value,lo=0,hi=1) => Math.min(hi,Math.max(lo,value));
const merc = lat => Math.asinh(Math.tan(lat*DEG));
const fromMerc = y => Math.atan(Math.sinh(y))/DEG;

async function read(url, type) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('远景地形资源读取失败 (' + response.status + ')');
  return response[type]();
}

async function getRgb(url, bounds) {
  const blob = await read(url, 'blob');
  let image;
  if (typeof createImageBitmap === 'function') {
    try { image = await createImageBitmap(blob); } catch {}
  }
  if (!image) {
    const local = URL.createObjectURL(blob);
    try {
      image = new Image();
      await new Promise((resolve,reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('远景影像解码失败'));
        image.src = local;
      });
    } finally { URL.revokeObjectURL(local); }
  }
  const scale = Math.min(1, 640 / Math.max(image.width,image.height));
  const width = Math.max(1,Math.round(image.width*scale));
  const height = Math.max(1,Math.round(image.height*scale));
  const canvas = typeof OffscreenCanvas === 'function'
    ? new OffscreenCanvas(width,height) : document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0,width,height);
  const pixels=ctx.getImageData(0,0,width,height).data;
  image.close?.();
  const [w,s,e,n] = bounds;
  return {
    pixels,width,height,
    west:w, north:merc(n), lonScale:width/(e-w), mercScale:height/(merc(n)-merc(s))
  };
}

function pixelAt(raster,lon,mercLat) {
  const x=(lon-raster.west)*raster.lonScale, y=(raster.north-mercLat)*raster.mercScale;
  if(x<0||x>=raster.width||y<0||y>=raster.height) return -1;
  return 4*(Math.floor(y)*raster.width+Math.floor(x));
}

// Concentrate samples around the Beijing plain and the mountain fronts to its west and north.
function selectIndices(size, count) {
  const result=new Int32Array(count);
  for(let k=0;k<count;k++) {
    const v=2*k/(count-1)-1;
    result[k]=Math.round((1+v*(.62+.38*v*v))*.5*(size-1));
  }
  return result;
}

function patchBounds(pos) {
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<pos.length;i++){
    const a=i%3;min[a]=Math.min(min[a],pos[i]);max[a]=Math.max(max[a],pos[i]);
  }
  const center=min.map((v,i)=>(v+max[i])*.5);
  return {min,max,center,radius:Math.hypot(...max.map((v,i)=>v-center[i]))};
}

// CPU fallback uses the very same DEM values, imagery UVs, curvature and local datum as terrain.js.
export async function loadCpuRelief(project) {
  const [meta,imagery] = await Promise.all([
    read(new URL('manifest.json',DEM),'json'),read(new URL('manifest.json',IMAGERY),'json')
  ]);
  const [dem,outer,region]=await Promise.all([
    read(new URL(meta.heightfile,DEM),'arrayBuffer'),
    getRgb(new URL(meta.texture,DEM),meta.bounds),
    getRgb(new URL(imagery.layers[0].file,IMAGERY),imagery.layers[0].bounds).catch(()=>null)
  ]);
  if(dem.byteLength!==meta.rows*meta.cols*2)throw new Error('高程数据长度校验失败');
  const data=new DataView(dem);
  const [w,s,e,n]=meta.bounds;
  const core=imagery.layers[1].bounds;
  const nw=project(core[0],core[3]),se=project(core[2],core[1]);
  const ref=project(...meta.referenceCoordinate);
  const ix=selectIndices(meta.cols,225),iy=selectIndices(meta.rows,209);
  const lon=Array.from(ix,i=>w+(e-w)*i/(meta.cols-1));
  const ml=Array.from(iy,j=>merc(n)+(merc(s)-merc(n))*j/(meta.rows-1));
  const xs=lon.map(v=>project(v,meta.referenceCoordinate[1]).x);
  const zs=ml.map(v=>project(meta.referenceCoordinate[0],fromMerc(v)).z);
  const H=new Float32Array(ix.length*iy.length);
  for(let j=0;j<iy.length;j++)for(let i=0;i<ix.length;i++) {
    const x=xs[i],z=zs[j];
    const h=data.getInt16(2*(iy[j]*meta.cols+ix[i]),true)-meta.localReferenceElevation;
    const target=h-((x-ref.x)**2+(z-ref.z)**2)/(2*R);
    const d=Math.hypot(Math.max(nw.x-x,0,x-se.x),Math.max(nw.z-z,0,z-se.z));
    const t=clamp((d-700)/4500);
    H[j*ix.length+i]=-10+(target+10)*t*t*(3-2*t);
  }
  const meshes=[];
  const size=16;
  for(let j0=0;j0<iy.length-1;j0+=size)for(let i0=0;i0<ix.length-1;i0+=size) {
    const cols=Math.min(size+1,ix.length-i0),rows=Math.min(size+1,iy.length-j0);
    const pos=new Float32Array(cols*rows*3), index=[], colors=[];
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++) {
      const a=i0+i,b=j0+j,q=j*cols+i;
      pos[q*3]=xs[a];pos[q*3+1]=H[b*ix.length+a];pos[q*3+2]=zs[b];
      if(i===cols-1||j===rows-1)continue;
      // All of these pixels have a higher resolution, horizontal imagery layer in the city renderer.
      if(xs[a]>=nw.x&&xs[a+1]<=se.x&&zs[b]>=nw.z&&zs[b+1]<=se.z)continue;
      index.push(q,q+cols,q+1, q+1,q+cols,q+cols+1);
      // Each face takes the satellite color at its geographical centroid.
      for(const k of [1/3,2/3]) {
        const tx=lon[a]+(lon[a+1]-lon[a])*k, ty=ml[b]+(ml[b+1]-ml[b])*k;
        const inset=region?pixelAt(region,tx,ty):-1;
        const raster=inset<0?outer:region;
        const p=inset<0?pixelAt(outer,tx,ty):inset;
        colors.push(raster.pixels[p],raster.pixels[p+1],raster.pixels[p+2]);
      }
    }
    if(index.length)meshes.push({pos,index:Uint32Array.from(index),colors:Uint8Array.from(colors),bounds:patchBounds(pos)});
  }
  meshes.groundAt=(x,z)=>{
    if(x>=nw.x&&x<=se.x&&z>=nw.z&&z<=se.z)return 0;
    if(x<xs[0]||x>xs.at(-1)||z<zs[0]||z>zs.at(-1))return 0;
    const i=Math.max(0,Math.min(xs.length-2,xs.findIndex(t=>t>x)-1)),j=Math.max(0,Math.min(zs.length-2,zs.findIndex(t=>t>z)-1));
    const u=(x-xs[i])/(xs[i+1]-xs[i]),v=(z-zs[j])/(zs[j+1]-zs[j]),a=i+j*ix.length;
    return (H[a]*(1-u)+H[a+1]*u)*(1-v)+(H[a+ix.length]*(1-u)+H[a+ix.length+1]*u)*v;
  };
  return meshes;
}
