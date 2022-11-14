import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { basicAuthMiddleware } from "../auth/basic.js"
import { adminOnlyMiddleware } from "../auth/admin.js"

const usersRouter = express.Router()

//POST a new user -----TESTED----
usersRouter.post("/", async (req, res, next) => {
  try {
    //check if the user already exists
    const newUser = new usersSchema(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Get searched users
usersRouter.get("/:name", basicAuthMiddleware, async (req, res, next) => {
  try {
    const users = await usersSchema.find({ name: { $regex: req.params.name, $options: "i" } })
    // you can also sort by name

    if (users) res.status(200).send(users)
    else res.status(404).send("user not found")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Get single user by username
usersRouter.get("/username/:username", basicAuthMiddleware, async (req, res, next) => {
  try {
    const user = await usersSchema.findOne({ username: req.params.username })

    if (user) res.status(200).send(user)
    else res.status(404).send("user not found")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//PUT  edit your self account data --- TESTED----
usersRouter.put("/edit/:userId", basicAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  // , adminOnlyMiddleware
  try {
    const user = await usersSchema.findByIdAndUpdate(
      req.params.userId,
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
usersRouter.delete("/delete/:userId", basicAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
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
