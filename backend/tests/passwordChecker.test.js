import { auditPassword } from '../src/services/passwordChecker.js';

jest.mock('axios');

describe('auditPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns correct structure for strong password', async () => {
    const result = await auditPassword('aVeryComplexPasswordWithSymbols#2026');
    
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('feedback');
    expect(result).toHaveProperty('advanced');
    expect(result).toHaveProperty('isBreached');
    expect(result.advanced).toHaveProperty('entropy');
    expect(result.advanced).toHaveProperty('finalScore');
    expect(result.advanced).toHaveProperty('percent');
    expect(result.advanced).toHaveProperty('status');
  });

  test('returns CRITICAL for weak password', async () => {
    const result = await auditPassword('password');
    
    expect(result.advanced.status).toBe('CRITICAL');
    expect(result.advanced.policies.length).toBe(false);
  });

  test('detects policies correctly', async () => {
    const result = await auditPassword('Admin123!');
    
    expect(result.advanced.policies.length).toBe(true);
    expect(result.advanced.policies.casing).toBe(true);
    expect(result.advanced.policies.numeric).toBe(true);
    expect(result.advanced.policies.symbols).toBe(false);
  });

  test('calculates entropy correctly', async () => {
    const result = await auditPassword('ab');
    
    expect(result.advanced.entropy).toBeDefined();
    expect(parseFloat(result.advanced.entropy)).toBeGreaterThan(0);
  });
});