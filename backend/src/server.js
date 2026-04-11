import app from './app.js';
import { PORT } from './config/env.js';
import * as scanScheduler from './services/scanScheduler.js';

// Initialize the scan scheduler for automated security checks
scanScheduler.init();

app.listen(PORT, () => {
  console.log(`Security Checker backend running on port ${PORT}`);
});
