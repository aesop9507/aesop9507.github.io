import React, { useState } from 'react';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationCategory, NotificationPriority } from '../types/notifications';

interface NotificationListProps {
  maxItems?: number;
}

const NotificationList: React.FC<NotificationListProps> = ({ maxItems }) => {
  const {
    notifications,
    unreadCount,
    isConnected,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
  } = useNotifications();

  const [filter, setFilter] = useState<{
    category: NotificationCategory | 'all';
    priority: NotificationPriority | 'all';
  }>({
    category: 'all',
    priority: 'all',
  });

  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // 필터링된 알림 목록
  const filteredNotifications = notifications
    .filter((n) => {
      if (filter.category !== 'all' && n.category !== filter.category) return false;
      if (filter.priority !== 'all' && n.priority !== filter.priority) return false;
      if (showOnlyUnread && n.read) return false;
      return true;
    })
    .slice(0, maxItems);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">알림</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                `}
              >
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  읽지 않음 {unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                모두 읽음
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                모두 삭제
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUnread}
                onChange={(e) => setShowOnlyUnread(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">읽지 않은 알림만</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as NotificationCategory | 'all' })}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">모든 카테고리</option>
              <option value={NotificationCategory.SYSTEM}>시스템</option>
              <option value={NotificationCategory.STOCK}>주식</option>
              <option value={NotificationCategory.PORTFOLIO}>포트폴리오</option>
              <option value={NotificationCategory.ALERT}>알림</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value as NotificationPriority | 'all' })}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">모든 우선순위</option>
              <option value={NotificationPriority.LOW}>낮음</option>
              <option value={NotificationPriority.MEDIUM}>중간</option>
              <option value={NotificationPriority.HIGH}>높음</option>
              <option value={NotificationPriority.URGENT}>긴급</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-gray-500">
              {showOnlyUnread ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
