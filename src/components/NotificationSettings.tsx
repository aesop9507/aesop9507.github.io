import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationCategory, NotificationPriority } from '../types/notifications';

const NotificationSettings: React.FC = () => {
  const { settings, updateSettings } = useNotifications();

  const handleUpdate = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  // 푸시 알림 권한 요청
  const requestPushPermission = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleUpdate('pushEnabled', true);
      }
    }
  };

  // 컴포넌트 마운트 시 푸시 권한 확인
  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">알림 설정</h2>

        {/* 알림 유형 */}
        <section className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">알림 유형</h3>
          <div className="space-y-3">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">푸시 알림</h4>
                <p className="text-sm text-gray-500">브라우저 푸시 알림 수신</p>
              </div>
              <div className="flex items-center space-x-3">
                {!('Notification' in window) && (
                  <span className="text-sm text-gray-400">지원하지 않음</span>
                )}
                {Notification.permission === 'default' && (
                  <button
                    onClick={requestPushPermission}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    권한 요청
                  </button>
                )}
                {Notification.permission === 'denied' && (
                  <span className="text-sm text-red-600">거부됨</span>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushEnabled}
                    onChange={(e) => handleUpdate('pushEnabled', e.target.checked)}
                    disabled={Notification.permission !== 'granted'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">이메일 알림</h4>
                <p className="text-sm text-gray-500">이메일로 알림 수신</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleUpdate('email', e.target.value)}
                  placeholder="이메일 주소"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => handleUpdate('emailEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">SMS 알림</h4>
                <p className="text-sm text-gray-500">문자 메시지로 알림 수신</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => handleUpdate('phone', e.target.value)}
                  placeholder="전화번호"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsEnabled}
                    onChange={(e) => handleUpdate('smsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리 설정 */}
        <section className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">알림 카테고리</h3>
          <div className="space-y-3">
            {Object.entries(settings.categories).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {key === 'system' && '시스템'}
                    {key === 'stock' && '주식'}
                    {key === 'portfolio' && '포트폴리오'}
                    {key === 'alert' && '알림'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {key === 'system' && '시스템 관련 알림'}
                    {key === 'stock' && '주식 가격 및 관련 정보'}
                    {key === 'portfolio' && '포트폴리오 성과 및 업데이트'}
                    {key === 'alert' && '사용자 설정 알림'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      handleUpdate('categories', {
                        ...settings.categories,
                        [key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* 우선순위 설정 */}
        <section className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">우선순위 설정</h3>
          <div className="space-y-3">
            {Object.entries(settings.priorities).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {key === 'low' && '낮음'}
                    {key === 'medium' && '중간'}
                    {key === 'high' && '높음'}
                    {key === 'urgent' && '긴급'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {key === 'low' && '일반 정보성 알림'}
                    {key === 'medium' && '중요한 업데이트'}
                    {key === 'high' && '긴급한 알림'}
                    {key === 'urgent' && '즉시 확인이 필요한 알림'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      handleUpdate('priorities', {
                        ...settings.priorities,
                        [key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* 방해 금지 시간 */}
        <section>
          <h3 className="text-lg font-medium text-gray-800 mb-4">방해 금지 시간</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">방해 금지 모드</h4>
                <p className="text-sm text-gray-500">지정된 시간 동안 알림을 받지 않음</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={(e) =>
                    handleUpdate('quietHours', {
                      ...settings.quietHours,
                      enabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {settings.quietHours.enabled && (
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) =>
                      handleUpdate('quietHours', {
                        ...settings.quietHours,
                        start: e.target.value,
                      })
                    }
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) =>
                      handleUpdate('quietHours', {
                        ...settings.quietHours,
                        end: e.target.value,
                      })
                    }
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationSettings;
