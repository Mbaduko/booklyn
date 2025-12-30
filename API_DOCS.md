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

## Notes
- All endpoints are currently mocked in `src/api.mock.ts` and use data from `src/mockdata.ts`.
- To switch to a real backend, replace the implementation in `api.mock.ts` with real HTTP requests.
- Extend endpoints as needed for create/update/delete operations.

---

For further details, see the type definitions and mock API implementation in the codebase.
