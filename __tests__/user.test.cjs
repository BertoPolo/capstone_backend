const request = require("supertest")
const { server } = require("../src/services/server")
const mongoose = require("mongoose")
const usersSchema = require("../src/users/model")
const { generateAccessToken } = require("../src/auth/tools")

describe("POST /users/login", () => {
  it("should return an access token for valid credentials", async () => {
    const validUser = {
      username: "validUsername",
      password: "validPassword",
    }

    // Mockear la función checkCredentials para devolver un usuario válido
    usersSchema.checkCredentials = jest.fn().mockResolvedValue({
      _id: "someUserId",
      isAdmin: false,
    })

    // Mockear la función generateAccessToken para devolver un token
    generateAccessToken = jest.fn().mockResolvedValue("fakeAccessToken")

    const response = await request(server).post("/users/login").send(validUser)

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty("accessToken", "fakeAccessToken")
  })

  it("should return 401 for invalid credentials", async () => {
    const invalidUser = {
      username: "invalidUsername",
      password: "invalidPassword",
    }

    // Mockear la función checkCredentials para devolver null (credenciales inválidas)
    usersSchema.checkCredentials = jest.fn().mockResolvedValue(null)

    const response = await request(server).post("/users/login").send(invalidUser)

    expect(response.statusCode).toBe(401)
    expect(response.body).toHaveProperty("message", "Credentials are not ok!")
  })
})
