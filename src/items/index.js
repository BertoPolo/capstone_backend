import itemSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import q2m from "query-to-mongo"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { JWTAuthMiddleware } from "../auth/token.js"

const itemsRouter = express.Router()

// createError example
// next(createError(404, `this post ${req.params.blogId} is not found`))

const cloudinaryfavImagesUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "itemImages",
    },
  }),
}).single("image")

//POST a new item
itemsRouter.post("/", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    //const item = new itemSchema(req.body)
    //await item.save()

    // const item = await itemSchema(req.body).save()

    const item = new itemSchema(req.body)
    const { _id } = await item.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//POST/PUT img's item
itemsRouter.put("/:itemId/img", JWTAuthMiddleware, adminOnlyMiddleware, cloudinaryfavImagesUploader, async (req, res, next) => {
  try {
    const itemToUpdate = await itemSchema.findByIdAndUpdate(req.params.itemId, { image: req.file.path }, { new: true })
    if (itemToUpdate) {
      res.status(201).send(itemToUpdate)
    } else {
      next(createError(404, `this item ${req.params.itemId} is not found`))
      // console.log(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//GET filtered items
// http://query example : localhost:3004/items?limit=10&sort=-title&category="Full Face"&price<20&brand=63501f2fa63bc3ba9b91c4b5
itemsRouter.get("/", async (req, res, next) => {
  try {
    const queryToMongo = q2m(req.query)
    console.log(queryToMongo)
    const products = await itemSchema
      .find(queryToMongo.criteria)
      // .populate(["brand", "category", "mainCategory"]) //({ path: "brand", select: "brands" })
      .populate([
        { path: "brand", select: "brands" },
        { path: "category", select: "categories" },
        { path: "mainCategory", select: "mainCategory" },
      ])
      .limit(queryToMongo.options.limit)
      .skip(queryToMongo.options.skip)
      .sort(queryToMongo.options.sort)

    if (products.length !== 0) {
      res.send(products)
    } else next(createError(404, `nothing found`))
  } catch (error) {
    next(error)
  }
})

//GET 15 random items
itemsRouter.get("/random", async (req, res, next) => {
  try {
    // if query parameter random===true then use $sample operator
    // else normal find()
    const items = await itemSchema.aggregate([{ $sample: { size: 10 } }]) // do not returning random items
    // .find({ $sample: { size: 15 } })
    if (items) res.status(200).send(items)
    else next(createError(404, `nothing found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///PUT item
itemsRouter.put("/:itemId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const itemToUpdate = await itemSchema.findByIdAndUpdate(req.params.itemId, { ...req.body }, { new: true })

    if (itemToUpdate) res.status(201).send(itemToUpdate)
    else next(createError(404, `this item ${req.params.itemTitle} is not found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///DELETE item
itemsRouter.delete("/:itemId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    await itemSchema.findByIdAndDelete(req.params.itemId)

    res.status(200).send("item was deleted successfully")
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
