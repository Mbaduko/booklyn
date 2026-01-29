import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, BorrowRecord, User, Notification, BorrowStatus } from '@/types/library';
import { addDays, isAfter, isBefore, differenceInDays, subDays } from 'date-fns';
import { getUsers } from '@/api/users';
import { getBooks } from '@/api/books';
import { getBorrowRecords, reserveBook as reserveBookAPI } from '@/api/borrows';
import { getNotifications } from '@/api/notifications';
import { useAuth } from '@/contexts/AuthContext';

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
  isLoadingBorrowRecords: boolean;
  borrowRecordsError: string | null;
  refetchBorrowRecords: () => Promise<void>;
  isLoadingNotifications: boolean;
  notificationsError: string | null;
  refetchNotifications: (userId?: string) => Promise<void>;
  
  // User operations (still using mock for now)
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Borrow operations
  reserveBook: (bookId: string) => Promise<BorrowRecord>; // Now using real API
  confirmPickup: (recordId: string, loanDurationDays?: number) => void; // Still mock
  confirmReturn: (recordId: string) => void; // Still mock
  
  // Notification operations (still using mock for now)
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

// Borrow records are now fetched from API instead of hardcoded data

// Notifications are now fetched from API instead of hardcoded data

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [isLoadingBorrowRecords, setIsLoadingBorrowRecords] = useState(true);
  const [borrowRecordsError, setBorrowRecordsError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

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

  // Function to fetch borrow records from API
  const refetchBorrowRecords = async () => {
    // Check if token exists before attempting to fetch
    const token = localStorage.getItem('library_token');
    if (!token) {
      setIsLoadingBorrowRecords(false);
      return;
    }

    try {
      setIsLoadingBorrowRecords(true);
      setBorrowRecordsError(null);
      const fetchedBorrowRecords = await getBorrowRecords();
      setBorrowRecords(fetchedBorrowRecords);
    } catch (error) {
      console.error('Failed to fetch borrow records:', error);
      setBorrowRecordsError(error instanceof Error ? error.message : 'Failed to fetch borrow records');
    } finally {
      setIsLoadingBorrowRecords(false);
    }
  };

  // Function to fetch notifications from API
  const refetchNotifications = async (userId?: string) => {
    // Check if token exists before attempting to fetch
    const token = localStorage.getItem('library_token');
    if (!token) {
      setIsLoadingNotifications(false);
      return;
    }

    try {
      setIsLoadingNotifications(true);
      setNotificationsError(null);
      // Use provided userId or default to empty string (API will handle validation)
      const targetUserId = userId || '';
      const fetchedNotifications = await getNotifications(targetUserId);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotificationsError(error instanceof Error ? error.message : 'Failed to fetch notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch users on mount if token exists
  useEffect(() => {
    refetchUsers();
    refetchBooks();
    refetchBorrowRecords();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch notifications when user is available
  useEffect(() => {
    if (user) {
      refetchNotifications(user.id);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for login events to refetch data
  useEffect(() => {
    const handleLogin = () => {
      refetchUsers();
      refetchBooks();
      refetchBorrowRecords();
      // Notifications will be fetched automatically when user is set in AuthContext
    };

    window.addEventListener('user-logged-in', handleLogin);
    return () => window.removeEventListener('user-logged-in', handleLogin);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // User operations (still using mock for now)
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
  const reserveBook = async (bookId: string) => {
    try {
      const newRecord = await reserveBookAPI(bookId);
      setBorrowRecords(prev => [...prev, newRecord]);
      await refetchBooks(); // Refresh books to update available copies
      return newRecord; // Return the reservation record
    } catch (error) {
      console.error('Failed to reserve book:', error);
      throw error; // Re-throw to let the calling component handle the error
    }
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

    // Note: updateBook is no longer available since we use real API
    // This would need to be handled by the API when implementing real borrow operations

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
        isLoadingBorrowRecords,
        borrowRecordsError,
        refetchBorrowRecords,
        isLoadingNotifications,
        notificationsError,
        refetchNotifications,
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
