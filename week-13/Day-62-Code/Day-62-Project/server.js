//============================================================================
// Dependencies - Setup
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

let employees = [
  { id: 1, name: "Batman", position: "Capped Crusader" },
  { id: 2, name: "Robin", position: "Boy Wonder" },
  { id: 3, name: "Saitama", position: "The Man of One Punch" },
  { id: 4, name: "Vegetta", position: "Prince of all Saiyans" },
  { id: 5, name: "Goku", position: "Main Character" },
];

//============================================================================
//Middlewares

//allows jsonto be used in the request body
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

//============================================================================
//Routes

//home route
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Employee Management System! For Day-62 Exercise, please use the /employees route to view all employees.",
  );
});

//GET all employees
app.get("/employees", (req, res) => {
  if (!employees || employees.length === 0) {
    return res.status(404).json({ error: "No employees found" });
  }

  res.status(200).send(employees);
});

//GET employee by ID
app.get("/employees/:id", (req, res) => {
  const employeeID = parseInt(req.params.id);

  const employee = employees.find((emp) => emp.id === employeeID);

  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
  }

  res.status(200).send(employee);
});

//POST new employee
app.post("/employees", (req, res) => {
  const name = req.body.name;
  const position = req.body.position;

  if (!name || !position) {
    return res.status(400).json({ error: "Name and position are required" });
  }

  const employee = {
    id: employees.length + 1,
    name: name,
    position: position,
  };

  employees.push(employee);
  res.status(201).json(employee);
});

//PUT update employee by ID
app.put("/employees/:id", (req, res) => {
  const employeeID = parseInt(req.params.id);

  if (!employeeID) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const employee = employees.find((emp) => emp.id === employeeID);

  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const name = req.body.name;
  const position = req.body.position;

  if (!name || !position) {
    return res.status(400).json({ error: "Name and position are required" });
  }

  employee.name = name;
  employee.position = position;

  res.status(200).json(employee);
});

//DELETE employee by ID
app.delete("/employees/:id", (req, res) => {
  const employeeID = parseInt(req.params.id);

  if (!employeeID) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const employeeIndex = employees.findIndex((emp) => emp.id === employeeID);

  if (employeeIndex === -1) {
    return res.status(404).json({ error: "Employee not found" });
  }

  employees.splice(employeeIndex, 1);
  res.status(200).json({ message: "Employee deleted successfully" });
});

//============================================================================
//Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
