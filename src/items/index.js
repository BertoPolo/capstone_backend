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

//POST a new item----TESTED----
itemsRouter.post("/", async (req, res, next) => {
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

//GET all items
// itemsRouter.get("/", async (req, res, next) => {
//   try {
//     const items = await itemSchema.find({})

//     res.status(200).send(items)
//   } catch (error) {
//     console.log(error)
//     next(createError(404, `this item ${req.params.itemTitle} is not found`))
//   }
// })

//GET filtered items
itemsRouter.get("/:itemTitle", async (req, res, next) => {
  try {
    const items = await itemSchema.find({ title: req.params.itemTitle })

    res.status(200).send(items)
  } catch (error) {
    console.log(error)
    next(createError(404, `this item ${req.params.itemTitle} is not found`))
  }
})

//GET 15 random items
itemsRouter.get("/", async (req, res, next) => {
  try {
    // if query parameter random===true then use $sample operator
    // else normal find()
    const items = await itemSchema.find({ $sample: { size: 15 } })

    res.status(200).send(items)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///GET single item
itemsRouter.get("/:itemTitle", async (req, res, next) => {
  try {
    const item = await itemSchema.findOne({ title: req.params.itemTitle })

    if (item) {
      res.status(200).send(item)
    } else {
      next(createError(404, `this item ${req.params.itemTitle} is not found`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///PUT item  ---TESTED----
itemsRouter.put("/:itemTitle", async (req, res, next) => {
  try {
    const itemToUpdate = await itemSchema.findOneAndUpdate(
      { title: req.params.itemTitle },
      {
        ...req.body,
      },
      { new: true }
    )

    if (itemToUpdate) {
      res.status(201).send(itemToUpdate)
    } else {
      next(createError(404, `this item ${req.params.itemTitle} is not found`))
      console.log(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

///DELETE item ---TESTED----
itemsRouter.delete("/:itemTitle", async (req, res, next) => {
  try {
    await itemSchema.findOneAndDelete({ title: req.params.itemTitle })

    res.status(200).send("item was deleted successfully")
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
