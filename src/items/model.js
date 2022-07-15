import mongoose from "mongoose"

const { Schema, model } = mongoose

const itemsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
)

export default model("Items", ItemsSchema)
