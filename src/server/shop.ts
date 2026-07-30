import { Router } from 'express';
import { prisma } from '../db/client';

export const shopRouter = Router();

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
  } catch (error) {
    console.error('Failed to fetch shop items:', error);
    res.status(500).json({ error: 'Failed to fetch shop items' });
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
  } catch (error) {
    console.error(`Failed to fetch shop item ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch shop item' });
  }
});
