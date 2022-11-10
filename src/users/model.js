import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    adress: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

usersSchema.pre("save", async function (next) {
  const currentUser = this
  const plainPW = this.password

  if (currentUser.isModified("password")) {
    const hash = await bcrypt.hash(plainPW, 11)
    currentUser.password = hash
  }
  next()
})

usersSchema.methods.toJSON = function () {
  const userDocument = this
  const userObject = userDocument.toObject()

  delete userObject.password
  delete userObject.__v

  return userObject
}

usersSchema.static("checkCredentials", async function (username, plainPW) {
  const user = await this.findOne({ username })

  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password)

    if (isMatch) {
      return user
    } else {
      return null
    }
  } else {
    return null
  }
})

export default model("Users", usersSchema)
