# Book Borrowing API Documentation

This document provides detailed information about the book borrowing lifecycle endpoints for frontend integration.

## Table of Contents

1. [Authentication](#authentication)
2. [Book Reservation](#book-reservation)
3. [Pickup Confirmation](#pickup-confirmation)
4. [Return Confirmation](#return-confirmation)
5. [Error Handling](#error-handling)
6. [Response Formats](#response-formats)
7. [Integration Examples](#integration-examples)

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Required Headers
```http
Content-Type: application/json
Authorization: Bearer <token>
```

---

## Book Reservation

### Endpoint
```
POST /borrows/{bookId}/reserve
```

### Description
Reserves a book for the authenticated user. This endpoint creates a reservation and decrements both the book's available copies and the user's remaining borrow limit.

### Authentication
- **Required**: JWT token
- **Role**: `client` only

### Request Parameters

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookId` | string | Yes | The ID of the book to reserve |

#### Request Body
Empty (no body required)

### Response

#### Success (201 Created)
```json
{
  "id": "borrow-record-uuid",
  "bookId": "book-uuid",
  "userId": "user-uuid",
  "status": "reserved",
  "reservedAt": "2026-01-29T08:30:00.000Z",
  "reservationExpiresAt": "2026-01-30T08:30:00.000Z",
  "pickupDate": null,
  "dueDate": null,
  "returnDate": null,
  "overduesDays": null
}
```

#### Error Responses
| Status Code | Error Message | Description |
|-------------|--------------|-------------|
| 403 | "User account is not active" | User account is deactivated |
| 404 | "Book not found" | Book with given ID doesn't exist |
| 404 | "User not found" | User account doesn't exist |
| 409 | "You have reached your maximum borrow limit" | User has no remaining borrows |
| 409 | "Book is not available for reservation" | No copies available |
| 409 | "You already have an active reservation or borrow for this book" | Duplicate reservation |
| 500 | "Failed to reserve book" | Server error |

### Business Rules
- User must have `remainingBorrows > 0`
- Book must have `availableCopies > 0`
- User cannot have existing active reservation/borrow for the same book
- Reservation expires after configurable period (default: 24 hours)
- User's `remainingBorrows` is decremented by 1
- Book's `availableCopies` is decremented by 1
- Librarians receive notification about new reservation

---

## Pickup Confirmation

### Endpoint
```
POST /borrows/{borrowId}/pickup
```

### Description
Confirms the pickup of a reserved book, changing the status from 'reserved' to 'borrowed' and setting the due date.

### Authentication
- **Required**: JWT token
- **Role**: `librarian` only

### Request Parameters

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `borrowId` | string | Yes | The ID of the borrow record to confirm pickup |

#### Request Body
Empty (no body required)

### Response

#### Success (200 OK)
```json
{
  "id": "borrow-record-uuid",
  "bookId": "book-uuid",
  "userId": "user-uuid",
  "status": "borrowed",
  "reservedAt": "2026-01-29T08:30:00.000Z",
  "reservationExpiresAt": "2026-01-30T08:30:00.000Z",
  "pickupDate": "2026-01-29T10:15:00.000Z",
  "dueDate": "2026-02-12T10:15:00.000Z",
  "returnDate": null,
  "overduesDays": null
}
```

#### Error Responses
| Status Code | Error Message | Description |
|-------------|--------------|-------------|
| 403 | "User account is not active" | User account is deactivated |
| 404 | "Borrow record not found" | Borrow record doesn't exist |
| 404 | "User not found" | User account doesn't exist |
| 409 | "This reservation cannot be confirmed for pickup" | Status not 'reserved' |
| 409 | "Reservation has expired" | Reservation past expiry time |
| 500 | "Failed to confirm book pickup" | Server error |

### Business Rules
- Borrow record must be in 'reserved' status
- Reservation must not be expired
- User account must be active
- Status changes from 'reserved' to 'borrowed'
- `pickupDate` is set to current timestamp
- `dueDate` is set to configurable days from now (default: 14 days)
- User receives success notification with due date

---

## Return Confirmation

### Endpoint
```
POST /borrows/{borrowId}/return
```

### Description
Confirms the return of a borrowed book, restoring book availability and user's borrow limit.

### Authentication
- **Required**: JWT token
- **Role**: `librarian` only

### Request Parameters

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `borrowId` | string | Yes | The ID of the borrow record to confirm return |

#### Request Body
Empty (no body required)

### Response

#### Success (200 OK)
```json
{
  "id": "borrow-record-uuid",
  "bookId": "book-uuid",
  "userId": "user-uuid",
  "status": "returned",
  "reservedAt": "2026-01-29T08:30:00.000Z",
  "reservationExpiresAt": "2026-01-30T08:30:00.000Z",
  "pickupDate": "2026-01-29T10:15:00.000Z",
  "dueDate": "2026-02-12T10:15:00.000Z",
  "returnDate": "2026-02-10T14:30:00.000Z",
  "overduesDays": null
}
```

#### Error Responses
| Status Code | Error Message | Description |
|-------------|--------------|-------------|
| 403 | "User account is not active" | User account is deactivated |
| 404 | "Borrow record not found" | Borrow record doesn't exist |
| 404 | "User not found" | User account doesn't exist |
| 409 | "Cannot return a book that is only reserved" | Status is 'reserved' |
| 409 | "This book has already been returned" | Status already 'returned' |
| 500 | "Failed to confirm book return" | Server error |

### Business Rules
- Borrow record must NOT be in 'reserved' status
- Borrow record must NOT already be 'returned'
- User account must be active
- Status changes to 'returned'
- `returnDate` is set to current timestamp
- Book's `availableCopies` is incremented by 1
- User's `remainingBorrows` is incremented by 1
- User receives thank you notification

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "message": "Error description",
    "statusCode": 409,
    "timestamp": "2026-01-29T10:30:00.000Z"
  }
}
```

### Common Error Scenarios

#### Authentication Errors
- **401**: Missing or invalid JWT token
- **403**: Insufficient permissions (wrong role)

#### Validation Errors
- **404**: Resource not found (book, user, or borrow record)
- **409**: Business rule violations (availability, limits, status)

#### Server Errors
- **500**: Internal server error

---

## Response Formats

### Borrow Record Object
All endpoints return a BorrowRecord object with the following structure:

```typescript
interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  status: 'reserved' | 'borrowed' | 'due_soon' | 'overdue' | 'returned';
  reservedAt: Date | null;
  reservationExpiresAt: Date | null;
  pickupDate: Date | null;
  dueDate: Date | null;
  returnDate: Date | null;
  overduesDays: number | null;
}
```

### Status Values
| Status | Description |
|--------|-------------|
| `reserved` | Book is reserved, not yet picked up |
| `borrowed` | Book is currently borrowed by user |
| `due_soon` | Book is due soon (system-generated) |
| `overdue` | Book is overdue (system-generated) |
| `returned` | Book has been returned |

---

## Integration Examples

### Frontend Integration Flow

#### 1. Book Reservation (Client)
```javascript
// User clicks "Reserve Book" button
const reserveBook = async (bookId) => {
  try {
    const response = await fetch(`/borrows/${bookId}/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (response.ok) {
      const borrowRecord = await response.json();
      console.log('Book reserved successfully:', borrowRecord);
      // Show success message to user
      // Update UI to show reserved status
      // Update user's remaining borrows count
    } else {
      const error = await response.json();
      console.error('Reservation failed:', error.error.message);
      // Show error message to user
    }
  } catch (error) {
    console.error('Network error:', error);
    // Show network error message
  }
};
```

#### 2. Pickup Confirmation (Librarian)
```javascript
// Librarian confirms book pickup
const confirmPickup = async (borrowId) => {
  try {
    const response = await fetch(`/borrows/${borrowId}/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${librarianToken}`
      }
    });
    
    if (response.ok) {
      const borrowRecord = await response.json();
      console.log('Pickup confirmed:', borrowRecord);
      // Update UI to show borrowed status
      // Show due date to librarian/user
      // Send notification to user (handled by backend)
    } else {
      const error = await response.json();
      console.error('Pickup confirmation failed:', error.error.message);
      // Show error message to librarian
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

#### 3. Return Confirmation (Librarian)
```javascript
// Librarian confirms book return
const confirmReturn = async (borrowId) => {
  try {
    const response = await fetch(`/borrows/${borrowId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${librarianToken}`
      }
    });
    
    if (response.ok) {
      const borrowRecord = await response.json();
      console.log('Return confirmed:', borrowRecord);
      // Update UI to show returned status
      // Update book availability
      // Update user's remaining borrows count
      // Thank you notification sent automatically
    } else {
      const error = await response.json();
      console.error('Return confirmation failed:', error.error.message);
      // Show error message to librarian
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### React Component Example

```jsx
import React, { useState } from 'react';

const BookCard = ({ book, userToken, onReservationComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReserve = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/borrows/${book.id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onReservationComplete(data);
        // Show success message
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="book-card">
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>Available: {book.availableCopies}/{book.totalCopies}</p>
      
      {error && <div className="error">{error}</div>}
      
      <button 
        onClick={handleReserve}
        disabled={isLoading || book.availableCopies === 0}
      >
        {isLoading ? 'Reserving...' : 'Reserve Book'}
      </button>
    </div>
  );
};

export default BookCard;
```

---

## Testing Scenarios

### Postman Collection Examples

#### Reserve Book
```http
POST {{baseUrl}}/borrows/{{bookId}}/reserve
Authorization: Bearer {{clientToken}}
Content-Type: application/json
```

#### Confirm Pickup
```http
POST {{baseUrl}}/borrows/{{borrowId}}/pickup
Authorization: Bearer {{librarianToken}}
Content-Type: application/json
```

#### Confirm Return
```http
POST {{baseUrl}}/borrows/{{borrowId}}/return
Authorization: Bearer {{librarianToken}}
Content-Type: application/json
```

---

## Environment Variables

The following environment variables affect the behavior of these endpoints:

| Variable | Default | Description |
|----------|---------|-------------|
| `BOOK_RESERVATION_PERIOD_HOURS` | 24 | Hours until reservation expires |
| `HOLD_BOOK_DURATION_DAYS` | 14 | Days until book is due after pickup |
| `MAX_BOOKS_PER_USER` | 5 | Maximum books a user can borrow simultaneously |

---

## Notes for Frontend Developers

1. **Role-based Access**: Ensure proper role checking before making requests
2. **Error Handling**: Implement comprehensive error handling for all scenarios
3. **Loading States**: Show loading indicators during API calls
4. **Real-time Updates**: Consider implementing real-time updates for notifications
5. **Date Handling**: All dates are in ISO 8601 format
6. **Status Management**: Track and display different borrow statuses appropriately
7. **User Feedback**: Provide clear feedback for success and error scenarios

---

## Support

For any questions or issues during integration, please refer to:
- API response messages for specific error details
- Server logs for debugging (if available)
- Backend development team for clarification
