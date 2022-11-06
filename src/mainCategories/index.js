import mainCategoriesSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"

const mainCategoriesRouter = express.Router()

//POST new mainCategory
mainCategoriesRouter.post("/new", async (req, res, next) => {
  //, adminOnlyMiddleware
  try {
    const newMcat = new mainCategoriesSchema(req.body)
    const { _id } = await newMcat.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//GET ALL MainCategories
mainCategoriesRouter.get("/all", async (req, res, next) => {
  try {
    const mCats = await mainCategoriesSchema.find().sort({ title: "ASC" }).populate({ path: "categories", select: "categories" })

    if (mCats) res.status(200).send(mCats)
    // else res.status(404).send()
  } catch (error) {
    console.log(error)
    next(createError(404, `no main categories found`))
  }
})

//PUT main category
mainCategoriesRouter.put("/addCat/:mCatId", async (req, res, next) => {
  try {
    const mCatToModify = await mainCategoriesSchema.findByIdAndUpdate(req.params.mCatId, { ...req.body }, { new: true })

    if (mCatToModify) res.status(201).send(mCatToModify)
    // else res.status(404).send()
  } catch (error) {
    console.log(error)
    next(createError(404, `no main categories found`))
  }
})

export default mainCategoriesRouter
