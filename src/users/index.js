import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../auth/token.js"
import { generateAccessToken } from "../auth/tools.js"
import { adminOnlyMiddleware } from "../auth/admin.js"
import nodemailer from "nodemailer"

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

      const accessToken = await generateAccessToken({ _id: user._id, isAdmin: user.isAdmin })
      res.send({ accessToken })
    } else {
      // 4. If credentials are not ok --> throw an error (401)
      next(createError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

//POST send Email after purchase
usersRouter.post("/purchase", async (req, res, next) => {
  //merge with poyment endpoint
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    })

    const info = await transporter.sendMail({
      from: `"Stuff To Route" <${process.env.USER}>`,
      to: req.body.email,
      subject: "Welcome ✔",
      text: "Thank you for your purchase!!",
      html: "<b>Thank you for your purchase,in a few days you gonna enjoy your stuff!!</b>",
    })

    res.send({ message: "Email sent!" })
  } catch (error) {
    next(error)
  }
})

//POST a new user and send Email after registration
usersRouter.post("/", async (req, res, next) => {
  try {
    const doesUserAlreadyExists = await usersSchema.findOne({ username: req.body.username })

    if (!doesUserAlreadyExists) {
      const newUser = new usersSchema(req.body)
      const { _id } = await newUser.save()

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      })

      const info = await transporter.sendMail({
        from: `"Stuff To Route" <${process.env.USER}>`,
        to: req.body.email,
        subject: "Welcome ✔",
        text: "Welcome aboard!!",
        html: "<b>Welcome aboard!!</b>",
      })

      res.status(201).send(_id)
    } else next(createError(409, `user already exists`))
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
    //implement q2m to search how admin wants to

    if (users) res.status(200).send(users)
    else next(createError(404, `no users found`))
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
    else next(createError(404, `no users found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//PUT account data
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
    else next(createError(404, `no users found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//PUT self account data
usersRouter.put("/me/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await usersSchema.findByIdAndUpdate(
      req.user._id,
      {
        ...req.body,
      },
      { new: true }
    )
    if (user) res.status(201).send(user)
    else next(createError(404, `no users found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//PUT self account password
usersRouter.put("/me/password", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await usersSchema.findById(req.user._id)
    user.password = req.body.password

    const { password } = await user.save()

    if (user) res.status(201).send(user)
    else next(createError(404, `no user found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Delete user
usersRouter.delete("/:userId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    await usersSchema.findByIdAndDelete(req.user._id)

    res.status(200).send({ message: "deleted successfully" })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
