import mongoose from "mongoose"

const { Schema, model } = mongoose

const categoriesSchema = new Schema(
  {
    categories: { type: String, required: true },
  },
  { timestamps: true }
)

export default model("Categories", categoriesSchema)
