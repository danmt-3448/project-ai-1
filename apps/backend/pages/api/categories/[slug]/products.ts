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

    // Find category first
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch products in this category
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        published: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        inventory: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse images JSON string to array
    const parsedProducts = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
    }));

    return res.status(200).json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      products: parsedProducts,
    });
  } catch (error) {
    console.error('Error fetching category products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCors(handler);
