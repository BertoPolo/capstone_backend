import categoriesSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"

const categoriesRouter = express.Router()

//POST new categories
categoriesRouter.post("/new", async (req, res, next) => {
  //adminOnlyMiddleware
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
    const categories = await categoriesSchema.find({}).sort({ title: "asc" }).populate({ path: "mainCategory", select: "mainCategories" })

    if (categories) {
      res.status(200).send(categories)
    }
  } catch (error) {
    console.log(error)
    next(createError(404, `no categories founded`))
  }
})

export default categoriesRouter
