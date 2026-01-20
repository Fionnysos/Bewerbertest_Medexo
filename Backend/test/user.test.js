const request = require("supertest");
const app = require("../app");

/**
 * ============================================================
 * USERS API INTEGRATION TESTS
 *
 * These tests verify the behavior of the Users API endpoints.
 * They test the full request → route → database flow using
 * an in-memory MongoDB instance.
 * ============================================================
 */

describe("Users API", () => {

    /**
     * Test: GET /v1/users
     * Verifies that the users list is initially empty.
     */
    it("GET /v1/users returns an empty list initially", async () => {
        // Perform HTTP GET request against the Express app
        const res = await request(app).get("/v1/users");

        // Assert HTTP status code
        expect(res.status).toBe(200);

        // Assert response structure
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);

        // Assert business logic: no users exist yet
        expect(res.body.items.length).toBe(0);
    });

    /**
     * Test: POST /v1/users
     * Verifies that a new user can be created successfully.
     */
    it("POST /v1/users creates a new user", async () => {
        // Simulates a request payload coming from the frontend
        const newUser = {
            name: "Test User",
            email: "test.user@example.com",
            location: "Berlin",
            active: true,
        };

        // Send POST request to create a new user
        const createRes = await request(app)
            .post("/v1/users")
            .send(newUser);

        // Assert successful creation
        expect(createRes.status).toBe(201);
        expect(createRes.body).toHaveProperty("item");
        expect(createRes.body.item.email).toBe(newUser.email);

        // Verify that the user now exists by calling GET endpoint
        const listRes = await request(app).get("/v1/users");

        expect(listRes.status).toBe(200);
        expect(listRes.body.items.length).toBe(1);
        expect(listRes.body.items[0].email).toBe(newUser.email);
    });

});
