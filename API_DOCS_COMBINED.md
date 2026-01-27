# Booklyn API Documentation (Full)

This document describes all API endpoints for the Booklyn library management system. All endpoints return JSON. Authentication and authorization are required for protected endpoints. Endpoints are used by various pages and components in the app, as noted below.

---

## Endpoint Summary Table

| Endpoint | Method | Input | Response | Used In |
|----------|--------|-------|----------|---------|
| /api/users | GET | None | User[] | UsersManagement, Dashboard |
| /api/users/:id | GET | id: string | User | UsersManagement |
| /api/users | POST | User (body) | User | UsersManagement |
| /api/users/:id | PUT | id: string, User (body) | User | UsersManagement |
| /api/users/:id | DELETE | id: string | Success | UsersManagement |
| /api/books | GET | None | Book[] | Books, Dashboard, MyBooks, Reports |
| /api/books/:id | GET | id: string | Book | Books, MyBooks |
| /api/books | POST | Book (body) | Book | Books |
| /api/books/:id | PUT | id: string, Book (body) | Book | Books |
| /api/books/:id | DELETE | id: string | Success | Books |
| /api/borrows | GET | None | BorrowRecord[] | Borrows, Dashboard, Reports |
| /api/borrows/:id | GET | id: string | BorrowRecord | Borrows |
| /api/borrows | POST | BorrowRecord (body) | BorrowRecord | Borrows |
| /api/borrows/:id | PUT | id: string, BorrowRecord (body) | BorrowRecord | Borrows |
| /api/borrows/:id | DELETE | id: string | Success | Borrows |
| /api/notifications?userId=... | GET | userId: string | Notification[] | NotificationBell |
| /api/notifications | POST | Notification (body) | Notification | NotificationBell |
| /api/notifications/:id | PUT | id: string, Notification (body) | Notification | NotificationBell |
| /api/notifications/:id | DELETE | id: string | Success | NotificationBell |
| /api/auth/login  | POST   | email, password      | AuthResponse     | Login page, AuthContext |
| /api/auth/logout | POST   | (session/cookie)     | Success          | Layout, AuthContext |

---

## Users

### GET `/api/users`
- **Description:** Get all users
- **Response:** `User[]`
- **Used In:** UsersManagement, Dashboard

### POST `/api/users`
- **Description:** Create a new user
- **Input:** User (body)
- **Response:** `User`
- **Used In:** UsersManagement

### GET `/api/users/:id`
- **Description:** Get a single user by ID
- **Input:** `id: string` (path)
- **Response:** `User`
- **Used In:** UsersManagement

### PUT `/api/users/:id`
- **Description:** Update a user
- **Input:** `id: string` (path), User (body)
- **Response:** `User`
- **Used In:** UsersManagement

### DELETE `/api/users/:id`
- **Description:** Delete a user
- **Input:** `id: string` (path)
- **Response:** `{ success: boolean }`
- **Used In:** UsersManagement

---

## Books

### GET `/api/books`
- **Description:** Get all books
- **Response:** `Book[]`
- **Used In:** Books, Dashboard, MyBooks, Reports

### POST `/api/books`
- **Description:** Add a new book
- **Input:** Book (body)
- **Response:** `Book`
- **Used In:** Books

### GET `/api/books/:id`
- **Description:** Get a single book by ID
- **Input:** `id: string` (path)
- **Response:** `Book`
- **Used In:** Books, MyBooks

### PUT `/api/books/:id`
- **Description:** Update a book
- **Input:** `id: string` (path), Book (body)
- **Response:** `Book`
- **Used In:** Books

### DELETE `/api/books/:id`
- **Description:** Delete a book
- **Input:** `id: string` (path)
- **Response:** `{ success: boolean }`
- **Used In:** Books

---

## Borrow Records

### GET `/api/borrows`
- **Description:** Get all borrow records
- **Response:** `BorrowRecord[]`
- **Used In:** Borrows, Dashboard, Reports

### POST `/api/borrows`
- **Description:** Create a borrow record
- **Input:** BorrowRecord (body)
- **Response:** `BorrowRecord`
- **Used In:** Borrows

