import assert from 'node:assert/strict';
import axios from 'axios';
import { auditPassword } from '../src/services/passwordChecker.js';

const originalAxiosGet = axios.get;

function mockNoBreachResponse() {
  axios.get = async () => ({ data: '' });
}

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  } finally {
    axios.get = originalAxiosGet;
  }
}

await runTest('returns correct structure for strong password', async () => {
  mockNoBreachResponse();

  const result = await auditPassword('aVeryComplexPasswordWithSymbols#2026');

  assert.ok(result.score !== undefined);
  assert.ok(result.feedback !== undefined);
  assert.ok(result.advanced !== undefined);
  assert.ok(result.isBreached !== undefined);
  assert.ok(result.advanced.entropy !== undefined);
  assert.ok(result.advanced.finalScore !== undefined);
  assert.ok(result.advanced.percent !== undefined);
  assert.ok(result.advanced.status !== undefined);
});

await runTest('returns CRITICAL for weak password', async () => {
  mockNoBreachResponse();

  const result = await auditPassword('password');

  assert.equal(result.advanced.status, 'CRITICAL');
  assert.equal(result.advanced.policies.length, false);
});

await runTest('detects policies correctly', async () => {
  mockNoBreachResponse();

  const result = await auditPassword('Admin123!');

  assert.equal(result.advanced.policies.length, false);
  assert.equal(result.advanced.policies.casing, true);
  assert.equal(result.advanced.policies.numeric, true);
  assert.equal(result.advanced.policies.symbols, true);
});

await runTest('calculates entropy correctly', async () => {
  mockNoBreachResponse();

  const result = await auditPassword('ab');

  assert.ok(result.advanced.entropy !== undefined);
  assert.ok(parseFloat(result.advanced.entropy) > 0);
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
