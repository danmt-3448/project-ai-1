import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withCors } from '@/lib/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid slug parameter' });
    }

    const product = await prisma.product.findFirst({
      where: {
        slug,
        published: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Parse images JSON string to array
    const parsedProduct = {
      ...product,
      images: JSON.parse(product.images || '[]'),
    };

    return res.status(200).json(parsedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCors(handler);
