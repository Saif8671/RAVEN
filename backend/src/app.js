import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import passwordRoutes from './routes/password.js';
import vulnerabilityRoutes from './routes/vulnerability.js';
import emailSecurityRoutes from './routes/emailSecurity.js';
import breachRoutes from './routes/breach.js';
import phishingRoutes from './routes/phishing.js';
import incidentRoutes from './routes/incident.js';
import reportRoutes from './routes/report.js';
import policyRoutes from './routes/policy.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for demo consistency
}));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'active', timestamp: new Date().toISOString() });
});

app.use('/api/password', passwordRoutes);
app.use('/api/vulnerability', vulnerabilityRoutes);
app.use('/api/email-security', emailSecurityRoutes);
app.use('/api/breach', breachRoutes);
app.use('/api/phishing', phishingRoutes);
app.use('/api/incident', incidentRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/policy', policyRoutes);

app.use(errorHandler);

export default app;
