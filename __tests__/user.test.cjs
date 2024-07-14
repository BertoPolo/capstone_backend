const request = require("supertest")
const { startServer } = require("../src/services/server")
const mongoose = require("mongoose")

jest.mock("../src/users/model", () => ({
  checkCredentials: jest.fn(),
}))

jest.mock("../src/auth/tools", () => ({
  generateAccessToken: jest.fn(),
}))

const usersSchema = require("../src/users/model")
const { generateAccessToken } = require("../src/auth/tools")

let app

beforeAll(async () => {
  app = await startServer()
})

afterAll((done) => {
  app.close(() => {
    mongoose.connection.close(done)
  })
})

describe("POST /users/login", () => {
  it("should return an access token for valid credentials", async () => {
    const validUser = {
      _id: "65718eb6e51603cd285d5ac4",
      name: "DemoUser",
      username: "user",
      email: "demostr@stuffroute.com",
      isAdmin: false,
      password: "123",
    }

    // Mockear la función checkCredentials para devolver un usuario válido
    usersSchema.checkCredentials.mockResolvedValue(validUser)

    // Mockear la función generateAccessToken para devolver un token
    generateAccessToken.mockResolvedValue("fakeAccessToken")

    const response = await request(app).post("/users/login").send({
      username: validUser.username,
      password: validUser.password,
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty("accessToken")
    expect(typeof response.body.accessToken).toBe("string")
  })

  it("should return 401 for invalid credentials", async () => {
    const invalidUser = {
      username: "invalidUsername",
      password: "invalidPassword",
    }

    // Mockear la función checkCredentials para devolver null (credenciales inválidas)
    usersSchema.checkCredentials.mockResolvedValue(null)

    const response = await request(app).post("/users/login").send(invalidUser)

    expect(response.statusCode).toBe(401)
    expect(response.body).toHaveProperty("message", "Unauthorized!")
  })
})
