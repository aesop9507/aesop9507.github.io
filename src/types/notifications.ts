// 알림 타입 정의
export enum NotificationType {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationCategory {
  SYSTEM = 'system',
  STOCK = 'stock',
  PORTFOLIO = 'portfolio',
  ALERT = 'alert'
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  email: string;
  phone?: string;
  categories: {
    system: boolean;
    stock: boolean;
    portfolio: boolean;
    alert: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export interface WebSocketMessage {
  type: 'notification' | 'heartbeat' | 'error';
  data?: any;
  timestamp?: number;
}
