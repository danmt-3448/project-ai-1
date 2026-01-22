import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/storefront_test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

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
