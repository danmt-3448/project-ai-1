import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withCors } from '@/lib/cors'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return res.status(200).json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
