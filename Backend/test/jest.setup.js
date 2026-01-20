// This file is executed automatically before running Jest tests.
// It prepares a clean, isolated test environment.

console.log("Jest setup running");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Reference to the in-memory MongoDB instance
let mongo;

/**
 * Runs once before all test suites.
 * Starts an in-memory MongoDB and connects Mongoose to it.
 */
beforeAll(async () => {
    // Create an in-memory MongoDB server
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    // Disable mongoose command buffering
    // This prevents tests from hanging if the DB is not connected
    mongoose.set("bufferCommands", false);

    // Connect mongoose to the in-memory database
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
    });
});

/**
 * Runs after each individual test.
 * Cleans all collections to ensure test isolation.
 */
afterEach(async () => {
    const collections = await mongoose.connection.db.collections();

    // Remove all documents from every collection
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

/**
 * Runs once after all test suites have finished.
 * Closes database connections and stops the in-memory MongoDB.
 */
afterAll(async () => {
    await mongoose.disconnect();

    if (mongo) {
        await mongo.stop();
    }
});
