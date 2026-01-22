import { beforeAll, afterAll, afterEach } from 'vitest';
import path from 'path';

// Mock environment variables for testing
// Use SQLite for tests (same as dev environment)
const testDbPath = path.resolve(__dirname, '../test.db');
process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${testDbPath}`;
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
(process.env as any).NODE_ENV = 'test';

beforeAll(async () => {
  // Setup: Could initialize test database here
  console.log('🧪 Starting backend tests...');
});

afterEach(() => {
  // Cleanup after each test if needed
});

afterAll(async () => {
  // Teardown: Could cleanup test database here
  console.log('✅ Backend tests completed');
});
