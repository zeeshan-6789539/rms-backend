import { randomBytes } from 'node:crypto';

const COUNTER_MAX = 0xfff;
const VERSION_7 = 0x70;
const VARIANT_RFC9562 = 0x80;

let lastTimestamp = 0;
let counter = 0;

// RFC 9562 method 1: a 12-bit counter keeps ids issued in the same millisecond ordered
const nextTick = (): [timestamp: number, sequence: number] => {
  const now = Date.now();

  if (now > lastTimestamp) {
    lastTimestamp = now;
    counter = 0;

    return [lastTimestamp, counter];
  }

  // Same millisecond, or a clock that stepped backwards — keep counting forward
  counter += 1;

  if (counter > COUNTER_MAX) {
    lastTimestamp += 1;
    counter = 0;
  }

  return [lastTimestamp, counter];
};

const format = (bytes: Buffer): string => {
  const hex = bytes.toString('hex');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// Time-ordered UUID: inserts land at the right edge of the B-tree instead of
// scattering across it the way a random v4 does, which keeps index bloat down.
export const uuidv7 = (): string => {
  const [timestamp, sequence] = nextTick();
  const bytes = randomBytes(16);

  bytes.writeUIntBE(timestamp, 0, 6);
  bytes[6] = VERSION_7 | ((sequence >>> 8) & 0x0f);
  bytes[7] = sequence & 0xff;
  bytes[8] = (bytes[8] & 0x3f) | VARIANT_RFC9562;

  return format(bytes);
};

// Milliseconds encoded in the first 48 bits, for sorting or debugging
export const uuidv7Timestamp = (value: string): number =>
  Number.parseInt(value.replace(/-/g, '').slice(0, 12), 16);
