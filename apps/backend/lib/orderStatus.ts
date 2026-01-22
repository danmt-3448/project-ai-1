/**
 * Order Status Management Business Logic
 * 
 * Implements status transition validation and inventory restock calculations
 * per Sprint 6 specifications.
 */

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED' | 'FAILED';

export interface StatusTransitionResult {
  allowed: boolean;
  error?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

/**
 * Validates whether a status transition is allowed based on business rules
 * 
 * Allowed transitions:
 * - PENDING → PROCESSING
 * - PROCESSING → SHIPPED
 * - SHIPPED → DELIVERED
 * - PENDING → CANCELLED
 * - PROCESSING → CANCELLED
 * 
 * Rejected:
 * - Any backward transition
 * - Changes from terminal states (DELIVERED, CANCELLED)
 * - CANCELLED from SHIPPED or DELIVERED
 */
export function validateStatusTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
): StatusTransitionResult {
  // Special case: Cannot cancel after shipping (check this first)
  if (toStatus === 'CANCELLED' && (fromStatus === 'SHIPPED' || fromStatus === 'DELIVERED')) {
    return {
      allowed: false,
      error: 'Cannot cancel order after shipping'
    };
  }

  // Terminal states cannot be changed
  if (fromStatus === 'DELIVERED' || fromStatus === 'CANCELLED') {
    return {
      allowed: false,
      error: `Cannot transition from ${fromStatus} to ${toStatus}`
    };
  }

  // Define allowed transitions
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [], // Terminal state
    CANCELLED: [], // Terminal state
    CONFIRMED: ['PROCESSING'], // In case this status is used
    FAILED: ['PENDING'] // Allow retry from failed
  };

  const allowed = allowedTransitions[fromStatus]?.includes(toStatus) ?? false;

  if (!allowed) {
    return {
      allowed: false,
      error: `Cannot transition from ${fromStatus} to ${toStatus}`
    };
  }

  return { allowed: true };
}

/**
 * Calculates inventory restock quantities when canceling an order
 * 
 * Features:
 * - Idempotent: returns null if order already restocked
 * - Aggregates duplicate products in the same order
 * - Returns Map<productId, quantity> for atomic inventory updates
 * 
 * @param orderItems - Array of items in the order
 * @param alreadyRestocked - Whether inventory was already restored
 * @returns Map of productId to quantity to restock, or null if idempotent check fails
 */
export function calculateRestockQuantities(
  orderItems: OrderItem[],
  alreadyRestocked: boolean
): Map<string, number> | null {
  // Idempotency check: if already restocked, return null
  if (alreadyRestocked) {
    return null;
  }

  // Aggregate quantities by productId
  const restockMap = new Map<string, number>();

  for (const item of orderItems) {
    const currentQty = restockMap.get(item.productId) || 0;
    restockMap.set(item.productId, currentQty + item.quantity);
  }

  return restockMap;
}
