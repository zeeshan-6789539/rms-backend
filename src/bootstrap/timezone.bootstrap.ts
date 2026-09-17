// Side-effect module: pins the whole process to UTC.
// Must be the FIRST import in every entrypoint, before anything touches Date.
process.env.TZ = 'UTC';
