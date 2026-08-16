const mongoose = require("mongoose");

const favoriteModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
  },
  { timestamps: true },
);

favoriteModel.index({ userId: 1, propertyId: 1 }, { unique: true });

const favorite = mongoose.model("favorite", favoriteModel, "favorite");

module.exports = favorite;