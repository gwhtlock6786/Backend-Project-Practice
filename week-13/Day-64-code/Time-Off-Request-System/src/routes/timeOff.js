const express = require("express");
const router = express.Router();
const { NotFoundError, ConflictError } = require("../errors/AppError.js");
const validate = require("../middleware/validate");
const {
  createTimeOffSchema,
  reviewTimeOffSchema,
} = require("../validators/timeOffSchema");

const {
  calculateDays,
  hasEnoughBalance,
  deductBalance,
  canChangeStatus,
  generateNextId,
} = require("../services/timeOffServices.js");

// ============================================
// STATE MACHINE & BALANCE TRACKING
// ============================================

const STATE_TRANSITIONS = {
  pending: ["approved", "rejected", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: [],
};

// Employee time-off balances (in days)
const employeeBalances = {
  1: { vacation: 10, sick: 5, personal: 3 }, // Maria Garcia
  2: { vacation: 15, sick: 5, personal: 3 }, // James Wilson
};

// ============================================
// IN-MEMORY DATA
// ============================================

let timeOffRequests = require("../data/timeoffRequests.js");

// ============================================
// ROUTES
// ============================================

// GET /time-off - List all time off requests
router.get("/", (req, res) => {
  let filtered = [...timeOffRequests];

  if (req.query.status) {
    filtered = filtered.filter((r) => r.status === req.query.status);
  }

  if (req.query.employeeId) {
    const employeeId = parseInt(req.query.employeeId);
    filtered = filtered.filter((r) => r.employeeId === employeeId);
  }

  if (req.query.type) {
    filtered = filtered.filter((r) => r.type === req.query.type);
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// GET /time-off/balance/:employeeId - Get employee's remaining balance
router.get("/balance/:employeeId", (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId) || req.params.employeeId;
    const balance = employeeBalances[employeeId];

    if (!balance) {
      throw new NotFoundError(`Employee balance for Id: ${employeeId}`);
    }

    res.json({
      success: true,
      data: {
        employeeId,
        balance,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /time-off/:id - Get one time off request
router.get("/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const request = timeOffRequests.find((r) => r.id === id);

    if (!request) {
      throw new NotFoundError("Time off request");
    }

    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// POST /time-off - Create new time off request
// Validation handled by Joi middleware
router.post("/", validate(createTimeOffSchema), (req, res, next) => {
  let nextId = generateNextId(timeOffRequests);

  try {
    const { employeeId, employeeName, startDate, endDate, type, reason } =
      req.body;

    // Calculate days requested
    const daysRequested = calculateDays(startDate, endDate);

    const newRequest = {
      id: nextId,
      employeeId: parseInt(employeeId),
      employeeName: employeeName || `Employee ${employeeId}`,
      startDate,
      endDate,
      type,
      reason: reason || "",
      daysRequested,
      status: "pending",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    };

    timeOffRequests.push(newRequest);

    res.status(201).json({
      success: true,
      message: "Time off request created",
      data: newRequest,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /time-off/:id/approve
// Approve time off request
router.patch(
  "/:id/approve",
  validate(reviewTimeOffSchema),
  (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      const request = timeOffRequests.find((r) => r.id === id);

      // ------------------------------------------
      // Check request exists
      // ------------------------------------------

      if (!request) {
        throw new NotFoundError("Time off request");
      }

      // ------------------------------------------
      // Only pending requests can be approved
      // ------------------------------------------
      if (!canChangeStatus(request.status, "approved", STATE_TRANSITIONS)) {
        throw new ConflictError("Only pending requests can be approved");
      }

      // ------------------------------------------
      // Check employee balance
      // ------------------------------------------

      hasEnoughBalance(
        employeeBalances,
        request.employeeId,
        request.type,
        request.daysRequested,
      );

      // ------------------------------------------
      // Deduct balance AFTER approval
      // ------------------------------------------

      deductBalance(
        employeeBalances,
        request.employeeId,
        request.type,
        request.daysRequested,
      );

      // ------------------------------------------
      // Update request
      // ------------------------------------------

      request.status = "approved";

      request.reviewedAt = new Date().toISOString();

      request.reviewedBy = req.body.reviewedBy;

      res.json({
        success: true,
        message: "Time off request approved",
        data: request,
      });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /time-off/:id/reject
// Reject time off request
router.patch("/:id/reject", validate(reviewTimeOffSchema), (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const request = timeOffRequests.find((r) => r.id === id);

    if (!request) {
      throw new NotFoundError("Time off request");
    }

    if (!canChangeStatus(request.status, "rejected", STATE_TRANSITIONS)) {
      throw new ConflictError("Only pending requests can be rejected");
    }

    request.status = "rejected";

    request.reviewedAt = new Date().toISOString();

    request.reviewedBy = req.body.reviewedBy;

    res.json({
      success: true,
      message: "Time off request rejected",
      data: request,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /time-off/:id
// Cancel pending time off request

router.delete("/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const request = timeOffRequests.find((r) => r.id === id);

    if (!request) {
      throw new NotFoundError("Time off request");
    }

    if (!canChangeStatus(request.status, "cancelled", STATE_TRANSITIONS)) {
      throw new ConflictError("Only pending requests can be cancelled");
    }

    request.status = "cancelled";
    request.cancelledAt = new Date().toISOString();

    res.json({
      success: true,
      message: "Time off request cancelled",
      data: request,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
