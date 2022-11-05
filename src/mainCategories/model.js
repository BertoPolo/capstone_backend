import mongoose from "mongoose"

const { Schema, model } = mongoose

const mainCategoriesSchema = new Schema(
  {
    mainCategory: { type: String, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Categories" }],
  },
  { timestamps: true }
)

export default model("MainCategories", mainCategoriesSchema)
