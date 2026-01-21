import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

export function cors(req: NextApiRequest, res: NextApiResponse) {
  // Allow any origin for local development to avoid CORS issues
  res.setHeader('Access-Control-Allow-Credentials', 'false')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length,Content-Type')
  res.setHeader('Access-Control-Max-Age', '600')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }
  return false
}

// HOF wrapper to automatically apply CORS to any API handler
export function withCors(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (cors(req, res)) return
    return handler(req, res)
  }
}