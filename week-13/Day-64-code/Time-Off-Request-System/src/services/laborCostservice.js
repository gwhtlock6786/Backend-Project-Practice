/**
 * =====================================================
 * Day 64: Labor Cost Service
 * =====================================================
 *
 * This service contains ALL business logic related
 * to calculating employee labor costs.
 *
 * IMPORTANT ARCHITECTURE RULE:
 *
 * Routes should handle:
 *  - Receiving requests
 *  - Validating input
 *  - Sending responses
 *
 * Services should handle:
 *  - Calculations
 *  - Business rules
 *  - Data processing
 *
 *
 * Labor Cost Rules:
 *
 * Regular Hours:
 *    First 40 hours per week
 *
 * Overtime Hours:
 *    Anything over 40 hours
 *
 * Overtime Rate:
 *    Regular hourly rate * 1.5
 *
 * =====================================================
 */

// ============================================
// CONSTANTS
// ============================================
//
// Business rules should live in one place.
//
// If the company changes overtime from
// 40 hours to 35 hours:
//
// We only change this value.
//
// We do NOT search through routes
// looking for calculations.
//
// ============================================

const OVERTIME_THRESHOLD = 40;

const OVERTIME_MULTIPLIER = 1.5;

// ============================================
// CALCULATE SHIFT HOURS
// ============================================
//
// Converts a shift's start and end time
// into total hours worked.
//
// Example:
//
// Input:
//
// startTime = "09:00"
// endTime   = "17:00"
//
//
// Process:
//
// Convert times into minutes:
//
// 09:00
// = 540 minutes
//
//
// 17:00
// = 1020 minutes
//
//
// Difference:
//
// 1020 - 540 = 480 minutes
//
//
// Convert minutes to hours:
//
// 480 / 60 = 8 hours
//
//
// Output:
//
// 8
//
// ============================================

function calculateShiftHours(startTime, endTime) {
  // Split time string into hours and minutes
  //
  // Example:
  //
  // "09:30"
  //
  // becomes:
  //
  // ["09","30"]
  //
  const [startHour, startMin] = startTime.split(":").map(Number);

  const [endHour, endMin] = endTime.split(":").map(Number);

  // Convert start time into total minutes
  //
  // Example:
  //
  // 9:30
  //
  // 9 * 60 + 30
  //
  // 570 minutes

  const startMinutes = startHour * 60 + startMin;

  // Convert end time into total minutes

  const endMinutes = endHour * 60 + endMin;

  // Find difference between end and start

  const totalMinutes = endMinutes - startMinutes;

  // Convert minutes into hours

  return totalMinutes / 60;
}

// ============================================
// CALCULATE PAY WITH OVERTIME
// ============================================
//
// Applies company overtime rules.
//
// Example:
//
// Employee:
//
// Total hours: 45
// Hourly rate: $20
//
//
// Regular:
//
// First 40 hours
//
// 40 * 20
//
// = $800
//
//
// Overtime:
//
// Remaining 5 hours
//
// 5 * 20 * 1.5
//
// = $150
//
//
// Total:
//
// $950
//
//
// Returns:
//
// {
//   regularHours: 40,
//   overtimeHours: 5,
//   regularPay: 800,
//   overtimePay:150,
//   totalPay:950
// }
//
// ============================================

function calculatePayWithOvertime(totalHours, hourlyRate) {
  // Regular hours are limited
  // to the overtime threshold.
  //
  // Math.min prevents regular hours
  // from going above 40.
  //
  // Example:
  //
  // 35 hours
  //
  // Math.min(35,40)
  //
  // =35
  //
  //
  // 50 hours
  //
  // Math.min(50,40)
  //
  // =40

  const regularHours = Math.min(totalHours, OVERTIME_THRESHOLD);

  // Anything above 40 becomes overtime

  const overtimeHours = Math.max(totalHours - OVERTIME_THRESHOLD, 0);

  // Calculate normal pay

  const regularPay = regularHours * hourlyRate;

  // Calculate overtime pay
  //
  // Overtime receives the multiplier

  const overtimePay = overtimeHours * hourlyRate * OVERTIME_MULTIPLIER;

  // Combine both pay amounts

  const totalPay = regularPay + overtimePay;

  return {
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay,
  };
}

// ============================================
// GET WEEK DATE RANGE
// ============================================
//
// Converts a week starting date into
// a full 7-day period.
//
// Example:
//
// Input:
//
// 2025-01-06
//
//
// Output:
//
// {
//   start:"2025-01-06",
//   end:"2025-01-12"
// }
//
// ============================================

function getWeekRange(weekStart) {
  const startDate = new Date(weekStart);

  const endDate = new Date(startDate);

  // Add six days
  //
  // Example:
  //
  // Monday + 6 days
  //
  // = Sunday

  endDate.setDate(endDate.getDate() + 6);

  return {
    start: weekStart,

    end: endDate.toISOString().split("T")[0],
  };
}

