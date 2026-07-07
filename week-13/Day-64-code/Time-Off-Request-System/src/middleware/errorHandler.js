/**
 * =====================================================
 * Day 64 - Centralized Error Handler Middleware
 * =====================================================
 *
 * This middleware catches every error thrown anywhere in
 * our application and sends a consistent JSON response.
 *
 * IMPORTANT:
 * Express ONLY recognizes error middleware if it has
 * EXACTLY four parameters:
 *
 * (err, req, res, next)
 *
 * This middleware should always be the LAST middleware
 * registered in server.js.
 *
 * =====================================================
 */

const errorHandler = (err, req, res, next) => {
  // ============================================
  // Log Error Information
  // ============================================

  // Display the error message in the terminal.
  console.error("========================================");
  console.error("ERROR:");
  console.error(err.message);

  // Display the full stack trace for debugging.
  console.error("----------------------------------------");
  console.error(err.stack);
  console.error("========================================");

  // ============================================
  // Default Error Values
  // ============================================

  // Use the status code from the custom error if available.
  // Otherwise default to Internal Server Error (500).
  let statusCode = err.statusCode || 500;

  // Use the custom error message if available.
  // Otherwise return a generic message.
  let message = err.message || "Internal Server Error";

  // ============================================
  // Handle Joi Validation Errors
  // ============================================

  /**
   * Joi automatically creates ValidationError objects.
   *
   * Example:
   *
   * {
   *   name: "ValidationError",
   *   details: [...]
   * }
   */

  if (err.name === "ValidationError" && err.details) {
    statusCode = 400;

    // Combine every validation error into one array.
    message = err.details.map((detail) => detail.message);
  }

  // ============================================
  // Handle Invalid JSON
  // ============================================

  /**
   * If the client sends malformed JSON,
   * Express throws this error before our route runs.
   */

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  // ============================================
  // Send Error Response
  // ============================================

  const errorResponse = {
    success: false,
    error: message,
  };

  /**
   * Only include the stack trace while developing.
   *
   * Never expose stack traces in production because
   * they reveal information about your application.
   */

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
