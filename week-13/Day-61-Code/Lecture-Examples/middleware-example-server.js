const express = require("express");
const app = express();

// Middleware 1: Log every request that comes in
// This runs BEFORE any route handler
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next(); // IMPORTANT: Call next() to continue to the next middleware/route
});

// Middleware 2: Parse JSON bodies (built into Express)
app.use(express.json());

// Middleware 3: Custom middleware to add server info to all responses
app.use((req, res, next) => {
  res.set("X-Powered-By", "Shift Scheduler API");
  next();
});

// Now our routes - these run AFTER the middleware
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.get("/employees", (req, res) => {
  res.json([{ id: 1, name: "Test Employee" }]);
});

app.listen(3000, () => {
  console.log("Server running with middleware!");
});

// When you visit any route, the console will log the request
// Every response will have the custom header
