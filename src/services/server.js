import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import itemsRouter from "../items/index.js"
import { genericErrorHandler, notFoundErrorHandler, badRequestErrorHandler, unauthorizedErrorHandler } from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001
const urlList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

// ****************** MIDDLEWARES *********************
server.use(cors())
// server.use(
//   cors({
//     origin: (origin, next) => {
//       // cors is a global middleware --> for each and every request we are going to be able to read the current origin value
//       console.log("ORIGIN: ", origin)

//       if (!origin || urlList.indexOf(origin) !== -1) {
//         // origin is in the urlList --> move next with no errors
//         next(null, true)
//       } else {
//         // origin is NOT in the urlList --> trigger an error
//         next(createError(400, "CORS ERROR!"))
//       }
//     },
//   })
// )
server.use(express.json())

// ****************** ENDPOINTS  *********************
server.use("/items", itemsRouter)

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
  })
})
