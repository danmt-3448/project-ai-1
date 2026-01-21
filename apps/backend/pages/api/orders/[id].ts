import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withCors } from '@/lib/cors'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Fetch products to get images and slug
    const productIds = order.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        slug: true,
        images: true,
      },
    })

    // Create product map for quick lookup
    const productMap = new Map(
      products.map((p) => [
        p.id,
        {
          slug: p.slug,
          images: JSON.parse(p.images || '[]'),
        },
      ])
    )

    // Merge product info into items
    const enrichedItems = order.items.map((item) => ({
      ...item,
      product: productMap.get(item.productId) || null,
    }))

    return res.status(200).json({
      ...order,
      items: enrichedItems,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
