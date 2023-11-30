import mongoose from "mongoose"

const { Schema, model } = mongoose

const brandsSchema = new Schema(
  {
    brands: { type: String, required: true, trim: true, maxlength: 15 },
  },
  { timestamps: true }
)

export default model("Brands", brandsSchema)
