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

//creates a log of the request method and path used with time stamp
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

//============================================================================
//Routes

//home route
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Employee Management System! For Activity 1, please use the /employees route to view all employees.",
  );
});

//GET all employees
app.get("/employees", (req, res) => {
  res.json(employees);
});

//GET employee by ID
app.get("/employees/:id", (req, res) => {
  const employeeID = parseInt(req.params.id);

  const employee = employees.find((emp) => emp.id === employeeID);

  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }

  res.json(employee);
});

//POST new employee
app.post("/employees", (req, res) => {
  const employee = {
    id: employees.length + 1,
    name: req.body.name,
    position: req.body.position,
  };
  if (!employee.name || !employee.position) {
    return res.status(400).json({ error: "Name and position are required" });
  }
  employees.push(employee);
  res.status(201).json(employee);
});

//PUT update employee by ID
app.put("/employees/:id", (req, res) => {
  const employeeID = parseInt(req.params.id);

  if (!employeeID) {
    return res
      .status(404)
      .json({ error: "Employee not found Must add correct ID" });
  }

  const index = employees.findIndex((emp) => emp.id === employeeID);

  if (index === -1) {
    return res.status(404).json({ error: "Employee not found" });
  }

  employees[index] = { id: employeeID, ...req.body };

  res.json(employees[index]);
});

//DELETE employee by ID
app.delete("/employees/:id", (req, res) => {
  const employeeID = parseInt(req.params.id);

  if (!employeeID) {
    return res
      .status(404)
      .json({ error: "Employee not found Must add correct ID" });
  }
  const index = employees.findIndex((emp) => emp.id === employeeID);

  if (index === -1) {
    return res.status(404).json({ error: "Employee not found" });
  }

  employees.splice(index, 1);
  res.json({ message: `Employee with ID ${employeeID} has been deleted.` });
});

//============================================================================

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
