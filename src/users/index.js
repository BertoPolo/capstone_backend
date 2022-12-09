import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../auth/token.js"
import { generateAccessToken } from "../auth/tools.js"
import { adminOnlyMiddleware } from "../auth/admin.js"
import nodemailer from "nodemailer"
// import { sendEmail } from "../tools/email.js"

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

//POST send Email after registration => not working
usersRouter.post("/registrationEmail", async (req, res, next) => {
  try {
    // const { email } = req.body

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      // port: 465,
      // secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
      tls: { rejectUnauthorized: false }, // is it needed?¿?
    })

    const info = await transporter.sendMail({
      from: '"Stuff To Route" <taniaxd07@hotmail.com>', // sender address
      to: "renorz@hotmail.com", // list of receivers
      subject: "Welcome ✔", // Subject line
      text: "Welcome aboard!!", // plain text body
      html: "<b>Welcome aboard!!</b>", // html body
    })

    res.send({ message: "User registered, email sent!" })
  } catch (error) {
    next(error)
  }
})

//POST a new user
usersRouter.post("/", async (req, res, next) => {
  try {
    const doesUserAlreadyExists = await usersSchema.findOne({ username: req.body.username })

    if (!doesUserAlreadyExists) {
      const newUser = new usersSchema(req.body)
      const { _id } = await newUser.save()

      res.status(201).send(_id)
    } else next(createError(409, `user already exists`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//POST send email notification
usersRouter.post("/email", async (req, res, next) => {
  try {
    // const email = req.body
    //  await sendRegistrationEmail(email)

    res.status(201).send(email)
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
    const user = await usersSchema.findByIdAndUpdate(req.user._id, { password: req.body.password }, { new: true })
    const { password } = await user.save()
    // console.log(password)
    if (user) res.status(201).send(user)
    // if (user) res.status(201).send(password)
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
