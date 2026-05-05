import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { apiRateLimiter, globalErrorHandler } from './middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(apiRateLimiter);

// Mount API routes
app.use('/api/v1', routes);

// Error handler
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[digital-asset-vault] Server active on port ${PORT}`);
    console.log(`[digital-asset-vault] Health check available at http://localhost:${PORT}/api/v1/health`);
  });
}

export default app;
