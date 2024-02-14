const request = require("supertest")
const app = require("../app") // Asegúrate de exportar tu aplicación Express en este archivo

describe("GET /users/:userId", () => {
  it("should return a user for a valid userId", async () => {
    const userId = "someUserId"
    const response = await request(app).get(`/users/${userId}`)
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty("username")
    // Agrega más expectativas según sea necesario
  })
})
