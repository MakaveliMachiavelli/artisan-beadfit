# Final Backend Architecture Blueprint (Milestone C0.5)

## 1. Entity Relationship Model (ERD)

**Core Architectural Rules:**
*   **Immutability:** Financial and historical records (`Order`, `OrderItem`, `Payment`, `ManufacturingJob`, `Shipment`) are append-only. They never change after reaching a terminal state.
*   **Historical Retention:** `OrderItem` snapshots the exact pricing, JSON configuration, and product metadata at the moment of purchase. If a product price or name changes tomorrow, the historical receipt remains accurate.
*   **Soft Deletes:** Applied to `User`, `Product`, `Variant`, and `BraceletDesign` to preserve referential integrity.
*   **Cascade Rules:** Restrict deletion if foreign keys exist. Cascade only for highly coupled child entities (e.g., deleting a User cascades to their Auth Tokens, but not their Orders).

**Cardinality & Relationships:**
*   `User` (1) ── (0..*) `Order` (Optional, guests can order)
*   `User` (1) ── (0..*) `BraceletDesign`
*   `Order` (1) ── (1..*) `OrderItem` (Required)
*   `Order` (1) ── (1) `Payment` (Optional until checkout)
*   `Order` (1) ── (1..*) `ManufacturingJob` (One job per custom item)
*   `Order` (1) ── (1..*) `Shipment` (Supports split fulfillment)
*   `Product` (1) ── (1..*) `Variant` (e.g., Amethyst Bead -> 8mm AAA)
*   `Variant` (1) ── (1) `InventoryLedger`
*   `Variant` (1) ── (0..*) `PriceHistory`

---

## 2. Normalization Review

**Target Analysis: `BraceletDesign`**
Should the bead sequence be stored as Normalized Rows (`DesignItem` table) or Denormalized JSON (`JSONB` column)?

**Recommendation:** **Denormalized `JSONB` for Structure, with Computed Indexes.**
*   **Why not Normalized:** A typical bracelet contains 30-50 beads. A user might iterate their design 20 times during a session. Normalizing this creates 1,000+ rows of garbage data per session. Relational joins on 50 beads per design would destroy read performance.
*   **The JSONB Approach:** We store the exact sequence (`[{ variantId: 'x', position: 1 }, ...]`) in a `JSONB` column. 
*   **Queryability:** To answer questions like "Show me all designs using Amethyst", we maintain a denormalized, GIN-indexed `material_ids` array column updated via database triggers or application logic on save.

**Overall Normalization Strategy:**
*   **Normalized:** Identity, Orders, Product Catalog, Manufacturing Jobs.
*   **Denormalized (JSONB):** Bracelet spatial configurations, Payment Gateway metadata, Analytics blobs.
*   **Event-Sourced (Ledger):** Inventory, Pricing History.

---

## 3. Product Model Review

The current flat `CatalogItem` model is insufficient for scale. We must split it into a normalized relational hierarchy:

1.  **Product:** The conceptual item (e.g., "Amethyst Bead", "Gold Spacer").
2.  **Variant (SKU):** The physical unit being sold (e.g., "Amethyst Bead - 8mm - AAA Quality").
3.  **Material:** The physical and metaphysical properties (e.g., Mohs Hardness 7.0, Density, Color Harmony, Energy Properties).
4.  **Inventory Ledger:** Event-sourced tracking of stock levels per Variant to prevent overselling.
5.  **Price Ledger:** Time-bound pricing records (Current Price, Sale Price, Effective Dates).

**Business Value:** Allows robust inventory forecasting, dynamic pricing, material compatibility validation across sizes, and seamless catalog expansion.

---

## 4. Manufacturing Domain

**Decision:** Manufacturing **MUST** be its own Bounded Context.

Making a custom bracelet is not picking a box off a shelf; it is an active assembly process.
*   **Trigger:** The `OrderPaid` event triggers the creation of `ManufacturingJob`s.
*   **Entities:**
    *   `ManufacturingJob`: Tracks a single custom item assembly.
    *   `AssemblyStep`: Picking -> Stringing -> Knotting -> Quality Inspection -> Packaging.
    *   `WorkbenchAssignment`: Maps a job to a specific artisan or station.
    *   `ProductionQueue`: Prioritizes jobs based on shipping SLAs and VIP status.
*   **Integration:** The Manufacturing context subscribes to Order events. Once a `ManufacturingJob` reaches the `Packaged` step, it publishes a `JobCompleted` event, which the Shipping context consumes to generate labels.

---

## 5. Event Architecture

The system will utilize Domain Events to decouple bounded contexts.

