import mongoose from "mongoose"

const { Schema, model } = mongoose

const itemsSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String },
    mainCategory: { type: String, required: true },
    category: { type: String },
    brand: { type: String, required: true },
    isOutlet: { type: Boolean, required: true },
    outletPrice: { type: String },
    description: { type: String, required: true }, // when at Home
    fullDescription: { type: String, required: true }, //  when u see the full item
    amount: { type: Number, default: 1 },
  },
  { timestamps: true }
)

export default model("Items", itemsSchema)
