import categoriesSchema from "./model.js"
import mainCategoriesSchema from "../mainCategories/model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { JWTAuthMiddleware } from "../auth/token.js"
// import { onAdminChange } from "../services/rollbackScript.js"

const categoriesRouter = express.Router()

//POST new categories
categoriesRouter.post("/", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const newCategory = new categoriesSchema(req.body)
    const { _id } = await newCategory.save()
    const mainCategory = await mainCategoriesSchema.findByIdAndUpdate(req.body.mainCategory, { $push: { categories: _id } })

    // onAdminChange()
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
    else next(createError(404, `no categories found`))
  } catch (error) {
    console.log(error)
    next(createError(404, `no categories found`))
  }
})

///DELETE categories
categoriesRouter.delete("/:categoriesId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const categoriesToDelete = await categoriesSchema.findByIdAndDelete(req.params.categoriesId)

    if (categoriesToDelete) {
      onAdminChange()
      res.status(200).send("categories was deleted successfully")
    } else next(createError(404, `this categories: ${req.params.categoriesId}, is not found`))
  } catch (error) {
    next(error)
  }
})

export default categoriesRouter