// ============================================
// FILTER SHIFTS BY DATE RANGE
// ============================================
//
// Returns only shifts that happen
// inside the requested week.
//
// Example:
//
// Input:
//
// [
//  Jan 1,
//  Jan 5,
//  Jan 15
// ]
//
//
// Range:
//
// Jan 1 - Jan 7
//
//
// Output:
//
// [
//  Jan 1,
//  Jan 5
// ]
//
// ============================================

function filterShiftsByDateRange(shifts, startDate, endDate) {
  return shifts.filter((shift) => {
    return shift.date >= startDate && shift.date <= endDate;
  });
}

// ============================================
// GROUP SHIFTS BY EMPLOYEE
// ============================================
//
// Converts a flat array:
//
// [
//   shift,
//   shift,
//   shift
// ]
//
//
// Into grouped employee data:
//
// {
//   1:{
//      shifts:[]
//   },
//   2:{
//      shifts:[]
//   }
// }
//
// This makes calculating payroll
// much easier.
//
// ============================================

function groupShiftsByEmployee(shifts) {
  const employees = {};

  shifts.forEach((shift) => {
    const id = shift.employeeId;

    // Create employee container
    // if it does not exist

    if (!employees[id]) {
      employees[id] = {
        employeeId: id,

        employeeName: shift.employeeName,

        shifts: [],

        totalHours: 0,

        hourlyRate: shift.hourlyRate,
      };
    }

    // Add shift to employee

    employees[id].shifts.push(shift);

    // Calculate hours

    const hours = calculateShiftHours(shift.startTime, shift.endTime);

    // Add hours together

    employees[id].totalHours += hours;
  });

  return employees;
}

// ============================================
// EXPORT SERVICE FUNCTIONS
// ============================================
//
// Routes will import these functions:
//
// const {
//   calculateWeeklyLaborCosts
// } = require("../services/laborCostService");
//
// ============================================

// ============================================
// CALCULATE EMPLOYEE LABOR COST
// ============================================
//
// Calculates payroll information for ONE employee.
//
// Example:
//
// Employee:
// Maria Garcia
//
// Hours worked:
// 45 hours
//
// Rate:
// $20/hour
//
//
// Returns:
//
// {
//   employeeId:1,
//   employeeName:"Maria Garcia",
//   totalHours:45,
//   regularHours:40,
//   overtimeHours:5,
//   regularPay:800,
//   overtimePay:150,
//   totalPay:950
// }
//
// ============================================

function calculateEmployeeLaborCost(employee) {
  // Get the overtime calculation
  //
  // This applies:
  //
  // - 40 hour regular limit
  // - 1.5 overtime multiplier
  //
  const pay = calculatePayWithOvertime(
    employee.totalHours,
    employee.hourlyRate,
  );

  return {
    employeeId: employee.employeeId,

    employeeName: employee.employeeName,

    // Total hours worked before
    // overtime calculation

    totalHours: employee.totalHours,

    // Spread the calculated
    // pay information
    //
    // This adds:
    //
    // regularHours
    // overtimeHours
    // regularPay
    // overtimePay
    // totalPay

    ...pay,
  };
}

// ============================================
// CALCULATE WEEKLY LABOR COSTS
// ============================================
//
// This is the main labor cost function.
//
// It combines all previous helpers:
//
// 1. Find the week range
//
// 2. Filter shifts for that week
//
// 3. Group shifts by employee
//
// 4. Calculate each employee's payroll
//
// 5. Calculate company totals
//
//
//
// Example:
//
// Input:
//
// shifts[]
//
// weekStart:
// "2025-01-06"
//
//
// Output:
//
// {
//   period:{
//      start:"2025-01-06",
//      end:"2025-01-12"
//   },
//
//   employees:[
//
//      {
//        employeeName:"Maria",
//        totalHours:45,
//        totalPay:950
//      }
//
//   ],
//
//   totals:{
//      totalRegularPay:800,
//      totalOvertimePay:150,
//      totalLaborCost:950
//   }
// }
//
// ============================================

function calculateWeeklyLaborCosts(shifts, weekStart) {
  // ------------------------------------------
  // Step 1:
  // Calculate week boundaries
  // ------------------------------------------

  const week = getWeekRange(weekStart);

  // ------------------------------------------
  // Step 2:
  // Get only shifts in this week
  // ------------------------------------------

  const weeklyShifts = filterShiftsByDateRange(shifts, week.start, week.end);

  // ------------------------------------------
  // Step 3:
  // Group shifts by employee
  // ------------------------------------------

  const employees = groupShiftsByEmployee(weeklyShifts);

  // ------------------------------------------
  // Step 4:
  // Calculate payroll for each employee
  // ------------------------------------------
  //
  // Object.values converts:
  //
  // {
  //   1:{},
  //   2:{}
  // }
  //
  // Into:
  //
  // [
  //   {},
  //   {}
  // ]
  //
  // because arrays are easier
  // to send as JSON responses.
  //

  const employeeCosts = Object.values(employees).map((employee) => {
    return calculateEmployeeLaborCost(employee);
  });

  // ------------------------------------------
  // Step 5:
  // Calculate company totals
  // ------------------------------------------

  const totalRegularPay = employeeCosts.reduce((total, employee) => {
    return total + employee.regularPay;
  }, 0);

  const totalOvertimePay = employeeCosts.reduce((total, employee) => {
    return total + employee.overtimePay;
  }, 0);

  const totalLaborCost = totalRegularPay + totalOvertimePay;

  // ------------------------------------------
  // Return complete report
  // ------------------------------------------

  return {
    period: {
      start: week.start,

      end: week.end,
    },

    employees: employeeCosts,

    totals: {
      totalRegularPay,

      totalOvertimePay,

      totalLaborCost,
    },
  };
}

