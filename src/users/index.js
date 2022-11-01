import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { adminOnlyMiddleware } from "../auth/admin.js"

const usersRouter = express.Router()

//POST a new user -----TESTED----
usersRouter.post("/", adminOnlyMiddleware, async (req, res, next) => {
  try {
    const newUser = new usersSchema(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Get single user -----TESTED----
// usersRouter.get("/:username", async (req, res, next) => {
//   try {
//     const user = await usersSchema.findOne({ username: req.params.username })

//     res.status(200).send(user)
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// })

//Get searched users
usersRouter.get("/:name", async (req, res, next) => {
  try {
    const user = await usersSchema.find({ name: { $regex: req.params.name, $options: "i" } })
    // you can also sort by name

    if (user) res.status(200).send(user)
    else res.status(404).send("user not found")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//PUT  edit your self account data --- TESTED----
usersRouter.put("/edit/:username", async (req, res, next) => {
  // , adminOnlyMiddleware
  try {
    const user = await usersSchema.findOneAndUpdate(
      { username: req.params.username },
      {
        ...req.body,
      },
      { new: true }
    )
    if (user) res.status(201).send(user)
    else res.status(404).send("user not found")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Delete user  -----TESTED----
usersRouter.delete("/delete/:userId", async (req, res, next) => {
  // , adminOnlyMiddleware
  try {
    await usersSchema.findByIdAndDelete(req.params.userId)

    res.status(200).send("deleted successfully")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
