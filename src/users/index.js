import usersRouter from "./users.js"
import express from "express"
import createError from "http-errors"

const usersRouter = express.Router()

//POST a new user
usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = await new usersRouter(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
