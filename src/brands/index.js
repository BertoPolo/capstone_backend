import brandsSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { JWTAuthMiddleware } from "../auth/token.js"

const brandsRouter = express.Router()

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *  security:
 *  - bearerAuth: []
 *  schemas:
 *    Brand:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: item's Brand
 *      required:
 *        - brands
 *      example:
 *         brands: DMD
 */

/**
 * @swagger
 * /brands/:
 *   post:
 *     description: create a new brand, Needs admin token.
 *     tags: [Brand]
 *     responses:
 *       201:
 *         description: Returns new brand's id
 */
//POST new Brand
brandsRouter.post("/", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const newBrands = new brandsSchema(req.body)
    const { _id } = await newBrands.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/**
 * @swagger
 * /brands/:
 *   get:
 *     description: recive all the brands
 *     tags: [Brand]
 *     responses:
 *       200:
 *         description: Returns brands array
 */
//GET ALL Brands
brandsRouter.get("/", async (req, res, next) => {
  try {
    const brands = await brandsSchema.find()

    if (brands) res.status(200).send(brands)
    else next(createError(404, `no brands found`))
  } catch (error) {
    console.log(error)
    next(createError(404, `no brands found`))
  }
})

///DELETE brand
brandsRouter.delete("/:brandId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const brandToDelete = await brandsSchema.findByIdAndDelete(req.params.brandId)

    if (brandToDelete) res.status(200).send("brand was deleted successfully")
    else next(createError(404, `this brand: ${req.params.brandId}, is not found`))
  } catch (error) {
    next(error)
  }
})

export default brandsRouter
