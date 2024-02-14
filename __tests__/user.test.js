const request = require("supertest")
const server = require("../src/services/server")

describe("GET /users/:userId", () => {
  it("should return a user for a valid userId", async () => {
    const userId = "someUserId"
    const response = await request(server).get(`/users/${userId}`)
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty("username")
    //
  })
})

describe("POST /users/login", () => {
  it("should authenticate user and return JWT token", async () => {
    const userData = {
      username: "testUser",
      password: "testPassword",
    }

    const response = await request(server).post("/users/login").send(userData)

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty("accessToken")
    expect(response.body.accessToken).toBeDefined()
  })
})
