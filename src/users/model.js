import mongoose from "mongoose"

const { Schema, model } = mongoose

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    adress: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
)

export default model("Users", usersSchema)
