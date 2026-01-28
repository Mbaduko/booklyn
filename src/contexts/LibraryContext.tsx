import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, BorrowRecord, User, Notification, BorrowStatus } from '@/types/library';
import { addDays, isAfter, isBefore, differenceInDays, subDays } from 'date-fns';
import { getUsers } from '@/api/users';

interface LibraryContextType {
  books: Book[];
  users: User[];
  borrowRecords: BorrowRecord[];
  notifications: Notification[];
  isLoadingUsers: boolean;
  usersError: string | null;
  refetchUsers: () => Promise<void>;
  
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
const initialBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Classic Literature',
    isbn: '978-0-7432-7356-5',
    totalCopies: 5,
    availableCopies: 3,
    description: 'A story of decadence and excess, Gatsby explores the American Dream.',
    publishedYear: 1925,
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Classic Literature',
    isbn: '978-0-06-112008-4',
    totalCopies: 4,
    availableCopies: 2,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town.',
    publishedYear: 1960,
  },
  {
    id: '3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Technology',
    isbn: '978-0-13-235088-4',
    totalCopies: 3,
    availableCopies: 1,
    description: 'A handbook of agile software craftsmanship.',
    publishedYear: 2008,
  },
  {
    id: '4',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    isbn: '978-0-7352-1129-2',
    totalCopies: 6,
    availableCopies: 4,
    description: 'An easy & proven way to build good habits & break bad ones.',
    publishedYear: 2018,
  },
  {
    id: '5',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    category: 'Fiction',
    isbn: '978-0-525-55947-4',
    totalCopies: 4,
    availableCopies: 0,
    description: 'Between life and death there is a library.',
    publishedYear: 2020,
  },
  {
    id: '6',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'Non-Fiction',
    isbn: '978-0-06-231609-7',
    totalCopies: 5,
    availableCopies: 3,
    description: 'A brief history of humankind.',
    publishedYear: 2011,
  },
  {
    id: '7',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'Finance',
    isbn: '978-0-85719-768-0',
    totalCopies: 4,
    availableCopies: 2,
    description: 'Timeless lessons on wealth, greed, and happiness.',
    publishedYear: 2020,
  },
  {
    id: '8',
    title: 'Dune',
    author: 'Frank Herbert',
    category: 'Science Fiction',
    isbn: '978-0-441-17271-9',
    totalCopies: 3,
    availableCopies: 1,
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.',
    publishedYear: 1965,
  },
];

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
  const [books, setBooks] = useState<Book[]>(initialBooks);
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

  // Fetch users on mount if token exists
  useEffect(() => {
    refetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for login events to refetch users
  useEffect(() => {
    const handleLogin = () => {
      refetchUsers();
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
