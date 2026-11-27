// A little-endian CPU mesh pack. Geometry, colours and normals are the original
// renderer's values. Array views share the decompressed buffer without copying.
const types={Float32Array,Uint32Array,Uint16Array,Uint8Array,Int8Array};
const decoder=new TextDecoder();
export function decodeCpuPack(buffer){
  const view=new DataView(buffer);
  if(view.getUint32(0)!==0x424a4331)throw Error('CPU mesh signature mismatch');
  const size=view.getUint32(4,true),start=(8+size+3)&~3;
  const ranges=JSON.parse(decoder.decode(new Uint8Array(buffer,8,size)));
  return ranges.map(({meta,attributes})=>{
    for(const [name,[type,offset,count]] of Object.entries(attributes)){
      const Type=types[type];if(!Type||offset<0||count<0||start+offset+count*Type.BYTES_PER_ELEMENT>buffer.byteLength)throw Error('Invalid CPU attribute '+name);
      meta[name]=new Type(buffer,start+offset,count);
    }
    return meta;
  });
}
export async function readCpuPack(name){
  const response=await fetch(new URL('./cpu/'+name+'.bin.gz',import.meta.url));
  if(!response.ok)throw Error('CPU geometry '+response.status);
  let bytes=await response.arrayBuffer();
  const hdr=new Uint8Array(bytes,0,2);
  if(hdr[0]===31&&hdr[1]===139){
    if(typeof DecompressionStream==='undefined')throw Error('Gzip decoding unavailable');
    const gz=new Blob([bytes]);bytes=await new Response(gz.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  return decodeCpuPack(bytes);
}
