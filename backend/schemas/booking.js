const mongoose = require("mongoose");

const bookingMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    senderRole: {
      type: String,
      enum: ["owner", "tenant"],
      required: true,
    },
    senderName: {
      type: String,
      trim: true,
      default: "",
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const bookingModel = mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    ownerName: {
      type: String,
      trim: true,
      default: "",
    },
    ownerContact: {
      type: String,
      trim: true,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    userName: {
      type: String,
      required: [true, "Please provide a User Name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a Phone Number"],
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    messages: {
      type: [bookingMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const bookingSchema = mongoose.model("bookingschema", bookingModel);

module.exports = bookingSchema;