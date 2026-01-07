/**
 * Auth Domain Errors
 * Custom error classes for authentication domain
 */

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message: string = 'Invalid email or password') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(message: string = 'User with this email already exists') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class EmailNotVerifiedError extends AuthError {
  constructor(
    message: string = 'Email not verified. Please check your inbox.',
  ) {
    super(message);
    this.name = 'EmailNotVerifiedError';
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message: string = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class WeakPasswordError extends AuthError {
  constructor(
    message: string = 'Password does not meet security requirements',
  ) {
    super(message);
    this.name = 'WeakPasswordError';
  }
}

export class PasswordMismatchError extends AuthError {
  constructor(message: string = 'Current password is incorrect') {
    super(message);
    this.name = 'PasswordMismatchError';
  }
}
