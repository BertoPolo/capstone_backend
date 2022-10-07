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

//Get searched users -- 404 not returned--
usersRouter.get("/:name", async (req, res, next) => {
  try {
    const lowName = req.params.name.toLocaleLowerCase()
    const user = await usersSchema.find({ name: lowName })

    if (user) {
      res.status(200).send(user)
    } else {
      res.status(404).send("user not found")
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//PUT  edit your self account data
usersRouter.put("/edit/:username", async (req, res, next) => {
  try {
    // const lowUserName = req.params.username.toLocaleLowerCase()
    const user = await usersSchema.findOneAndUpdate(
      { username: req.params.username },
      {
        ...req.body,
      },
      { new: true }
    )
    if (user) {
      res.status(201).send(user)
    } else {
      res.status(404).send("user not found")
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//Delete user  -----TESTED----
usersRouter.delete("/:name", async (req, res, next) => {
  try {
    const lowName = req.params.name.toLocaleLowerCase()
    await usersSchema.findOneAndDelete({ name: lowName })

    res.status(200).send("deleted successfully")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default usersRouter
