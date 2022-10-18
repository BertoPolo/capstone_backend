import mongoose from "mongoose"

const { Schema, model } = mongoose

const brandsSchema = new Schema(
  {
    brands: { type: Array, required: true },
  },
  { timestamps: true }
)

export default model("Brands", brandsSchema)
