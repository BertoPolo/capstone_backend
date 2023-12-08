import mongoose from "mongoose"

const { Schema, model } = mongoose

const categoriesSchema = new Schema(
  {
    categories: { type: String, required: true, trim: true, maxlength: 20 },
  },
  { timestamps: true }
)

export default model("Categories", categoriesSchema)
