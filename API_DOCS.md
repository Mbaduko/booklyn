# Booklyn API Documentation

This document describes the API endpoints needed for the Booklyn library management system. All endpoints should return JSON. Authentication and authorization are assumed for protected endpoints.

---

## Users

### GET `/api/users`
- **Description:** Get all users
- **Response:** `User[]`

### GET `/api/users/:id`
- **Description:** Get a single user by ID
- **Response:** `User`

---

## Books

### GET `/api/books`
- **Description:** Get all books
- **Response:** `Book[]`

### GET `/api/books/:id`
- **Description:** Get a single book by ID
- **Response:** `Book`

---

## Borrow Records

### GET `/api/borrows`
- **Description:** Get all borrow records
- **Response:** `BorrowRecord[]`

### GET `/api/borrows/:id`
- **Description:** Get a single borrow record by ID
- **Response:** `BorrowRecord`

---

## Notifications

### GET `/api/notifications?userId=...`
- **Description:** Get notifications for a user
- **Response:** `Notification[]`

---

## Types

- `User`, `Book`, `BorrowRecord`, `Notification` types are defined in `src/types/library.ts`.

---

## Database Schema (SQL Example)

### users
```
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('librarian', 'client')),
  avatar VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### books
```
CREATE TABLE books (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  isbn VARCHAR(32) NOT NULL UNIQUE,
  total_copies INT NOT NULL,
  available_copies INT NOT NULL,
  cover_image VARCHAR(255),
  description TEXT,
  published_year INT
);
```

### borrow_records
```
CREATE TABLE borrow_records (
  id VARCHAR(36) PRIMARY KEY,
  book_id VARCHAR(36) NOT NULL REFERENCES books(id),
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('reserved', 'borrowed', 'due_soon', 'overdue', 'returned')),
  reserved_at TIMESTAMP NOT NULL,
  reservation_expires_at TIMESTAMP NOT NULL,
  pickup_date TIMESTAMP,
  due_date TIMESTAMP,
  return_date TIMESTAMP,
  overdues_days INT
);
```

### notifications
```
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Notes
- All endpoints are currently mocked in `src/api.mock.ts` and use data from `src/mockdata.ts`.
- To switch to a real backend, replace the implementation in `api.mock.ts` with real HTTP requests.
- Extend endpoints as needed for create/update/delete operations.

---

For further details, see the type definitions and mock API implementation in the codebase.
