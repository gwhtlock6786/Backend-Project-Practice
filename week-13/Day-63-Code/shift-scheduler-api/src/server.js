//====================================================================
//REQUIRED IMPORTS

//Import express
const express = require("express");

//Import logger middleware from middleware/logger.js
const logger = require("./middleware/logger");

//Import cors - allows cross-origin requests from different domains (React frontend)
const cors = require("cors");

//Import shifts router
const shiftsRouter = require("./routes/shifts");

//====================================================================
//APP SETUP
const app = express();

const PORT = process.env.PORT || 3000;

//====================================================================
//MIDDLEWARES

//Allows json to be used in the request body -built i middleware in express
app.use(express.json());

//Use logger middleware
app.use(logger);

//Use cors middleware
app.use(cors());

// for specific origin (production)- set origin to your frontend domain
// app.use(cors({
//     origin: 'http://localhost:5173'
// }));

//====================================================================
//ROUTES
app.get("/", (req, res) => {
  res.json({
    message: "Shift Scheduler API",
    version: "1.0.0",
    endpoints: ["/shifts"],
  });
});

app.use("/shifts", shiftsRouter);
//====================================================================

//START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
