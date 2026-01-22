import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { cors } from './cors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends NextApiRequest {
  adminId?: string;
}

export function verifyAdminToken(req: AuthRequest): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    return decoded.adminId;
  } catch (error) {
    return null;
  }
}

export function requireAdmin(
  handler: (req: AuthRequest, res: NextApiResponse) => Promise<any> | void
) {
  return async (req: AuthRequest, res: NextApiResponse): Promise<any> => {
    // Apply CORS first
    if (cors(req, res)) return;

    const adminId = verifyAdminToken(req);

    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.adminId = adminId;
    return handler(req, res);
  };
}
