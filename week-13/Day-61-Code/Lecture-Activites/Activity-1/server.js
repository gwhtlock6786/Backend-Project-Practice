const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

app.get("/", (re, res) => {
  res.send("Welcome to the Employee Management System!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
