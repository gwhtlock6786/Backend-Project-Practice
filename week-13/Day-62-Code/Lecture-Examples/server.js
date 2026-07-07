const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

let employees = [
  { id: 1, name: "Maria Garcia", position: "Server" },
  { id: 2, name: "James Wilson", position: "Cook" },
  { id: 3, name: "Sarah Chen", position: "Host" },
  { id: 4, name: "Vegetta", position: "Prince of all Saiyans" },
  { id: 5, name: "Goku", position: "Main Character" },
];

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} Rest Action executed on the URL:  ${req.url}`);

  next();
});

//home route
app.get("/", (req, res) => {
  res.send("Welcome to the Employee Management System!");
});

//GET all employees
app.get("/employees", (req, res) => {
  res.json(employees).status(200);
});

//GET employee by ID
app.get("/employees/:id", (req, res) => {
  const employeeID = parseInt(req.params.id);

  const employee = employees.find((emp) => emp.id === employeeID);

  res.json(employee).status(200);

  console.log(
    `Employee with ID ${employeeID} has been retrieved successfully. ${employee}`,
  );
});

//POST new employee
app.post("/employees", (req, res) => {
  const newEmployee = {
    id: employees.length + 1,
    name: req.body.name,
    position: req.body.position,
  };

  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

//PUT update employee by ID
app.put("/employees/:id", (req, res) => {
  const ID = parseInt(req.params.id);

  const index = employees.findIndex((emp) => emp.id === ID);
  employees[index] = { id: ID, ...req.body };

  res.status(200).json(employees[index]);
});

//DELETE employee by ID
app.delete("/employees/:id", (req, res) => {
  const index = employees.findIndex(
    (emp) => emp.id === parseInt(req.params.id),
  );
  employees.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
