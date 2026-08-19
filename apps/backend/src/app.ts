import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';

import { config } from './config/environment.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export { app };
export default app;
