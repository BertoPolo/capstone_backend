import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"
import nodemailer from "nodemailer"
import Stripe from "stripe"
import q2m from "query-to-mongo"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"

import { JWTAuthMiddleware } from "../auth/token.js"
import { generateAccessToken } from "../auth/tools.js"
import { adminOnlyMiddleware } from "../auth/admin.js"
import { onAdminChange } from "../services/rollbackScript.js"

const usersRouter = express.Router()

const cloudinaryUsersImagesUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "usersAvatars",
    },
  }),
}).single("image")

/**
*@swagger: "2.0"
*info:
*  description: "API documentation for the Users service."
*  version: "1.0.0"
*  title: "Users API"
*host: "localhost:3000"
*basePath: "/"
*schemes:
*  - "http"
*paths: {}
*components:
*  securitySchemes:
*    bearerAuth:  # Correctly applying the JWT token for secured endpoints
*      type: http
*      scheme: bearer
*      bearerFormat: JWT
*  security:
*    - bearerAuth: []
*  schemas:
*    User:
*      type: object
*      required:
*        - name
*        - username
*        - email
*        - address
*        - isAdmin
*        - password
*      properties:
*        name:
*          type: string
*          description: "The full name of the user."
*        username:
*          type: string
*          description: "The unique username for the user. Used for logging in."
*        email:
*          type: string
*          description: "The email address of the user."
*        address:
*          type: string
*          description: "Physical address of the user."
*        isAdmin:
*          type: boolean
*          description: "Flag indicating whether the user has admin privileges."
*        password:
*          type: string
*          description: "The user's password. Stored securely as a hash."
*      example:
*        name: "Harrison"
*        username: "s0nF0rd"
*        email: "harryford@gmail.com"
*        address: "C/my street 33"
*        isAdmin: false
*        password: "0192ie0jdq0j1A"

 */

/**
*@swagger: "2.0"
*paths:
*  /users/login:
*    post:
*      summary: "Login User"
*      description: "Authenticates a user and creates a new JWT token."
*      tags: 
*        - User
*      requestBody:
*        required: true
*        content:
*          application/json:
*            schema:
*              type: object
*              required:
*                - username
*                - password
*              properties:
*                username:
*                  type: string
*                  example: "user123"
*                password:
*                  type: string
*                  format: password
*                  example: "pass123"
*      responses:
*        201:
*          description: "JWT token successfully created and returned."
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  accessToken:
*                    type: string
*                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
*        401:
*          description: "Authentication failed. Credentials are not ok."
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  error:
*                    type: string
*                    example: "Credentials are not ok!"

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
      const error = new Error("Unauthorized")
      error.status = 401
      throw error
    }
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger: "2.0"
 * paths:
*  /users/:
*    post:
*      summary: "Register User"
*      description: "Creates a new user and sends an email after successful registration."
*      tags: 
*        - User
*      requestBody:
*        required: true
*        content:
*          application/json:
*            schema:
*              type: object
*              required:
*                - name
*                - username
*                - email
*                - password
*                - address
*                - isAdmin
*              properties:
*                name:
*                  type: string
*                  example: "Jane Doe"
*                username:
*                  type: string
*                  example: "janedoe"
*                email:
*                  type: string
*                  example: "jane.doe@example.com"
*                password:
*                  type: string
*                  format: password
*                  example: "password123"
*                address:
*                  type: string
*                  example: "123 Main St, Anytown, Anycountry"
*                isAdmin:
*                  type: boolean
*                  example: false
*      responses:
*        201:
*          description: "New user's ID returned. An email is sent to the user's email address."
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  _id:
*                    type: string
*                    example: "5f3e075d2712160018f7354d"
*        409:
*          description: "Error message returned when a user already exists."
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  error:
*                    type: string
*                    example: "user already exists"

 */
