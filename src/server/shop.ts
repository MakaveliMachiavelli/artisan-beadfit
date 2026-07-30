import { Router } from 'express';
import { prisma } from '../db/client';

export const shopRouter = Router();

// GET /api/shop/health - diagnostic endpoint
shopRouter.get('/health', async (req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;
  try {
    const count = await prisma.shopItem.count();
    res.json({ 
      status: 'ok', 
      dbUrl: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
      hasToken,
      itemCount: count
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error',
      dbUrl: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
      hasToken,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
  }
});

// GET /api/shop/items
shopRouter.get('/items', async (req, res) => {
  try {
    const items = await prisma.shopItem.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    res.json(items);
  } catch (error: any) {
    console.error('Failed to fetch shop items:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch shop items', detail: error.message });
  }
});

// GET /api/shop/items/:slug
shopRouter.get('/items/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await prisma.shopItem.findUnique({
      where: { slug }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error: any) {
    console.error(`Failed to fetch shop item ${req.params.slug}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch shop item', detail: error.message });
  }
});
