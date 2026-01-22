/**
 * OrderActivityTimeline Component Tests (TDD)
 * Sprint 6: Order Management Enhancement - FE-30
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderActivityTimeline from '../../components/OrderActivityTimeline';

// Mock API
vi.mock('../../lib/api', () => ({
  api: {
    adminGetOrderActivities: vi.fn(),
  },
}));

import { api } from '../../lib/api';

const mockActivities = {
  orderId: 'order-123',
  currentStatus: 'SHIPPED',
  activities: [
    {
      id: 'act-1',
      fromStatus: 'PENDING',
      toStatus: 'PROCESSING',
      note: 'Order confirmed',
      timestamp: '2026-01-20T10:00:00Z',
      admin: { id: 'admin-1', username: 'admin1' },
    },
    {
      id: 'act-2',
      fromStatus: 'PROCESSING',
      toStatus: 'SHIPPED',
      note: 'Shipped via FedEx',
      timestamp: '2026-01-21T14:30:00Z',
      admin: { id: 'admin-2', username: 'admin2' },
    },
  ],
};

describe('OrderActivityTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(api.adminGetOrderActivities).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it('should render empty state when no activities', async () => {
    vi.mocked(api.adminGetOrderActivities).mockResolvedValue({
      orderId: 'order-123',
      currentStatus: 'PENDING',
      activities: [],
    });

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText(/no activity/i)).toBeTruthy();
    });
  });

  it('should render activities in chronological order', async () => {
    vi.mocked(api.adminGetOrderActivities).mockResolvedValue(mockActivities);

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);

    await waitFor(() => {
      expect(screen.getAllByText('PROCESSING').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SHIPPED').length).toBeGreaterThan(0);
    });

    // Verify first activity
    expect(screen.getByText('Order confirmed')).toBeTruthy();
    expect(screen.getByText('admin1')).toBeTruthy();

    // Verify second activity
    expect(screen.getByText('Shipped via FedEx')).toBeTruthy();
    expect(screen.getByText('admin2')).toBeTruthy();
  });

  it('should display formatted timestamps', async () => {
    vi.mocked(api.adminGetOrderActivities).mockResolvedValue(mockActivities);

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);

    await waitFor(() => {
      // Should format timestamps (e.g., "Jan 20, 2026")
      expect(screen.getByText(/Jan 20, 2026/i)).toBeTruthy();
      expect(screen.getByText(/Jan 21, 2026/i)).toBeTruthy();
    });
  });

  it('should show transition arrows (from → to)', async () => {
    vi.mocked(api.adminGetOrderActivities).mockResolvedValue(mockActivities);

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);

    await waitFor(() => {
      const container = screen.getByTestId('activity-timeline');
      expect(container.textContent).toContain('→');
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(api.adminGetOrderActivities).mockRejectedValue(
      new Error('Failed to fetch activities')
    );

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeTruthy();
      expect(screen.getByText(/failed to fetch activities/i)).toBeTruthy();
    });
  });

  it('should call API with correct parameters', async () => {
    vi.mocked(api.adminGetOrderActivities).mockResolvedValue(mockActivities);

    render(<OrderActivityTimeline orderId="order-456" token="my-token" />);

    await waitFor(() => {
      expect(api.adminGetOrderActivities).toHaveBeenCalledWith('my-token', 'order-456');
    });
  });

  it('should not render notes when null', async () => {
    vi.mocked(api.adminGetOrderActivities).mockResolvedValue({
      orderId: 'order-123',
      currentStatus: 'PROCESSING',
      activities: [
        {
          id: 'act-1',
          fromStatus: 'PENDING',
          toStatus: 'PROCESSING',
          note: null,
          timestamp: '2026-01-20T10:00:00Z',
          admin: { id: 'admin-1', username: 'admin1' },
        },
      ],
    });

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);

    await waitFor(() => {
      expect(screen.getAllByText('PROCESSING').length).toBeGreaterThan(0);
    });

    // Note should not be rendered
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('should display current status badge', async () => {
    vi.mocked(api.adminGetOrderActivities).mockResolvedValue(mockActivities);

    render(<OrderActivityTimeline orderId="order-123" token="test-token" />);

    await waitFor(() => {
      // Should show current status at the top
      const currentStatusBadge = screen.getAllByText('SHIPPED')[0];
      expect(currentStatusBadge).toBeTruthy();
    });
  });
});
