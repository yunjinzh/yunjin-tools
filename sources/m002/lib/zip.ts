// Store-only ZIP: generated PNG/JPEG/WebP images are already compressed.
const table = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(bytes: Uint8Array) { let c = 0xffffffff; for (const byte of bytes) c = table[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
export function makeZip(files: { name: string; bytes: Uint8Array<ArrayBuffer> }[]): Blob {
  const local: BlobPart[] = [], central: BlobPart[] = []; let offset = 0, centralSize = 0;
  for (const file of files) {
    const name = new TextEncoder().encode(file.name), crc = crc32(file.bytes);
    const head = new Uint8Array(30 + name.length), h = new DataView(head.buffer);
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, file.bytes.length, true); h.setUint32(22, file.bytes.length, true); h.setUint16(26, name.length, true); head.set(name, 30);
    const record = new Uint8Array(46 + name.length), r = new DataView(record.buffer);
    r.setUint32(0, 0x02014b50, true); r.setUint16(4, 20, true); r.setUint16(6, 20, true); r.setUint16(8, 0x800, true); r.setUint16(14, 0x21, true); r.setUint32(16, crc, true); r.setUint32(20, file.bytes.length, true); r.setUint32(24, file.bytes.length, true); r.setUint16(28, name.length, true); r.setUint32(42, offset, true); record.set(name, 46);
    local.push(head, file.bytes); central.push(record); offset += head.length + file.bytes.length; centralSize += record.length;
  }
  const end = new Uint8Array(22), e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
  return new Blob([...local, ...central, end], { type: "application/zip" });
}
