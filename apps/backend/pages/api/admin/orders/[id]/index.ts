import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthRequest } from '@/lib/auth';

export default requireAdmin(async function handler(req: AuthRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  if (req.method === 'GET') {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      // Fetch product info for each item
      const productIds = order.items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, slug: true, images: true },
      });
      // Map product info to items
      const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
      const itemsWithProduct = order.items.map((item) => ({
        ...item,
        product: productMap[item.productId]
          ? {
              ...productMap[item.productId],
              images: (() => {
                try {
                  return JSON.parse(productMap[item.productId].images || '[]');
                } catch {
                  return [];
                }
              })(),
            }
          : null,
      }));

      return res.status(200).json({ ...order, items: itemsWithProduct });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch order', details: err });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
