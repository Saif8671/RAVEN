import crypto from 'crypto';
import zxcvbn from 'zxcvbn';
import axios from 'axios';

export const auditPassword = async (password) => {
  const strength = zxcvbn(password);
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

  return {
    score: strength.score, // 0-4
    feedback: strength.feedback,
    crackTimes: strength.crack_times_display,
    isBreached,
    breachCount,
    suggestions: strength.feedback.suggestions
  };
};
