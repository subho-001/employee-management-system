
const mongoose = require("mongoose");
const Employee = require("../src/models/employeeModel/employee.model");
const {
  connectTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
} = require("./helpers/database");

describe.skip("Employee database integration", () => {
  beforeAll(async () => {
  await connectTestDatabase();
  await Employee.init();
}, 15000);

    afterEach(async () => {
        if (mongoose.connection.readyState === 1) {
            await clearTestDatabase();
        }
    });

  afterAll(async () => {
    await closeTestDatabase();
  });

  test("should reject duplicate employee emails", async () => {
    const employee = {
      name: "Test Employee",
      email: "duplicate@example.com",
      department: "Engineering",
      salary: 50000,
    };

    await Employee.create(employee);

    await expect(
      Employee.create({
        ...employee,
        name: "Another Employee",
      })
    ).rejects.toMatchObject({
      code: 11000,
    });
  });
});
