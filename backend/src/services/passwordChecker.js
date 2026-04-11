import crypto from 'crypto';
import zxcvbn from 'zxcvbn';
import axios from 'axios';

const calculateEntropy = (str) => {
  if (!str) return 0;
  const freq = {};
  for (let char of str) freq[char] = (freq[char] || 0) + 1;
  let entropy = 0;
  for (let char in freq) {
    let p = freq[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  return (entropy * str.length).toFixed(2);
};

const formatCrackTime = (seconds) => {
  if (seconds < 1) return "INSTANT";
  const intervals = [
    { s: 3153600000, l: 'Centuries' },
    { s: 31536000, l: 'Years' },
    { s: 2592000, l: 'Months' },
    { s: 86400, l: 'Days' },
    { s: 3600, l: 'Hours' },
    { s: 60, l: 'Mins' }
  ];
  for (let i of intervals) {
    if (seconds >= i.s) return `${Math.floor(seconds / i.s)} ${i.l}`;
  }
  return "< 1 Min";
};

export const auditPassword = async (password) => {
  const strength = zxcvbn(password);
  const entropy = calculateEntropy(password);
  const len = password.length;

  // HIBP Real Breach Check
  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  let isBreached = false;
  let breachCount = 0;

  try {
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    const lines = response.data.split('\n');
    const match = lines.find(line => line.startsWith(suffix));

    if (match) {
      isBreached = true;
      breachCount = parseInt(match.split(':')[1]);
    }
  } catch (error) {
    console.error('HIBP API error:', error.message);
  }

  // Elite Scoring Logic
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSym = /[^A-Za-z0-9]/.test(password);

  let heuristicScore = 0;
  heuristicScore += Math.min(len, 20) * 5; // Max 100
  if (hasLower) heuristicScore += 10;
  if (hasUpper) heuristicScore += 10;
  if (hasNum) heuristicScore += 15;
  if (hasSym) heuristicScore += 20;
  if (len > 16) heuristicScore += 20;

  const entMultiplier = Math.min(entropy / 40, 1.2);
  let finalScore = Math.min((heuristicScore * entMultiplier), 150);

  // Status and Theme
  const percent = Math.min((finalScore / 150) * 100, 100);
  let status = "CRITICAL";
  if (percent > 90) status = "ELITE";
  else if (percent > 70) status = "SECURE";
  else if (percent > 50) status = "VIBRANT";
  else if (percent > 25) status = "VULNERABLE";

  if (isBreached) status = "COMPROMISED";

  // Crack Forecast (RTX 5090 Cluster simulation - 10^12 guesses/sec)
  const charsetSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNum ? 10 : 0) + (hasSym ? 32 : 0);
  const combinations = Math.pow(charsetSize || 1, len);
  const seconds = combinations / 1e12;

  return {
    // Legacy mapping for compatibility
    score: Math.floor(strength.score),
    feedback: strength.feedback,
    crackTimes: strength.crack_times_display,
    
    // Advanced Metrics
    advanced: {
      entropy,
      finalScore,
      percent,
      status,
      crackForecast: formatCrackTime(seconds),
      guessProbability: isBreached ? "0.999" : Math.max(0.01, (1 - (finalScore / 150))).toFixed(3),
      byteLength: Buffer.from(password).length,
      policies: {
        length: len >= 12,
        casing: hasLower && hasUpper,
        numeric: hasNum,
        symbols: hasSym
      }
    },
    isBreached,
    breachCount
  };
};

