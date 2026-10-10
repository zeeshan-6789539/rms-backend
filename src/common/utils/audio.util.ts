const WAV_HEADER_BYTES = 44;
const DEFAULT_PCM_SAMPLE_RATE = 24_000;
const PCM_BITS_PER_SAMPLE = 16;
const PCM_CHANNELS = 1;

export const buildWavHeader = (dataBytes: number, sampleRate: number): Buffer => {
  const blockAlign = (PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const header = Buffer.alloc(WAV_HEADER_BYTES);

  header.write('RIFF', 0);
  header.writeUInt32LE(WAV_HEADER_BYTES - 8 + dataBytes, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(PCM_CHANNELS, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(PCM_BITS_PER_SAMPLE, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataBytes, 40);

  return header;
};

// Loudest 16-bit PCM sample as 0–1; null when the buffer is not a 16-bit PCM WAV
export const getWavPeakLevel = (wav: Buffer): number | null => {
  const isPcmWav =
    wav.length > WAV_HEADER_BYTES &&
    wav.subarray(0, 4).toString() === 'RIFF' &&
    wav.subarray(8, 12).toString() === 'WAVE' &&
    wav.readUInt16LE(20) === 1 &&
    wav.readUInt16LE(34) === PCM_BITS_PER_SAMPLE;

  if (!isPcmWav) return null;

  let peak = 0;

  for (let offset = WAV_HEADER_BYTES; offset + 1 < wav.length; offset += 2) {
    peak = Math.max(peak, Math.abs(wav.readInt16LE(offset)));
  }

  return peak / 32768;
};

// Gemini TTS answers either a ready WAV or raw 16-bit mono PCM ("audio/L16;codec=pcm;rate=24000")
export const toWavBase64 = (base64: string, mimeType: string | undefined): string => {
  if (!mimeType || /wav/i.test(mimeType)) return base64;

  const sampleRate = Number(/rate=(\d+)/i.exec(mimeType)?.[1] ?? DEFAULT_PCM_SAMPLE_RATE);
  const pcm = Buffer.from(base64, 'base64');

  return Buffer.concat([buildWavHeader(pcm.length, sampleRate), pcm]).toString('base64');
};
