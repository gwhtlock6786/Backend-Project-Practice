/**
 * =====================================================
 * Day 64 - Custom Error Classes
 * =====================================================
 *
 * These classes create consistent HTTP errors that can be
 * handled by our centralized error handling middleware.
 *
 * Instead of manually sending error responses inside every
 * route, we simply throw one of these custom errors.
 *
 * Example:
 *
 * throw new NotFoundError("Employee");
 *
 * =====================================================
 */

// ============================================
// Base Application Error
// Parent class for all custom application errors.
// ============================================

class AppError extends Error {
  constructor(message, statusCode) {
    // Call JavaScript's built-in Error constructor
    super(message);

    // Store the name of the current error class
    this.name = this.constructor.name;

    // Store the HTTP status code
    this.statusCode = statusCode;

    // Marks this as an expected application error
    this.isOperational = true;

    // Removes this constructor from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// 404 - Resource Not Found
// ============================================

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

// ============================================
// 400 - Invalid Request Data
// ============================================

class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

// ============================================
// 401 - Authentication Required
// ============================================

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// ============================================
// 403 - User Lacks Permission
// ============================================

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

// ============================================
// 409 - Resource Conflict
// Example: Duplicate email or username
// ============================================

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

// ============================================
// Export All Error Classes
// ============================================

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
