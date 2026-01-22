import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withCors } from '@/lib/cors';

// Validation schema
const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().min(1),
});

const checkoutSchema = z.object({
  buyerName: z.string().min(1, 'Buyer name is required'),
  buyerEmail: z.string().email('Invalid email'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  items: z.array(checkoutItemSchema).min(1, 'At least one item is required'),
  simulateFail: z.boolean().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validationResult = checkoutSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const { buyerName, buyerEmail, address, items, simulateFail } = validationResult.data;

    // Simulate failure if requested
    if (simulateFail) {
      return res.status(400).json({
        error: 'Simulated checkout failure',
        message: 'This is a test failure',
      });
    }

    // Use Prisma transaction for atomic checkout
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch all products and check availability
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          published: true,
        },
      });

      // Check if all products exist
      if (products.length !== productIds.length) {
        throw new Error('Some products not found or not published');
      }

      // Build product map for easy lookup
      const productMap = new Map(products.map((p) => [p.id, p]));

      // 2. Check inventory and calculate total
      let total = 0;
      const orderItems: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }> = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.inventory < item.quantity) {
          throw new Error(
            `Insufficient inventory for product "${product.name}". Available: ${product.inventory}, requested: ${item.quantity}`
          );
        }

        total += product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      }

      // 3. Create order with items
      const order = await tx.order.create({
        data: {
          buyerName,
          buyerEmail,
          address,
          total,
          status: 'pending',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // 4. Decrement inventory
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return res.status(200).json({
      orderId: result.id,
      status: result.status,
      total: result.total,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('Checkout error:', error);

    // Handle specific errors
    if (error.message?.includes('Insufficient inventory')) {
      return res.status(400).json({
        error: 'Insufficient inventory',
        message: error.message,
      });
    }

    if (error.message?.includes('not found')) {
      return res.status(400).json({
        error: 'Product not found',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during checkout',
    });
  }
}

export default withCors(handler);
