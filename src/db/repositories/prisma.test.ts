// Set the test database URL before importing any database client
process.env.DATABASE_URL = 'file:./test.db';

import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../client';
import {
  PrismaUserRepository,
  PrismaSessionRepository,
  PrismaCartRepository,
  PrismaDesignRepository,
  PrismaOrderRepository,
  PrismaCatalogRepository,
  PrismaInventoryRepository,
  PrismaManufacturingRepository,
  PrismaPaymentRepository,
  PrismaShipmentRepository,
} from './prisma';

describe('Prisma Repositories Unit Tests (Isolated Test DB)', () => {
  const userRepo = new PrismaUserRepository();
  const sessionRepo = new PrismaSessionRepository();
  const cartRepo = new PrismaCartRepository();
  const designRepo = new PrismaDesignRepository();
  const orderRepo = new PrismaOrderRepository();
  const catalogRepo = new PrismaCatalogRepository();
  const inventoryRepo = new PrismaInventoryRepository();
  const mfgRepo = new PrismaManufacturingRepository();
  const paymentRepo = new PrismaPaymentRepository();
  const shipmentRepo = new PrismaShipmentRepository();

  beforeEach(async () => {
    // Clean up tables to ensure test isolation
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.shipment.deleteMany({});
    await prisma.manufacturingJob.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.braceletDesign.deleteMany({});
    await prisma.inventoryLedger.deleteMany({});
    await prisma.priceHistory.deleteMany({});
    await prisma.variant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.material.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('PrismaUserRepository', () => {
    it('should create and retrieve a user with passwordHash', async () => {
      const email = 'test@example.com';
      const created = await userRepo.create({
        email,
        passwordHash: 'hashed_pw',
        name: 'Test User',
        role: 'CUSTOMER',
      });

      expect(created).toBeDefined();
      expect(created.email).toBe(email);
      expect(created.passwordHash).toBe('hashed_pw');
      expect(created.name).toBe('Test User');
      expect(created.role).toBe('CUSTOMER');

      const foundById = await userRepo.findById(created.id);
      expect(foundById).not.toBeNull();
      expect(foundById?.passwordHash).toBe('hashed_pw');
    });

    it('should update and soft-delete a user', async () => {
      const created = await userRepo.create({
        email: 'update@example.com',
        name: 'Old Name',
      });

      const updated = await userRepo.update(created.id, {
        name: 'New Name',
        role: 'ADMIN',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.role).toBe('ADMIN');

      const softDeleted = await userRepo.softDelete(created.id);
      expect(softDeleted.deletedAt).not.toBeNull();

      // findById and findByEmail should filter out soft-deleted users
      const found = await userRepo.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('PrismaSessionRepository', () => {
    it('should manage user sessions correctly', async () => {
      const user = await userRepo.create({ email: 'session@example.com' });
      
      const session = await sessionRepo.create({
        userId: user.id,
        token: 'test-token',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      });

      expect(session).toBeDefined();
      expect(session.token).toBe('test-token');

      const found = await sessionRepo.findByToken('test-token');
      expect(found).not.toBeNull();
      expect(found?.userId).toBe(user.id);

      await sessionRepo.deleteByToken('test-token');
      const deleted = await sessionRepo.findByToken('test-token');
      expect(deleted).toBeNull();
    });
  });

  describe('PrismaCartRepository', () => {
    it('should manage cart and items', async () => {
      const user = await userRepo.create({ email: 'cart@example.com' });
      const cart = await cartRepo.getCart(user.id, null);
      
      expect(cart.userId).toBe(user.id);
      expect(cart.items.length).toBe(0);

      const added = await cartRepo.addItem(cart.id, {
        type: 'CUSTOM_BRACELET',
        quantity: 1,
        configuration: '{"test":"yes"}',
      });

      expect(added.items.length).toBe(1);
      expect(added.items[0].type).toBe('CUSTOM_BRACELET');

      const updated = await cartRepo.updateItemQuantity(added.items[0].id, 2);
      expect(updated.items[0].quantity).toBe(2);

      const removed = await cartRepo.removeItem(updated.items[0].id);
      expect(removed.items.length).toBe(0);
    });

    it('should merge guest cart', async () => {
      const guestCart = await cartRepo.getCart(null, 'guest-123');
      const item = await cartRepo.addItem(guestCart.id, { type: 'BEAD', quantity: 5 });
      expect(item.items.length).toBe(1);

      const user = await userRepo.create({ email: 'guest-convert@example.com' });
      const mergedCart = await cartRepo.getCart(user.id, 'guest-123');
      
      expect(mergedCart.userId).toBe(user.id);
      expect(mergedCart.items.length).toBe(1);
    });
  });

  describe('PrismaDesignRepository', () => {
    it('should save and load bracelet designs', async () => {
      const design = await designRepo.save({
        name: 'My Cosmic Bracelet',
        items: JSON.stringify([{ variantId: '1', position: 0 }]),
        materialIds: JSON.stringify(['1']),
      });

      expect(design.id).toBeDefined();
      expect(design.name).toBe('My Cosmic Bracelet');

      const found = await designRepo.findById(design.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('My Cosmic Bracelet');
    });

    it('should handle updates and soft deletes of designs', async () => {
      const user = await userRepo.create({ email: 'designer@example.com' });
      const design = await designRepo.save({
        userId: user.id,
        name: 'First Iteration',
        items: '[]',
        materialIds: '[]',
      });

      const updated = await designRepo.save({
        id: design.id,
        userId: user.id,
        name: 'Second Iteration',
        items: '[1]',
        materialIds: '[2]',
      });

      expect(updated.name).toBe('Second Iteration');

      const recent = await designRepo.findRecentByUser(user.id);
      expect(recent.length).toBe(1);
      expect(recent[0].name).toBe('Second Iteration');

      await designRepo.softDelete(design.id);
      const found = await designRepo.findById(design.id);
      expect(found).toBeNull();
    });
  });

  describe('PrismaCatalogRepository', () => {
    it('should construct and query a modular product, variant, and material model', async () => {
      const mat = await catalogRepo.createMaterial({
        name: 'Lapis Lazuli',
        hardness: 5.5,
        color: 'Deep Blue',
      });

      const prod = await catalogRepo.createProduct({
        name: 'Lapis Round Bead',
        description: 'Polished lapis lazuli round bead',
        category: 'BEAD',
      });

      const variant = await catalogRepo.createVariant({
        productId: prod.id,
        materialId: mat.id,
        sku: 'BEAD-LAP-8MM',
        size: 8,
        quality: 'AAA',
      });

      expect(variant.sku).toBe('BEAD-LAP-8MM');

      const materialProps = await catalogRepo.getMaterialProperties(mat.id);
      expect(materialProps?.name).toBe('Lapis Lazuli');
      expect(materialProps?.hardness).toBe(5.5);

      // Create a pricing entry manually or let active variants test return it
      await prisma.priceHistory.create({
        data: {
          variantId: variant.id,
          price: 2.50,
        },
      });

      const activeVariants = await catalogRepo.getActiveVariants();
      expect(activeVariants.length).toBeGreaterThan(0);
      const matched = activeVariants.find(v => v.sku === 'BEAD-LAP-8MM');
      expect(matched).toBeDefined();
      expect(matched?.product.name).toBe('Lapis Round Bead');
      expect(matched?.material?.name).toBe('Lapis Lazuli');
      expect(matched?.pricing[0].price).toBe(2.50);
    });
  });

  describe('PrismaInventoryRepository', () => {
    it('should compute event-sourced inventory levels perfectly', async () => {
      const prod = await catalogRepo.createProduct({
        name: 'Spacer',
        description: 'Spacer',
        category: 'SPACER',
      });
      const variant = await catalogRepo.createVariant({
        productId: prod.id,
        sku: 'SPCR-TEST',
      });

      // Initial state: 0
      let stock = await inventoryRepo.getStockLevel(variant.id);
      expect(stock).toBe(0);

      // Replenish 100
      await inventoryRepo.replenishStock(variant.id, 100, 'First shipment');
      stock = await inventoryRepo.getStockLevel(variant.id);
      expect(stock).toBe(100);

      // Reserve 10
      await inventoryRepo.reserveStock(variant.id, 10, 'Checkout pending');
      stock = await inventoryRepo.getStockLevel(variant.id);
      expect(stock).toBe(90);

      // Release 5 of those
      await inventoryRepo.releaseStock(variant.id, 5, 'Cart updated');
      stock = await inventoryRepo.getStockLevel(variant.id);
      expect(stock).toBe(95);

      // Physically commit 5
      await inventoryRepo.commitStock(variant.id, 5, 'Shipped');
      stock = await inventoryRepo.getStockLevel(variant.id);
      expect(stock).toBe(90);
    });
  });

  describe('PrismaOrderRepository & Sub-modules', () => {
    it('should manage complete order lifecycles and historical aggregates', async () => {
      const user = await userRepo.create({ email: 'buyer@example.com' });
      
      const order = await orderRepo.create({
        userId: user.id,
        status: 'PENDING',
        totalAmount: 45.50,
        items: [
          {
            type: 'CUSTOM_BRACELET',
            quantity: 1,
            price: 45.50,
            configuration: JSON.stringify([{ id: '1' }]),
          },
        ],
      });

      expect(order.id).toBeDefined();
      expect(order.items.length).toBe(1);
      expect(order.totalAmount).toBe(45.50);

      // 1. Advance Order state
      await orderRepo.updateStatus(order.id, 'PAID');
      const orderCheck = await orderRepo.findById(order.id);
      expect(orderCheck?.status).toBe('PAID');

      // 2. Add Payment record
      const payment = await paymentRepo.create({
        orderId: order.id,
        provider: 'STRIPE',
        status: 'CAPTURED',
        amount: 45.50,
        referenceId: 'ch_stripe_123',
      });

      expect(payment.referenceId).toBe('ch_stripe_123');

      const paymentCheck = await paymentRepo.findByOrderId(order.id);
      expect(paymentCheck?.status).toBe('CAPTURED');

      // 3. Add Manufacturing Job
      const job = await mfgRepo.createJob(order.id, 'QUEUED');
      expect(job.status).toBe('QUEUED');

      await mfgRepo.assignWorker(job.id, 'artisan_1');
      await mfgRepo.advanceStep(job.id, 'STRINGING');

      const jobCheck = await mfgRepo.findById(job.id);
      expect(jobCheck?.status).toBe('STRINGING');
      expect(jobCheck?.workerId).toBe('artisan_1');

      // Check Queue
      const queue = await mfgRepo.getQueue('STRINGING');
      expect(queue.length).toBe(1);

      // 4. Add Shipment Label
      const shipment = await shipmentRepo.create({
        orderId: order.id,
        status: 'PREPARING',
        trackingNum: 'TRACK-123',
        carrier: 'DHL',
      });

      expect(shipment.trackingNum).toBe('TRACK-123');

      // 5. Query Full Aggregated Receipt
      const receipt = await orderRepo.getHistoricalReceipt(order.id);
      expect(receipt).not.toBeNull();
      expect(receipt?.status).toBe('PAID');
      expect(receipt?.items.length).toBe(1);
      expect(receipt?.payment?.referenceId).toBe('ch_stripe_123');
      expect(receipt?.shipments[0].carrier).toBe('DHL');
    });
  });
});
