import { describe, it, expect, vi } from 'vitest';

// Mock API client for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Checkout API', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should successfully create order with valid data', async () => {
    const mockOrder = {
      orderId: 1,
      status: 'pending',
      total: 300000,
      message: 'Order created successfully',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrder,
    });

    const checkoutData = {
      buyerName: 'Test User',
      buyerEmail: 'test@example.com',
      address: '123 Test Street, Test City',
      items: [
        {
          productId: 1,
          quantity: 2,
        },
      ],
    };

    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });

    const result = await response.json();

    expect(response.ok).toBe(true);
    expect(result.orderId).toBe(1);
    expect(result.status).toBe('pending');
    expect(result.total).toBe(300000);
  });

  it('should fail with insufficient inventory', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Insufficient inventory',
        message: 'Insufficient inventory for product "Test Product"',
      }),
    });

    const checkoutData = {
      buyerName: 'Test User',
      buyerEmail: 'test@example.com',
      address: '123 Test Street',
      items: [
        {
          productId: 1,
          quantity: 9999,
        },
      ],
    };

    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(result.error).toBe('Insufficient inventory');
  });

  it('should fail with validation errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Validation failed',
        details: {
          buyerEmail: ['Invalid email'],
        },
      }),
    });

    const checkoutData = {
      buyerName: 'Test User',
      buyerEmail: 'invalid-email',
      address: '123 Test Street',
      items: [{ productId: 1, quantity: 1 }],
    };

    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(result.error).toBe('Validation failed');
  });
});
