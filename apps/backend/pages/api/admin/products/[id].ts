import { NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin, AuthRequest } from '@/lib/auth'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  inventory: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  published: z.boolean().optional(),
})

async function handler(req: AuthRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      return res.status(200).json({
        ...product,
        images: JSON.parse(product.images || '[]'),
      })
    } catch (error) {
      console.error('Error fetching product:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const validationResult = updateProductSchema.safeParse(req.body)

      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        })
      }

      const data = validationResult.data

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      })

      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // If slug is being updated, check for conflicts
      if (data.slug && data.slug !== existingProduct.slug) {
        const slugConflict = await prisma.product.findUnique({
          where: { slug: data.slug },
        })

        if (slugConflict) {
          return res.status(400).json({ error: 'Slug already exists' })
        }
      }

      // If category is being updated, verify it exists
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        })

        if (!category) {
          return res.status(400).json({ error: 'Category not found' })
        }
      }

      const updateData = data.images
        ? { ...data, images: JSON.stringify(data.images) }
        : data

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      return res.status(200).json({
        ...product,
        images: JSON.parse(product.images || '[]'),
      })
    } catch (error) {
      console.error('Error updating product:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      })

      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      await prisma.product.delete({
        where: { id },
      })

      return res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error) {
      console.error('Error deleting product:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAdmin(handler)
