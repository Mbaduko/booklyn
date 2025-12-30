export type UserRole = 'librarian' | 'client';

export type BorrowStatus = 'reserved' | 'borrowed' | 'due_soon' | 'overdue' | 'returned';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
  description?: string;
  publishedYear?: number;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  status: BorrowStatus;
  reservedAt: Date;
  reservationExpiresAt: Date;
  pickupDate?: Date;
  dueDate?: Date;
  returnDate?: Date;
  overduesDays?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface LibraryStats {
  totalBooks: number;
  totalUsers: number;
  activeBorrows: number;
  overdueBooks: number;
  mostBorrowedBooks: { bookId: string; count: number }[];
  borrowingTrends: { date: string; count: number }[];
}
