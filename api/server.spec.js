const request = require("supertest");
const server = require("./server.js");
const db = require("../database/dbConfig");
// are we even in a testing environment lmao
it("should set db environment to testing", function() {
  expect(process.env.DB_ENV).toBe("testing");
});

describe("register", () => {
  beforeEach(async () => {
    await db("users").truncate();
  });

  it("should return a 201 CREATED status code", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "user1", password: "password" });
    expect(response.status).toBe(201);
  });

  it("should send back JSON", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send({ username: "user1", password: "password" });
    expect(response.type).toMatch(/json/i);
  });
});

describe("login", () => {
  it("should allow a registered user to log in", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "user1", password: "password" });
    expect(response.status).toBe(200);
  });

  it("denies acces if user has invalid credentials", async () => {
    const response = await request(server)
      .post("/api/auth/login")
      .send({ username: "user1", password: "notpassword" });
    expect(response.status).toBe(401);
  });
});

describe("get jokes", () => {
  it("should return 200 status code", async () => {
    const response = await request(server)
      // log in first, then make sure the get returns a 200 after auth
      .post("/api/auth/login")
      .send({ username: "user1", password: "password" });
    const jokes = await request(server)
      .get("/api/jokes")
      .set("Authorization", response.body.token);
    expect(jokes.status).toBe(200);
  });

  it("should return a list of jokes if user is signed in", async () => {
    const response = await request(server)
      // Same as above but make sure the jokes exist
      .post("/api/auth/login")
      .send({ username: "user1", password: "password" });
    const jokes = await request(server)
      .get("/api/jokes")
      .set("Authorization", response.body.token);
    expect(jokes.body);
  });
});
