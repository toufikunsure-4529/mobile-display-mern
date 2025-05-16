import mongoose from "mongoose";
const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const brandModel =
  mongoose.models.Brand || mongoose.model("Brand", brandSchema);

export default brandModel;
