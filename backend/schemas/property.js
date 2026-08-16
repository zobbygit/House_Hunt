const mongoose = require("mongoose");

const propertyImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const propertyModel = mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    propertyType: {
      type: String,
      required: [true, "Please provide a Property Type"],
    },
    propertyAdType: {
      type: String,
      required: [true, "Please provide a Property Ad Type"],
    },
    propertyAddress: {
      type: String,
      required: [true, "Please Provide an Address"],
    },
    ownerContact: {
      type: Number,
      required: [true, "Please provide owner contact"],
    },
    propertyAmt: {
      type: Number,
      default: 0,
    },
    propertyImages: {
      type: [propertyImageSchema],
      default: [],
    },
    additionalInfo: {
      type: String,
    },
    ownerName: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    bedrooms: {
      type: Number,
    },
    bathrooms: {
      type: Number,
    },
    furnished: {
      type: String,
      enum: ["Furnished", "Unfurnished", "Semi-furnished"],
    },
    parking: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    strict: false,
  },
);

const property = mongoose.model("property", propertyModel, "property");

module.exports = property;