### GET `/api/borrows/:id`
- **Description:** Get a single borrow record by ID
- **Input:** `id: string` (path)
- **Response:** `BorrowRecord`
- **Used In:** Borrows

### PUT `/api/borrows/:id`
- **Description:** Update a borrow record
- **Input:** `id: string` (path), BorrowRecord (body)
- **Response:** `BorrowRecord`
- **Used In:** Borrows

### DELETE `/api/borrows/:id`
- **Description:** Delete a borrow record
- **Input:** `id: string` (path)
- **Response:** `{ success: boolean }`
- **Used In:** Borrows

---

## Notifications

### GET `/api/notifications?userId=...`
- **Description:** Get notifications for a user
- **Input:** `userId: string` (query param)
- **Response:** `Notification[]`
- **Used In:** NotificationBell

### POST `/api/notifications`
- **Description:** Create a notification
- **Input:** Notification (body)
- **Response:** `Notification`
- **Used In:** NotificationBell

### PUT `/api/notifications/:id`
- **Description:** Update a notification
- **Input:** `id: string` (path), Notification (body)
- **Response:** `Notification`
- **Used In:** NotificationBell

### DELETE `/api/notifications/:id`
- **Description:** Delete a notification
- **Input:** `id: string` (path)
- **Response:** `{ success: boolean }`
- **Used In:** NotificationBell

---

## Auth Endpoints

### POST `/api/auth/login`
- **Description:** Authenticate a user and start a session.
- **Input:**
  - `email: string` (body)
  - `password: string` (body)
- **Response:**
  - `AuthResponse` (see below)
- **Used In:** Login page, AuthContext, route protection (ProtectedRoute, PublicRoute)
- **Details:**
  - On success, returns user info and session token (mocked as storing user in localStorage).
  - On failure, returns error message.

### POST `/api/auth/logout`
- **Description:** End the user session (logout).
- **Input:**
  - (session/cookie, handled in frontend)
- **Response:**
  - `{ success: boolean }`
- **Used In:** Layout (logout button), AuthContext
- **Details:**
  - Clears user session (removes user from localStorage).

---

## Types

- `User`, `Book`, `BorrowRecord`, `Notification` types are defined in `src/types/library.ts`.

### User
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'librarian' | 'client';
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}
```

### Book
```typescript
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
```

### BorrowRecord
```typescript
export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  status: 'reserved' | 'borrowed' | 'due_soon' | 'overdue' | 'returned';
  reservedAt: Date;
  reservationExpiresAt: Date;
  pickupDate?: Date;
  dueDate?: Date;
  returnDate?: Date;
  overduesDays?: number;
}
```

### Notification
```typescript
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
}
```

### LibraryStats
```typescript
export interface LibraryStats {
  totalBooks: number;
  totalUsers: number;
  activeBorrows: number;
  overdueBooks: number;
  mostBorrowedBooks: { bookId: string; count: number }[];
  borrowingTrends: { date: string; count: number }[];
}
```

### AuthResponse
```typescript
interface AuthResponse {
  user: User;
  token: string; // (mocked, not used in frontend)
}
```

---

## Usage in the App

- **Login page:** Calls `/api/auth/login` with email and password. On success, user is redirected to dashboard and session is stored.
- **Logout:** Calls `/api/auth/logout` (handled in AuthContext and Layout). On success, user is redirected to login and session is cleared.
- **Route Protection:**
  - `ProtectedRoute` and `PublicRoute` components use AuthContext to check authentication state and redirect as needed.
- **Session:**
  - Session is managed in the frontend using localStorage (mocked). In a real backend, a token or cookie would be used.

---

## Notes
- All endpoints are currently mocked in `src/api.mock.ts` and use data from `src/mockdata.ts`.
- Auth endpoints are currently mocked in the frontend (`src/contexts/AuthContext.tsx`).
- To switch to a real backend, implement these endpoints on the server and update the AuthContext to use real HTTP requests.
- Extend endpoints as needed for create/update/delete operations.
- For more details, see the mock API implementation in `src/api.mock.ts`, `src/contexts/AuthContext.tsx`, and type definitions in `src/types/library.ts`.
