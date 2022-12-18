import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

//metadata info about our API
const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Stuff to route documentation", version: "1.0.0" },
  },
  apis: ["src/items/index.js", "src/brands/index.js", "src/categories/index.js", "src/mainCategories/index.js", "src/users/index.js"], //
}

//Docs in JSON format
const swaggerSpec = swaggerJSDoc(options)

//To setup our docs
export const swaggerDocs = (server, port) => {
  server.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  server.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
  })
  console.log(`Version 1 Docs are available at http://localhost:${port}/api/docs`) //should i add deployed version??
}
