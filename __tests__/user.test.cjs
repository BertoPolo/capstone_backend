const request = require("supertest")
const { startServer } = require("../src/services/server")
const nodemailer = require("nodemailer")
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

//
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

    // Mock the checkCredentials function to return a valid user
    usersSchema.checkCredentials.mockResolvedValue(validUser)

    // Mock the generateAccessToken function to return a token
    generateAccessToken.mockResolvedValue("fakeAccessToken")

    const response = await request(app).post("/users/login").send({
      username: validUser.username,
      password: validUser.password,
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty("accessToken")
    expect(typeof response.body.accessToken).toBe("string")
    // expect(response.body.accessToken).toMatch(/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\./)
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

//
describe("POST /users", () => {
  it("should create a new user and send a welcome email, when username does not exist", async () => {
    const newValidUser = {
      username: "newuser",
      password: "123456",
      email: "newuser@example.com",
      address: "123 Street",
      isAdmin: false,
    }

    // Mock the findOne function to return null (user doesn't exist)
    usersSchema.findOne.mockResolvedValue(null)

    // Mock the save function to return an _id
    const saveMock = jest.fn().mockResolvedValue({ _id: "newUserId", ...newValidUser })
    usersSchema.prototype.save = saveMock

    // Mock the createTransport and sendMail functions of nodemailer
    const sendMailMock = jest.fn().mockResolvedValue("Email sent")
    nodemailer.createTransport = jest.fn().mockReturnValue({
      sendMail: sendMailMock,
    })

    const response = await request(app).post("/users").send(newValidUser)

    expect(response.statusCode).toBe(201)
    expect(typeof response.body).toBe("string")
    expect(sendMailMock).toHaveBeenCalledTimes(1)
  })

  it("should return 409 if the user already exists", async () => {
    const existingUser = {
      username: "user",
      password: "123",
      email: "existinguser@example.com",
    }

    // Mockear la función findOne para devolver un usuario existente
    usersSchema.findOne = jest.fn().mockResolvedValue(existingUser)

    const response = await request(app).post("/users").send(existingUser)

    expect(response.statusCode).toBe(409)
    expect(response.body).toHaveProperty("message", "User already exists")
  })
})
