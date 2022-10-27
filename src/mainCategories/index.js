import mainCategoriesSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"

const mainCategoriesRouter = express.Router()

//POST new Brands
mainCategoriesRouter.post("/new", adminOnlyMiddleware, async (req, res, next) => {
  try {
    const newMcat = new mainCategoriesSchema(req.body)
    const { _id } = await newMcat.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//GET ALL Brands
mainCategoriesRouter.get("/all", async (req, res, next) => {
  try {
    const mCats = await mainCategoriesSchema.find({})

    if (mCats) {
      res.status(200).send(mCats)
    }
  } catch (error) {
    console.log(error)
    next(createError(404, `no Main Categories founded`))
  }
})

export default mainCategoriesRouter
