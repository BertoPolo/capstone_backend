import categoriesSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { JWTAuthMiddleware } from "../auth/token.js"

const categoriesRouter = express.Router()

//POST new categories
categoriesRouter.post("/new", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const newCategory = new categoriesSchema(req.body)
    const { _id } = await newCategory.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//GET ALL categories
categoriesRouter.get("/all", async (req, res, next) => {
  try {
    const categories = await categoriesSchema.find().sort({ categories: "ASC" })
    if (categories) res.status(200).send(categories)
    else res.status(404).send()
  } catch (error) {
    console.log(error)
    next(createError(404, `no categories found`))
  }
})

//Delete Category

export default categoriesRouter
