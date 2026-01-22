/**
 * GET /api/admin/orders/:id/activities
 * 
 * Retrieve order status change history (audit trail)
 * Returns chronological list of activities with admin details
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const orderId = Array.isArray(id) ? id[0] : id;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Fetch activities with admin details
    const activities = await prisma.orderActivity.findMany({
      where: { orderId },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        timestamp: 'asc', // Chronological order
      },
    });

    return res.status(200).json({
      orderId,
      currentStatus: order.status,
      activities: activities.map((activity) => ({
        id: activity.id,
        fromStatus: activity.fromStatus,
        toStatus: activity.toStatus,
        note: activity.note,
        timestamp: activity.timestamp.toISOString(),
        admin: {
          id: activity.admin.id,
          username: activity.admin.username,
        },
      })),
    });
  } catch (error: any) {
    console.error('Error fetching order activities:', error);
    return res.status(500).json({
      error: 'Failed to fetch order activities',
      message: error.message,
    });
  }
}

export default requireAdmin(handler);
