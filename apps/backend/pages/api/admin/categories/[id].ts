import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for category update
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({
      error: 'Invalid category ID',
      message: 'Category ID must be a string',
    });
  }

  if (req.method === 'PUT') {
    try {
      // Validate request body
      const validation = updateCategorySchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid category data',
          details: validation.error.errors,
        });
      }

      const data = validation.data;

      // Check if category exists
      const existing = await prisma.category.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({
          error: 'Category not found',
          message: `Category with ID "${id}" not found`,
        });
      }

      // If updating slug, check for duplicates
      if (data.slug && data.slug !== existing.slug) {
        const duplicateSlug = await prisma.category.findUnique({
          where: { slug: data.slug },
        });

        if (duplicateSlug) {
          return res.status(409).json({
            error: 'Duplicate slug',
            message: `Category with slug "${data.slug}" already exists`,
          });
        }
      }

      // Update category
      const updated = await prisma.category.update({
        where: { id },
        data,
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('PUT /api/admin/categories/:id error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update category',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if category exists
      const existing = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!existing) {
        return res.status(404).json({
          error: 'Category not found',
          message: `Category with ID "${id}" not found`,
        });
      }

      // Prevent deletion if category has products
      if (existing._count.products > 0) {
        return res.status(409).json({
          error: 'Category has products',
          message: `Cannot delete category with ${existing._count.products} associated products`,
        });
      }

      // Delete category
      await prisma.category.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('DELETE /api/admin/categories/:id error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete category',
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({
    error: 'Method not allowed',
    message: `Method ${req.method} not allowed`,
  });
}

// Wrap with requireAdmin for JWT auth + CORS
export default requireAdmin(handler);
