import { prisma } from '../client';
import {
  DomainUser,
  DomainSession,
  DomainCart,
  DomainCartItem,
  CartAggregate,
  DomainBraceletDesign,
  DomainOrder,
  DomainOrderItem,
  DomainPayment,
  DomainManufacturingJob,
  DomainShipment,
  DomainProduct,
  DomainMaterial,
  DomainVariant,
  DomainInventoryLedger,
  CatalogVariantAggregate,
  OrderReceiptAggregate,
  OrderWithItemsAggregate,
  IUserRepository,
  ISessionRepository,
  ICartRepository,
  IDesignRepository,
  IOrderRepository,
  ICatalogRepository,
  IInventoryRepository,
  IManufacturingRepository,
  IPaymentRepository,
  IShipmentRepository,
  DomainShopItem,
  IShopItemRepository,
} from './contracts';

// 1. PrismaUserRepository
export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<DomainUser | null> {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return user;
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return user;
  }

  async create(data: { email: string; passwordHash?: string | null; name?: string; role?: string }): Promise<DomainUser> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash || null,
        name: data.name || null,
        role: data.role || 'CUSTOMER',
      },
    });
    return user;
  }

  async update(id: string, data: Partial<Omit<DomainUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DomainUser> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
        deletedAt: data.deletedAt,
      },
    });
    return user;
  }

  async softDelete(id: string): Promise<DomainUser> {
    const user = await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return user;
  }
}

// 1.5 PrismaSessionRepository
export class PrismaSessionRepository implements ISessionRepository {
  async create(data: { userId: string; token: string; expiresAt: Date }): Promise<DomainSession> {
    return await prisma.session.create({ data });
  }

