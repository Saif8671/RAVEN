import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Routes
import scanRoutes from './src/routes/scan.js';
import passwordRoutes from './src/routes/password.js';
import aiRoutes from './src/routes/ai.js';
import phishingRoutes from './src/routes/phishing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/scan', scanRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/phishing', phishingRoutes);

// Legacy Aliases
app.post('/api/scan/full', (req, res, next) => {
  req.url = '/'; // Redirect to scanRouter base
  scanRoutes(req, res, next);
});

app.get('/api/reports', (req, res, next) => {
  req.url = '/history';
  scanRoutes(req, res, next);
});

app.get('/api/report/:id', (req, res, next) => {
  req.url = `/${req.params.id}`;
  scanRoutes(req, res, next);
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    traceId: uuidv4()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Security Checker Backend running on port ${PORT}`);
});
