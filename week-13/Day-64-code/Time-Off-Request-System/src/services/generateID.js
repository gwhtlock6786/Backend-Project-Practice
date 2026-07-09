//creates new Id requests
function generateNextId(timeOffRequests) {
  return timeOffRequests.length > 0
    ? Math.max(...timeOffRequests.map((r) => r.id)) + 1
    : 1;
}

module.exports = {
  generateNextId,
};
