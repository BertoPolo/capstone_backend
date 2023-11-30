import mongoose from "mongoose"

const { Schema, model } = mongoose

const mainCategoriesSchema = new Schema(
  {
    mainCategory: { type: String, required: true, trim: true, maxlength: 15 },
    categories: [{ type: Schema.Types.ObjectId, ref: "Categories", trim: true, maxlength: 15 }],
  },
  { timestamps: true }
)

export default model("MainCategories", mainCategoriesSchema)