  async findByToken(token: string): Promise<DomainSession | null> {
    return await prisma.session.findUnique({ where: { token } });
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.session.deleteMany({ where: { token } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }

  async deleteExpired(): Promise<void> {
    await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

// 1.6 PrismaCartRepository
export class PrismaCartRepository implements ICartRepository {
  private async getCartAggregate(cartId: string): Promise<CartAggregate> {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });
    if (!cart) throw new Error('Cart not found');
    return cart;
  }

  async getCart(userId: string | null, sessionId: string | null): Promise<CartAggregate> {
    let cart = await prisma.cart.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(sessionId ? [{ sessionId }] : []),
        ],
      },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          sessionId,
        },
        include: { items: true },
      });
    } else if (userId && !cart.userId) {
      // Merge guest cart to user cart
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { userId, sessionId: null },
        include: { items: true },
      });
    }

    return cart;
  }

  async addItem(cartId: string, data: { type: string; quantity: number; configuration?: string | null }): Promise<CartAggregate> {
    await prisma.cartItem.create({
      data: {
        cartId,
        type: data.type,
        quantity: data.quantity,
        configuration: data.configuration || null,
      },
    });
    return this.getCartAggregate(cartId);
  }

  async updateItemQuantity(cartItemId: string, quantity: number): Promise<CartAggregate> {
    const item = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
    return this.getCartAggregate(item.cartId);
  }

  async removeItem(cartItemId: string): Promise<CartAggregate> {
    const item = await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
    return this.getCartAggregate(item.cartId);
  }

  async clearCart(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

// 2. PrismaDesignRepository
export class PrismaDesignRepository implements IDesignRepository {
  async save(data: { id?: string; userId?: string | null; name: string; items: string; materialIds: string }): Promise<DomainBraceletDesign> {
    if (data.id) {
      const design = await prisma.braceletDesign.upsert({
        where: { id: data.id },
        update: {
          userId: data.userId || null,
          name: data.name,
          items: data.items,
          materialIds: data.materialIds,
        },
        create: {
          id: data.id,
          userId: data.userId || null,
          name: data.name,
          items: data.items,
          materialIds: data.materialIds,
        },
      });
      return design;
    } else {
      const design = await prisma.braceletDesign.create({
        data: {
          userId: data.userId || null,
          name: data.name,
          items: data.items,
          materialIds: data.materialIds,
        },
      });
      return design;
    }
  }

  async findById(id: string): Promise<DomainBraceletDesign | null> {
    const design = await prisma.braceletDesign.findFirst({
      where: { id, deletedAt: null },
    });
    return design;
  }

  async findRecentByUser(userId: string, limit = 10): Promise<DomainBraceletDesign[]> {
    const designs = await prisma.braceletDesign.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
    return designs;
  }

  async softDelete(id: string): Promise<DomainBraceletDesign> {
    const design = await prisma.braceletDesign.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return design;
  }
}

// 3. PrismaOrderRepository
export class PrismaOrderRepository implements IOrderRepository {
  async create(data: {
    userId?: string | null;
    status: string;
    totalAmount: number;
    items: {
      type: string;
      quantity: number;
      price: number;
      configuration?: string | null;
      metadata?: string | null;
    }[];
  }): Promise<OrderWithItemsAggregate> {
    const order = await prisma.order.create({
      data: {
        userId: data.userId || null,
        status: data.status,
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map(item => ({
            type: item.type,
            quantity: item.quantity,
            price: item.price,
            configuration: item.configuration || null,
            metadata: item.metadata || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    return order;
  }

  async updateStatus(orderId: string, status: string): Promise<DomainOrder> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return order;
  }

  async getHistoricalReceipt(orderId: string): Promise<OrderReceiptAggregate | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        shipments: true,
      },
    });
    return order;
  }

  async findById(orderId: string): Promise<DomainOrder | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    return order;
  }
}

// 4. PrismaCatalogRepository
export class PrismaCatalogRepository implements ICatalogRepository {
  async getActiveVariants(): Promise<CatalogVariantAggregate[]> {
    const variants = await prisma.variant.findMany({
      where: { deletedAt: null },
      include: {
        product: true,
        material: true,
        pricing: {
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    });
    return variants as CatalogVariantAggregate[];
  }

  async getMaterialProperties(materialId: string): Promise<DomainMaterial | null> {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });
    return material;
  }

  async createProduct(data: { name: string; description: string; category: string }): Promise<DomainProduct> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
      },
    });
    return product;
  }

  async createVariant(data: { productId: string; materialId?: string | null; sku: string; size?: number | null; quality?: string | null }): Promise<DomainVariant> {
    const variant = await prisma.variant.create({
      data: {
        productId: data.productId,
        materialId: data.materialId || null,
        sku: data.sku,
        size: data.size || null,
        quality: data.quality || null,
      },
    });
    return variant;
  }

  async createMaterial(data: { name: string; hardness?: number | null; density?: number | null; color?: string | null; properties?: string | null }): Promise<DomainMaterial> {
    const material = await prisma.material.create({
      data: {
        name: data.name,
        hardness: data.hardness || null,
        density: data.density || null,
        color: data.color || null,
        properties: data.properties || null,
      },
    });
    return material;
  }
}

// 5. PrismaInventoryRepository
export class PrismaInventoryRepository implements IInventoryRepository {
  async reserveStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger> {
    const ledger = await prisma.inventoryLedger.create({
      data: {
        variantId,
        type: 'RESERVE',
        quantity: -Math.abs(quantity),
        notes: notes || 'Stock reserved',
      },
    });
    return ledger;
  }

  async commitStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger> {
    const ledger = await prisma.inventoryLedger.create({
      data: {
        variantId,
        type: 'COMMIT',
        quantity: -Math.abs(quantity),
        notes: notes || 'Stock physically committed',
      },
    });
    return ledger;
  }

  async releaseStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger> {
    const ledger = await prisma.inventoryLedger.create({
      data: {
        variantId,
        type: 'RELEASE',
        quantity: Math.abs(quantity),
        notes: notes || 'Stock reservation released',
      },
    });
    return ledger;
  }

  async replenishStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger> {
    const ledger = await prisma.inventoryLedger.create({
      data: {
        variantId,
        type: 'REPLENISH',
        quantity: Math.abs(quantity),
        notes: notes || 'Stock replenishment',
      },
    });
    return ledger;
  }

  async getStockLevel(variantId: string): Promise<number> {
    const result = await prisma.inventoryLedger.aggregate({
      where: { variantId },
      _sum: {
        quantity: true,
      },
    });
    return result._sum.quantity || 0;
  }
}

