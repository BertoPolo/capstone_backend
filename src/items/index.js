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

//POST a new item ----TESTED----
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

//GET all items ----TESTED----
itemsRouter.get("/", async (req, res, next) => {
  try {
    const items = await itemSchema.find({})

    res.status(200).send(items)
  } catch (error) {
    next(error)
  }
})

///GET single item
itemsRouter.get("/:itemId", async (req, res, next) => {
  try {
    const item = await itemSchema.findOne({ title: req.params.itemId })

    res.status(200).send(item)
  } catch (error) {
    next(error)
  }
})

///PUT item
itemsRouter.put("/:itemId", async (req, res, next) => {
  try {
    // const item = await itemSchema.findOne({ title: req.params.itemId })
    // res.status(201).send(item)
  } catch (error) {
    next(error)
  }
})

///DELETE item ---TESTED----
itemsRouter.delete("/:itemId", async (req, res, next) => {
  try {
    const item = await itemSchema.findOneAndDelete({ title: req.params.itemId })

    res.status(200).send("item was deleted successfully")
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
