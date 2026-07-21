export function keyedSignedVariation(seed: number, key: string): number {
  let hash = 0x811c9dc5 ^ (seed >>> 0);

  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;

  return ((hash >>> 0) / 0xffffffff) * 2 - 1;
}
