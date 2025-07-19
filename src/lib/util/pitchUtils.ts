export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  let SIZE = buffer.length;
  let maxval = 0;
  let maxpos = 0;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // 무음은 무시

  const c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] += buffer[j] * buffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  if (maxpos === 0) return null;
  const pitch = sampleRate / maxpos;
  if (pitch < 50 || pitch > 1000) return null;
  return pitch;
}
