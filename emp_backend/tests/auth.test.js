
process.env.JWT_SECRET = "jest-only-secret-for-local-tests";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

describe("Employee API authentication and authorization", () => {
    test("should return 401 when requesting employees without a token", async () => {
        const response = await request(app).get("/api/employees");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("should return 401 when requesting employees with an invalid token", async () => {
        const response = await request(app)
            .get("/api/employees")
            .set("Authorization", "Bearer invalid.fake.token");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test("should return 403 when a viewer tries to create an employee", async () => {
        const viewerToken = jwt.sign(
            {
                sub: "507f1f77bcf86cd799439011",
                role: "viewer",
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "15m",
            }
        );

        const response = await request(app)
            .post("/api/employees")
            .set("Authorization", `Bearer ${viewerToken}`)
            .send({
                name: "Test Employee",
                email: "test.employee@example.com",
                department: "Engineering",
                salary: 50000,
            });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });


    test("should allow an admin past the role check", async () => {
        const adminToken = jwt.sign(
            {
                sub: "507f1f77bcf86cd799439012",
                role: "admin",
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "15m",
            }
        );

        const response = await request(app)
            .post("/api/employees")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({});

        // Empty data should fail employee validation, not role authorization.
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });


    test("should reject employee creation with a negative salary", async () => {
        const adminToken = jwt.sign(
            {
                sub: "507f1f77bcf86cd799439012",
                role: "admin",
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "15m",
            }
        );

        const response = await request(app)
            .post("/api/employees")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test Employee",
                email: "test.employee@example.com",
                department: "Engineering",
                salary: -5000,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });


});
