import { beforeAll, afterAll, afterEach } from 'vitest';
import path from 'path';

// Mock environment variables for testing
// Use PostgreSQL test database (separate from dev)
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/storefront_test?schema=public';
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
