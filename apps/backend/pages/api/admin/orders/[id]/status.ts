/**
 * PUT /api/admin/orders/:id/status
 * 
 * Update order status with business logic validation:
 * - Validates status transitions
 * - Creates audit trail (OrderActivity)
 * - Handles inventory restock on cancellation
 * - Supports idempotency via Idempotency-Key header
 * - Implements optimistic concurrency control
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { validateStatusTransition, calculateRestockQuantities, OrderStatus } from '@/lib/orderStatus';

// Request validation schema
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'CONFIRMED', 'FAILED']),
  note: z.string().optional(),
  // Shipping details (required for SHIPPED status)
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  shipDate: z.string().datetime().optional(),
  // Delivery details (required for DELIVERED status)
  deliveryDate: z.string().datetime().optional(),
  // Cancellation details (required for CANCELLED status)
  cancellationReason: z.string().optional(),
  shouldRestock: z.boolean().default(true), // Whether to restock inventory on cancellation
});

type UpdateStatusBody = z.infer<typeof updateStatusSchema>;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const orderId = Array.isArray(id) ? id[0] : id;
  
  // Get adminId from requireAdmin middleware
  const adminId = (req as any).adminId;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }
  
  if (!adminId) {
    return res.status(401).json({ error: 'Admin ID not found in request' });
  }

  // Parse and validate request body
  const parseResult = updateStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation error',
      details: parseResult.error.errors,
    });
  }

  const body: UpdateStatusBody = parseResult.data;
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  try {
    // Check for existing idempotent operation
    if (idempotencyKey) {
      const existingActivity = await prisma.orderActivity.findFirst({
        where: {
          orderId,
          toStatus: body.status as OrderStatus,
          note: body.note || null,
          adminId,
        },
        orderBy: { timestamp: 'desc' },
        take: 1,
      });

      // If same transition exists within last 5 minutes, return cached response
      if (existingActivity) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingActivity.timestamp > fiveMinutesAgo) {
          const order = await prisma.order.findUnique({ where: { id: orderId } });
          return res.status(200).json({
            message: 'Order status already updated (idempotent)',
            order,
          });
        }
      }
    }

    // Fetch current order with items (for inventory restock)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true, // OrderItem doesn't have product relation in schema
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status transition
    // Normalize statuses to uppercase for validation
    const currentStatus = order.status.toUpperCase() as OrderStatus;
    const newStatus = body.status as OrderStatus;
    
    const transitionResult = validateStatusTransition(
      currentStatus,
      newStatus
    );

    if (!transitionResult.allowed) {
      return res.status(400).json({
        error: 'Invalid status transition',
        message: transitionResult.error,
        currentStatus: order.status,
        requestedStatus: body.status,
      });
    }

    // Validate required fields for specific statuses
    if (body.status === 'SHIPPED') {
      if (!body.trackingNumber || !body.carrier) {
        return res.status(400).json({
          error: 'Tracking number and carrier required for SHIPPED status',
        });
      }
    }

    if (body.status === 'CANCELLED' && !body.cancellationReason) {
      return res.status(400).json({
        error: 'Cancellation reason required for CANCELLED status',
      });
    }

    // Calculate inventory restock if canceling
    let restockQuantities: Map<string, number> | null = null;
    if (body.status === 'CANCELLED' && body.shouldRestock) {
      // Check if already restocked by looking for existing CANCELLED activity
      const alreadyRestocked = await prisma.orderActivity.findFirst({
        where: {
          orderId,
          toStatus: 'CANCELLED',
        },
      });

      restockQuantities = calculateRestockQuantities(
        order.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        !!alreadyRestocked
      );
    }

    // Execute transaction: update status + create activity + restock inventory
    const result = await prisma.$transaction(async (tx) => {
      // Optimistic concurrency check: re-fetch order with FOR UPDATE lock
      const lockedOrder = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, updatedAt: true },
      });

      if (!lockedOrder) {
        throw new Error('Order not found during transaction');
      }

      // Detect concurrent modification
      if (lockedOrder.status !== order.status) {
        throw new Error('CONCURRENT_UPDATE');
      }

      // Update order status and related fields
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: body.status,
          trackingNumber: body.status === 'SHIPPED' ? body.trackingNumber : undefined,
          carrier: body.status === 'SHIPPED' ? body.carrier : undefined,
          shipDate: body.status === 'SHIPPED' && body.shipDate ? new Date(body.shipDate) : undefined,
          deliveryDate: body.status === 'DELIVERED' && body.deliveryDate ? new Date(body.deliveryDate) : undefined,
          cancellationReason: body.status === 'CANCELLED' ? body.cancellationReason : undefined,
          updatedAt: new Date(),
        },
        include: {
          items: true, // OrderItem doesn't have product relation
        },
      });

      // Create audit trail activity
      await tx.orderActivity.create({
        data: {
          orderId,
          adminId,
          fromStatus: order.status,
          toStatus: body.status,
          note: body.note || null,
          timestamp: new Date(),
        },
      });

      // Restock inventory if needed
      if (restockQuantities && restockQuantities.size > 0) {
        for (const [productId, quantity] of restockQuantities.entries()) {
          await tx.product.update({
            where: { id: productId },
            data: {
              inventory: {
                increment: quantity,
              },
            },
          });
        }
      }

      return updatedOrder;
    });

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: result,
      restocked: restockQuantities ? Array.from(restockQuantities.entries()).map(([productId, qty]) => ({
        productId,
        quantity: qty,
      })) : null,
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);

    // Handle concurrent update conflict
    if (error.message === 'CONCURRENT_UPDATE') {
      return res.status(409).json({
        error: 'Concurrent update detected',
        message: 'Order was modified by another admin. Please refresh and try again.',
      });
    }

    return res.status(500).json({
      error: 'Failed to update order status',
      message: error.message,
    });
  }
}

export default requireAdmin(handler);
