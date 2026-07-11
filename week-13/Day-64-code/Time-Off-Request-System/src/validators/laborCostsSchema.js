/**
 * =====================================================
 * Day 64 - Labor Cost Validation Schemas
 * =====================================================
 *
 * Joi schemas validate incoming labor cost request data.
 *
 * IMPORTANT:
 *
 * These schemas ONLY validate:
 *
 * ✔ Required fields exist
 * ✔ Correct data types
 * ✔ Correct formatting
 * ✔ Valid ranges
 *
 *
 * They DO NOT:
 *
 * ❌ Calculate labor costs
 * ❌ Calculate overtime
 * ❌ Check if employees exist
 * ❌ Check if shifts exist
 *
 *
 * Business logic belongs in:
 *
 * services/laborCostService.js
 *
 *
 * =====================================================
 */

const Joi = require("joi");

// ============================================
// Weekly Labor Cost Query Schema
// ============================================
//
// Used by:
//
// GET /labor-costs/weekly
//
// Example:
//
// /labor-costs/weekly?weekStart=2025-01-06
//
// ============================================

/**
 * Validates the starting date for
 * weekly labor calculations.
 *
 * The service will use this date to calculate:
 *
 * start:
 * 2025-01-06
 *
 * end:
 * 2025-01-12
 *
 */

const weeklyLaborCostSchema = Joi.object({
  // ------------------------------------------
  // Week Start Date
  // ------------------------------------------

  /**
   * The first day of the payroll week.
   *
   * Rules:
   *
   * - Must exist
   * - Must be a valid ISO date
   *
   * Example:
   *
   * "2025-01-06"
   *
   */

  weekStart: Joi.date().iso().required().messages({
    "any.required": "weekStart query parameter is required.",

    "date.base": "weekStart must be a valid date.",

    "date.format": "weekStart must use ISO format (YYYY-MM-DD).",
  }),
});

// ============================================
// Employee Labor Cost Params Schema
// ============================================
//
// Used by:
//
// GET /labor-costs/employee/:employeeId
//
// Example:
//
// /labor-costs/employee/5?weekStart=2025-01-06
//
// ============================================

/**
 * Validates employee ID from URL params.
 *
 * Before Joi:
 *
 * req.params
 *
 * {
 *    employeeId: "5"
 * }
 *
 *
 * After Joi:
 *
 * {
 *    employeeId: 5
 * }
 *
 */

const employeeLaborCostSchema = Joi.object({
  // ------------------------------------------
  // Employee ID
  // ------------------------------------------

  /**
   *
   * Employee IDs must:
   *
   * - Be numbers
   * - Be whole numbers
   * - Be positive
   * - Be required
   *
   */

  employeeId: Joi.number().integer().positive().required().messages({
    "any.required": "Employee ID is required.",

    "number.base": "Employee ID must be a number.",

    "number.integer": "Employee ID must be a whole number.",

    "number.positive": "Employee ID must be positive.",
  }),
});

// ============================================
// Daily Labor Cost Query Schema
// ============================================
//
// Used by:
//
// GET /labor-costs/daily
//
// Example:
//
// /labor-costs/daily?date=2025-01-06
//
// ============================================

/**
 * Validates date used for
 * daily labor reports.
 *
 */

const dailyLaborCostSchema = Joi.object({
  // ------------------------------------------
  // Date
  // ------------------------------------------

  /**
   *
   * Rules:
   *
   * - Required
   * - Valid ISO date
   *
   */

  date: Joi.date().iso().required().messages({
    "any.required": "date query parameter is required.",

    "date.base": "date must be a valid date.",

    "date.format": "date must use ISO format (YYYY-MM-DD).",
  }),
});

// ============================================
// Export Schemas
// ============================================

module.exports = {
  weeklyLaborCostSchema,

  employeeLaborCostSchema,

  dailyLaborCostSchema,
};
