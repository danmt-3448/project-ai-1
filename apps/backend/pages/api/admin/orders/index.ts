import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthRequest } from '@/lib/auth';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '20', status } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

      const where: any = {};

      if (status && typeof status === 'string') {
        where.status = status;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.order.count({ where }),
      ]);

      return res.status(200).json({
        data: orders,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);
