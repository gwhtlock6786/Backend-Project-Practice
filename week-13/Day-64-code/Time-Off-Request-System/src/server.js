const express = require("express");
const cors = require("cors");

const {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} = require("./errors/AppError");

const app = express();

const PORT = process.env.PORT || 3000;

// Import routers
const timeOffRouter = require("./routes/timeOff");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} -> ${req.method} used on route ${req.url}`,
  );

  next();
});

// ============================================
// ROUTES
// ============================================

// Mount routers
app.use("/time-off", timeOffRouter);

// Root route - API info
app.get("/", (req, res) => {
  res.json({
    message: "Shift Scheduler API v2",
    version: "2.0.0",
    endpoints: {
      shifts: "/shifts",
      shiftSwaps: "/shift-swaps",
      timeOff: "/time-off",
      laborCosts: "/labor-costs",
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

//404 handler for unknown routes
app.use((req, res, next) => {
  // TODO: Digg into how this works
  throw new NotFoundError(`Route --> ${req.originalUrl}`);
});

// Centralized error handler - MUST be last!
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log("========================================");
  console.log("  Shift Scheduler API v2 - RUNNING");
  console.log("========================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log("");
  console.log("Today's New Endpoints:");
  console.log("  POST   /shift-swaps        - Request swap");
  console.log("  PATCH  /shift-swaps/:id/approve");
  console.log("  POST   /time-off           - Request time off");
  console.log("  PATCH  /time-off/:id/approve");
  console.log("  GET    /labor-costs/weekly - Weekly costs");
  console.log("========================================");
});
