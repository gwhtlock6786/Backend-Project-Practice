/**
 * =====================================================
 * Day 64 - Time Off Request Validation Schemas
 * =====================================================
 *
 * Joi schemas define what valid request data looks like.
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
 *   validate(createTimeOffSchema),
 *   createTimeOffRequest
 * );
 *
 * =====================================================
 */

const Joi = require("joi");

// ============================================
// Valid Time Off Types
// ============================================

/**
 * These are the only acceptable time off types.
 * Joi's .valid() method will compare incoming values
 * against this array.
 */
const TIME_OFF_TYPES = ["vacation", "sick", "personal", "unpaid"];

// ============================================
// Create Time Off Request Schema
// ============================================

const createTimeOffSchema = Joi.object({
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
  // Start Date
  // ------------------------------------------

  /**
   * The requested start date:
   * - must be a valid ISO date
   * - must occur today or later
   */
  startDate: Joi.date().iso().min("now").required().messages({
    "date.base": "Start date must be a valid date.",
    "date.format": "Start date must use ISO format (YYYY-MM-DD).",
    "date.min": "Start date must be today or later.",
    "any.required": "Start date is required.",
  }),

  // ------------------------------------------
  // End Date
  // ------------------------------------------

  /**
   * The end date:
   * - must be a valid ISO date
   * - cannot occur before the start date
   */
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required().messages({
    "date.base": "End date must be a valid date.",
    "date.format": "End date must use ISO format (YYYY-MM-DD).",
    "date.min": "End date must be on or after the start date.",
    "any.required": "End date is required.",
  }),

  // ------------------------------------------
  // Time Off Type
  // ------------------------------------------

  /**
   * The request type must be one of the
   * approved values listed above.
   */
  type: Joi.string()
    .valid(...TIME_OFF_TYPES)
    .required()
    .messages({
      "any.required": "Time off type is required.",
      "any.only": "Time off type must be vacation, sick, personal, or unpaid.",
    }),

  // ------------------------------------------
  // Reason
  // ------------------------------------------

  /**
   * A reason is optional.
   * If provided, it cannot exceed 500 characters.
   */
  reason: Joi.string().max(500).optional().messages({
    "string.max": "Reason cannot exceed 500 characters.",
  }),
});

// ============================================
// Approve / Reject Request Schema
// ============================================

/**
 * When approving or rejecting a request,
 * we only need to know who reviewed it.
 */
const reviewTimeOffSchema = Joi.object({
  reviewedBy: Joi.string().min(2).max(100).required().messages({
    "any.required": "Reviewer name is required.",
    "string.empty": "Reviewer name cannot be empty.",
    "string.min": "Reviewer name must be at least 2 characters.",
    "string.max": "Reviewer name cannot exceed 100 characters.",
  }),
});

// ============================================
// Export Schemas
// ============================================

module.exports = {
  createTimeOffSchema,
  reviewTimeOffSchema,
  TIME_OFF_TYPES,
};
