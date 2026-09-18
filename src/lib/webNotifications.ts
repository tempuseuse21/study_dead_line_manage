import { playNotificationChime } from './utils';

export interface WebsiteToast {
  id: string;
  type: 'announcement' | 'task' | 'deadline' | 'system';
  title: string;
  message: string;
  authorName?: string;
  subjectName?: string;
  subjectCode?: string;
  subjectColor?: string;
  priority?: string;
  dueDate?: string;
  actionUrl?: string;
  taskId?: string;
  announcementId?: string;
  timestamp: string;
}

// Global listener registry for in-app toast alerts
type ToastListener = (toast: WebsiteToast) => void;
const toastListeners: Set<ToastListener> = new Set();

export function subscribeToWebsiteToasts(listener: ToastListener): () => void {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

export function emitWebsiteToast(toast: Omit<WebsiteToast, 'id' | 'timestamp'>): WebsiteToast {
  const fullToast: WebsiteToast = {
    ...toast,
    id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };

  toastListeners.forEach(listener => {
    try {
      listener(fullToast);
    } catch (e) {
      console.error('Error in toast listener', e);
    }
  });

  return fullToast;
}

// Cross-tab broadcast channel for instant multi-user simulation
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('studysync_website_feed');
  }
} catch {}

export function broadcastPostEvent(event: {
  type: 'NEW_TASK' | 'NEW_ANNOUNCEMENT' | 'TASK_STATUS_CHANGED';
  payload: any;
}) {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(event);
    }
    // Also use localStorage storage event as fallback across tabs
    localStorage.setItem('studysync_last_broadcast_event', JSON.stringify({
      ...event,
      _time: Date.now()
    }));
  } catch {}
}

export function subscribeToBroadcastEvents(handler: (event: any) => void): () => void {
  const handleBcMessage = (ev: MessageEvent) => {
    if (ev.data) handler(ev.data);
  };

  const handleStorageEvent = (ev: StorageEvent) => {
    if (ev.key === 'studysync_last_broadcast_event' && ev.newValue) {
      try {
        const parsed = JSON.parse(ev.newValue);
        handler(parsed);
      } catch {}
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBcMessage);
  }
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Check current browser desktop notification permission status
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Prompt user to grant browser notification permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('Failed to request notification permission', error);
    return Notification.permission;
  }
}

/**
 * Send an OS-level desktop notification via HTML5 Notification API
 */
export function sendBrowserNotification(title: string, options?: {
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  onClick?: () => void;
}) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notif = new Notification(title, {
      body: options?.body,
      icon: options?.icon || 'https://api.iconify.design/lucide:bell.svg?color=%232563eb',
      badge: 'https://api.iconify.design/lucide:book-open.svg?color=%232563eb',
      tag: options?.tag || `notif_${Date.now()}`,
      requireInteraction: options?.requireInteraction || false,
      silent: false
    });

    if (options?.onClick) {
      notif.onclick = () => {
        window.focus();
        options.onClick?.();
        notif.close();
      };
    } else {
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }

    // Auto close after 8 seconds
    setTimeout(() => {
      try {
        notif.close();
      } catch {}
    }, 8000);

    return notif;
  } catch (err) {
    console.warn('Failed to display browser notification:', err);
    return null;
  }
}

/**
 * Send a unified notification across all channels:
 * 1. OS Browser Desktop notification (if enabled)
 * 2. In-App Floating Toast Alert (always visible in app)
 * 3. Audio Chime (Web Audio API)
 * 4. Multi-tab broadcast channel
 */
export function triggerWebsiteNotification({
  title,
  message,
  type = 'system',
  authorName,
  subjectName,
  subjectCode,
  subjectColor,
  priority = 'normal',
  dueDate,
  taskId,
  announcementId,
  chimeType = 'success',
  broadcast = true
}: {
  title: string;
  message: string;
  type?: 'announcement' | 'task' | 'deadline' | 'system';
  authorName?: string;
  subjectName?: string;
  subjectCode?: string;
  subjectColor?: string;
  priority?: string;
  dueDate?: string;
  taskId?: string;
  announcementId?: string;
  chimeType?: 'success' | 'warning' | 'alert';
  broadcast?: boolean;
}) {
  // 1. Play Audio Sound
  playNotificationChime(chimeType);

  // 2. Trigger In-App Floating Toast
  const toast = emitWebsiteToast({
    type,
    title,
    message,
    authorName,
    subjectName,
    subjectCode,
    subjectColor,
    priority,
    dueDate,
    taskId,
    announcementId
  });

  // 3. Trigger Browser Desktop Notification
  const browserTitle = type === 'announcement' 
    ? `📢 CR Notice: ${title}` 
    : type === 'task' 
    ? `📋 New Assignment: ${title}` 
    : title;
  
  const browserBody = authorName 
    ? `Posted by ${authorName}: ${message}` 
    : message;

  sendBrowserNotification(browserTitle, {
    body: browserBody,
    tag: toast.id,
    requireInteraction: priority === 'urgent'
  });

  // 4. Broadcast to other tabs if requested
  if (broadcast) {
    broadcastPostEvent({
      type: type === 'announcement' ? 'NEW_ANNOUNCEMENT' : 'NEW_TASK',
      payload: {
        title,
        message,
        authorName,
        subjectName,
        subjectCode,
        priority,
        dueDate,
        taskId,
        announcementId
      }
    });
  }

  return toast;
}
