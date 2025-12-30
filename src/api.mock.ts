import { mockUsers, mockBooks, mockBorrowRecords, mockNotifications } from '@/mockdata';
import { User, Book, BorrowRecord, Notification } from '@/types/library';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  async getUsers(): Promise<User[]> {
    await delay(300);
    return mockUsers;
  },
  async getUser(id: string): Promise<User | undefined> {
    await delay(200);
    return mockUsers.find(u => u.id === id);
  },
  async getBooks(): Promise<Book[]> {
    await delay(300);
    return mockBooks;
  },
  async getBook(id: string): Promise<Book | undefined> {
    await delay(200);
    return mockBooks.find(b => b.id === id);
  },
  async getBorrowRecords(): Promise<BorrowRecord[]> {
    await delay(300);
    return mockBorrowRecords;
  },
  async getBorrowRecord(id: string): Promise<BorrowRecord | undefined> {
    await delay(200);
    return mockBorrowRecords.find(r => r.id === id);
  },
  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(200);
    return mockNotifications.filter(n => n.userId === userId);
  },
  // Add more endpoints as needed
};
