import brandsSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { JWTAuthMiddleware } from "../auth/token.js"

const brandsRouter = express.Router()

//POST new Brands
brandsRouter.post("/new", async (req, res, next) => {
  // , basicAuthMiddleware, adminOnlyMiddleware
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
brandsRouter.get("/all", async (req, res, next) => {
  try {
    const brands = await brandsSchema.find({})

    if (brands) {
      res.status(200).send(brands)
    }
  } catch (error) {
    console.log(error)
    next(createError(404, `no brands found`))
  }
})

export default brandsRouter
