/**
 * =====================================================
 * Day 64: Shift Swap Requests Router
 * =====================================================
 *
 * This router manages the workflow for employee shift
 * swap requests.
 *
 * A shift swap follows a workflow (state machine):
 *
 * pending
 *    |
 *    +------> approved
 *    |
 *    +------> rejected
 *    |
 *    +------> cancelled
 *
 * Once a request leaves the "pending" state,
 * it cannot be changed again.
 *
 * Today this router demonstrates:
 *
 * ✔ CRUD-style API routes
 * ✔ Joi validation middleware
 * ✔ State machine workflow
 * ✔ Authorization checks
 * ✔ Centralized error handling
 * ✔ Audit trail (reviewedBy, reviewedAt)
 *
 * =====================================================
 */

const express = require("express");
const router = express.Router();

const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require("../errors/AppError.js");

const validate = require("../middleware/validate.js");

const {
  createShiftSwapSchema,
  updateShiftSwapSchema,
  reviewShiftSwapSchema,
} = require("../validators/shiftSwapSchema.js");

const { canChangeStatus } = require("../services/timeOffServices");

const { generateNextId } = require("../services/generateID.js");

// ============================================
// STATE MACHINE
// ============================================
//
// A state machine defines which status changes
// are allowed.
//
// Valid transitions:
//
// pending
//    |
//    +----> approved
//    |
//    +----> rejected
//    |
//    +----> cancelled
//
// Approved, rejected, and cancelled are
// final states.
//
// ============================================

const STATE_TRANSITIONS = {
  pending: ["approved", "rejected", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: [],
};

// ============================================
// IN-MEMORY DATA
// ============================================
//
// In a real application this information would
// come from a database.
//
// For this lesson we are importing a JavaScript
// array from our data folder to simulate one.
//
// ============================================
const { shiftSwaps } = require("../data/shift-swap-data.js");

// ============================================
// GET ALL SHIFT SWAPS
// ============================================
//
// GET /shift-swaps
//
// Optional Query Parameters:
//
// ?status=pending
//
// ?requesterId=1
//
// Example:
//
// GET /shift-swaps?status=pending
//
// ============================================

router.get("/", (req, res) => {
  // Create a copy so the original array
  // cannot be modified accidentally.
  let filtered = [...shiftSwaps];

  // ------------------------------------------
  // Filter by Status
  // ------------------------------------------

  if (req.query.status) {
    filtered = filtered.filter((swap) => swap.status === req.query.status);
  }

  // ------------------------------------------
  // Filter by Requesting Employee
  // ------------------------------------------

  if (req.query.requesterId) {
    const requesterId = parseInt(req.query.requesterId);

    filtered = filtered.filter((swap) => swap.requesterId === requesterId);
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// ============================================
// GET SINGLE SHIFT SWAP
// ============================================
//
// GET /shift-swaps/:id
//
// Example:
//
// GET /shift-swaps/1
//
// ============================================

router.get("/:id", (req, res, next) => {
  try {
    // Route parameters are strings,
    // so convert the ID into a number.
    const id = parseInt(req.params.id);

    // Array.find() returns:
    // • matching object
    // • undefined if not found
    const swap = shiftSwaps.find((swap) => swap.id === id);

    if (!swap) {
      throw new NotFoundError("Shift swap request");
    }

    res.json({
      success: true,
      data: swap,
    });
  } catch (err) {
    // Pass errors to the centralized
    // error-handling middleware.
    next(err);
  }
});
