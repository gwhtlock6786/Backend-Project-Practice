/**
 * =====================================================
 * Day 64 - Shift Validation Schemas
 * =====================================================
 *
 * Joi schemas define what valid shift data looks like.
 * They DO NOT validate requests by themselves.
 *
 * Our validation middleware will later use these schemas
 * to check incoming request bodies before they reach the
 * route handler.
 *
 * Example:
 *
 * router.post(
 *   "/",
 *   validate(createShiftSchema),
 *   createShift
 * );
 *
 * =====================================================
 */

const Joi = require("joi");

// ============================================
// Valid Shift Positions
// ============================================

/**
 * These are the only acceptable employee positions.
 * Joi's .valid() method ensures only these values
 * can be submitted by the client.
 */
const SHIFT_POSITIONS = [
  "Cashier",
  "Cook",
  "Server",
  "Manager",
  "Host",
  "Evil Overlord",
];

// ============================================
// Create Shift Schema
// ============================================

const createShiftSchema = Joi.object({
  // ------------------------------------------
  // Employee ID
  // ------------------------------------------

  /**
   * Employee IDs must:
   * - be numbers
   * - be whole numbers
   * - be greater than zero
   * - always be provided
   */
  employeeId: Joi.number().integer().positive().required().messages({
    "any.required": "Employee ID is required.",
    "number.base": "Employee ID must be a number.",
    "number.integer": "Employee ID must be a whole number.",
    "number.positive": "Employee ID must be positive.",
  }),

  // ------------------------------------------
  // Employee Name
  // ------------------------------------------

  /**
   * Employee names must:
   * - contain at least 2 characters
   * - contain no more than 100 characters
   * - always be provided
   */
  employeeName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Employee name is required.",
    "string.empty": "Employee name cannot be empty.",
    "string.min": "Employee name must be at least 2 characters.",
    "string.max": "Employee name cannot exceed 100 characters.",
  }),

  // ------------------------------------------
  // Shift Date
  // ------------------------------------------

  /**
   * Shift dates must:
   * - be valid ISO dates
   * - occur today or later
   */
  date: Joi.date().iso().min("now").required().messages({
    "any.required": "Shift date is required.",
    "date.base": "Shift date must be a valid date.",
    "date.format": "Shift date must use ISO format (YYYY-MM-DD).",
    "date.min": "Shift date must be today or later.",
  }),

  // ------------------------------------------
  // Start Time
  // ------------------------------------------

  /**
   * Start time must:
   * - be provided
   * - follow 24-hour HH:MM format
   */
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "any.required": "Start time is required.",
      "string.empty": "Start time cannot be empty.",
      "string.pattern.base": "Start time must use 24-hour format (HH:MM).",
    }),

  // ------------------------------------------
  // End Time
  // ------------------------------------------

  /**
   * End time must:
   * - be provided
   * - follow 24-hour HH:MM format
   */
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "any.required": "End time is required.",
      "string.empty": "End time cannot be empty.",
      "string.pattern.base": "End time must use 24-hour format (HH:MM).",
    }),

  // ------------------------------------------
  // Position
  // ------------------------------------------

  /**
   * Position must be one of the approved
   * shift positions listed above.
   */
  position: Joi.string()
    .valid(...SHIFT_POSITIONS)
    .required()
    .messages({
      "any.required": "Position is required.",
      "any.only":
        "Position must be Cashier, Cook, Server, Manager, Evil Overlord, or Host.",
    }),

  // ------------------------------------------
  // Hourly Rate
  // ------------------------------------------

  /**
   * Hourly rate:
   * - is optional
   * - must be a positive number
   * - defaults to 15 if omitted
   */
  hourlyRate: Joi.number().positive().optional().messages({
    "number.base": "Hourly rate must be a number.",
    "number.positive": "Hourly rate must be greater than zero.",
  }),
});

// ============================================
// Update Shift Schema
// ============================================

/**
 * Updating a shift allows partial updates.
 * Every field is optional, but at least one
 * field must be included.
 */
const updateShiftSchema = Joi.object({
  employeeId: Joi.number().integer().positive(),

  employeeName: Joi.string().min(2).max(100),

  date: Joi.date().iso(),

  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),

  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),

  position: Joi.string().valid(...SHIFT_POSITIONS),

  hourlyRate: Joi.number().positive(),
}).min(1);

// ============================================
// Export Schemas
// ============================================

module.exports = {
  createShiftSchema,
  updateShiftSchema,
  SHIFT_POSITIONS,
};
