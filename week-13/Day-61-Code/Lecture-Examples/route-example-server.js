const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// This middleware lets Express read JSON data from requests
app.use(express.json());

// Sample data - in real apps, this comes from a database
let employees = [
  { id: 1, name: "Maria Garcia", position: "Server" },
  { id: 2, name: "James Wilson", position: "Cook" },
  { id: 3, name: "Sarah Chen", position: "Host" },
];

// GET /employees - Return all employees
// Like asking the manager: "Who works here?"
app.get("/employees", (req, res) => {
  res.json(employees);
});

// GET /employees/:id - Return one specific employee
// The :id is a parameter - it can be any value
// Like asking: "Tell me about employee #2"
app.get("/employees/:id", (req, res) => {
  const employeeId = parseInt(req.params.id);

  const employee = employees.find((emp) => emp.id === employeeId);

  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ error: "Employee not found" });
  }
});

// POST /employees - Add a new employee
// Like filling out paperwork to hire someone new
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
  console.log("Server running on http://localhost:3000");
});
