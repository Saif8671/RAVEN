import { auditPassword } from '../backend/src/services/passwordChecker.js';

async function test() {
  const passwords = ['password', 'Admin123!', 'aVeryComplexPasswordWithSymbols#2026'];
  for (const pw of passwords) {
    console.log(`\nTesting: ${pw}`);
    const result = await auditPassword(pw);
    console.log(JSON.stringify(result.advanced, null, 2));
    console.log(`Breached: ${result.isBreached} (${result.breachCount})`);
  }
}

test();
