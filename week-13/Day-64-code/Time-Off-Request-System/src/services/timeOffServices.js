/**
 * =====================================================
 * Day 64 - Time Off Helper Functions
 * =====================================================
 *
 * Helper functions contain reusable business logic.
 *
 * Routes should handle:
 * - receiving requests
 * - calling helpers
 * - sending responses
 *
 * Helpers should handle:
 * - calculations
 * - business rules
 * - data changes
 *
 * =====================================================
 */

const { ValidationError, NotFoundError } = require("../errors/AppError");

// ============================================
// Calculate Number of Days Requested
// ============================================

/**
 * Calculates how many calendar days are
 * between two dates.
 *
 * Example:
 *
 * startDate: 2025-01-10
 * endDate:   2025-01-12
 *
 * Result:
 * 3 days
 *
 * We add +1 because both the start
 * and end date count.
 */

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);

  const end = new Date(endDate);

  const difference = Math.abs(end - start);

  return Math.ceil(difference / (1000 * 60 * 60 * 24)) + 1;
}

// ============================================
// Check Employee Balance
// ============================================

/**
 * Checks whether an employee has enough
 * available time off before approving.
 *
 * IMPORTANT:
 *
 * This does NOT deduct balance.
 *
 * It only checks if the request is possible.
 */

function hasEnoughBalance(employeeBalances, employeeId, type, daysRequested) {
  const balance = employeeBalances[employeeId];

  if (!balance) {
    throw new NotFoundError("Employee balance");
  }

  if (balance[type] === undefined) {
    throw new ValidationError(`Invalid time off type: ${type}`);
  }

  if (balance[type] < daysRequested) {
    throw new ValidationError("Employee does not have enough time off balance");
  }

  return true;
}

// ============================================
// Deduct Employee Balance
// ============================================

/**
 * Removes approved days from an
 * employee's available balance.
 *
 * IMPORTANT:
 *
 * Only call this after approval.
 *
 * Do NOT deduct balance when creating
 * a request because requests can be:
 *
 * pending
 * rejected
 * cancelled
 */

function deductBalance(employeeBalances, employeeId, type, daysRequested) {
  const balance = employeeBalances[employeeId];

  if (!balance) {
    throw new NotFoundError("Employee balance");
  }

  balance[type] -= daysRequested;

  return balance;
}

// ============================================
// Validate State Transition
// ============================================

/**
 * Controls allowed status changes.
 *
 * Example:
 *
 * pending -> approved ✅
 *
 * approved -> rejected ❌
 *
 */

function canChangeStatus(currentStatus, newStatus, transitions) {
  return transitions[currentStatus].includes(newStatus);
}

// ============================================
// Export Helpers
// ============================================

module.exports = {
  calculateDays,
  hasEnoughBalance,
  deductBalance,
  canChangeStatus,
};
