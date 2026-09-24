import { waitUntil } from '@vercel/functions';
import { describe, expect, it, vi } from 'vitest';
import { runInBackground } from './background.util.js';

vi.mock('@vercel/functions', () => ({ waitUntil: vi.fn() }));

describe('runInBackground', () => {
  it('registers the task with waitUntil so the function outlives the response', () => {
    const task = Promise.resolve();

    runInBackground(task);

    expect(waitUntil).toHaveBeenCalledWith(task);
  });
});
