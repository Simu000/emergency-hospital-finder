const request = require("supertest");
const app = require("../server");

describe("API Tests", () => {

  // Health Check API
  describe("GET /api/health", () => {
    it("should return status ok and timestamp", async () => {
      const res = await request(app).get("/api/health");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  // Mock Hospitals API
  describe("GET /hospitals/mock", () => {
    it("should return list of hospitals", async () => {
      const res = await request(app).get("/hospitals/mock");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("each hospital should have required fields", async () => {
      const res = await request(app).get("/hospitals/mock");

      const hospital = res.body[0];

      expect(hospital).toHaveProperty("id");
      expect(hospital).toHaveProperty("name");
      expect(hospital).toHaveProperty("availableBeds");
      expect(hospital).toHaveProperty("emergencyContact");
    });

    it("availableBeds should be a number", async () => {
      const res = await request(app).get("/hospitals/mock");

      const hospital = res.body[0];

      expect(typeof hospital.availableBeds).toBe("number");
    });
  });

  // Unknown Route (fallback to React)
  describe("GET unknown route", () => {
    it("should return HTML (React app)", async () => {
      const res = await request(app).get("/random-route");

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/html/);
    });
  });

});