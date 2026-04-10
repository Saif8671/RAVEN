import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Backend Tests...\n');

  // Test 1: Scan
  try {
    console.log('1. Testing /api/scan...');
    const scanRes = await axios.post(`${baseURL}/scan`, {
      domain: 'example.com',
      businessName: 'Example Corp'
    });
    console.log('✅ Scan successful:', scanRes.data.id);
  } catch (e) {
    console.error('❌ Scan failed:', e.response?.data || e.message);
  }

  // Test 2: Password
  try {
    console.log('\n2. Testing /api/password/check...');
    const pwdRes = await axios.post(`${baseURL}/password/check`, {
      password: 'password123'
    });
    console.log('✅ Password check successful. Breached:', pwdRes.data.isBreached);
  } catch (e) {
    console.error('❌ Password check failed:', e.response?.data || e.message);
  }

  // Test 3: Phishing
  try {
    console.log('\n3. Testing /api/phishing/quiz...');
    const quizRes = await axios.post(`${baseURL}/phishing/quiz`, {
      industry: 'Retail'
    });
    console.log('✅ Phishing quiz generated. Questions:', quizRes.data.length);
  } catch (e) {
    console.error('❌ Phishing quiz failed:', e.response?.data || e.message);
  }

  console.log('\n🏁 Tests Finished.');
}

runTests();
