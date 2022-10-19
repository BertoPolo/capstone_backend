import mongoose from "mongoose"

const { Schema, model } = mongoose

const brandsSchema = new Schema(
  {
    brands: [{ type: Schema.Types.ObjectId, ref: "Items" }],
  },
  { timestamps: true }
)

export default model("Brands", brandsSchema)
