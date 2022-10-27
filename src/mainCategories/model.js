import mongoose from "mongoose"

const { Schema, model } = mongoose

const mainCategoriesSchema = new Schema(
  {
    mainCategories: { type: String, required: true },
  },
  { timestamps: true }
)

export default model("MainCategories", mainCategoriesSchema)
