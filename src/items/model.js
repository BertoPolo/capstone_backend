import mongoose from "mongoose"

const { Schema, model } = mongoose

const itemsSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 60 },
    price: { type: Number, required: true, trim: true, maxlength: 6 },
    image: { type: String, trim: true },
    mainCategory: { type: Schema.Types.ObjectId, ref: "MainCategories", required: true, trim: true, maxlength: 15 },
    category: { type: Schema.Types.ObjectId, ref: "Categories", trim: true, maxlength: 15 },
    brand: { type: Schema.Types.ObjectId, ref: "Brands", required: true, trim: true, maxlength: 15 },
    isOutlet: { type: Boolean, required: true },
    outletPrice: { type: Number, default: 0, trim: true, maxlength: 6 },
    description: { type: String, required: true, trim: true, maxlength: 70 }, // when at Home
    fullDescription: { type: String, required: true, trim: true, maxlength: 250 }, //  when u see the full item
  },
  { timestamps: true }
)

export default model("Items", itemsSchema)
