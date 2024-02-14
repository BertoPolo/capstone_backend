import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createError from "http-errors"
import helmet from "helmet"

import itemsRouter from "../items/index.js"
import usersRouter from "../users/index.js"
import brandsRouter from "../brands/index.js"
import categoriesRouter from "../categories/index.js"
import mainCategoriesRouter from "../mainCategories/index.js"

import { swaggerDocs as V1SwaggerDocs } from "../routes/swagger.js"
import { genericErrorHandler, notFoundErrorHandler, badRequestErrorHandler, unauthorizedErrorHandler } from "./errorHandlers.js"
import apiLimiter from "../tools/requestRestriction.js"

mongoose.set("strictQuery", false)

const server = express()
const port = process.env.PORT || 3001
const urlList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL, process.env.FE_PROD_BACKOFFICE_URL]

//****************** MIDDLEWARES *********************
server.use(
  cors({
    origin: (origin, next) => {
      if (!origin || urlList.indexOf(origin) !== -1) {
        next(null, true)
      } else {
        next(createError(400, "CORS ERROR!"))
      }
    },
  })
)
server.use(express.json())

// ****************** ENDPOINTS  *********************
server.use("/items", itemsRouter)
server.use("/users", usersRouter)
server.use("/brands", brandsRouter)
server.use("/categories", categoriesRouter)
server.use("/mainCategories", mainCategoriesRouter)

// ****************** TOOLS *********************
server.use(apiLimiter)
server.use(helmet())

// check,adapt and add this whenever you can
// server.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"], // Solo permite recursos del mismo origen
//         scriptSrc: ["'self'", "https://apis.example.com"], // Ejemplo: permite scripts del mismo origen y de apis.example.com
//         objectSrc: ["'none'"], // No permite plugins (Flash, etc.)
//         upgradeInsecureRequests: [], // Actualiza las solicitudes HTTP a HTTPS
//         // ... otras directivas según sea necesario ...
//       },
//     },
//   })
// )

// ****************** ERROR HANDLERS *********************
server.use(badRequestErrorHandler) // 400
server.use(unauthorizedErrorHandler) // 401
server.use(notFoundErrorHandler) // 404
server.use(genericErrorHandler) // 500

mongoose.connect(process.env.MONGO_CONNECTION)
// mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo")

  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
    V1SwaggerDocs(server, port)
  })
})

export default server
