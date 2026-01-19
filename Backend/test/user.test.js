const request = require("supertest");
const app = require("../app");

describe("Users API", () => {

    it("GET /v1/users returns an empty list initially", async () => {
        const res = await request(app).get("/v1/users");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("items");
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBe(0);
    });

    it("POST /v1/users creates a new user", async () => {
        // simulates a request coming from the frontend
        const newUser = {
            name: "Test User",
            email: "test.user@example.com",
            location: "Berlin",
            active: true,
        };

        // Create user
        const createRes = await request(app)
            .post("/v1/users")
            .send(newUser);

        expect(createRes.status).toBe(201);
        expect(createRes.body).toHaveProperty("item");
        expect(createRes.body.item.email).toBe(newUser.email);

        // Verify user exists in database via GET endpoint
        const listRes = await request(app).get("/v1/users");

        expect(listRes.status).toBe(200);
        expect(listRes.body.items.length).toBe(1);
        expect(listRes.body.items[0].email).toBe(newUser.email);
    });

});
