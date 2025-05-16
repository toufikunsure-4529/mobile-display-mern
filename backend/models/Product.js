import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
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
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model",
      required: true,
    },

    variableProduct: { type: Boolean, default: false },
    hasQualityOptions: { type: Boolean, default: false },

    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },

    bestSelling: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },

    featureImage: { type: String, required: true }, // Single image (Cloudinary URL)
    images: [{ type: String, required: true }], // Multiple images (array of Cloudinary URLs)

    description: { type: String },
    keyFeatures: { type: String },
    inTheBox: { type: String },
    compatibility: { type: String },
  },
  {
    timestamps: true,
  }
);

const productModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
