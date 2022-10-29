import mongoose from "mongoose"

const { Schema, model } = mongoose

const itemsSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    mainCategory: { type: Schema.Types.ObjectId, ref: "MainCategories", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Categories" },
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true },
    isOutlet: { type: Boolean, required: true },
    outletPrice: { type: Number },
    description: { type: String, required: true }, // when at Home
    fullDescription: { type: String, required: true }, //  when u see the full item
  },
  { timestamps: true }
)

export default model("Items", itemsSchema)
