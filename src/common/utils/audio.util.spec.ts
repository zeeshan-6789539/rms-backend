import { describe, expect, it } from 'vitest';
import { buildWavHeader, getWavPeakLevel, toWavBase64 } from './audio.util.js';

const wavOf = (samples: number[]): Buffer => {
  const pcm = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, index) => pcm.writeInt16LE(sample, index * 2));
  return Buffer.concat([buildWavHeader(pcm.length, 16000), pcm]);
};

describe('getWavPeakLevel', () => {
  it('returns the loudest sample as a 0–1 level', () => {
    expect(getWavPeakLevel(wavOf([0, 100, -16384, 50]))).toBe(0.5);
  });

  it('returns null for anything that is not a 16-bit PCM WAV', () => {
    expect(getWavPeakLevel(Buffer.from('not audio at all, just some text bytes here ok'))).toBeNull();
  });
});

describe('toWavBase64', () => {
  it('passes a WAV through unchanged', () => {
    expect(toWavBase64('UklGRg==', 'audio/wav')).toBe('UklGRg==');
  });

  it('wraps raw PCM in a WAV header using the rate from the mime type', () => {
    const pcm = Buffer.from([1, 2, 3, 4]);
    const wav = Buffer.from(toWavBase64(pcm.toString('base64'), 'audio/L16;codec=pcm;rate=16000'), 'base64');

    expect(wav.subarray(0, 4).toString()).toBe('RIFF');
    expect(wav.subarray(8, 12).toString()).toBe('WAVE');
    expect(wav.readUInt32LE(24)).toBe(16000);
    expect(wav.readUInt32LE(40)).toBe(4);
    expect(wav.subarray(44)).toEqual(pcm);
  });
});
