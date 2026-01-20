/**
 * ============================================================
 * JEST CONFIGURATION
 *
 * This file configures how Jest runs backend tests.
 * It defines the test environment and global setup logic.
 * ============================================================
 */

module.exports = {
    // Run tests in a Node.js environment (not browser / jsdom)
    // This is required for backend and API tests.
    testEnvironment: "node",

    // Files listed here are executed AFTER Jest is initialized
    // but BEFORE any test files are run.
    // Used to prepare the test environment (e.g. database setup).
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
};
