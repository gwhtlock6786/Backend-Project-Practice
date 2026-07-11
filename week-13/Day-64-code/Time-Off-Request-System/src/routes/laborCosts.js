/**
 * =====================================================
 * Day 64: Labor Cost Routes
 * =====================================================
 *
 * This router handles HTTP requests related to
 * employee labor cost calculations.
 *
 *
 * IMPORTANT:
 *
 * This file should NOT contain business logic.
 *
 * It should only:
 *
 * ✔ Receive request data
 * ✔ Validate required inputs
 * ✔ Call service functions
 * ✔ Return responses
 *
 *
 * Business calculations live in:
 *
 * services/laborCostService.js
 *
 *
 * =====================================================
 */

const express = require("express");

const router = express.Router();

const { NotFoundError } = require("../errors/AppError.js");

const validate = require("../middleware/validate.js");

// ============================================
// Joi Validation Schemas
// ============================================

const {
  weeklyLaborCostSchema,
  employeeLaborCostSchema,
  dailyLaborCostSchema,
} = require("../validators/laborCostsSchema.js");

// Import shift data
//
// In a real application this would come
// from a database.
//
// Example:
//
// SELECT * FROM shifts
//
const shifts = require("../data/shifts.js");

// Import labor cost business logic
//
// All calculations happen inside the service layer.
//
// The route only passes data and returns results.
//

const {
  calculateWeeklyLaborCosts,
  calculateEmployeeWeeklyCost,
  calculateDailyLaborCosts,
} = require("../services/laborCostService.js");

// ============================================
// GET WEEKLY LABOR COSTS
// ============================================
//
// GET /labor-costs/weekly
//
// Query:
//
// ?weekStart=2025-01-06
//
//
// Validation:
//
// validate(..., "query")
//
// Joi checks:
// - weekStart exists
// - valid date format
//
// ============================================

router.get(
  "/weekly",
  validate(weeklyLaborCostSchema, "query"),
  (req, res, next) => {
    try {
      const { weekStart } = req.query;

      // --------------------------------------
      // Call Service
      // --------------------------------------
      //
      // Route responsibility:
      //
      // Receive request
      // Pass data
      // Return response
      //
      // Business logic:
      //
      // calculate hours
      // calculate overtime
      // calculate pay
      //
      // happens in the service.
      //
      // --------------------------------------

      const result = calculateWeeklyLaborCosts(shifts, weekStart);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ============================================
// GET EMPLOYEE LABOR COST
// ============================================
//
// GET /labor-costs/employee/:employeeId
//
// Query:
//
// ?weekStart=2025-01-06
//
//
// Validation:
//
// employeeId comes from params
// weekStart comes from query
//
// ============================================

router.get("/employee/:employeeId", (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;

    const { weekStart } = req.query;

    const result = calculateEmployeeWeeklyCost(shifts, employeeId, weekStart);

    if (!result) {
      throw new NotFoundError("Employee labor record");
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// GET DAILY LABOR COSTS
// ============================================
//
// GET /labor-costs/daily
//
// Query:
//
// ?date=2025-01-06
//
// Validation:
// - date required
// - ISO date format
//
// ============================================

router.get(
  "/daily",
  validate(dailyLaborCostSchema, "query"),
  (req, res, next) => {
    try {
      const { date } = req.query;

      const result = calculateDailyLaborCosts(shifts, date);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
