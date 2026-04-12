import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const PORT = process.env.PORT || 5000;
export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
export const HIBP_API_KEY = process.env.HIBP_API_KEY || '';
export const HIBP_MODE = process.env.HIBP_MODE || 'mock';
