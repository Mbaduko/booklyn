import { Book, BorrowRecord, Notification } from '@/types/library';

export const mockBooks: Book[] = [
  {
    id: 'b1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    isbn: '9780743273565',
    totalCopies: 5,
    availableCopies: 2,
    publishedYear: 1925,
    description: 'A classic novel set in the Roaring Twenties.'
  },
  {
    id: 'b2',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    isbn: '9780553380163',
    totalCopies: 3,
    availableCopies: 1,
    publishedYear: 1988,
    description: 'A popular-science book on cosmology.'
  },
  {
    id: 'b3',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'Non-Fiction',
    isbn: '9780062316097',
    totalCopies: 4,
    availableCopies: 4,
    publishedYear: 2011,
    description: 'A brief history of humankind.'
  },
  {
    id: 'b4',
    title: 'World History',
    author: 'Jane Smith',
    category: 'History',
    isbn: '9781234567890',
    totalCopies: 2,
    availableCopies: 0,
    publishedYear: 2000,
    description: 'A comprehensive history book.'
  },
];

export const mockBorrowRecords: BorrowRecord[] = [
  {
    id: 'r1',
    bookId: 'b1',
    userId: '2',
    status: 'borrowed',
    reservedAt: new Date('2023-12-20'),
    reservationExpiresAt: new Date('2023-12-22'),
    pickupDate: new Date('2023-12-21'),
    dueDate: new Date('2023-12-28'),
  },
  {
    id: 'r2',
    bookId: 'b2',
    userId: '2',
    status: 'reserved',
    reservedAt: new Date('2023-12-25'),
    reservationExpiresAt: new Date('2023-12-27'),
  },
  {
    id: 'r3',
    bookId: 'b4',
    userId: '3',
    status: 'overdue',
    reservedAt: new Date('2023-12-10'),
    reservationExpiresAt: new Date('2023-12-12'),
    pickupDate: new Date('2023-12-11'),
    dueDate: new Date('2023-12-18'),
    overduesDays: 12,
  },
];

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
