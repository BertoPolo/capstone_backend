import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../auth/token.js"
import { generateAccessToken } from "../auth/tools.js"
import { adminOnlyMiddleware } from "../auth/admin.js"

const usersRouter = express.Router()

//POST create a new token
usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain credentials from req.body
    const { username, password } = req.body

    // 2. Verify credentials
    const user = await usersSchema.checkCredentials(username, password)

    if (user) {
      // 3. If credentials are ok --> generate an access token (JWT) and send it as a response

      const accessToken = await generateAccessToken({ _id: user._id, role: user.role })
      res.send({ accessToken })
    } else {
      // 4. If credentials are not ok --> throw an error (401)
      next(createError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

//POST a new user
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
usersRouter.get("/:name", JWTAuthMiddleware, async (req, res, next) => {
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
usersRouter.get("/username/:username", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await usersSchema.findOne({ username: req.params.username })

    if (user) res.status(200).send(user)
    else res.status(404).send("user not found")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//PUT  edit your self account data
usersRouter.put("/edit/:userId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
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

//Delete user
usersRouter.delete("/delete/:userId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    await usersSchema.findByIdAndDelete(req.params.userId)

    res.status(200).send("deleted successfully")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
