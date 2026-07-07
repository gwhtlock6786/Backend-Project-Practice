const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

let employees = [
  { id: 1, name: "Maria Garcia", position: "Server" },
  { id: 2, name: "James Wilson", position: "Cook" },
  { id: 3, name: "Sarah Chen", position: "Host" },
];

app.use(express.json()); // Middleware to parse JSON request bodies

app.get("/", (req, res) => {
  res.send("Welcome to the Employee Management System!");
});

app.get("/employees", (req, res) => {
  res.json(employees);
});

app.get("/employees/:id", (req, res) => {
  const employeeId = parseInt(req.params.id);
  const employee = employees.find((emp) => emp.id === employeeId);

  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }

  res.json(employee);
});

app.post("/employees", (req, res) => {
  const newEmployee = {
    id: employees.length + 1,
    name: req.body.name,
    position: req.body.position,
  };

  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