//POST a new user and send an email after successful registration
usersRouter.post("/", async (req, res, next) => {
  try {
    const usernameLower = req.body.username.toLowerCase()

    const doesUserAlreadyExists = await usersSchema.findOne({ username: usernameLower })
    if (!doesUserAlreadyExists) {
      const newUser = new usersSchema({
        ...req.body,
        username: usernameLower,
      })
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
 * @swagger: "2.0"
 * paths:
*  /users/purchase:
*    post:
*      summary: "Process Purchase"
*      description: "Processes a user's purchase and sends an email confirmation."
*      tags: 
*        - User
*      requestBody:
*        required: true
*        content:
*          application/json:
*            schema:
*              type: object
*              required:
*                - id
*                - amount
*                - email
*              properties:
*                id:
*                  type: string
*                  description: "Payment method ID."
*                  example: "pm_1HfYK2GZbWqjMvR4Xx7lr6lv"
*                amount:
*                  type: number
*                  description: "Total amount of the purchase."
*                  example: 150.00
*                email:
*                  type: string
*                  description: "Email address to send the purchase confirmation."
*                  example: "user@example.com"
*      responses:
*        200:
*          description: "Confirmation message that payment and email have been processed."
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  message:
*                    type: string
*                    example: "payment and Email are done!"

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
 * @swagger: "2.0"
 * paths:
 *  /users/:
 *    get:
 *      summary: "Search Users by Name"
 *      description: "Returns users matching the provided name query. Requires a token for authentication."
 *      tags:
 *        - User
 *      parameters:
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          required: true
 *          description: "The name of the user to search for."
 *      responses:
 *        200:
 *          description: "A list of users that match the search criteria."
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/User'
 *        404:
 *          description: "No users found matching the search criteria."
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "no users found"
 *
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

usersRouter.get("/withtotalnumber", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const queryToMongo = q2m(req.query)
    let criteria = queryToMongo.criteria

    if (req.query.name) {
      criteria = { ...criteria, name: { $regex: req.query.name, $options: "i" } }
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 6
    const skip = (page - 1) * limit

    const total = await usersSchema.countDocuments({})
    const users = await usersSchema.find({}).skip(skip).limit(limit).sort({ name: 1 })

    if (users) {
      res.status(200).send({ total, users })
    } else {
      next(createError(404, `No users found`))
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

/**
 * @swagger: "2.0"
 * paths:
 *  /users/username/{username}:
 *    get:
 *      summary: "Get User by Username"
 *      description: "Retrieves a single user by their username. Requires a token for authentication."
 *      tags:
 *        - User
 *      parameters:
 *        - in: path
 *          name: username
 *          required: true
 *          schema:
 *            type: string
 *          description: "The username of the user to retrieve."
 *      responses:
 *        200:
 *          description: "The user was found and is returned."
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        404:
 *          description: "No user found with the provided username."
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "no users found"
 *
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
 * @swagger: "2.0"
 * paths:
 *   /users/{userId}:
 *     put:
 *       summary: "Modify User Account Data"
 *       description: "Updates the account data for a user. Requires an admin token for authentication."
 *       tags:
 *         - User
 *       parameters:
 *         - in: path
 *           name: userId
 *           required: true
 *           schema:
 *             type: string
 *           description: "The unique identifier of the user whose account is being modified."
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: "User's new name."
 *                 email:
 *                   type: string
 *                   description: "User's new email address."
 *                 username:
 *                   type: string
 *                   description: "User's new username."
 *                 address:
 *                   type: string
 *                   description: "User's new address."
 *                 isAdmin:
 *                   type: boolean
 *                   description: "Whether the user has admin rights."
 *               example:
 *                 name: "Jane Doe"
 *                 email: "janedoe@example.com"
 *                 username: "janedoe"
 *                 address: "123 New Street, New City, NC"
 *                 isAdmin: false
 *       responses:
 *         201:
 *           description: "The user's account data was successfully updated."
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
 *         404:
 *           description: "No user found with the provided ID."
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "no users found"
 *
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
 * @swagger: "2.0"
 * paths:
 *  /users/{userId}/img:
 *   put:
 *     summary: "Update User's Image"
 *     description: "Allows an admin to update the avatar image for a user. The image is uploaded to Cloudinary."
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The unique identifier of the user whose image is being updated."
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "The new avatar image for the user."
 *     responses:
 *       201:
 *         description: "User's image was successfully updated. Returns the updated user object."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: "No user found with the provided ID."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "this user {userId} is not found"
 *     security:
 *       - bearerAuth: []
 */
//PUT img's user
usersRouter.put("/:userId/img", JWTAuthMiddleware, adminOnlyMiddleware, cloudinaryUsersImagesUploader, async (req, res, next) => {
  try {
    const userToUpdate = await usersSchema.findByIdAndUpdate(req.params.userId, { avatar: req.file.path }, { new: true })
    if (userToUpdate) {
      res.status(201).send(userToUpdate)
    } else {
      next(createError(404, `this user ${req.params.userId} is not found`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// SWAGGER CORRECTED UNTIL HERE, AND OTHER SCHEMAS ARE NOT DONE

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
    const user = await usersSchema.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true })

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

    if (user) {
      res.status(201).send(user)
      onAdminChange()
    } else next(createError(404, `no user found`))
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
    const userToDelete = await usersSchema.findByIdAndDelete(req.params.userId)
    onAdminChange()
    if (userToDelete) res.status(200).send({ message: "deleted successfully" })
    else next(createError(404, `User not found`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
