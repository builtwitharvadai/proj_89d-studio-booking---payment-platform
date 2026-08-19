import type { Server } from 'node:http';

import { app } from './app.js';
import { config } from './config/environment.js';

const server: Server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${config.port}`);
});

const shutdown = (signal: NodeJS.Signals): void => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}, shutting down gracefully...`);

  server.close((err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }

    // eslint-disable-next-line no-console
    console.log('Server shut down successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { server };
