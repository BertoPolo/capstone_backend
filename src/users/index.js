import usersRouter from "./users.js"
import express from "express"
import createError from "http-errors"

const usersRouter = express.Router()

//POST a new user
usersRouter.post("/", async (req, res, next) => {
  try {
    // const item = await new itemSchema(req.body)
    // const { _id } = await item.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
