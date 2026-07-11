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
  cancelShiftSwapSchema,
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

/*
    Current State      Allowed Next States

    pending     ---> approved
                 ---> rejected
                 ---> cancelled

    approved    ---> none

    rejected    ---> none

    cancelled   ---> none
*/

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
const shiftSwaps = require("../data/shift-swap-data.js");

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
  // Create a shallow copy.
  //
  // This allows us to filter the data
  // without changing the original array.
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

// ============================================
// CREATE SHIFT SWAP REQUEST
// ============================================
//
// POST /shift-swaps
//
// Creates a new shift swap request.
//
// Workflow:
//
// 1. Employee creates swap request
// 2. Request starts as "pending"
// 3. Manager reviews request
// 4. Request can become:
//        approved
//        rejected
//        cancelled
//
// Example:
//
// POST /shift-swaps
//
// ============================================

router.post("/", validate(createShiftSwapSchema), (req, res, next) => {
  try {
    const {
      requesterId,
      requesterName,
      targetEmployeeId,
      targetEmployeeName,
      requesterShiftId,
      targetShiftId,
      reason,
    } = req.body;

    // ------------------------------------------
    // Create New Shift Swap Object
    // ------------------------------------------
    //
    // At this point Joi has already validated:
    //
    // ✔ Required fields exist
    // ✔ IDs are positive numbers
    // ✔ Names meet length requirements
    // ✔ Reason is within allowed length
    //
    // This allows our route to focus only
    // on creating the data.
    //
    // ------------------------------------------

    const newSwap = {
      // Generate the next unique ID
      //
      // Example:
      //
      // Existing IDs:
      // [1, 2, 3]
      //
      // New ID:
      // 4
      //
      id: generateNextId(shiftSwaps),

      // --------------------------------------
      // Employee Requesting Swap
      // --------------------------------------

      requesterId,

      requesterName,

      // --------------------------------------
      // Employee Receiving Swap
      // --------------------------------------

      targetEmployeeId,

      targetEmployeeName,

      // --------------------------------------
      // Shift Information
      // --------------------------------------
      //
      // requesterShiftId:
      // The shift the employee wants to give away
      //
      // targetShiftId:
      // The shift they want instead
      //
      // --------------------------------------

      requesterShiftId,

      targetShiftId,

      // Optional explanation from employee
      reason: reason || "",

      // --------------------------------------
      // Initial Status
      // --------------------------------------
      //
      // Every new request starts as pending.
      //
      // We NEVER allow users to create their
      // own approved request because approval
      // must happen through the workflow.
      //
      // --------------------------------------

      status: "pending",

      // --------------------------------------
      // Audit Information
      // --------------------------------------
      //
      // These fields track the history of
      // the request.
      //
      // When created:
      //
      // reviewedAt = null
      // reviewedBy = null
      //
      // They are updated later when a manager
      // approves or rejects the request.
      //
      // --------------------------------------

      createdAt: new Date().toISOString(),

      reviewedAt: null,

      reviewedBy: null,
    };

    // Add the new request to our data store
    //
    // In production this would be:
    //
    // INSERT INTO shift_swaps (...)
    //
    // For practice:
    //
    // array.push()
    //
    shiftSwaps.push(newSwap);

    res.status(201).json({
      success: true,

      message: "Shift swap request created successfully",

      data: newSwap,
    });
  } catch (err) {
    // Send errors to centralized
    // error-handling middleware.
    //
    // Example:
    //
    // Database error
    // Unexpected error
    //
    next(err);
  }
});

// ============================================
// APPROVE SHIFT SWAP REQUEST
// ============================================
//
// PATCH /shift-swaps/:id/approve
//
// Workflow:
//
// pending
//    |
//    ↓
// approved
//
// Only pending requests can be approved.
//
// Example:
//
// PATCH /shift-swaps/1/approve
//
// Body:
//
// {
//   "reviewedBy": "Manager Smith"
// }
//
// ============================================

