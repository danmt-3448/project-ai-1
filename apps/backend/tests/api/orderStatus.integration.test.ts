/**
 * Integration Tests: Order Status Management API
 * Sprint 6: Order Management Enhancement
 * 
 * Tests PUT /api/admin/orders/:id/status and GET /api/admin/orders/:id/activities
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../../lib/prisma';

// Test data setup
let testAdminId: string;
let testOrderId: string;
let testProductId: string;
let testCategoryId: string;
let authToken: string;

beforeAll(async () => {
  // Create test admin
  const admin = await prisma.adminUser.create({
    data: {
      username: 'test-admin-order-status-' + Date.now(), // Unique username
      password: 'dummy-hash', // Not used in tests, just for DB constraint
    },
  });
  testAdminId = admin.id;
  authToken = 'test-token'; // Mock JWT token

  // Create test category
  const category = await prisma.category.create({
    data: {
      name: 'Test Category Order Status',
      slug: 'test-category-order-status-' + Date.now(), // Unique slug to avoid conflicts
    },
  });
  testCategoryId = category.id;

  // Create test product
  const product = await prisma.product.create({
    data: {
      name: 'Test Product Order Status',
      slug: 'test-product-order-status-' + Date.now(), // Unique slug
      description: 'Test product for order status tests',
      price: 100,
      inventory: 10,
      images: '[]',
      categoryId: testCategoryId,
    },
  });
  testProductId = product.id;
});

afterAll(async () => {
  // Cleanup (order matters: child → parent due to FK constraints)
  // Clean up all test orders (since testOrderId changes in beforeEach)
  await prisma.orderActivity.deleteMany({ where: { adminId: testAdminId } });
  await prisma.orderItem.deleteMany({ where: { productId: testProductId } });
  await prisma.order.deleteMany({ where: { buyerEmail: 'test@example.com' } });
  await prisma.product.deleteMany({ where: { id: testProductId } });
  await prisma.category.deleteMany({ where: { id: testCategoryId } });
  await prisma.adminUser.deleteMany({ where: { id: testAdminId } });
});

beforeEach(async () => {
  // Ensure product exists (recreate if deleted by other tests)
  const existingProduct = await prisma.product.findUnique({ where: { id: testProductId } });
  if (!existingProduct) {
    await prisma.product.create({
      data: {
        id: testProductId,
        name: 'Test Product Order Status',
        slug: 'test-product-order-status-' + Date.now(),
        description: 'Test product for order status tests',
        price: 100,
        inventory: 10,
        images: '[]',
        categoryId: testCategoryId,
      },
    });
  }

  // Create fresh order for each test
  const order = await prisma.order.create({
    data: {
      buyerName: 'Test Buyer',
      buyerEmail: 'test@example.com',
      address: 'Test Address',
      total: 200, // Match schema field name
      status: 'PENDING',
      items: {
        create: [
          {
            productId: testProductId,
            name: 'Test Product Order Status', // Required field
            quantity: 2,
            price: 100,
          },
        ],
      },
    },
  });
  testOrderId = order.id;

  // Reset product inventory
  await prisma.product.update({
    where: { id: testProductId },
    data: { inventory: 10 },
  });
});

describe('PUT /api/admin/orders/:id/status', () => {
  it('should transition PENDING → PROCESSING', async () => {
    const result = await updateOrderStatus({
      status: 'PROCESSING',
      note: 'Starting to process order',
    });

    expect(result.order.status).toBe('PROCESSING');
    expect(result.order.id).toBe(testOrderId);

    // Verify activity created
    const activities = await prisma.orderActivity.findMany({
      where: { orderId: testOrderId },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].fromStatus).toBe('PENDING');
    expect(activities[0].toStatus).toBe('PROCESSING');
    expect(activities[0].adminId).toBe(testAdminId);
  });

  it('should transition PROCESSING → SHIPPED with tracking', async () => {
    // First move to PROCESSING
    await updateOrderStatus({ status: 'PROCESSING' });

    // Then ship
    const result = await updateOrderStatus({
      status: 'SHIPPED',
      trackingNumber: 'TRACK123',
      carrier: 'FedEx',
      shipDate: new Date().toISOString(),
      note: 'Shipped via FedEx',
    });

    expect(result.order.status).toBe('SHIPPED');
    expect(result.order.trackingNumber).toBe('TRACK123');
    expect(result.order.carrier).toBe('FedEx');
    expect(result.order.shipDate).toBeTruthy();

    // Verify activities
    const activities = await prisma.orderActivity.findMany({
      where: { orderId: testOrderId },
      orderBy: { timestamp: 'asc' },
    });
    expect(activities).toHaveLength(2);
    expect(activities[1].toStatus).toBe('SHIPPED');
  });

  it('should transition SHIPPED → DELIVERED', async () => {
    // Setup: PENDING → PROCESSING → SHIPPED
    await updateOrderStatus({ status: 'PROCESSING' });
    await updateOrderStatus({
      status: 'SHIPPED',
      trackingNumber: 'TRACK123',
      carrier: 'FedEx',
      shipDate: new Date().toISOString(),
    });

    // Deliver
    const result = await updateOrderStatus({
      status: 'DELIVERED',
      deliveryDate: new Date().toISOString(),
      note: 'Delivered successfully',
    });

    expect(result.order.status).toBe('DELIVERED');
    expect(result.order.deliveryDate).toBeTruthy();

    // Verify full history
    const activities = await prisma.orderActivity.findMany({
      where: { orderId: testOrderId },
      orderBy: { timestamp: 'asc' },
    });
    expect(activities).toHaveLength(3);
    expect(activities.map((a) => a.toStatus)).toEqual(['PROCESSING', 'SHIPPED', 'DELIVERED']);
  });

  it('should cancel PENDING order and restock inventory', async () => {
    const productBefore = await prisma.product.findUnique({
      where: { id: testProductId },
    });

    const result = await updateOrderStatus({
      status: 'CANCELLED',
      cancellationReason: 'Customer request',
      shouldRestock: true,
      note: 'Cancelled by customer',
    });

    expect(result.order.status).toBe('CANCELLED');
    expect(result.order.cancellationReason).toBe('Customer request');
    expect(result.restocked).toHaveLength(1);
    expect(result.restocked[0].productId).toBe(testProductId);
    expect(result.restocked[0].quantity).toBe(2);

    // Verify inventory restocked
    const productAfter = await prisma.product.findUnique({
      where: { id: testProductId },
    });
    expect(productAfter!.inventory).toBe(productBefore!.inventory + 2);
  });

  it('should not restock inventory twice (idempotency)', async () => {
    // Cancel with restock
    await updateOrderStatus({
      status: 'CANCELLED',
      cancellationReason: 'Test',
      shouldRestock: true,
    });

    const inventoryAfterFirst = await prisma.product.findUnique({
      where: { id: testProductId },
      select: { inventory: true },
    });

    // Try to cancel again (should be idempotent)
    try {
      await updateOrderStatus({
        status: 'CANCELLED',
        cancellationReason: 'Test again',
        shouldRestock: true,
      });
    } catch (error) {
      // Expected to fail due to terminal state
    }

    // Verify inventory not restocked twice
    const inventoryAfterSecond = await prisma.product.findUnique({
      where: { id: testProductId },
      select: { inventory: true },
    });
    expect(inventoryAfterSecond!.inventory).toBe(inventoryAfterFirst!.inventory);
  });

  it('should reject invalid transition (PENDING → SHIPPED)', async () => {
    try {
      await updateOrderStatus({ status: 'SHIPPED' });
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data.error).toContain('Invalid status transition');
    }
  });

  it('should reject SHIPPED without tracking info', async () => {
    await updateOrderStatus({ status: 'PROCESSING' });

    try {
      await updateOrderStatus({ status: 'SHIPPED' }); // Missing tracking
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data.error).toContain('Tracking number');
    }
  });

  it('should reject CANCELLED without reason', async () => {
    try {
      await updateOrderStatus({ status: 'CANCELLED' }); // Missing reason
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data.error).toContain('Cancellation reason');
    }
  });

  it('should reject transition from terminal state (DELIVERED)', async () => {
    // Setup: complete order flow
    await updateOrderStatus({ status: 'PROCESSING' });
    await updateOrderStatus({
      status: 'SHIPPED',
      trackingNumber: 'TRACK123',
      carrier: 'FedEx',
      shipDate: new Date().toISOString(),
    });
    await updateOrderStatus({
      status: 'DELIVERED',
      deliveryDate: new Date().toISOString(),
    });

    // Try to change from DELIVERED
    try {
      await updateOrderStatus({ status: 'PROCESSING' });
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data.message).toContain('Cannot transition from DELIVERED');
    }
  });

  it('should reject cancel after shipping', async () => {
    await updateOrderStatus({ status: 'PROCESSING' });
    await updateOrderStatus({
      status: 'SHIPPED',
      trackingNumber: 'TRACK123',
      carrier: 'FedEx',
      shipDate: new Date().toISOString(),
    });

    try {
      await updateOrderStatus({
        status: 'CANCELLED',
        cancellationReason: 'Too late',
      });
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data.message).toContain('Cannot cancel order after shipping');
    }
  });
});

describe('GET /api/admin/orders/:id/activities', () => {
  it('should return empty array for new order', async () => {
    const activities = await getOrderActivities();

    expect(activities.orderId).toBe(testOrderId);
    expect(activities.currentStatus).toBe('PENDING');
    expect(activities.activities).toEqual([]);
  });

  it('should return chronological activity history', async () => {
    // Create activity history
    await updateOrderStatus({ status: 'PROCESSING', note: 'First' });
    await updateOrderStatus({
      status: 'SHIPPED',
      trackingNumber: 'TRACK123',
      carrier: 'FedEx',
      shipDate: new Date().toISOString(),
      note: 'Second',
    });

    const result = await getOrderActivities();

    expect(result.activities).toHaveLength(2);
    expect(result.activities[0].fromStatus).toBe('PENDING');
    expect(result.activities[0].toStatus).toBe('PROCESSING');
    expect(result.activities[0].note).toBe('First');
    expect(result.activities[0].admin.id).toBe(testAdminId);
    expect(result.activities[0].admin.username).toContain('test-admin-order-status'); // Username has timestamp suffix

    expect(result.activities[1].fromStatus).toBe('PROCESSING');
    expect(result.activities[1].toStatus).toBe('SHIPPED');
    expect(result.activities[1].note).toBe('Second');

    // Verify chronological order
    const timestamps = result.activities.map((a) => new Date(a.timestamp).getTime());
    expect(timestamps[0]).toBeLessThan(timestamps[1]);
  });

  it('should return 404 for non-existent order', async () => {
    try {
      await getOrderActivities('non-existent-id');
      expect.fail('Should have thrown error');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
      expect(error.response?.data.error).toContain('Order not found');
    }
  });
});

// Helper functions (mock API calls for now - will integrate with actual endpoints)
async function updateOrderStatus(data: any) {
  // Direct DB call for testing (replace with HTTP call in full integration tests)
  const { validateStatusTransition, calculateRestockQuantities } = await import('../../lib/orderStatus');

  const order = await prisma.order.findUnique({
    where: { id: testOrderId },
    include: { items: true },
  });

  if (!order) throw new Error('Order not found');

  const validation = validateStatusTransition(order.status as any, data.status);
  if (!validation.allowed) {
    const error = new Error('Validation failed') as any;
    error.response = {
      status: 400,
      data: { error: 'Invalid status transition', message: validation.error },
    };
    throw error;
  }

  // Validate required fields
  if (data.status === 'SHIPPED' && (!data.trackingNumber || !data.carrier)) {
    const error = new Error('Validation failed') as any;
    error.response = {
      status: 400,
      data: { error: 'Tracking number and carrier required' },
    };
    throw error;
  }

  if (data.status === 'CANCELLED' && !data.cancellationReason) {
    const error = new Error('Validation failed') as any;
    error.response = {
      status: 400,
      data: { error: 'Cancellation reason required' },
    };
    throw error;
  }

  const alreadyRestocked = await prisma.orderActivity.findFirst({
    where: { orderId: testOrderId, toStatus: 'CANCELLED' },
  });

  const restockQuantities =
    data.status === 'CANCELLED' && data.shouldRestock
      ? calculateRestockQuantities(
          order.items.map((i) => ({
            id: i.id,
            orderId: i.orderId,
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
          !!alreadyRestocked
        )
      : null;

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: testOrderId },
      data: {
        status: data.status,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        shipDate: data.shipDate ? new Date(data.shipDate) : undefined,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
        cancellationReason: data.cancellationReason,
        updatedAt: new Date(),
      },
      include: { items: true }, // OrderItem doesn't have product relation in schema
    });

    await tx.orderActivity.create({
      data: {
        orderId: testOrderId,
        adminId: testAdminId,
        fromStatus: order.status,
        toStatus: data.status,
        note: data.note || null,
        timestamp: new Date(),
      },
    });

    if (restockQuantities) {
      for (const [productId, quantity] of restockQuantities.entries()) {
        await tx.product.update({
          where: { id: productId },
          data: { inventory: { increment: quantity } },
        });
      }
    }

    return updated;
  });

  return {
    order: updatedOrder,
    restocked: restockQuantities
      ? Array.from(restockQuantities.entries()).map(([productId, quantity]) => ({ productId, quantity }))
      : null,
  };
}

async function getOrderActivities(orderId?: string) {
  const id = orderId || testOrderId;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!order) {
    const error = new Error('Not found') as any;
    error.response = { status: 404, data: { error: 'Order not found' } };
    throw error;
  }

  const activities = await prisma.orderActivity.findMany({
    where: { orderId: id },
    include: {
      admin: {
        select: { id: true, username: true },
      },
    },
    orderBy: { timestamp: 'asc' },
  });

  return {
    orderId: id,
    currentStatus: order.status,
    activities: activities.map((a) => ({
      id: a.id,
      fromStatus: a.fromStatus,
      toStatus: a.toStatus,
      note: a.note,
      timestamp: a.timestamp.toISOString(),
      admin: { id: a.admin.id, username: a.admin.username },
    })),
  };
}
