import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import scanRoutes from './routes/scan.js';
import reportRoutes from './routes/reports.js';
import passwordRoutes from './routes/password.js';
import aiRoutes from './routes/ai.js';
import phishingRoutes from './routes/phishing.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});

app.use('/api/scan', scanRoutes);
app.use('/api', reportRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/phishing', phishingRoutes);

app.use(errorHandler);

export default app;
