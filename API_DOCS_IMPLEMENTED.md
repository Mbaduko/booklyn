# Booklyn API Documentation

---

## General

### Welcome
- **GET /**  
  Returns a welcome message.  
  **Response:**
  - 200: `"Welcome to Booklyn API!"`

---

## Auth

### Login
- **POST /auth/login**  
  User login.  
  **Request Body:**
  - `email` (string, required)
  - `password` (string, required)  
  **Response:**
  - 200: `{ user: User, token: string }`
  - 400: Email and password are required
  - 401: Invalid email or password

---

## Users

### Get All Users

> Getting user endpoints require authentication and `librarian` role (except for `/users/:id` which allows owner access).
- **GET /users**  
  Get all users.  
  **Response:**
  - 200: `User[]`
  - 404: No users found

### Get User by ID
- **GET /users/{id}**  
  Get a single user by ID.  
  **Path Param:**
  - `id` (string, required)  
  **Response:**
  - 200: `User`
  - 404: User not found

---

## Books

> All book endpoints require authentication.

### Get All Books
- **GET /books**  
  Get all books.  
  **Response:**
  - 200: `Book[]`
  - 404: No books found

### Get Book by ID
- **GET /books/{id}**  
  Get a single book by ID.  
  **Path Param:**
  - `id` (string, required)  
  **Response:**
  - 200: `Book`
  - 404: Book not found

---

## Borrows

> All borrow endpoints require authentication.

### Get All Borrow Records
- **GET /borrows**  
  Get all borrow records.  
  **Response:**
  - 200: `BorrowRecord[]`
  - 404: No borrow records found

### Get Borrow Record by ID
- **GET /borrows/{id}**  
  Get a single borrow record by ID.  
  **Path Param:**
  - `id` (string, required)  
  **Response:**
  - 200: `BorrowRecord`
  - 404: Borrow record not found

---

## Notifications

> Requires authentication. Both `librarian` and owner access allowed.

### Get Notifications for a User
- **GET /notifications?userId={userId}**  
  Get notifications for a user.  
  **Query Param:**
  - `userId` (string, required)  
  **Response:**
  - 200: `Notification[]`
  - 400: userId is required
  - 404: No notifications found

---

## Models (Full Schema Details)

### User
```
id: string (uuid)
email: string (email)
name: string
role: 'librarian' | 'client'
avatar: string | null
createdAt: string (date-time)
isActive: boolean
```

### Book
```
id: string (uuid)
title: string
author: string
category: string
isbn: string
totalCopies: number
availableCopies: number
coverImage: string | null
description: string | null
publishedYear: number | null
```

### BorrowRecord
```
id: string (uuid)
bookId: string
userId: string
status: 'reserved' | 'borrowed' | 'due_soon' | 'overdue' | 'returned'
reservedAt: string (date-time)
reservationExpiresAt: string (date-time)
pickupDate: string (date-time) | null
dueDate: string (date-time) | null
returnDate: string (date-time) | null
overduesDays: number | null
```

### Notification
```
id: string (uuid)
userId: string
title: string
message: string
type: 'info' | 'warning' | 'success' | 'error'
read: boolean
createdAt: string (date-time)
```

---

**Security:**  
All endpoints (except `/` and `/auth/login`) require a Bearer JWT in the `Authorization` header.

**For full schema details, see the model definitions above or in `src/config/swagger.ts`.**
