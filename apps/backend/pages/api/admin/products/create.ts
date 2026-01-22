import { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthRequest } from '@/lib/auth';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  inventory: z.number().int().min(0, 'Inventory must be non-negative'),
  categoryId: z.string().min(1, 'Category ID is required'),
  images: z.array(z.string().url()).optional().default([]),
  published: z.boolean().optional().default(false),
});
 

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const validationResult = createProductSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        });
      }

      const data = validationResult.data;

      const createData: any = { ...data, images: JSON.stringify(data.images || []) };

      // Check if slug already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingProduct) {
        return res.status(400).json({ error: 'Slug already exists' });
      }

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }

      const product = await prisma.product.create({
        data: createData,
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

      return res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);
