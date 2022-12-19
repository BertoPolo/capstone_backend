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

const cloudinaryfavImagesUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "itemImages",
    },
  }),
}).single("image")

/**
 * @swagger
 * components:
 *  schemas:
 *    Items:
 *      type: object
 *      properties:
 *        title:
 *          type: string
 *          description: Item's title
 *        price:
 *          type: Number
 *          description: Item's price
 *        image:
 *          type: string
 *          description: Item's image
 *        mainCategory:
 *          type: Schema.Types.ObjectId
 *          description: Item's mainCategory
 *        category:
 *          type: Schema.Types.ObjectId
 *          description: Item's category
 *        brand:
 *          type: string
 *          description: Item's brand
 *        isOutlet:
 *          type: boolean
 *          description: Item's isOutlet
 *        outletPrice:
 *          type: number
 *          description: Item's outletPrice
 *        description:
 *          type: string
 *          description: Item's description
 *        fullDescription:
 *          type: string
 *          description: Item's fullDescription
 *      required:
 *        - title
 *        - price
 *        - mainCategory
 *        - brand
 *        - isOutlet
 *        - description
 *        - fullDescription
 *      example:
 *         title: Helmet Cool
 *         price: 111.11
 *         mainCategory: Helmets
 *         category: Full ones
 *         brand: Bandit
 *         isOutlet: false
 *         outletPrice: 23.88
 *         description: this helmet is cool
 *         fullDescription: this helmet is cool and awesome you should buy it now
 *
 */

/**
 * @swagger
 * /items/:
 *   post:
 *     description: Creates a new item. Needs admin token
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Items'
 *     responses:
 *       201:
 *         description: Returns new item's id.
 */
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

/**
 * @swagger
 * /items/:query:
 *   get:
 *     description: Search items searching by filters. query example "server"/items?limit=10&sort=-title&category="Full Face"&price<20&brand=63501f2fa63bc3ba9b91c4b5
 *     tags: [Items]
 *     parameters:
 *     - in: path
 *       name: query
 *       schema:
 *         type: string
 *       required: true
 *       description: string with query parameters
 *     responses:
 *       201:
 *         description: Returns the searched item.
 *       404:
 *         description: Returns "not found"
 */
//GET filtered items
//query example http://:localhost:3004/items?limit=10&sort=-title&category="Full Face"&price<20&brand=63501f2fa63bc3ba9b91c4b5
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

/**
 * @swagger
 * /items/random:
 *   get:
 *     description: Returns 15 random items from the database.
 *     tags: [Items]
 *     responses:
 *       201:
 *         description: Returns an array of items.
 *       404:
 *         description: Returns "not found"
 */
//GET 15 random items
itemsRouter.get("/random", async (req, res, next) => {
  try {
    // if query parameter random===true then use $sample operator
    // else normal find()
    const items = await itemSchema.aggregate([{ $sample: { size: 10 } }]) // returning random items SOMETIMES
    // .find({ $sample: { size: 15 } })
    if (items) res.status(200).send(items)
    else next(createError(404, `nothing found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/**
 * @swagger
 * /items/{itemId}/img:
 *   put:
 *     description: Change item's image. Needs admin token
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Items'
 *     parameters:
 *     - in: path
 *       name: itemId
 *       schema:
 *         type: string
 *       required: true
 *       description: item's id
 *     responses:
 *       201:
 *         description: Returns the updated item.
 *       404:
 *         description: Returns "not found"
 */
//PUT img's item
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

/**
 * @swagger
 * /items/{itemId}/:
 *   put:
 *     description: Change item's properties ( NOT IMAGE ). Needs admin token
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Items'
 *     parameters:
 *     - in: path
 *       name: itemId
 *       schema:
 *         type: string
 *       required: true
 *       description: item's id
 *     responses:
 *       201:
 *         description: Returns the updated item.
 *       404:
 *         description: Returns "not found"
 */
///PUT item
itemsRouter.put("/:itemId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const itemToUpdate = await itemSchema.findByIdAndUpdate(req.params.itemId, { ...req.body }, { new: true })

    if (itemToUpdate) res.status(201).send(itemToUpdate)
    else next(createError(404, `this item: ${req.params.itemId}, is not found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/**
 * @swagger
 * /items/:itemId/:
 *   delete:
 *     description: Delete an item. Needs admin token
 *     tags: [Items]
 *     parameters:
 *     - in: path
 *       name: itemId
 *       schema:
 *         type: string
 *       required: true
 *       description: item's id
 *     responses:
 *       201:
 *         description: Returns a verification message.
 *       404:
 *         description: Returns "not found"
 */
///DELETE item
itemsRouter.delete("/:itemId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const itemToDelete = await itemSchema.findByIdAndDelete(req.params.itemId)

    if (itemToDelete) res.status(200).send("item was deleted successfully")
    else next(createError(404, `this item: ${req.params.itemId}, is not found`))
  } catch (error) {
    next(error)
  }
})

export default itemsRouter
