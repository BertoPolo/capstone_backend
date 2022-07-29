import itemSchema from "./model.js"
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

itemsRouter.post("/", async (req, res, next) => {
  try {
    //const item = new itemSchema(req.body)
    //await item.save()

    // const item = await itemSchema({ ...req.body }).save()

    const item = await new itemSchema(req.body)
    const { _id } = await item.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

itemsRouter.get("/", async (req, res) => {
  try {
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
