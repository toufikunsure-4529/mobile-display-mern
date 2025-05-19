import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, requires: true },
  quantity: { type: Number, required: true, min: 1 },
  productData: { type: Object, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [cartItemSchema],
    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0, min: 1 },
  },
  {
    timestamps: true,
  }
);

const cartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default cartModel;
