import app from './app.js';
import { PORT } from './config/env.js';

app.listen(PORT, () => {
  console.log(`Security Checker backend running on port ${PORT}`);
});
