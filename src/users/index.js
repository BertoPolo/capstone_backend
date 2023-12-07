import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import nodemailer from "nodemailer"
import Stripe from "stripe"
import q2m from "query-to-mongo"
import { JWTAuthMiddleware } from "../auth/token.js"
import { generateAccessToken } from "../auth/tools.js"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { onAdminChange } from "../services/resetScript.js"

const usersRouter = express.Router()

//swagger token not rightly applied
/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *  security:
 *  - bearerAuth: []
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: User's name
 *        price:
 *          type: string
 *          description: User's username
 *        email:
 *          type: string
 *          description: User's email
 *        adress:
 *          type: string
 *          description: User's adress
 *        isAdmin:
 *          type: boolean
 *          description: User's rights, if it's admin or not
 *        password:
 *          type: string
 *          description: User's encrypted password
 *      required:
 *        - name
 *        - username
 *        - email
 *        - adress
 *        - isAdmin
 *        - password
 *      example:
 *         name: Harrison
 *         username: s0nF0rd
 *         email: harryford@gmail.com
 *         adress: C/my street 33
 *         isAdmin: false
 *         password: 0192ie0jdq0j1A
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     description: Creates a new token.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Returns a token
 *       401:
 *         description: returns a 401 error message " Credentials are not ok"
 */
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
      res.status(201).send({ accessToken })
    } else {
      // 4. If credentials are not ok --> throw an error (401)
      next(createError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /users/:
 *   post:
 *     description: Creates a new user and send an email afer successful registration.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Returns new user's id.
 *       409:
 *         description: Returns error message "user already exists".
 */
//POST a new user and send an email after successful registration
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

/**
 * @swagger
 * /users/purchase:
 *   post:
 *     description: Send an email after purchase.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Returns message "payment and Email are done!"
 */
//POST send an email after purchase
usersRouter.post("/purchase", async (req, res, next) => {
  const { id, amount, email } = req.body

  try {
    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY)

    const payment = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "EUR",
      payment_method: id,
      description: " this description should be dynamic filled with all the purchased items",
      confirm: true,
    })

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
      to: email,
      subject: "Welcome ✔",
      text: "Thank you for your purchase!!",
      html: "<b>Thank you for your purchase,in a few days you gonna enjoy your stuff!!</b>",
    })

    res.send({ message: "payment and Email are done!" })
  } catch (error) {
    next(error)
    console.log(error)
  }
})

/**
 * @swagger
 * /users/{name}:
 *   get:
 *     description: Returns searched users by name. Needs token.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: user's name
 *     responses:
 *       200:
 *         description: Returns found users
 *       404:
 *         description: Returns message "no users found"
 */
//Get searched users
usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const queryToMongo = q2m(req.query)
    console.log(queryToMongo)
    const users = await usersSchema
      .find(queryToMongo.criteria)
      .limit(queryToMongo.options.limit)
      .skip(queryToMongo.options.skip)
      .sort(queryToMongo.options.sort)

    // const users = await usersSchema.find({ name: { $regex: req.params.name, $options: "i" } })

    if (users) res.status(200).send(users)
    else next(createError(404, `no users found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/**
 * @swagger
 * /users/username/{username}:
 *   get:
 *     description: Returns single user by username. Needs token.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: user's username
 *     responses:
 *       200:
 *         description: Returns found user
 *       404:
 *         description: Returns message "no users found"
 */
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

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     description: Modify account data. Needs admin token.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: user's id
 *     responses:
 *       201:
 *         description: Returns updated user
 *       404:
 *         description: Returns message "no users found"
 */
//PUT account data
usersRouter.put("/:userId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const user = await usersSchema.findByIdAndUpdate(
      req.params.userId,
      {
        ...req.body,
      },
      { new: true }
    )
    if (user) {
      onAdminChange()
      res.status(201).send(user)
    } else next(createError(404, `no users found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/**
 * @swagger
 * /users/me:
 *   put:
 *     description: Modify self account data. Needs token.
 *     tags: [User]
 *     responses:
 *       201:
 *         description: Returns updated user
 *       404:
 *         description: Returns message "no users found"
 */
//PUT self account data
usersRouter.put("/me/data", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await usersSchema.findByIdAndUpdate(
      req.user._id,
      {
        ...req.body,
      },
      { new: true }
    )
    if (user) {
      onAdminChange()
      res.status(201).send(user)
    } else next(createError(404, `no users found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     description: Modify self password. Needs token.
 *     tags: [User]
 *     responses:
 *       201:
 *         description: Returns updated user
 *       404:
 *         description: Returns message "no users found"
 */
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

/**
 * @swagger
 * /users/forgotPassword:
 *   put:
 *     description: set password from account and send email with new provisional password.
 *     tags: [User]
 *     responses:
 *       201:
 *         description: Returns updated user
 *       404:
 *         description: Returns message "no users found"
 */
//PUT check and reset password
usersRouter.put("/password/forgotPassword", async (req, res, next) => {
  try {
    const user = await usersSchema.findOne({ name: req.body.name, username: req.body.username, email: req.body.email })

    if (user) {
      user.password = req.body.password
      const { password } = await user.save()

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
        to: user.email,
        subject: "Welcome ✔",
        text: "Here is there your new password",
        html: `<b>Here is there your new password. Change it ASAP, this one is a low security pass. <p>New password : <u> ${req.body.password}</u></p> <h3>Stuff to Route</h3> </b>`,
      })
      onAdminChange()
      res.status(201).send({ message: "New password is sent to that mail successfully" })
    } else next(createError(404, `User not found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     description: delete an user, Needs admin token.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: user's id
 *     responses:
 *       200:
 *         description: Returns "deleted successfully"
 *       404:
 *         description: Returns message "no users found"
 */
//Delete user
usersRouter.delete("/:userId", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    // const userToDelete = await usersSchema.findByIdAndDelete(req.params.userId)
    const userToDelete = await usersSchema.findById(req.params.userId)

    if (userToDelete) res.status(200).send({ message: "deleted successfully" })
    else next(createError(404, `User not found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
