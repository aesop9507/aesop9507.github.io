import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification, NotificationSettings, WebSocketMessage } from '../types/notifications';

const WS_URL = process.env.GATSBY_WS_URL || 'ws://localhost:8080/ws';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: false,
    smsEnabled: false,
    email: '',
    categories: {
      system: true,
      stock: true,
      portfolio: true,
      alert: true,
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      urgent: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket 연결
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === 'notification' && message.data) {
          const newNotification: Notification = {
            ...message.data,
            createdAt: new Date(message.data.createdAt || Date.now()),
            read: false,
          };

          // 중복 알림 방지
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === newNotification.id);
            if (exists) return prev;
            return [newNotification, ...prev];
          });

          // 브라우저 푸시 알림 (권한이 있고 푸시가 활성화된 경우)
          if (settings.pushEnabled && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/icon.png',
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [settings.pushEnabled]);

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 알림 읽음 표시
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // 모든 알림 읽음 표시
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // 알림 삭제
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // 모든 알림 삭제
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
  };
};
