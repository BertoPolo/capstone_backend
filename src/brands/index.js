import brandsSchema from "./model.js"
import express from "express"
import createError from "http-errors"

const brandsRouter = express.Router()

//POST new Brands
brandsRouter.post("/bytitle/:itemTitle", async (req, res, next) => {
  try {
    const newBrands = new brandsSchema(req.body)
    const { _id } = await newBrands.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//GET ALL Brands
brandsRouter.get("/bytitle/:itemTitle", async (req, res, next) => {})

export default brandsRouter
