/**
 * OrderStatusBadge Component Tests (TDD)
 * Sprint 6: Order Management Enhancement - FE-24
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OrderStatusBadge from '../../components/OrderStatusBadge';

describe('OrderStatusBadge', () => {
  it('should render PENDING with gray style', () => {
    render(<OrderStatusBadge status="PENDING" />);
    const badge = screen.getByText('PENDING');
    expect(badge).toBeTruthy();
    // Badge should have gray background
    expect(badge.className).toContain('bg-gray-');
  });

  it('should render PROCESSING with blue style', () => {
    render(<OrderStatusBadge status="PROCESSING" />);
    const badge = screen.getByText('PROCESSING');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('bg-blue-');
  });

  it('should render SHIPPED with purple style', () => {
    render(<OrderStatusBadge status="SHIPPED" />);
    const badge = screen.getByText('SHIPPED');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('bg-purple-');
  });

  it('should render DELIVERED with green style', () => {
    render(<OrderStatusBadge status="DELIVERED" />);
    const badge = screen.getByText('DELIVERED');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('bg-green-');
  });

  it('should render CANCELLED with red style', () => {
    render(<OrderStatusBadge status="CANCELLED" />);
    const badge = screen.getByText('CANCELLED');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('bg-red-');
  });

  it('should support small size prop', () => {
    render(<OrderStatusBadge status="PENDING" size="sm" />);
    const badge = screen.getByText('PENDING');
    expect(badge.className).toContain('text-xs');
  });

  it('should support medium size prop (default)', () => {
    render(<OrderStatusBadge status="PENDING" />);
    const badge = screen.getByText('PENDING');
    expect(badge.className).toContain('text-sm');
  });

  it('should support large size prop', () => {
    render(<OrderStatusBadge status="PENDING" size="lg" />);
    const badge = screen.getByText('PENDING');
    expect(badge.className).toContain('text-base');
  });

  it('should handle CONFIRMED status', () => {
    render(<OrderStatusBadge status="CONFIRMED" />);
    const badge = screen.getByText('CONFIRMED');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('bg-indigo-');
  });

  it('should handle FAILED status', () => {
    render(<OrderStatusBadge status="FAILED" />);
    const badge = screen.getByText('FAILED');
    expect(badge).toBeTruthy();
    expect(badge.className).toContain('bg-orange-');
  });
});
