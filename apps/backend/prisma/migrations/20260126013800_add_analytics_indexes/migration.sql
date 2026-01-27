-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE INDEX "orders_createdAt_status_idx" ON "orders"("createdAt", "status");

-- CreateIndex
CREATE INDEX "products_categoryId_published_idx" ON "products"("categoryId", "published");

-- CreateIndex
CREATE INDEX "products_inventory_idx" ON "products"("inventory");
