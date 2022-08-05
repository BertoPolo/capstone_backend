import itemSchema from "./model.js"
import express from "express"
import createError from "http-errors"

// import multer from "multer"
// import { CloudinaryStorage } from "multer-storage-cloudinary"
// import { v2 as cloudinary } from "cloudinary"

const itemsRouter = express.Router()

// createError example
// next(createError(404, `this post ${req.params.blogId} is not found`))

// const cloudinaryfavImagesUploader = multer({
//   storage: new CloudinaryStorage({
//     cloudinary,
//     params: {
//       folder: "favImages",
//     },
//   }),
// }).single("image")

//POST a new item ----TESTED----
itemsRouter.post("/", async (req, res, next) => {
  try {
    //const item = new itemSchema(req.body)
    //await item.save()

    const item = await itemSchema(req.body).save()

    const item = await new itemSchema(req.body)
    const { _id } = await item.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//GET all items ----TESTED----
itemsRouter.get("/", async (req, res, next) => {
  try {
    const items = await itemSchema.find({})

    res.status(200).send(items)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///GET single item
itemsRouter.get("/:itemId", async (req, res, next) => {
  try {
    const item = await itemSchema.findOne({ title: req.params.itemId })

    res.status(200).send(item)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///PUT item  ---TESTED----
itemsRouter.put("/:itemId", async (req, res, next) => {
  try {
    const itemToUpdate = await itemSchema.findOneAndUpdate(
      { title: req.params.itemId },
      {
        ...req.body,
      },
      { new: true }
    )

    if (itemToUpdate) {
      res.status(201).send(itemToUpdate)
    } else {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///DELETE item ---TESTED----
itemsRouter.delete("/:itemId", async (req, res, next) => {
  try {
    await itemSchema.findOneAndDelete({ title: req.params.itemId })

    res.status(200).send("item was deleted successfully")
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
