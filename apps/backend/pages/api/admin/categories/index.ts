import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for category creation
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch all categories with product counts
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      // Transform response to include productCount
      const result = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat._count.products,
      }));

      return res.status(200).json(result);
    } catch (error) {
      console.error('GET /api/admin/categories error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch categories',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      // Validate request body
      const validation = createCategorySchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid category data',
          details: validation.error.errors,
        });
      }

      const { name, slug } = validation.data;

      // Check for duplicate slug
      const existing = await prisma.category.findUnique({
        where: { slug },
      });

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate slug',
          message: `Category with slug "${slug}" already exists`,
        });
      }

      // Create new category
      const category = await prisma.category.create({
        data: {
          name,
          slug,
        },
      });

      return res.status(201).json(category);
    } catch (error) {
      console.error('POST /api/admin/categories error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create category',
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({
    error: 'Method not allowed',
    message: `Method ${req.method} not allowed`,
  });
}

// Wrap with requireAdmin for JWT auth + CORS
export default requireAdmin(handler);
