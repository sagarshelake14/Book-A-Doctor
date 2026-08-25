const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    website: {
      type: String,
      required: [true, "Website is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },

    experience: {
      type: String,
      required: [true, "Experience is required"],
      trim: true,
    },

    // IMPORTANT: spelling must match frontend + controller
    feePerCunsultation: {
      type: Number,
      required: [true, "Fee per consultation is required"],
    },

    timings: {
      type: [String],
      required: [true, "Timings are required"],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const doctorModel = mongoose.model("doctors", doctorSchema);

module.exports = doctorModel;