// 6. PrismaManufacturingRepository
export class PrismaManufacturingRepository implements IManufacturingRepository {
  async createJob(orderId: string, initialStatus = 'QUEUED'): Promise<DomainManufacturingJob> {
    const job = await prisma.manufacturingJob.create({
      data: {
        orderId,
        status: initialStatus,
      },
    });
    return job;
  }

  async assignWorker(jobId: string, workerId: string | null): Promise<DomainManufacturingJob> {
    const job = await prisma.manufacturingJob.update({
      where: { id: jobId },
      data: { workerId },
    });
    return job;
  }

  async advanceStep(jobId: string, step: string): Promise<DomainManufacturingJob> {
    const job = await prisma.manufacturingJob.update({
      where: { id: jobId },
      data: { status: step },
    });
    return job;
  }

  async getQueue(status?: string): Promise<DomainManufacturingJob[]> {
    const jobQueue = await prisma.manufacturingJob.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'asc' },
    });
    return jobQueue;
  }

  async findById(jobId: string): Promise<DomainManufacturingJob | null> {
    const job = await prisma.manufacturingJob.findUnique({
      where: { id: jobId },
    });
    return job;
  }
}

// 7. PrismaPaymentRepository
export class PrismaPaymentRepository implements IPaymentRepository {
  async create(data: { orderId: string; provider: string; status: string; amount: number; referenceId?: string | null }): Promise<DomainPayment> {
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        status: data.status,
        amount: data.amount,
        referenceId: data.referenceId || null,
      },
    });
    return payment;
  }

  async updateStatus(paymentId: string, status: string, referenceId?: string | null): Promise<DomainPayment> {
    const updateData: any = { status };
    if (referenceId !== undefined) {
      updateData.referenceId = referenceId;
    }
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });
    return payment;
  }

  async findByOrderId(orderId: string): Promise<DomainPayment | null> {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });
    return payment;
  }
}

// 8. PrismaShipmentRepository
export class PrismaShipmentRepository implements IShipmentRepository {
  async create(data: { orderId: string; status: string; trackingNum?: string | null; carrier?: string | null }): Promise<DomainShipment> {
    const shipment = await prisma.shipment.create({
      data: {
        orderId: data.orderId,
        status: data.status,
        trackingNum: data.trackingNum || null,
        carrier: data.carrier || null,
      },
    });
    return shipment;
  }

  async updateStatus(shipmentId: string, status: string, trackingNum?: string | null): Promise<DomainShipment> {
    const updateData: any = { status };
    if (trackingNum !== undefined) {
      updateData.trackingNum = trackingNum;
    }
    const shipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: updateData,
    });
    return shipment;
  }

  async findByOrderId(orderId: string): Promise<DomainShipment[]> {
    const shipments = await prisma.shipment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return shipments;
  }
}

// 10. PrismaShopItemRepository
export class PrismaShopItemRepository implements IShopItemRepository {
  async listActive(): Promise<DomainShopItem[]> {
    return prisma.shopItem.findMany({
      where: { deletedAt: null, status: { in: ['ACTIVE', 'SOLD_OUT'] } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findBySlug(slug: string): Promise<DomainShopItem | null> {
    return prisma.shopItem.findFirst({ where: { slug, deletedAt: null } });
  }

  async findById(id: string): Promise<DomainShopItem | null> {
    return prisma.shopItem.findFirst({ where: { id, deletedAt: null } });
  }

  /**
   * Guarded decrement. The `stockQty: { gte: quantity }` predicate lives in
   * the WHERE clause rather than in a read-then-write, so two concurrent
   * confirmations cannot both pass a check and drive stock negative - the
   * second matches zero rows and throws, which we translate to null.
   */
  async decrementStock(id: string, quantity: number): Promise<DomainShopItem | null> {
    try {
      const updated = await prisma.shopItem.update({
        where: { id, stockQty: { gte: quantity } },
        data: { stockQty: { decrement: quantity } },
      });
      if (updated.stockQty <= 0 && updated.status === 'ACTIVE') {
        return prisma.shopItem.update({
          where: { id },
          data: { status: 'SOLD_OUT' },
        });
      }
      return updated;
    } catch {
      // No row matched the stock guard - insufficient stock or missing item.
      return null;
    }
  }
}
