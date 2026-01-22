/**
 * OrderStatusBadge Component
 * Sprint 6: Order Management Enhancement - FE-24
 * 
 * Displays order status with color coding and sizing options
 */

import React from 'react';

export type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'CONFIRMED' 
  | 'FAILED';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<OrderStatus, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-gray-200', text: 'text-gray-800' },
  PROCESSING: { bg: 'bg-blue-200', text: 'text-blue-800' },
  SHIPPED: { bg: 'bg-purple-200', text: 'text-purple-800' },
  DELIVERED: { bg: 'bg-green-200', text: 'text-green-800' },
  CANCELLED: { bg: 'bg-red-200', text: 'text-red-800' },
  CONFIRMED: { bg: 'bg-indigo-200', text: 'text-indigo-800' },
  FAILED: { bg: 'bg-orange-200', text: 'text-orange-800' },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  // Normalize status to uppercase and provide fallback
  const normalizedStatus = (status?.toString().toUpperCase() || 'PENDING') as OrderStatus;
  const config = statusConfig[normalizedStatus] || statusConfig.PENDING;
  const { bg, text } = config;
  const sizeClasses = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${bg} ${text} ${sizeClasses}`}
    >
      {normalizedStatus}
    </span>
  );
};

export default OrderStatusBadge;
