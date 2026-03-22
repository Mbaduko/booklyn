export interface ValidationError {
  field: string;
  message: string;
}

export function validatePassword(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password must be a string';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (password.length > 100) {
    return 'Password must be less than 100 characters';
  }
  
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }
  
  return null;
}

export function validateName(name: string): string | null {
  if (!name || typeof name !== 'string') {
    return 'Name is required';
  }
  
  if (name.length < 2) {
    return 'Name must be at least 2 characters long';
  }
  
  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }
  
  return null;
}

export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return passwordError;
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
}