router.patch(
  "/:id/approve",
  validate(reviewShiftSwapSchema),
  (req, res, next) => {
    try {
      // Route parameters arrive as strings
      // Convert id into a number
      const id = parseInt(req.params.id);

      // Find the shift swap request
      const swap = shiftSwaps.find((swap) => swap.id === id);

      // ------------------------------------------
      // Check Request Exists
      // ------------------------------------------

      if (!swap) {
        throw new NotFoundError("Shift swap request");
      }

      // ------------------------------------------
      // Validate State Transition
      // ------------------------------------------
      //
      // We only allow:
      //
      // pending → approved
      //
      // Approved, rejected, and cancelled
      // requests cannot change.
      //
      // ------------------------------------------

      if (!canChangeStatus(swap.status, "approved", STATE_TRANSITIONS)) {
        throw new ConflictError(
          `Cannot approve request. Current status is ${swap.status}`,
        );
      }

      // ------------------------------------------
      // Update Request
      // ------------------------------------------

      swap.status = "approved";

      swap.reviewedAt = new Date().toISOString();

      swap.reviewedBy = req.body.reviewedBy;

      // ------------------------------------------
      // Return Updated Request
      // ------------------------------------------

      res.json({
        success: true,
        message: "Shift swap request approved successfully",
        data: swap,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ============================================
// REJECT SHIFT SWAP REQUEST
// ============================================
//
// PATCH /shift-swaps/:id/reject
//
// Workflow:
//
// pending
//    |
//    ↓
// rejected
//
// Example:
//
// PATCH /shift-swaps/1/reject
//
// Body:
//
// {
//   "reviewedBy": "Manager Smith",
//   "rejectionReason": "Coverage unavailable"
// }
//
// ============================================

router.patch(
  "/:id/reject",
  validate(reviewShiftSwapSchema),
  (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      const swap = shiftSwaps.find((swap) => swap.id === id);

      // ------------------------------------------
      // Check Request Exists
      // ------------------------------------------

      if (!swap) {
        throw new NotFoundError("Shift swap request");
      }

      // ------------------------------------------
      // Validate State Transition
      // ------------------------------------------

      if (!canChangeStatus(swap.status, "rejected", STATE_TRANSITIONS)) {
        throw new ConflictError(
          `Cannot reject request. Current status is ${swap.status}`,
        );
      }

      // ------------------------------------------
      // Update Request
      // ------------------------------------------

      swap.status = "rejected";

      swap.reviewedAt = new Date().toISOString();

      swap.reviewedBy = req.body.reviewedBy;

      // Store optional rejection explanation

      swap.rejectionReason = req.body.rejectionReason || "";

      res.json({
        success: true,
        message: "Shift swap request rejected successfully",
        data: swap,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ============================================
// CANCEL SHIFT SWAP REQUEST
// ============================================
//
// PATCH /shift-swaps/:id/cancel
//
// Only the employee who created
// the request can cancel it.
//
// Workflow:
//
// pending
//    |
//    ↓
// cancelled
//
// Example:
//
// PATCH /shift-swaps/1/cancel
//
// Body:
//
// {
//   "requesterId": 1
// }
//
// ============================================

router.patch(
  "/:id/cancel",
  validate(cancelShiftSwapSchema),
  (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      const swap = shiftSwaps.find((swap) => swap.id === id);

      // ------------------------------------------
      // Check Request Exists
      // ------------------------------------------

      if (!swap) {
        throw new NotFoundError("Shift swap request");
      }

      // ------------------------------------------
      // Authorization Check
      // ------------------------------------------
      //
      // Make sure the person cancelling
      // owns the request.
      //
      // Example:
      //
      // Request belongs to Maria (id 1)
      //
      // James cannot cancel it.
      //
      // ------------------------------------------

      if (swap.requesterId !== req.body.requesterId) {
        throw new ForbiddenError(
          "You can only cancel your own shift swap request",
        );
      }

      // ------------------------------------------
      // Validate State Transition
      // ------------------------------------------

      if (!canChangeStatus(swap.status, "cancelled", STATE_TRANSITIONS)) {
        throw new ConflictError(
          `Cannot cancel request. Current status is ${swap.status}`,
        );
      }

      // ------------------------------------------
      // Update Request
      // ------------------------------------------

      swap.status = "cancelled";

      swap.cancelledAt = new Date().toISOString();

      res.json({
        success: true,
        message: "Shift swap request cancelled successfully",
        data: swap,
      });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
