import { API_BASE_URL } from '@/config';
import { BorrowRecord } from '@/types/library';

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
function convertAPIToFrontend(apiRecord: any): BorrowRecord {
  return {
    ...apiRecord,
    reservedAt: new Date(apiRecord.reservedAt),
    reservationExpiresAt: new Date(apiRecord.reservationExpiresAt),
    pickupDate: apiRecord.pickupDate ? new Date(apiRecord.pickupDate) : undefined,
    dueDate: apiRecord.dueDate ? new Date(apiRecord.dueDate) : undefined,
    returnDate: apiRecord.returnDate ? new Date(apiRecord.returnDate) : undefined,
  };
}

export async function getBorrowRecords(): Promise<BorrowRecord[]> {
  const res = await fetch(`${API_BASE_URL}/borrows`, {
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
    throw new Error(error.message || 'Failed to fetch borrow records');
  }
  
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Failed to parse response data');
  }
  
  // Convert API response to frontend types
  return Array.isArray(data) ? data.map(convertAPIToFrontend) : [];
}

export async function reserveBook(bookId: string): Promise<BorrowRecord> {
  const res = await fetch(`${API_BASE_URL}/borrows/${bookId}/reserve`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.error || error.message || 'Failed to reserve book');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Failed to parse response data');
  }
  
  // Convert API response to frontend types
  return convertAPIToFrontend(data);
}

export async function confirmPickup(borrowId: string): Promise<BorrowRecord> {
  const res = await fetch(`${API_BASE_URL}/borrows/${borrowId}/pickup`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.error || error.message || 'Failed to confirm book pickup');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Failed to parse response data');
  }
  
  // Convert API response to frontend types
  return convertAPIToFrontend(data);
}

export async function getBorrowRecord(id: string): Promise<BorrowRecord> {
  const res = await fetch(`${API_BASE_URL}/borrows/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }
    throw new Error(error.message || 'Failed to fetch borrow record');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Failed to parse response data');
  }
  
  // Convert API response to frontend types
  return convertAPIToFrontend(data);
}
