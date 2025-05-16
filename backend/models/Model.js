import mongoose from "mongoose";

const modelSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Series",
    required: true,
  },
},
  {
    timestamps: true,
  });

const modelModels =
  mongoose.models.Model || mongoose.model("Model", modelSchema);

export default modelModels;
