/**
 * =====================================================
 * Day 64 - Joi Validation Middleware Factory
 * =====================================================
 *
 * This middleware validates incoming request data against
 * a Joi schema before the request reaches the route handler.
 *
 * Benefits:
 * - Keeps route handlers clean
 * - Eliminates repetitive validation code
 * - Returns consistent validation errors
 * - Sanitizes incoming data
 *
 * Example Usage:
 *
 * router.post(
 *   "/",
 *   validate(createEmployeeSchema),
 *   createEmployee
 * );
 *
 * =====================================================
 */

/**
 * Creates validation middleware for a specific Joi schema.
 *
 * @param {Object} schema
 * A Joi schema used to validate the incoming request body.
 *
 * @returns {Function}
 * Express middleware function.
 */
const validate = (schema) => {
  /**
   * This returned function is the actual middleware
   * Express executes whenever a request reaches this route.
   */
  return (req, res, next) => {
    /**
     * Validate the request body.
     *
     * abortEarly: false
     *   Continue checking every field instead of stopping
     *   after the first validation error.
     *
     * stripUnknown: true
     *   Remove any properties that are not defined
     *   in the Joi schema.
     */
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    /**
     * If validation failed,
     * return a 400 Bad Request response.
     */
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((detail) => detail.message),
      });
    }

    /**
     * Validation succeeded.
     *
     * Replace the original request body with the
     * sanitized version returned by Joi.
     */
    req.body = value;

    /**
     * Continue to the next middleware
     * or route handler.
     */
    next();
  };
};

/**
 * Export the middleware factory.
 */
module.exports = validate;
