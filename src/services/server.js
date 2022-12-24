import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createError from "http-errors"
import itemsRouter from "../items/index.js"
import usersRouter from "../users/index.js"
import brandsRouter from "../brands/index.js"
import categoriesRouter from "../categories/index.js"
import mainCategoriesRouter from "../mainCategories/index.js"

import { swaggerDocs as V1SwaggerDocs } from "../routes/swagger.js"
import { genericErrorHandler, notFoundErrorHandler, badRequestErrorHandler, unauthorizedErrorHandler } from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001
const urlList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

//****************** MIDDLEWARES *********************
// server.use(cors())
server.use(
  cors({
    origin: (origin, next) => {
      // console.log("ORIGIN: ", origin)

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

// ****************** ERROR HANDLERS *********************
server.use(badRequestErrorHandler) // 400
server.use(unauthorizedErrorHandler) // 401
server.use(notFoundErrorHandler) // 404
server.use(genericErrorHandler) // 500
////

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo")

  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
    V1SwaggerDocs(server, port)
  })
})
