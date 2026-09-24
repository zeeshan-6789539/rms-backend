import { waitUntil } from '@vercel/functions';

// Keeps a serverless function alive until the task settles; off Vercel the task simply runs in the background
export const runInBackground = (task: Promise<unknown>): void => {
  waitUntil(task);
};
