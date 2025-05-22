// Allowed origins
export const whitelist = [
  process.env.DOMAIN_NAME_HTTP,
  process.env.DOMAIN_NAME_HTTPS,
  'http://0.0.0.0:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5173',
];
