import mongoose from "mongoose"

const { Schema, model } = mongoose

const itemsSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    mainCategory: { type: String, required: true },
    category: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "Brands" },
    isOutlet: { type: Boolean, required: true },
    outletPrice: { type: Number },
    description: { type: String, required: true }, // when at Home
    fullDescription: { type: String, required: true }, //  when u see the full item
  },
  { timestamps: true }
)

export default model("Items", itemsSchema)
