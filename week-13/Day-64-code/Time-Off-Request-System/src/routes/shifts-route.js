/**
 * =====================================================
 * Day 64: Shifts Router
 * =====================================================
 *
 * This router manages CRUD operations for employee shifts.
 *
 * Today we are improving yesterday's version by adding:
 *
 * ✅ Joi validation middleware
 * ✅ Centralized error handling
 * ✅ Better route organization
 * ✅ Service layer utility functions
 *
 * Route flow:
 *
 * Client Request
 *        |
 *        ↓
 * Joi Validation Middleware
 *        |
 *        ↓
 * Route Handler
 *        |
 *        ↓
 * Service / Business Logic
 *        |
 *        ↓
 * JSON Response
 *
 * =====================================================
 */

const express = require("express");
const router = express.Router();

const { NotFoundError } = require("../errors/AppError");

const { generateNextId } = require("../services/generateID.js");

const validate = require("../middleware/validate");

const {
  createShiftSchema,
  updateShiftSchema,
} = require("../validators/shiftSchema.js");

// ============================================
// IN-MEMORY DATA
// ============================================
//
// In a production application this data would come
// from a database.
//
// For practice purposes we are importing a JavaScript
// array that acts like our database.
//
let shifts = require("../data/shifts.js");

// ============================================
// GET ALL SHIFTS
// ============================================
//
// GET /shifts
//
// Optional query filters:
// ?date=2026-07-10
// ?employeeId=1
//
// Example:
// GET /shifts?employeeId=1
//
// ============================================

router.get("/", (req, res) => {
  // Create a copy of the array so we do not
  // accidentally modify our original data.
  let filteredShifts = [...shifts];

  // Filter by date if provided
  if (req.query.date) {
    filteredShifts = filteredShifts.filter(
      (shift) => shift.date === req.query.date,
    );
  }

  // Filter by employee if provided
  if (req.query.employeeId) {
    const employeeId = parseInt(req.query.employeeId);

    filteredShifts = filteredShifts.filter(
      (shift) => shift.employeeId === employeeId,
    );
  }

  res.json({
    success: true,
    count: filteredShifts.length,
    data: filteredShifts,
  });
});

// ============================================
// GET SINGLE SHIFT
// ============================================
//
// GET /shifts/:id
//
// Example:
// GET /shifts/1
//
// ============================================

router.get("/:id", (req, res, next) => {
  try {
    // Route parameters are strings by default,
    // so we convert the ID to a number.
    const id = parseInt(req.params.id);

    const shift = shifts.find((shift) => shift.id === id);

    if (!shift) {
      throw new NotFoundError("Shift");
    }

    res.json({
      success: true,
      data: shift,
    });
  } catch (err) {
    // Pass errors to centralized error middleware
    next(err);
  }
});

// ============================================
// CREATE SHIFT
// ============================================
//
// POST /shifts
//
// Validation happens BEFORE this handler runs.
//
// If validation fails:
//      Request stops here
//
// If validation passes:
//      Handler creates the shift
//
// ============================================

router.post("/", validate(createShiftSchema), (req, res, next) => {
  try {
    const {
      employeeId,
      employeeName,
      date,
      startTime,
      endTime,
      position,
      hourlyRate,
    } = req.body;

    const shift = {
      // Generate a unique ID
      id: generateNextId(shifts),

      // Joi already validated employeeId
      employeeId,

      employeeName,

      date,

      startTime,

      endTime,

      position,

      // If hourlyRate is missing,
      // use the default value of $15/hour.
      //
      // ?? only applies the default when the
      // value is null or undefined.
      hourlyRate: hourlyRate ?? 15.0,
    };

    shifts.push(shift);

    res.status(201).json({
      success: true,

      message: "Shift created successfully",

      data: shift,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// UPDATE SHIFT
// ============================================
//
// PUT /shifts/:id
//
// Updates an existing shift.
//
// Example:
// PUT /shifts/1
//
// ============================================

router.put("/:id", validate(updateShiftSchema), (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const shiftIndex = shifts.findIndex((shift) => shift.id === id);

    if (shiftIndex === -1) {
      throw new NotFoundError("Shift");
    }

    /*
        Spread operator (...) combines objects.

        Existing shift:
        {
          id: 1,
          position: "Cashier",
          hourlyRate: 15
        }

        Updated fields:
        {
          hourlyRate: 18
        }

        Result:
        {
          id: 1,
          position: "Cashier",
          hourlyRate: 18
        }
      */

    shifts[shiftIndex] = {
      ...shifts[shiftIndex],

      ...req.body,

      // Prevent users from changing IDs
      id,
    };

    res.json({
      success: true,

      message: "Shift updated successfully",

      data: shifts[shiftIndex],
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// DELETE SHIFT
// ============================================
//
// DELETE /shifts/:id
//
// Removes a shift from the system.
//
// Successful deletes return:
// 204 No Content
//
// This means:
// "The request succeeded,
// but there is no response body."
//
// ============================================

router.delete("/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const shiftIndex = shifts.findIndex((shift) => shift.id === id);

    if (shiftIndex === -1) {
      throw new NotFoundError("Shift");
    }

    // Remove one item from the array
    shifts.splice(shiftIndex, 1);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
