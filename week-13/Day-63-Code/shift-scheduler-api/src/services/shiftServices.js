function doTimesOverlap(start1, end1, start2, end2) {
  const toMinutes = (time) => {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return s1 < e2 && s2 < e1;
}

function checkShiftConflict(newShift, existingShifts) {
  const sameEmployeeSameDay = existingShifts.filter(
    (shift) =>
      shift.employeeId === newShift.employeeId && shift.date === newShift.date,
  );

  for (const existing of sameEmployeeSameDay) {
    if (
      doTimesOverlap(
        newShift.startTime,
        newShift.endTime,
        existing.startTime,
        existing.endTime,
      )
    ) {
      return {
        hasConflict: true,
        conflictingShift: existing,
      };
    }
  }
  return { hasConflict: false };
}

module.exports = {
  checkShiftConflict,
};
