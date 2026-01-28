import { mockBooks, mockBorrowRecords, mockNotifications } from '@/mockdata';
import { Book, BorrowRecord, Notification } from '@/types/library';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  // User endpoints removed - now using real API in src/api/users.ts
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
