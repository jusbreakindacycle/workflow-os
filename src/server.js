// @ts-check
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = createApp(config);

app.server.listen(config.port, config.host, () => {
  const address = app.server.address();
  const actualPort = typeof address === 'object' && address ? address.port : config.port;
  console.log(`Workflow OS Gate 1 running at http://${config.host}:${actualPort}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; shutting down.`);
  app.server.close(() => {
    app.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
