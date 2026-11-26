import * as THREE from 'three';

const ROOT = new URL('./terrain-data/', import.meta.url);
const IMAGERY = new URL('./imagery/', import.meta.url);
const EARTH_RADIUS = 6371008.8;
const DEG = Math.PI / 180;

const merc = latitude => Math.asinh(Math.tan(latitude * DEG));
const unmerc = value => Math.atan(Math.sinh(value)) / DEG;
const clamp = x => Math.max(0, Math.min(1, x));

async function file(url, binary = false) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('无法读取地形资源 ' + url.pathname + ' (' + response.status + ')');
  return binary ? response.arrayBuffer() : response.json();
}

async function texture(source, space = THREE.SRGBColorSpace) {
  const result = await new THREE.TextureLoader().loadAsync(source.href);
  result.colorSpace = space;
  result.anisotropy = 2;
  return result;
}

function zoomArea(bounds) {
  const [west,south,east,north] = bounds;
  return new THREE.Vector4(west,merc(south),east-west,merc(north)-merc(south));
}

function groundMaterial(outer, region, night, globalBounds, regionBounds) {
  const material = new THREE.MeshLambertMaterial({color: 0xffffff, map: outer});
  const world = zoomArea(globalBounds);
  const inset = zoomArea(regionBounds);
  const uniforms = {
    uReliefRegion: {value: region || outer},
    uReliefNight: {value: night || outer},
    uReliefNightAvailable: {value: night ? 1 : 0},
    uReliefRegionAvailable: {value: region ? 1 : 0},
    uReliefNightStrength: {value: 0},
    uReliefSnow: {value: 0},
    uReliefWet: {value: 0},
    uReliefTransform: {value: new THREE.Vector4(
      (world.x-inset.x)/inset.z, (world.y-inset.y)/inset.w,
      world.z/inset.z, world.w/inset.w
    )}
  };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>',`
      #include <common>
      uniform sampler2D uReliefRegion;
      uniform sampler2D uReliefNight;
      uniform float uReliefRegionAvailable;
      uniform float uReliefNightAvailable;
      uniform float uReliefNightStrength;
      uniform float uReliefSnow;
      uniform float uReliefWet;
      uniform vec4 uReliefTransform;
    `).replace('#include <map_fragment>',`
      vec2 insetUV = uReliefTransform.xy + vMapUv * uReliefTransform.zw;
      vec2 edges = min(insetUV, 1.0-insetUV);
      float blend = smoothstep(0.0, .018, min(edges.x,edges.y)) * uReliefRegionAvailable;
      vec3 dayGround = mix(texture2D(map,vMapUv).rgb,
                           texture2D(uReliefRegion,clamp(insetUV,0.0,1.0)).rgb, blend);
      float lightness = dot(dayGround,vec3(.2126,.7152,.0722));
      dayGround = mix(dayGround, mix(vec3(.42,.45,.49),vec3(.77,.82,.88),lightness), uReliefSnow*.50);
      diffuseColor.rgb *= dayGround * (1.0-.23*uReliefWet);
    `).replace('#include <emissivemap_fragment>',`
      #include <emissivemap_fragment>
      vec3 cityLights = texture2D(uReliefNight, vMapUv).rgb;
      float glow = dot(cityLights, vec3(.2126,.7152,.0722));
      totalEmissiveRadiance += vec3(1.0,.69,.38) * glow *
        uReliefNightStrength * uReliefNightAvailable * .45;
    `);
  };
  return {material, uniforms};
}

function buildPatches(xs, zs, heights, group, material) {
  const cols = xs.length, rows = zs.length;
  const stride = 64;
  for (let row=0; row<rows-1; row+=stride) {
    for (let col=0; col<cols-1; col+=stride) {
      const nx=Math.min(stride, cols-1-col)+1, nz=Math.min(stride, rows-1-row)+1;
      const positions=new Float32Array(nx*nz*3), normals=new Float32Array(positions.length);
      const uvs=new Float32Array(nx*nz*2), faces=new Uint16Array((nx-1)*(nz-1)*6);
      let t=0;
      for (let j=0; j<nz; j++) for (let i=0; i<nx; i++) {
        const x=col+i, z=row+j, local=j*nx+i, k=z*cols+x;
        const left=Math.max(0,x-1), right=Math.min(cols-1,x+1);
        const top=Math.max(0,z-1), bottom=Math.min(rows-1,z+1);
        const dx=(heights[z*cols+right]-heights[z*cols+left])/(xs[right]-xs[left]);
        const dz=(heights[bottom*cols+x]-heights[top*cols+x])/(zs[bottom]-zs[top]);
        const length=Math.hypot(dx,1,dz);
        positions[local*3]=xs[x];
        positions[local*3+1]=heights[k];
        positions[local*3+2]=zs[z];
        normals[local*3]=-dx/length;
        normals[local*3+1]=1/length;
        normals[local*3+2]=-dz/length;
        uvs[local*2]=x/(cols-1);
        uvs[local*2+1]=1-z/(rows-1);
        if (i===nx-1 || j===nz-1) continue;
        faces[t++]=local; faces[t++]=local+nx; faces[t++]=local+1;
        faces[t++]=local+1; faces[t++]=local+nx; faces[t++]=local+nx+1;
      }
      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
      geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));
      geo.setAttribute('uv',new THREE.BufferAttribute(uvs,2));
      geo.setIndex(new THREE.BufferAttribute(faces,1));
      geo.computeBoundingSphere();
      const mesh=new THREE.Mesh(geo,material);
      mesh.matrixAutoUpdate=false;
      group.add(mesh);
    }
  }
}

function locate(axis, coordinate) {
  let left=0, right=axis.length-1;
  while(right-left>1) {
    const mid=(left+right)>>1;
    if(axis[mid]<=coordinate) left=mid; else right=mid;
  }
  return [left,clamp((coordinate-axis[left])/(axis[right]-axis[left]))];
}

/** SRTM elevations in a local metre frame, X east and Z south. */
export async function createTerrain({scene,project}) {
  const [meta, imagery]=await Promise.all([
    file(new URL('manifest.json',ROOT)),
    file(new URL('manifest.json',IMAGERY)).catch(()=>({layers:[]}))
  ]);
  const [buffer,outer,region,night]=await Promise.all([
    file(new URL(meta.heightfile,ROOT),true),
    texture(new URL(meta.texture,ROOT)),
    imagery.layers[0] ? texture(new URL(imagery.layers[0].file,IMAGERY)).catch(()=>null) : null,
    meta.nightTexture ? texture(new URL(meta.nightTexture,ROOT)).catch(()=>null) : null
  ]);
  const {cols,rows,bounds,referenceCoordinate,localReferenceElevation}=meta;
  if(buffer.byteLength!==cols*rows*2) throw new Error('高程网格字节数与行列数不一致');
  const encoded=new DataView(buffer);
  const [west,south,east,north]=bounds;
  const {material,uniforms}=groundMaterial(outer,region,night,bounds,imagery.layers[0]?.bounds||bounds);
  const core=imagery.layers[1]?.bounds || [116.32324,39.84228,116.58692,40.07807];
  const center=project(...referenceCoordinate);
  const a=project(core[0],core[3]), b=project(core[2],core[1]);
  const xs=new Float64Array(cols), zs=new Float64Array(rows);
  const top=merc(north), bottom=merc(south);
  for(let i=0;i<cols;i++) xs[i]=project(west+(east-west)*i/(cols-1),referenceCoordinate[1]).x;
  for(let i=0;i<rows;i++) zs[i]=project(referenceCoordinate[0],unmerc(top+(bottom-top)*i/(rows-1))).z;
  const heights=new Float32Array(cols*rows);
  for(let j=0;j<rows;j++) for(let i=0;i<cols;i++) {
    const x=xs[i], z=zs[j], dx=x-center.x, dz=z-center.z;
    const target=encoded.getInt16((j*cols+i)*2,true)-localReferenceElevation-(dx*dx+dz*dz)/(2*EARTH_RADIUS);
    // The city is modeled on a local plane. Blend only outside its imagery extent.
    const d=Math.hypot(Math.max(a.x-x,0,x-b.x),Math.max(a.z-z,0,z-b.z));
    const f=clamp((d-700)/4500);
    const smooth=f*f*(3-2*f);
    heights[j*cols+i]=-10+(target+10)*smooth;
  }
  const group=new THREE.Group();
  group.name='北京远景实测地形 · Mapzen / USGS SRTM';
  buildPatches(xs,zs,heights,group,material);
  scene.add(group);
  return {
    meta,group,
    update({night=0,wet=0,snow=0}={}) {
      uniforms.uReliefNightStrength.value=clamp(Number(night)||0);
      uniforms.uReliefWet.value=clamp(Number(wet)||0);
      uniforms.uReliefSnow.value=clamp(Number(snow)||0);
    },
    groundAt(x,z) {
      if(x<xs[0]||x>xs[cols-1]||z<zs[0]||z>zs[rows-1]) return null;
      if(x>=a.x&&x<=b.x&&z>=a.z&&z<=b.z) return 0;
      const [i,fx]=locate(xs,x),[j,fz]=locate(zs,z);
      const q=j*cols+i;
      return THREE.MathUtils.lerp(THREE.MathUtils.lerp(heights[q],heights[q+1],fx),
        THREE.MathUtils.lerp(heights[q+cols],heights[q+cols+1],fx),fz);
    },
    dispose() {
      group.removeFromParent();
      group.children.forEach(mesh=>mesh.geometry.dispose());
      [outer,region,night].forEach(map=>map?.dispose());
      material.dispose();
    }
  };
}
