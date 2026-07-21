-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "composition" TEXT,
    "sizeMm" INTEGER,
    "wristMm" INTEGER,
    "ease" INTEGER,
    "heroImage" TEXT,
    "spinBasePath" TEXT,
    "spinFrameCount" INTEGER NOT NULL DEFAULT 0,
    "galleryImages" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_slug_key" ON "ShopItem"("slug");

-- CreateIndex
CREATE INDEX "ShopItem_slug_idx" ON "ShopItem"("slug");

-- CreateIndex
CREATE INDEX "ShopItem_status_idx" ON "ShopItem"("status");
