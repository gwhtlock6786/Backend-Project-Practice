const express = require("express");
const router = express.Router();

// Import shift data
let shifts = require("../data/shift-data");

const { checkShiftConflict } = require("../services/shiftServices");

// ============================================================
// GET /shifts - Get all shifts
// ============================================================
router.get("/", (req, res) => {
  res.json(shifts);
});

// ============================================================
// GET /shifts/:id - Get one shift
// ============================================================
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const shift = shifts.find((s) => s.id === id);

  if (!shift) {
    return res.status(404).json({ message: "Shift not found" });
  }

  res.json(shift);
});

// ============================================================
// POST /shifts - Create a new shift (with validation)
// ============================================================
router.post("/", (req, res) => {
  const {
    employeeId,
    employeeName,
    date,
    startTime,
    endTime,
    position,
    notes,
  } = req.body;

  // Basic validation
  if (
    !employeeId ||
    !employeeName ||
    !date ||
    !startTime ||
    !endTime ||
    !position
  ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const newShift = {
    id: shifts.length ? shifts[shifts.length - 1].id + 1 : 1,
    employeeId,
    employeeName,
    date,
    startTime,
    endTime,
    position,
    notes: notes || "",
  };

  // Check for shift conflicts
  const { hasConflict, conflictingShift } = checkShiftConflict(
    newShift,
    shifts,
  );

  if (hasConflict) {
    return res.status(409).json({
      message: "Shift conflict detected",
      conflictingShift,
    });
  }

  shifts.push(newShift);

  res.status(201).json(newShift);
});

// ============================================================
// PUT /shifts/:id - Update a shift
// ============================================================
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = shifts.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Shift not found" });
  }

  shifts[index] = {
    id: shifts[index].id,
    ...req.body,
  };

  res.json(shifts[index]);
});

// ============================================================
// DELETE /shifts/:id - Remove a shift
// ============================================================
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = shifts.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Shift not found" });
  }

  const deletedShift = shifts.splice(index, 1);

  res.json({
    message: "Shift deleted successfully",
    deleted: deletedShift[0],
  });
});

module.exports = router;
