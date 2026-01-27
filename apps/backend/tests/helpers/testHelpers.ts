import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Generate a test JWT token for admin user
 */
export function generateAdminToken(adminId: number = 1): string {
  return jwt.sign(
    {
      adminId: String(adminId),
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Generate a test JWT token for regular user
 */
export function generateUserToken(userId: number = 2): string {
  return jwt.sign(
    {
      userId,
      email: 'user@test.com',
      role: 'USER',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Mock request helper
 */
export function createMockRequest(
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  } = {}
) {
  return {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body,
    query: options.query || {},
    url: '/',
  };
}

/**
 * Mock response helper with status tracking
 */
export function createMockResponse() {
  const res: any = {
    statusCode: 200,
    _data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this._data = data;
      return this;
    },
    send(data: any) {
      this._data = data;
      return this;
    },
    setHeader() {
      return this;
    },
  };
  return res;
}
