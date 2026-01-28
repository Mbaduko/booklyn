import { API_BASE_URL } from '@/config';
import { User } from '@/types/library';

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

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch users');
  }

  return res.json();
}

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch user');
  }

  return res.json();
}
