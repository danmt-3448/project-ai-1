/**
 * OrderActivityTimeline Component
 * Sprint 6: Order Management Enhancement - FE-30
 * 
 * Displays chronological order status change history with admin attribution
 */

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import OrderStatusBadge from './OrderStatusBadge';

export interface OrderActivityTimelineProps {
  orderId: string;
  token: string;
}

interface Activity {
  id: string;
  fromStatus: string;
  toStatus: string;
  note: string | null;
  timestamp: string;
  admin: { id: string; username: string };
}

const OrderActivityTimeline: React.FC<OrderActivityTimelineProps> = ({ orderId, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.adminGetOrderActivities(token, orderId);
        setCurrentStatus(data.currentStatus);
        setActivities(data.activities);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [orderId, token]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading activity history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading activities</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity history yet for this order.
      </div>
    );
  }

  return (
    <div data-testid="activity-timeline" className="space-y-4">
      {/* Current Status */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <span className="text-sm font-medium text-gray-700">Current Status:</span>
        <OrderStatusBadge status={currentStatus as any} />
      </div>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}

            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
              </div>

              {/* Activity content */}
              <div className="flex-1 pb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  {/* Status transition */}
                  <div className="flex items-center gap-2 mb-2">
                    <OrderStatusBadge status={activity.fromStatus as any} size="sm" />
                    <span className="text-gray-400">→</span>
                    <OrderStatusBadge status={activity.toStatus as any} size="sm" />
                  </div>

                  {/* Note */}
                  {activity.note && (
                    <p className="text-gray-700 text-sm mb-2">{activity.note}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      <span className="font-medium text-gray-700">{activity.admin.username}</span>
                    </span>
                    <span>•</span>
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderActivityTimeline;
