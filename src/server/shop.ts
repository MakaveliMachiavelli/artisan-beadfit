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

    items.unshift({
      id: 'test-3d-gallery',
      slug: 'test-3d-gallery',
      title: 'Photorealistic 3D Test',
      description: 'Testing the upgraded 3D lighting and materials.',
      price: 150,
      status: 'ACTIVE',
      composition: JSON.stringify(Array(22).fill('Onyx')),
      sizeMm: 8,
      wristMm: 165,
      spinBasePath: null,
      spinFrameCount: 0,
      inStock: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    res.json(items);
  } catch (error: any) {
    console.error('Failed to fetch shop items:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch shop items', detail: error.message });
  }
});

// POST /api/shop/items
shopRouter.post('/items', async (req, res) => {
  try {
    const { name, tagline, price, stockQty, composition, sizeMm, wristMm } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const newItem = await prisma.shopItem.create({
      data: {
        slug,
        name,
        tagline,
        price: parseFloat(price),
        status: 'ACTIVE',
        stockQty: parseInt(stockQty),
        composition: JSON.stringify(composition), // Array of bead objects
        sizeMm: parseInt(sizeMm) || 8,
        wristMm: parseInt(wristMm) || 165,
        spinFrameCount: 0,
      }
    });

    res.json(newItem);
  } catch (error: any) {
    console.error('Failed to create shop item:', error.message);
    res.status(500).json({ error: 'Failed to create shop item', detail: error.message });
  }
});

// DELETE /api/shop/items/:id (Soft Delete)
shopRouter.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shopItem.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
    res.json({ success: true, message: 'Item archived' });
  } catch (error: any) {
    console.error(`Failed to delete shop item ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to delete shop item', detail: error.message });
  }
});

// POST /api/shop/items/:id/restore (Undo Delete)
shopRouter.post('/items/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shopItem.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
    res.json({ success: true, message: 'Item restored' });
  } catch (error: any) {
    console.error(`Failed to restore shop item ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to restore shop item', detail: error.message });
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
