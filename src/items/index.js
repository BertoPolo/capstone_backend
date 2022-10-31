import itemSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import q2m from "query-to-mongo"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import { adminOnlyMiddleware } from "../auth/admin.js"

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
itemsRouter.post("/new", async (req, res, next) => {
  //adminOnlyMiddleware
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
itemsRouter.put("/:itemId/img", cloudinaryfavImagesUploader, async (req, res, next) => {
  // adminOnlyMiddleware
  try {
    const itemToUpdate = await itemSchema.findByIdAndUpdate(req.params.itemId, { image: req.file.path }, { new: true })

    if (itemToUpdate) {
      res.status(201).send(itemToUpdate)
    } else {
      next(createError(404, `this item ${req.params.itemId} is not found`))
      console.log(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//GET filtered items
itemsRouter.get("/", async (req, res, next) => {
  try {
    const queryToMongo = q2m(req.query)
    // http://query example : localhost:3004/items?limit=10&sort=-title?category="Full Face"&price<20&brand=63501f2fa63bc3ba9b91c4b5
    console.log(queryToMongo)
    const products = await itemSchema
      .find(queryToMongo.criteria)
      // .populate(["brand", "category", "mainCategory"]) //({ path: "brand", select: "brands" })
      .populate([
        { path: "brand", select: "brands" },
        { path: "category", select: "categories" },
        { path: "mainCategory", select: "mainCategories" },
      ])
      .limit(queryToMongo.options.limit)
      .skip(queryToMongo.options.skip)
      .sort(queryToMongo.options.sort)
    // console.log(req.user)
    res.send(products)
  } catch (error) {
    next(error)
  }
})

//GET 15 random items
itemsRouter.get("/random", async (req, res, next) => {
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

//GET filtered BY TITLE items
// itemsRouter.get("/bytitle/:itemTitle", async (req, res, next) => {
//   try {
//     const items = await itemSchema.find({ title: { $regex: req.params.itemTitle, $options: "i" } }).populate({ path: "brand", select: "brands" })
//     const mongoQuery = q2m(req.query)

//     res.status(200).send(items)
//   } catch (error) {
//     console.log(error)
//     next(createError(404, `this item ${req.params.itemTitle} is not found`))
//   }
// })

//GET  BY CATEGORY items
// itemsRouter.get("/category/:category", async (req, res, next) => {
//   try {
//     const items = await itemSchema.find({ category: req.params.category })
//     if (items) {
//       res.status(200).send(items)
//     } else {
//       res.status(404).send("category not found")
//     }
//   } catch (error) {
//     console.log(error)
//     next(createError(404, `this category ${req.params.category} is not found`))
//   }
// })

//GET  BY mainCategory items
// itemsRouter.get("/mainCategory/:mainCategory", async (req, res, next) => {
//   try {
//     const items = await itemSchema.find({ mainCategory: req.params.mainCategory })
//     if (items) {
//       res.status(200).send(items)
//     } else {
//       res.status(404).send("mainCategory not found")
//     }
//   } catch (error) {
//     console.log(error)
//     next(createError(404, `this category ${req.params.mainCategory} is not found`))
//   }
// })

//GET  BY brand's item
// itemsRouter.get("/brand/:brand", async (req, res, next) => {
//   try {
//     const items = await itemSchema.find({ brand: req.params.brand })

//     if (items) {
//       res.status(200).send(items)
//     } else {
//       res.status(404).send("brand not found")
//     }
//   } catch (error) {
//     console.log(error)
//     next(createError(404, `this brand ${req.params.brand} is not found`))
//   }
// })

///GET single item
// itemsRouter.get("/:itemTitle", async (req, res, next) => {
//   try {
//     const item = await itemSchema.findOne({ title: req.params.itemTitle })

//     if (item) {
//       res.status(200).send(item)
//     } else {
//       next(createError(404, `this item ${req.params.itemTitle} is not found`))
//     }
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// })

///PUT item  ---TESTED----
itemsRouter.put("/:itemTitle", adminOnlyMiddleware, async (req, res, next) => {
  // should be /itemEdit/:itemTitle
  try {
    const itemToUpdate = await itemSchema.findOneAndUpdate({ title: req.params.itemTitle }, { ...req.body }, { new: true })

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
itemsRouter.delete("/:itemTitle", adminOnlyMiddleware, async (req, res, next) => {
  try {
    await itemSchema.findOneAndDelete({ title: req.params.itemTitle })

    res.status(200).send("item was deleted successfully")
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
