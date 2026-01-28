import { API_BASE_URL } from '@/config';
import { Book } from '@/types/library';

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('library_token');
}

// Helper to create authenticated headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${API_BASE_URL}/books`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch books');
  }

  return res.json();
}

export async function getBook(id: string): Promise<Book> {
  const res = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch book');
  }

  return res.json();
}

export async function createBook(formData: FormData): Promise<Book> {
  const res = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.error || error.message || 'Failed to create book');
  }

  return res.json();
}

export async function updateBook(id: string, formData: FormData): Promise<Book> {
  const res = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.error || error.message || 'Failed to update book');
  }

  return res.json();
}
