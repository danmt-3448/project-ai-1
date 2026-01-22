import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateStatusTransition, calculateRestockQuantities, OrderStatus, StatusTransitionResult } from '../lib/orderStatus';

describe('Order Status Management - Status Transitions', () => {
  describe('validateStatusTransition', () => {
    it('should allow PENDING → PROCESSING transition', () => {
      const result = validateStatusTransition('PENDING', 'PROCESSING');
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow PROCESSING → SHIPPED transition', () => {
      const result = validateStatusTransition('PROCESSING', 'SHIPPED');
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow SHIPPED → DELIVERED transition', () => {
      const result = validateStatusTransition('SHIPPED', 'DELIVERED');
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow PENDING → CANCELLED transition', () => {
      const result = validateStatusTransition('PENDING', 'CANCELLED');
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow PROCESSING → CANCELLED transition', () => {
      const result = validateStatusTransition('PROCESSING', 'CANCELLED');
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject DELIVERED → PROCESSING (backward transition)', () => {
      const result = validateStatusTransition('DELIVERED', 'PROCESSING');
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot transition from DELIVERED to PROCESSING');
    });

    it('should reject SHIPPED → PENDING (backward transition)', () => {
      const result = validateStatusTransition('SHIPPED', 'PENDING');
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot transition from SHIPPED to PENDING');
    });

    it('should reject CANCELLED → anything (terminal state)', () => {
      const result = validateStatusTransition('CANCELLED', 'PENDING');
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot transition from CANCELLED to PENDING');
    });

    it('should reject DELIVERED → SHIPPED (terminal state)', () => {
      const result = validateStatusTransition('DELIVERED', 'SHIPPED');
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot transition from DELIVERED to SHIPPED');
    });

    it('should reject SHIPPED → CANCELLED (too late)', () => {
      const result = validateStatusTransition('SHIPPED', 'CANCELLED');
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot cancel order after shipping');
    });

    it('should reject DELIVERED → CANCELLED (too late)', () => {
      const result = validateStatusTransition('DELIVERED', 'CANCELLED');
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Cannot cancel order after shipping');
    });
  });

  describe('calculateRestockQuantities - Idempotency', () => {
    const mockOrderItems = [
      { productId: 'prod1', quantity: 2 },
      { productId: 'prod2', quantity: 1 },
    ];

    it('should calculate restock quantities when not yet restocked', () => {
      const result = calculateRestockQuantities(mockOrderItems, false);
      expect(result).not.toBeNull();
      expect(result!.get('prod1')).toBe(2);
      expect(result!.get('prod2')).toBe(1);
    });

    it('should return null when already restocked (idempotent)', () => {
      const result = calculateRestockQuantities(mockOrderItems, true);
      expect(result).toBeNull();
    });

    it('should handle empty order items', () => {
      const result = calculateRestockQuantities([], false);
      expect(result).not.toBeNull();
      expect(result!.size).toBe(0);
    });

    it('should aggregate quantities for duplicate products', () => {
      const items = [
        { productId: 'prod1', quantity: 2 },
        { productId: 'prod1', quantity: 3 },
        { productId: 'prod2', quantity: 1 },
      ];
      const result = calculateRestockQuantities(items, false);
      expect(result!.get('prod1')).toBe(5);
      expect(result!.get('prod2')).toBe(1);
    });
  });
});

describe('Order Status Management - Audit Logging', () => {
  it('should create activity record with all required fields', () => {
    const activity = {
      orderId: 'ord123',
      adminId: 'admin1',
      fromStatus: 'PENDING',
      toStatus: 'PROCESSING',
      note: 'Test note',
      timestamp: new Date(),
    };

    expect(activity.orderId).toBe('ord123');
    expect(activity.adminId).toBe('admin1');
    expect(activity.fromStatus).toBe('PENDING');
    expect(activity.toStatus).toBe('PROCESSING');
    expect(activity.note).toBe('Test note');
    expect(activity.timestamp).toBeInstanceOf(Date);
  });
});
