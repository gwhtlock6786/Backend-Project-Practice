// /**
//  * =====================================================
//  * Day 64 - Joi Validation Middleware Factory
//  * =====================================================
//  *
//  * This middleware validates incoming request data against
//  * a Joi schema before the request reaches the route handler.
//  *
//  * Benefits:
//  * - Keeps route handlers clean
//  * - Eliminates repetitive validation code
//  * - Returns consistent validation errors
//  * - Sanitizes incoming data
//  *
//  * Example Usage:
//  *
//  * router.post(
//  *   "/",
//  *   validate(createEmployeeSchema),
//  *   createEmployee
//  * );
//  *
//  * =====================================================
//  */

// /**
//  * Creates validation middleware for a specific Joi schema.
//  *
//  * @param {Object} schema
//  * A Joi schema used to validate the incoming request body.
//  *
//  * @returns {Function}
//  * Express middleware function.
//  */
// const validate = (schema) => {
//   /**
//    * This returned function is the actual middleware
//    * Express executes whenever a request reaches this route.
//    */
//   return (req, res, next) => {
//     /**
//      * Validate the request body.
//      *
//      * abortEarly: false
//      *   Continue checking every field instead of stopping
//      *   after the first validation error.
//      *
//      * stripUnknown: true
//      *   Remove any properties that are not defined
//      *   in the Joi schema.
//      */
//     const { error, value } = schema.validate(req.body, {
//       abortEarly: false,
//       stripUnknown: true,
//     });

//     /**
//      * If validation failed,
//      * return a 400 Bad Request response.
//      */
//     if (error) {
//       return res.status(400).json({
//         success: false,
//         errors: error.details.map((detail) => detail.message),
//       });
//     }

//     /**
//      * Validation succeeded.
//      *
//      * Replace the original request body with the
//      * sanitized version returned by Joi.
//      */
//     req.body = value;

//     /**
//      * Continue to the next middleware
//      * or route handler.
//      */
//     next();
//   };
// };

// /**
//  * Export the middleware factory.
//  */
// module.exports = validate;

/**
 * =====================================================
 * Day 64 - Joi Validation Middleware Factory
 * =====================================================
 *
 * This middleware validates incoming request data against
 * a Joi schema before the request reaches the route handler.
 *
 * Supports validation from:
 *
 * ✔ req.body
 * ✔ req.query
 * ✔ req.params
 *
 *
 * Benefits:
 * - Keeps route handlers clean
 * - Eliminates repetitive validation code
 * - Returns consistent validation errors
 * - Sanitizes incoming data
 * - Allows reusable validation for all request types
 *
 *
 * Example Usage:
 *
 * Body validation:
 *
 * router.post(
 *   "/",
 *   validate(createEmployeeSchema),
 *   createEmployee
 * );
 *
 *
 * Query validation:
 *
 * router.get(
 *   "/weekly",
 *   validate(weeklyLaborCostSchema, "query"),
 *   getWeeklyCosts
 * );
 *
 *
 * Params validation:
 *
 * router.get(
 *   "/employee/:id",
 *   validate(employeeIdSchema, "params"),
 *   getEmployee
 * );
 *
 * =====================================================
 */

/**
 * Creates validation middleware for a specific Joi schema.
 *
 * @param {Object} schema
 * Joi schema used to validate incoming data.
 *
 * @param {String} source
 * Determines which part of the request is validated.
 *
 * Options:
 *
 * "body"   -> req.body
 * "query"  -> req.query
 * "params" -> req.params
 *
 * Default:
 *
 * "body"
 *
 * This keeps existing routes working without changes.
 *
 *
 * @returns {Function}
 * Express middleware function.
 */

const { ValidationError } = require("../errors/AppError.js");
const validate = (schema, source = "body") => {
  /**
   * This returned function is the actual middleware
   * Express executes whenever a request reaches this route.
   */
  return (req, res, next) => {
    let data;

    // ============================================
    // Determine Data Source
    // ============================================
    //
    // Different API endpoints store incoming
    // information in different locations.
    //
    // Example:
    //
    // POST /employees
    //
    // req.body
    //
    //
    // GET /employees?page=2
    //
    // req.query
    //
    //
    // GET /employees/5
    //
    // req.params
    //
    // ============================================

    switch (source) {
      case "query":
        data = req.query;
        break;

      case "params":
        data = req.params;
        break;

      case "body":
      default:
        data = req.body;
        break;
    }

    /**
     * Validate incoming data.
     *
     * abortEarly: false
     * ------------------
     * Continue checking every field instead of
     * stopping after the first validation error.
     *
     *
     * stripUnknown: true
     * ------------------
     * Remove properties that are not included
     * in the Joi schema.
     *
     * Example:
     *
     * Incoming:
     *
     * {
     *    name: "John",
     *    password: "12345",
     *    randomField: "hello"
     * }
     *
     *
     * Schema:
     *
     * {
     *    name: Joi.string()
     * }
     *
     *
     * Result:
     *
     * {
     *    name: "John"
     * }
     *
     */
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    /**
     * If validation failed,
     * return a 400 Bad Request response (ValidationError).
     */
    if (error) {
      throw new ValidationError(
        error.details.map((detail) => detail.message).join(", "),
      );
    }

    /**
     * Validation succeeded.
     *
     * Replace the original request data
     * with Joi's sanitized/coerced version.
     *
     *
     * Example:
     *
     * Query:
     *
     * ?employeeId=5
     *
     *
     * Before Joi:
     *
     * "5"  (string)
     *
     *
     * After Joi:
     *
     * 5    (number)
     *
     */
    switch (source) {
      case "query":
        req.query = value;
        break;

      case "params":
        req.params = value;
        break;

      case "body":
      default:
        req.body = value;
        break;
    }

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
