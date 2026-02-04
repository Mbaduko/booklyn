import { API_BASE_URL } from '@/config';
import { Notification } from '@/types/library';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('library_token');
}

// Helper to create authenticated headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// Helper to convert API response to frontend types
function convertAPIToFrontend(apiNotification: any): Notification {
  return {
    ...apiNotification,
    createdAt: new Date(apiNotification.createdAt),
  };
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!userId) {
    throw new Error('userId is required');
  }

  const res = await fetch(`${API_BASE_URL}/notifications?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.message || 'Failed to fetch notifications');
  }
  
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Failed to parse response data');
  }
  
  // Convert API response to frontend types and sort from newest to oldest
  const notifications = Array.isArray(data) ? data.map(convertAPIToFrontend) : [];
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  if (!notificationId) {
    throw new Error('notificationId is required');
  }

  const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.error || 'Failed to mark notification as read');
  }
  
  const data = await res.json();
  return convertAPIToFrontend(data.notification);
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.error || 'Failed to mark all notifications as read');
  }
  
  const data = await res.json();
  return { count: data.count };
}
