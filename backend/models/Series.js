import mongoose from "mongoose";

const seriesSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const seriesModel =
  mongoose.models.Series || mongoose.model("Series", seriesSchema);
export default seriesModel;
