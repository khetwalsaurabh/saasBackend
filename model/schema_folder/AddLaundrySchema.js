const mongoose = require("mongoose");

const AddLaundrySchema = new mongoose.Schema(
  {
    // 🔗 Link laundry to same booking
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    roomNumber: {
      type: Number,
      required: true,
    },

    serialNumber: {
      type: Number,
      required: true,
    },

    laundryItem: {
      type: String,
      required: true, // Shirt, Pant, Bedsheet etc.
      trim: true,
    },

    laundryRate: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    laundryAmount: {
      type: Number,
      required: true, // rate * quantity
    },

    status: {
      type: String,
      enum: ["unbilled", "billed"],
      default: "unbilled",
    },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreateAccount",
      required: true
    }

  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("Laundry", AddLaundrySchema);
