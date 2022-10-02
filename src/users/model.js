import mongoose from "mongoose"

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

export default model("Users", usersSchema)
