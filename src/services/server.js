import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createError from "http-errors"
import helmet from "helmet"
import dotenv from "dotenv"

import itemsRouter from "../items/index.js"
import usersRouter from "../users/index.js"
import brandsRouter from "../brands/index.js"
import categoriesRouter from "../categories/index.js"
import mainCategoriesRouter from "../mainCategories/index.js"

import { swaggerDocs as V1SwaggerDocs } from "../routes/swagger.js"
import { genericErrorHandler, notFoundErrorHandler, badRequestErrorHandler, unauthorizedErrorHandler } from "./errorHandlers.js"
import apiLimiter from "../tools/requestRestriction.js"

mongoose.set("strictQuery", false)
dotenv.config()
const server = express()
const port = process.env.PORT || 3001
const urlList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL, process.env.FE_PROD_BACKOFFICE_URL]

if (!process.env.PORT || !process.env.MONGO_CONNECTION || !process.env.FE_DEV_URL || !process.env.FE_PROD_URL) {
  throw new Error("Missing required environment variables")
}

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

server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://apis.example.com", "https://www.google.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "http://www.w3.org/"],
        connectSrc: ["'self'", "https://api.example.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'", "https://www.google.com"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "no-referrer" }, // reference policies
    frameguard: { action: "deny" }, // Protection clickjacking
    dnsPrefetchControl: { allow: false }, // block prefetch DNS
    expectCt: { enforce: true, maxAge: 86400 }, // Expect-CT
    hidePoweredBy: true, // hide X-Powered-By header
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Strict-Transport-Security
    ieNoOpen: true, // X-Download-Options IE8+
    noSniff: true, // X-Content-Type-Options
    permittedCrossDomainPolicies: { policy: "none" }, // Cross-Domain Policies
    xssFilter: true, // X-XSS-Protection
  })
)

// ****************** ERROR HANDLERS *********************
server.use(badRequestErrorHandler) // 400
server.use(unauthorizedErrorHandler) // 401
server.use(notFoundErrorHandler) // 404
server.use(genericErrorHandler) // 500

mongoose.connect(process.env.MONGO_CONNECTION)
// mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo")

  // server.listen(port, () => {  adding 0's for fly.io, rest of hosts didn't ask for it
  server.listen(port, "0.0.0.0", () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
    V1SwaggerDocs(server, port)
  })
})

export default server
