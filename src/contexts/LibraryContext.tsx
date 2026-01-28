import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, BorrowRecord, User, Notification, BorrowStatus } from '@/types/library';
import { addDays, isAfter, isBefore, differenceInDays, subDays } from 'date-fns';
import { getUsers } from '@/api/users';
import { getBooks } from '@/api/books';

interface LibraryContextType {
  books: Book[];
  users: User[];
  borrowRecords: BorrowRecord[];
  notifications: Notification[];
  isLoadingUsers: boolean;
  usersError: string | null;
  refetchUsers: () => Promise<void>;
  isLoadingBooks: boolean;
  booksError: string | null;
  refetchBooks: () => Promise<void>;
  
  // Book operations
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  
  // User operations
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Borrow operations
  reserveBook: (bookId: string, userId: string) => void;
  confirmPickup: (recordId: string, loanDurationDays?: number) => void;
  confirmReturn: (recordId: string) => void;
  
  // Notification operations
  markNotificationRead: (id: string) => void;
  
  // Helpers
  getBookById: (id: string) => Book | undefined;
  getUserById: (id: string) => User | undefined;
  getBorrowStatus: (record: BorrowRecord) => BorrowStatus;
  getUserBorrowRecords: (userId: string) => BorrowRecord[];
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Mock initial data
// Books are now fetched from API instead of hardcoded data

// Users are now fetched from API instead of hardcoded data

const initialBorrowRecords: BorrowRecord[] = [
  {
    id: 'b1',
    bookId: '1',
    userId: '2',
    status: 'borrowed',
    reservedAt: subDays(new Date(), 10),
    reservationExpiresAt: subDays(new Date(), 9),
    pickupDate: subDays(new Date(), 9),
    dueDate: addDays(new Date(), 5),
  },
  {
    id: 'b2',
    bookId: '3',
    userId: '2',
    status: 'overdue',
    reservedAt: subDays(new Date(), 20),
    reservationExpiresAt: subDays(new Date(), 19),
    pickupDate: subDays(new Date(), 19),
    dueDate: subDays(new Date(), 5),
  },
  {
    id: 'b3',
    bookId: '5',
    userId: '3',
    status: 'reserved',
    reservedAt: new Date(),
    reservationExpiresAt: addDays(new Date(), 2),
  },
  {
    id: 'b4',
    bookId: '2',
    userId: '4',
    status: 'borrowed',
    reservedAt: subDays(new Date(), 5),
    reservationExpiresAt: subDays(new Date(), 4),
    pickupDate: subDays(new Date(), 4),
    dueDate: addDays(new Date(), 2),
  },
];

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '2',
    title: 'Book Due Soon',
    message: 'The Great Gatsby is due in 5 days. Please return it on time.',
    type: 'warning',
    read: false,
    createdAt: new Date(),
  },
  {
    id: 'n2',
    userId: '2',
    title: 'Overdue Book',
    message: 'Clean Code is 5 days overdue. Please return it as soon as possible.',
    type: 'error',
    read: false,
    createdAt: subDays(new Date(), 1),
  },
  {
    id: 'n3',
    userId: '1',
    title: 'Pending Pickup',
    message: 'Emma Wilson has a book waiting for pickup.',
    type: 'info',
    read: false,
    createdAt: new Date(),
  },
];

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>(initialBorrowRecords);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Function to fetch users from API
  const refetchUsers = async () => {
    // Check if token exists before attempting to fetch
    const token = localStorage.getItem('library_token');
    if (!token) {
      setIsLoadingUsers(false);
      return;
    }

    try {
      setIsLoadingUsers(true);
      setUsersError(null);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsersError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Function to fetch books from API
  const refetchBooks = async () => {
    // Check if token exists before attempting to fetch
    const token = localStorage.getItem('library_token');
    if (!token) {
      setIsLoadingBooks(false);
      return;
    }

    try {
      setIsLoadingBooks(true);
      setBooksError(null);
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setBooksError(error instanceof Error ? error.message : 'Failed to fetch books');
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // Fetch users on mount if token exists
  useEffect(() => {
    refetchUsers();
    refetchBooks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for login events to refetch users
  useEffect(() => {
    const handleLogin = () => {
      refetchUsers();
      refetchBooks();
    };

    window.addEventListener('user-logged-in', handleLogin);
    return () => window.removeEventListener('user-logged-in', handleLogin);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Book operations
  const addBook = (book: Omit<Book, 'id'>) => {
    setBooks(prev => [...prev, { ...book, id: generateId() }]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => book.id === id ? { ...book, ...updates } : book));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  // User operations
  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    setUsers(prev => [...prev, { ...user, id: generateId(), createdAt: new Date() }]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // Borrow operations
  const reserveBook = (bookId: string, userId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;

    const newRecord: BorrowRecord = {
      id: generateId(),
      bookId,
      userId,
      status: 'reserved',
      reservedAt: new Date(),
      reservationExpiresAt: addDays(new Date(), 2),
    };

    setBorrowRecords(prev => [...prev, newRecord]);
    updateBook(bookId, { availableCopies: book.availableCopies - 1 });

    // Add notification
    const newNotification: Notification = {
      id: generateId(),
      userId,
      title: 'Book Reserved',
      message: `${book.title} has been reserved. Please pick it up within 48 hours.`,
      type: 'success',
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const confirmPickup = (recordId: string, loanDurationDays: number = 14) => {
    setBorrowRecords(prev =>
      prev.map(record =>
        record.id === recordId
          ? {
              ...record,
              status: 'borrowed',
              pickupDate: new Date(),
              dueDate: addDays(new Date(), loanDurationDays),
            }
          : record
      )
    );
  };

  const confirmReturn = (recordId: string) => {
    const record = borrowRecords.find(r => r.id === recordId);
    if (!record) return;

    const book = books.find(b => b.id === record.bookId);
    if (book) {
      updateBook(book.id, { availableCopies: book.availableCopies + 1 });
    }

    setBorrowRecords(prev =>
      prev.map(r =>
        r.id === recordId
          ? { ...r, status: 'returned', returnDate: new Date() }
          : r
      )
    );
  };

  // Notification operations
  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Helpers
  const getBookById = (id: string) => books.find(b => b.id === id);
  const getUserById = (id: string) => users.find(u => u.id === id);

  const getBorrowStatus = (record: BorrowRecord): BorrowStatus => {
    if (record.status === 'returned') return 'returned';
    if (record.status === 'reserved') return 'reserved';
    
    if (record.dueDate) {
      const now = new Date();
      if (isAfter(now, record.dueDate)) return 'overdue';
      if (isBefore(record.dueDate, addDays(now, 3))) return 'due_soon';
    }
    
    return 'borrowed';
  };

  const getUserBorrowRecords = (userId: string) => {
    return borrowRecords.filter(r => r.userId === userId);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        users,
        borrowRecords,
        notifications,
        isLoadingUsers,
        usersError,
        refetchUsers,
        isLoadingBooks,
        booksError,
        refetchBooks,
        addBook,
        updateBook,
        deleteBook,
        addUser,
        updateUser,
        deleteUser,
        reserveBook,
        confirmPickup,
        confirmReturn,
        markNotificationRead,
        getBookById,
        getUserById,
        getBorrowStatus,
        getUserBorrowRecords,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