// ============================================
// CALCULATE EMPLOYEE WEEKLY COST
// ============================================
//
// Calculates labor cost for ONE employee
// during a specific week.
//
// This is used when a manager wants to see:
//
// "How much did Maria cost this week?"
//
// Example:
//
// employeeId:
// 1
//
// weekStart:
// 2025-01-06
//
// Returns:
//
// {
//   employeeId:1,
//   employeeName:"Maria",
//   totalHours:45,
//   regularHours:40,
//   overtimeHours:5,
//   totalPay:950
// }
//
// ============================================

function calculateEmployeeWeeklyCost(shifts, employeeId, weekStart) {
  // ------------------------------------------
  // Step 1:
  // Find the requested week range
  // ------------------------------------------

  const week = getWeekRange(weekStart);

  // ------------------------------------------
  // Step 2:
  // Filter shifts by:
  //
  // 1. Employee
  // 2. Date range
  //
  // ------------------------------------------

  const employeeShifts = shifts.filter((shift) => {
    return (
      shift.employeeId === employeeId &&
      shift.date >= week.start &&
      shift.date <= week.end
    );
  });

  // ------------------------------------------
  // Step 3:
  // Handle employee with no shifts
  // ------------------------------------------
  //
  // Returning null allows the route
  // to decide whether to send:
  //
  // 404 Not Found
  //
  // or another response.
  //
  // ------------------------------------------

  if (employeeShifts.length === 0) {
    return null;
  }

  // ------------------------------------------
  // Step 4:
  // Convert shifts into employee format
  // ------------------------------------------

  const employee = {
    employeeId,

    employeeName: employeeShifts[0].employeeName,

    shifts: employeeShifts,

    totalHours: 0,

    hourlyRate: employeeShifts[0].hourlyRate,
  };

  // ------------------------------------------
  // Step 5:
  // Calculate total hours
  // ------------------------------------------

  employeeShifts.forEach((shift) => {
    employee.totalHours += calculateShiftHours(shift.startTime, shift.endTime);
  });

  // ------------------------------------------
  // Step 6:
  // Calculate payroll
  // ------------------------------------------

  const result = calculateEmployeeLaborCost(employee);

  return {
    period: {
      start: week.start,

      end: week.end,
    },

    ...result,
  };
}

// ============================================
// CALCULATE DAILY LABOR COSTS
// ============================================
//
// Calculates labor cost for ONE day.
//
// Important:
//
// Daily calculations DO NOT calculate
// overtime.
//
// Overtime depends on total weekly hours.
//
// Example:
//
// Monday:
// 10 hours
//
// Daily cost:
//
// 10 * hourlyRate
//
//
// Weekly overtime decides later
// whether those hours were regular
// or overtime.
//
// ============================================

function calculateDailyLaborCosts(shifts, date) {
  // ------------------------------------------
  // Step 1:
  // Get shifts for this date
  // ------------------------------------------

  const dailyShifts = shifts.filter((shift) => {
    return shift.date === date;
  });

  // ------------------------------------------
  // Step 2:
  // Calculate each shift cost
  // ------------------------------------------

  const employees = dailyShifts.map((shift) => {
    const hours = calculateShiftHours(shift.startTime, shift.endTime);

    const cost = hours * shift.hourlyRate;

    return {
      employeeId: shift.employeeId,

      employeeName: shift.employeeName,

      hoursWorked: hours,

      hourlyRate: shift.hourlyRate,

      laborCost: cost,
    };
  });

  // ------------------------------------------
  // Step 3:
  // Calculate daily totals
  // ------------------------------------------

  const totalHours = employees.reduce((total, employee) => {
    return total + employee.hoursWorked;
  }, 0);

  const totalLaborCost = employees.reduce((total, employee) => {
    return total + employee.laborCost;
  }, 0);

  return {
    date,

    employees,

    totals: {
      totalHours,

      totalLaborCost,
    },
  };
}

module.exports = {
  calculateShiftHours,

  calculatePayWithOvertime,

  getWeekRange,

  filterShiftsByDateRange,

  groupShiftsByEmployee,

  calculateEmployeeLaborCost,

  calculateWeeklyLaborCosts,

  calculateEmployeeWeeklyCost,

  calculateDailyLaborCosts,
};
