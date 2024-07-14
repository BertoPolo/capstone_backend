const request = require("supertest")
const server = require("../src/services/server")
// import request from "supertest"
// import server from "../src/services/server"

describe("GET /users/:userId", () => {
  it("should return a user for a valid userId", async () => {
    const userId = "someUserId"
    const response = await request(server).get(`/users/${userId}`)
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty("username")
  })
})
