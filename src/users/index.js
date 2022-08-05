import usersSchema from "./model.js"
import express from "express"
import createError from "http-errors"

const usersRouter = express.Router()

//POST a new user -----TESTED----
usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new usersSchema(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Get single user
usersRouter.get("/:findUser", async (req, res, next) => {
  try {
    const user = await usersSchema.findOne({ name: req.params.findUser } || { username: req.params.findUser }) // find by name or username

    res.status(200).send(user)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Delete user
usersRouter.delete("/:findUser", async (req, res, next) => {
  try {
    await usersSchema.findOneAndDelete({ name: req.params.findUser } || { username: req.params.findUser }) // find by name or username

    res.status(200).send("deleted successfully")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
