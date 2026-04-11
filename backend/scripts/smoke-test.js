import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

async function runTests() {
  console.log('Starting backend smoke tests...\n');

  try {
    console.log('1. Testing /api/scan/full...');
    const scanRes = await axios.post(`${baseURL}/scan/full`, {
      domain: 'example.com',
      businessName: 'Example Corp',
    });
    console.log('Scan successful:', scanRes.data.report.id);
  } catch (error) {
    console.error('Scan failed:', error.response?.data || error.message);
  }

  try {
    console.log('\n2. Testing /api/password/check...');
    const pwdRes = await axios.post(`${baseURL}/password/check`, {
      password: 'password123',
    });
    console.log('Password check successful. Breached:', pwdRes.data.isBreached);
  } catch (error) {
    console.error('Password check failed:', error.response?.data || error.message);
  }

  try {
    console.log('\n3. Testing /api/phishing/quiz...');
    const quizRes = await axios.post(`${baseURL}/phishing/quiz`, {
      industry: 'Retail',
    });
    console.log('Phishing quiz generated. Questions:', quizRes.data.length);
  } catch (error) {
    console.error('Phishing quiz failed:', error.response?.data || error.message);
  }

  console.log('\nTests finished.');
}

runTests();
