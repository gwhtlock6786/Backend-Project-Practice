/**
 * =====================================================
 * Day 64 - Shift Swap Request Validation Schemas
 * =====================================================
 *
 * Joi schemas define what valid shift swap request data
 * should look like.
 *
 * IMPORTANT:
 * These schemas ONLY validate the shape and format of
 * incoming data.
 *
 * They DO NOT:
 * - check if employees exist
 * - check if shifts exist
 * - check if a shift is already swapped
 * - check if a request is approved
 *
 * Those rules belong in the route/controller logic.
 *
 * Example:
 *
 * router.post(
 *   "/",
 *   validate(createShiftSwapSchema),
 *   createShiftSwapRequest
 * );
 *
 * =====================================================
 */

const Joi = require("joi");

// ============================================
// Create Shift Swap Request Schema
// ============================================

/**
 * This schema validates data when an employee
 * creates a new shift swap request.
 *
 * A shift swap request needs:
 *
 * - The employee requesting the swap
 * - The employee they want to swap with
 * - The shift being given away
 * - The shift they want in return
 * - An optional reason
 */

const createShiftSwapSchema = Joi.object({
  // ------------------------------------------
  // Requester Employee ID
  // ------------------------------------------

  /**
   * The employee who is requesting the swap.
   *
   * Rules:
   * - Must be a number
   * - Must be a whole number
   * - Must be greater than zero
   * - Required field
   */
  requesterId: Joi.number().integer().positive().required().messages({
    "any.required": "Requester ID is required.",
    "number.base": "Requester ID must be a number.",
    "number.integer": "Requester ID must be a whole number.",
    "number.positive": "Requester ID must be positive.",
  }),

  // ------------------------------------------
  // Requester Employee Name
  // ------------------------------------------

  /**
   * The name of the employee requesting
   * the shift swap.
   *
   * Rules:
   * - Minimum 2 characters
   * - Maximum 100 characters
   * - Required field
   */
  requesterName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Requester name is required.",
    "string.empty": "Requester name cannot be empty.",
    "string.min": "Requester name must be at least 2 characters.",
    "string.max": "Requester name cannot exceed 100 characters.",
  }),

  // ------------------------------------------
  // Target Employee ID
  // ------------------------------------------

  /**
   * The employee who will receive the
   * swap request.
   *
   * Rules:
   * - Must be a number
   * - Must be a whole number
   * - Must be positive
   * - Required
   */
  targetEmployeeId: Joi.number().integer().positive().required().messages({
    "any.required": "Target employee ID is required.",
    "number.base": "Target employee ID must be a number.",
    "number.integer": "Target employee ID must be a whole number.",
    "number.positive": "Target employee ID must be positive.",
  }),

  // ------------------------------------------
  // Target Employee Name
  // ------------------------------------------

  /**
   * The name of the employee receiving
   * the swap request.
   *
   * Rules:
   * - Minimum 2 characters
   * - Maximum 100 characters
   * - Required
   */
  targetEmployeeName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Target employee name is required.",
    "string.empty": "Target employee name cannot be empty.",
    "string.min": "Target employee name must be at least 2 characters.",
    "string.max": "Target employee name cannot exceed 100 characters.",
  }),

  // ------------------------------------------
  // Requester's Shift ID
  // ------------------------------------------

  /**
   * The shift the requester wants to give away.
   *
   * Rules:
   * - Must be a number
   * - Must be a whole number
   * - Must be positive
   * - Required
   */
  requesterShiftId: Joi.number().integer().positive().required().messages({
    "any.required": "Requester shift ID is required.",
    "number.base": "Requester shift ID must be a number.",
    "number.integer": "Requester shift ID must be a whole number.",
    "number.positive": "Requester shift ID must be positive.",
  }),

  // ------------------------------------------
  // Target Shift ID
  // ------------------------------------------

  /**
   * The shift the requester wants to receive.
   *
   * Rules:
   * - Must be a number
   * - Must be a whole number
   * - Must be positive
   * - Required
   */
  targetShiftId: Joi.number().integer().positive().required().messages({
    "any.required": "Target shift ID is required.",
    "number.base": "Target shift ID must be a number.",
    "number.integer": "Target shift ID must be a whole number.",
    "number.positive": "Target shift ID must be positive.",
  }),

  // ------------------------------------------
  // Reason
  // ------------------------------------------

  /**
   * Employees can optionally explain why
   * they need the shift swap.
   *
   * Rules:
   * - Optional field
   * - Maximum 500 characters
   */
  reason: Joi.string().max(500).optional().messages({
    "string.max": "Reason cannot exceed 500 characters.",
  }),
});

// ============================================
// Update Shift Swap Request Schema
// ============================================

/**
 * Used when partially updating a shift swap.
 *
 * Example:
 * PATCH /shift-swaps/:id
 *
 * Unlike the create schema:
 * - Fields are optional
 * - At least ONE field must be provided
 *
 * The .min(1) prevents sending:
 *
 * {}
 *
 * because an empty update does nothing.
 */

const updateShiftSwapSchema = Joi.object({
  requesterShiftId: Joi.number().integer().positive().optional(),

  targetShiftId: Joi.number().integer().positive().optional(),

  reason: Joi.string().max(500).optional(),
})
  .min(1)
  .messages({
    "object.min":
      "At least one field is required to update a shift swap request.",
  });

// ============================================
// Approve / Reject Shift Swap Schema
// ============================================

/**
 * When approving or rejecting a shift swap,
 * we need to know who reviewed the request.
 *
 * The route will handle:
 * - changing status
 * - checking current status is pending
 * - saving approval date
 */
const reviewShiftSwapSchema = Joi.object({
  reviewedBy: Joi.string().min(2).max(100).required().messages({
    "any.required": "Reviewer name is required.",
    "string.empty": "Reviewer name cannot be empty.",
    "string.min": "Reviewer name must be at least 2 characters.",
    "string.max": "Reviewer name cannot exceed 100 characters.",
  }),

  rejectionReason: Joi.string().max(500).optional().messages({
    "string.max": "Rejection reason cannot exceed 500 characters.",
  }),
});

// ============================================
// Cancel Shift Swap Request Schema
// ============================================

/**
 * When cancelling a shift swap request,
 * we need to know who is attempting to cancel it.
 *
 * The route will handle:
 *
 * - checking the request exists
 * - checking the requester owns the request
 * - checking the status is still pending
 * - changing status to cancelled
 *
 * Joi only verifies that requesterId
 * is valid input.
 */

const cancelShiftSwapSchema = Joi.object({
  // ------------------------------------------
  // Requester ID
  // ------------------------------------------

  /**
   * Employee attempting to cancel
   * the shift swap request.
   *
   * Rules:
   * - Must be a number
   * - Must be a whole number
   * - Must be positive
   * - Required field
   */

  requesterId: Joi.number().integer().positive().required().messages({
    "any.required": "Requester ID is required.",
    "number.base": "Requester ID must be a number.",
    "number.integer": "Requester ID must be a whole number.",
    "number.positive": "Requester ID must be positive.",
  }),
});

// ============================================
// Export Schemas
// ============================================

module.exports = {
  createShiftSwapSchema,
  updateShiftSwapSchema,
  reviewShiftSwapSchema,
  cancelShiftSwapSchema,
};
