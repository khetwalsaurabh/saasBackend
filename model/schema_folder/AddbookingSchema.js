const mongoose = require("mongoose");

const AddbookingSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: true,
      trim: true,
    },

    roomNumber: {
      type: String,
      required: true,
    },

    roomType: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    comingFrom: {
      type: String,
      default: "",
    },

    checkinDate: {
      type: String,
      required: true,
    },

    checkinTime: {
      type: String,
      required: true,
    },

    paymentBy: {
      type: String,
      enum: ["self", "company"],
      default: "self",
    },

    companyName: {
      type: String,
      default: "",
    },

    companyTariff: {
      type: Number,
      default: 0,
    },

    adults: {
      type: String,
      required: true,
    },
    // ////
    paymentmode: {
      type: String,
      default: "CASH",
    },

    advancepayment: {
      type: Number,
      default: 0,
    },

    Lodging: { type: Number, default: 0 },

    // ✅ ADD THIS
    status: {
      type: String,
      enum: ["checked_in", "checked_out"],
      default: "checked_in",
    },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreateAccount",
      required: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Addbooking", AddbookingSchema);
