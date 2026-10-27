
const mongoose = require("mongoose");

const connectTestDatabase = async () => {
  const uri = process.env.MONGODB_TEST_URI;

  if (!uri) {
    throw new Error("MONGODB_TEST_URI is not configured");
  }

  if (!uri.includes("employee_management_test")) {
    throw new Error("Refusing to connect to a non-test database");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

const clearTestDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
};

const closeTestDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = {
  connectTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
};
