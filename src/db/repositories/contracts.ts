// Plain TypeScript interfaces representing domain entities, fully decoupled from Prisma

export interface DomainUser {
  id: string;
  email: string;
  passwordHash: string | null;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DomainSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface DomainCart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainCartItem {
  id: string;
  cartId: string;
  type: string;
  quantity: number;
  configuration: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartAggregate extends DomainCart {
  items: DomainCartItem[];
}

export interface DomainProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DomainMaterial {
  id: string;
  name: string;
  hardness: number | null;
  density: number | null;
  color: string | null;
  properties: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainVariant {
  id: string;
  productId: string;
  materialId: string | null;
  sku: string;
  size: number | null;
  quality: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DomainInventoryLedger {
  id: string;
  variantId: string;
  type: string;
  quantity: number;
  notes: string | null;
  createdAt: Date;
}

export interface DomainPriceHistory {
  id: string;
  variantId: string;
  price: number;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

export interface DomainBraceletDesign {
  id: string;
  userId: string | null;
  name: string;
  items: string;
  materialIds: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DomainOrder {
  id: string;
  userId: string | null;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainOrderItem {
  id: string;
  orderId: string;
  type: string;
  quantity: number;
  price: number;
  configuration: string | null;
  metadata: string | null;
}

export interface DomainPayment {
  id: string;
  orderId: string;
  provider: string;
  status: string;
  amount: number;
  referenceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainManufacturingJob {
  id: string;
  orderId: string;
  status: string;
  workerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainShipment {
  id: string;
  orderId: string;
  status: string;
  trackingNum: string | null;
  carrier: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Complex aggregate types returned by repositories
export interface CatalogVariantAggregate extends DomainVariant {
  product: DomainProduct;
  material: DomainMaterial | null;
  pricing: DomainPriceHistory[];
}

export interface OrderReceiptAggregate extends DomainOrder {
  items: DomainOrderItem[];
  payment: DomainPayment | null;
  shipments: DomainShipment[];
}

export interface OrderWithItemsAggregate extends DomainOrder {
  items: DomainOrderItem[];
}

// Repository Interfaces

export interface IUserRepository {
  findById(id: string): Promise<DomainUser | null>;
  findByEmail(email: string): Promise<DomainUser | null>;
  create(data: { email: string; passwordHash?: string | null; name?: string; role?: string }): Promise<DomainUser>;
  update(id: string, data: Partial<Omit<DomainUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DomainUser>;
  softDelete(id: string): Promise<DomainUser>;
}

export interface ISessionRepository {
  create(data: { userId: string; token: string; expiresAt: Date }): Promise<DomainSession>;
  findByToken(token: string): Promise<DomainSession | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export interface ICartRepository {
  getCart(userId: string | null, sessionId: string | null): Promise<CartAggregate>;
  addItem(cartId: string, data: { type: string; quantity: number; configuration?: string | null }): Promise<CartAggregate>;
  updateItemQuantity(cartItemId: string, quantity: number): Promise<CartAggregate>;
  removeItem(cartItemId: string): Promise<CartAggregate>;
  clearCart(cartId: string): Promise<void>;
}

export interface IDesignRepository {
  save(data: { id?: string; userId?: string | null; name: string; items: string; materialIds: string }): Promise<DomainBraceletDesign>;
  findById(id: string): Promise<DomainBraceletDesign | null>;
  findRecentByUser(userId: string, limit?: number): Promise<DomainBraceletDesign[]>;
  softDelete(id: string): Promise<DomainBraceletDesign>;
}

export interface IOrderRepository {
  create(data: {
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
  }): Promise<OrderWithItemsAggregate>;
  updateStatus(orderId: string, status: string): Promise<DomainOrder>;
  getHistoricalReceipt(orderId: string): Promise<OrderReceiptAggregate | null>;
  findById(orderId: string): Promise<DomainOrder | null>;
}

export interface ICatalogRepository {
  getActiveVariants(): Promise<CatalogVariantAggregate[]>;
  getMaterialProperties(materialId: string): Promise<DomainMaterial | null>;
  createProduct(data: { name: string; description: string; category: string }): Promise<DomainProduct>;
  createVariant(data: { productId: string; materialId?: string | null; sku: string; size?: number | null; quality?: string | null }): Promise<DomainVariant>;
  createMaterial(data: { name: string; hardness?: number | null; density?: number | null; color?: string | null; properties?: string | null }): Promise<DomainMaterial>;
}

export interface IInventoryRepository {
  reserveStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger>;
  commitStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger>;
  releaseStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger>;
  replenishStock(variantId: string, quantity: number, notes?: string): Promise<DomainInventoryLedger>;
  getStockLevel(variantId: string): Promise<number>;
}

export interface IManufacturingRepository {
  createJob(orderId: string, initialStatus?: string): Promise<DomainManufacturingJob>;
  assignWorker(jobId: string, workerId: string | null): Promise<DomainManufacturingJob>;
  advanceStep(jobId: string, step: string): Promise<DomainManufacturingJob>;
  getQueue(status?: string): Promise<DomainManufacturingJob[]>;
  findById(jobId: string): Promise<DomainManufacturingJob | null>;
}

export interface IPaymentRepository {
  create(data: { orderId: string; provider: string; status: string; amount: number; referenceId?: string | null }): Promise<DomainPayment>;
  updateStatus(paymentId: string, status: string, referenceId?: string | null): Promise<DomainPayment>;
  findByOrderId(orderId: string): Promise<DomainPayment | null>;
}

export interface IShipmentRepository {
  create(data: { orderId: string; status: string; trackingNum?: string | null; carrier?: string | null }): Promise<DomainShipment>;
  updateStatus(shipmentId: string, status: string, trackingNum?: string | null): Promise<DomainShipment>;
  findByOrderId(orderId: string): Promise<DomainShipment[]>;
}

/** A ready-made piece sold as-is. See the ShopItem model in schema.prisma. */
export interface DomainShopItem {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number;
  status: string;
  stockQty: number;
  composition: string | null;
  sizeMm: number | null;
  wristMm: number | null;
  ease: number | null;
  heroImage: string | null;
  spinBasePath: string | null;
  spinFrameCount: number;
  galleryImages: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IShopItemRepository {
  /** Public listing - excludes DRAFT/ARCHIVED and soft-deleted rows. */
  listActive(): Promise<DomainShopItem[]>;
  findBySlug(slug: string): Promise<DomainShopItem | null>;
  findById(id: string): Promise<DomainShopItem | null>;
  /**
   * Decrements stock and flips status to SOLD_OUT at zero. Returns null when
   * there is not enough stock, so the caller can distinguish "sold out" from
   * "no such item" without a second read.
   */
  decrementStock(id: string, quantity: number): Promise<DomainShopItem | null>;
}
