import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import passwordRoutes from './routes/password.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});

app.use('/api/password', passwordRoutes);

app.use(errorHandler);

export default app;