*   **Design Context**
    *   `DesignCreated`, `DesignUpdated`, `DesignForked`, `DesignSaved`
*   **Checkout Context**
    *   `CartCreated`, `CartItemAdded`, `CheckoutInitiated`, `AddressValidated`
*   **Payment Context**
    *   `PaymentAuthorized`, `PaymentCaptured`, `PaymentFailed`, `RefundIssued`
*   **Order Context**
    *   `OrderPlaced`, `OrderConfirmed` (Post-Payment), `OrderCancelled`
*   **Inventory Context**
    *   `StockReserved` (At checkout), `StockReleased` (On cancel), `StockDepleted`, `StockReplenished`
*   **Manufacturing Context**
    *   `ManufacturingJobCreated`, `AssemblyStarted`, `QualityCheckPassed`, `JobPackaged`
*   **Shipping Context**
    *   `ShipmentLabelCreated`, `ShipmentDispatched`, `ShipmentDelivered`

---

## 6. API Contracts (REST/JSON)

*Note: Strict contracts defining the inputs and outputs.*

*   `POST /api/v1/designs` - Save a new workspace design.
*   `GET /api/v1/designs/:id` - Load a specific design workspace.
*   `GET /api/v1/catalog/variants` - Fetch the hierarchical catalog.
*   `POST /api/v1/checkout/initiate` - Lock inventory, generate payment intent.
*   `POST /api/v1/webhooks/payment` - Idempotent webhook for payment success/failure.
*   `GET /api/v1/orders/me` - Fetch authenticated user's order history.
*   `GET /api/v1/manufacturing/queue` - (Admin) Fetch prioritized assembly queue.
*   `PATCH /api/v1/manufacturing/jobs/:id/status` - (Admin) Advance assembly workflow.

---

## 7. Repository Contracts

Interfaces defining persistence boundaries (Abstracted away from Prisma/SQL):

*   `IDesignRepository`: `save(Design)`, `findById(id)`, `findRecentByUser(userId)`
*   `IOrderRepository`: `createFromCart(cartId)`, `updateStatus(orderId, status)`, `getHistoricalReceipt(orderId)`
*   `ICatalogRepository`: `getActiveVariants()`, `getMaterialProperties(materialId)`
*   `IInventoryRepository`: `reserveStock(variantId, quantity, lockDuration)`, `commitStock(variantId, quantity)`
*   `IManufacturingRepository`: `createJob(orderItem)`, `assignWorker(jobId, workerId)`, `advanceStep(jobId, step)`

---

## 8. Backend Architecture Review

**Evaluation:**
*   **Microservices:** Overkill. Network latency between Cart, Inventory, and Pricing will degrade the checkout experience. Operational complexity will stall feature velocity.
*   **Serverless (Functions):** Connection pooling issues with relational databases. Unpredictable cold starts ruin the premium, instantaneous feel of the Studio.

**Recommendation:** **Modular Monolith (Node.js/TypeScript).**
*   **Why:** A single deployable container offering the simplicity of a monolith, but internally organized into strict Bounded Contexts (Orders, Catalog, Manufacturing). Modules communicate via internal memory buses (Domain Events) rather than HTTP. 
*   **Scaling:** Scales horizontally with stateless containers. Database handles concurrency.

---

## 9. Self-Critique & Risk Assessment

Attempting to disprove the architecture:

1.  **Hidden Assumption:** Assuming PostgreSQL JSONB indexing is fast enough for complex material searches. 
    *   *Risk:* If we eventually need faceted search (e.g., "Bracelets with Amethyst AND Silver Spacers under $100"), JSONB queries will bottleneck.
    *   *Mitigation:* We may need to sync catalog and popular designs to an Elasticsearch/Meilisearch cluster later. The Modular Monolith allows us to easily tap into the `DesignSaved` event to do this.
2.  **Scaling Bottleneck:** `IInventoryRepository.reserveStock()`. Real-time stock reservation during high-traffic drops can cause database row locks and checkout timeouts.
    *   *Mitigation:* Implement a Redis-backed distributed lock for inventory reservation before touching PostgreSQL.
3.  **Migration Risk:** Migrating the existing flat `CatalogItem` frontend state to the new `Product -> Variant -> Material` structure will break the 3D Studio if not phased correctly.
    *   *Mitigation:* Backend must supply an adapter layer in the API that maps the new hierarchical data into the flat structure the frontend expects, until the frontend is ready to upgrade.
4.  **Operational Risk:** Modular Monoliths degrade into spaghetti code if boundaries aren't enforced.
    *   *Mitigation:* Strict linting rules and folder structure (`/src/modules/...`). A module may only import from another module's `/public` or `/contracts` folder.
