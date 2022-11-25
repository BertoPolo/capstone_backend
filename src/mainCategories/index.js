import mainCategoriesSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { mongoose } from "mongoose"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { JWTAuthMiddleware } from "../auth/token.js"

const mainCategoriesRouter = express.Router()

//POST new mainCategory
mainCategoriesRouter.post("/", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
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
    const mCats = await mainCategoriesSchema.find().sort({ mainCategory: "ASC" }).populate({ path: "categories", select: "categories" })

    if (mCats) res.status(200).send(mCats)
    else next(createError(404, `no main categories found`))
  } catch (error) {
    console.log(error)
    next(createError(404, `no main categories found`))
  }
})

//PUT main category
mainCategoriesRouter.put("/:mCatId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const id = mongoose.Types.ObjectId(req.body.categories)
    const mCatToModify = await mainCategoriesSchema.findByIdAndUpdate(req.params.mCatId, { $push: { categories: id } }, { new: true })

    if (mCatToModify) res.status(201).send(mCatToModify)
    else next(createError(404, `no main categories found`))
  } catch (error) {
    console.log(error)
    next(createError(404, `no main categories found`))
  }
})
//Delete Main Category

export default mainCategoriesRouter
