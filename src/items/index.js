import ItemSchema from "./model"
import express from "express"
import createError from "http-errors"

const itemsRouter = express.Router()

//example

// usersRouter.delete("/session", JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     res.clearCookie("accessToken")
//   } catch (error) {
//     next(error)
//   }
// })
itemsRouter.post("/item", async (req, res, next) => {
  try {
    const item = req.body
    res.status(201).send(item)
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
