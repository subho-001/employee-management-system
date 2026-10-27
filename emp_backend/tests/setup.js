
require("dotenv").config({ quiet: true });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "jest-only-secret-for-local-tests";
