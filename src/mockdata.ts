import { Notification } from '@/types/library';

// Books are now fetched from the real API (src/api/books.ts)
/*
export const mockBooks: Book[] = [
  ...
];
*/

// Borrow records are now fetched from the real API (src/api/borrows.ts)
/*
export const mockBorrowRecords: BorrowRecord[] = [
  ...
];
*/

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '2',
    title: 'Book Due Soon',
    message: 'The Great Gatsby is due in 2 days.',
    type: 'warning',
    read: false,
    createdAt: new Date('2023-12-26'),
  },
  {
    id: 'n2',
    userId: '2',
    title: 'Reservation Confirmed',
    message: 'Your reservation for A Brief History of Time is confirmed.',
    type: 'success',
    read: true,
    createdAt: new Date('2023-12-25'),
  },
  {
    id: 'n3',
    userId: '1',
    title: 'Overdue Book',
    message: 'World History is overdue.',
    type: 'error',
    read: false,
    createdAt: new Date('2023-12-20'),
  },
];
