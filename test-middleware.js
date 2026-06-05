import { protect, authorize } from './src/middleware/auth.js';
import { validateVote } from './src/middleware/validation.js';

console.log('✅ Middleware loaded successfully');
console.log('Available middleware:');
console.log('- protect (auth)');
console.log('- authorize (role-based)');
console.log('- validateVote (validation)');
console.log('- voteLimiter (rate limiting)');