// Strips credentials from a connection string so it is safe to log
export const redactConnectionUrl = (value: string): string => {
  try {
    const url = new URL(value);
    const database = url.pathname.replace(/^\//, '');

    return `${url.hostname}${url.port ? `:${url.port}` : ''}/${database}`;
  } catch {
    return 'unknown host';
  }
};
