import React from 'react';
import { Notification, NotificationPriority, NotificationCategory } from '../types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  [NotificationPriority.LOW]: 'bg-blue-100 text-blue-800',
  [NotificationPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [NotificationPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [NotificationPriority.URGENT]: 'bg-red-100 text-red-800',
};

const categoryIcons = {
  [NotificationCategory.SYSTEM]: '⚙️',
  [NotificationCategory.STOCK]: '📈',
  [NotificationCategory.PORTFOLIO]: '💼',
  [NotificationCategory.ALERT]: '🔔',
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const handleActionClick = () => {
    onMarkAsRead(notification.id);
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all duration-200
        ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200 shadow-sm'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Category Icon */}
          <div className="text-2xl flex-shrink-0">
            {categoryIcons[notification.category] || '📢'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4
                className={`
                  font-semibold text-sm
                  ${notification.read ? 'text-gray-600' : 'text-gray-900'}
                `}
              >
                {notification.title}
              </h4>
              <span
                className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${priorityColors[notification.priority]}
                `}
              >
                {notification.priority.toUpperCase()}
              </span>
            </div>

            <p
              className={`
                text-sm mb-2
                ${notification.read ? 'text-gray-500' : 'text-gray-700'}
              `}
            >
              {notification.message}
            </p>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">
                {formatDate(notification.createdAt)}
              </span>
              <span className="text-xs text-gray-400">
                {notification.type.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="읽음 표시"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}

          {notification.actionUrl && (
            <button
              onClick={handleActionClick}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="바로가기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}

          <button
            onClick={() => onDelete(notification.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
