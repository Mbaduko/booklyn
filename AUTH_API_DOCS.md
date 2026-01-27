# Booklyn Auth API Documentation

This section documents the authentication endpoints required for the Booklyn app. Authentication is required for all protected routes and is handled via the login and logout endpoints. The app uses a session-based approach (mocked in the frontend for now).

---

## Endpoint Summary Table

| Endpoint         | Method | Input                | Response         | Used In         |
|------------------|--------|----------------------|------------------|-----------------|
| /api/auth/login  | POST   | email, password      | AuthResponse     | Login page, AuthContext |
| /api/auth/logout | POST   | (session/cookie)     | Success          | Layout, AuthContext |

---

## Endpoints

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

### AuthResponse
```typescript
interface AuthResponse {
  user: User;
  token: string; // (mocked, not used in frontend)
}
```

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
- These endpoints are currently mocked in the frontend (`src/contexts/AuthContext.tsx`).
- To switch to a real backend, implement these endpoints on the server and update the AuthContext to use real HTTP requests.
