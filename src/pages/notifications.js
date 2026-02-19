import React, { useState } from 'react';
import NotificationList from '../components/NotificationList';
import NotificationSettings from '../components/NotificationSettings';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">알림 센터</h1>
          <p className="text-gray-600">
            실시간 알림을 확인하고 알림 설정을 관리하세요.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab('list')}
              className={`
                flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === 'list'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              알림 목록
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`
                flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              알림 설정
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'list' ? <NotificationList /> : <NotificationSettings />}
      </div>
    </div>
  );
};

export default NotificationsPage;
