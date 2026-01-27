const request = require("supertest");
const app = require("../src/server");
const { shutdownPrisma } = require("../src/db/prisma");

afterAll(async () => {
    await shutdownPrisma();
});

describe("Health Check API", () => {
    it("should return status 200 and ok:true", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("ok", true);
        expect(res.body).toHaveProperty("status", "up");
    });

    it("should return API version prefix", async () => {
        // This is just a sample to show supertest working
        const res = await request(app).get("/health");
        expect(res.body).toHaveProperty("time");
    });
});
