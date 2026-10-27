
const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  test("should return 200 and a success response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Employee Management API is running"
    );
  });
});
