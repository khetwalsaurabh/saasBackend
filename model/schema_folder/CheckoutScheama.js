const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema(
  {

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Booking",
      ref: "Addbooking", // ✅ MUST MATCH model name
      required: true,
    },

    guestName: { type: String, required: true, trim: true },

    roomNumber: { type: String, required: true },

    roomType: { type: String, required: true },

    mobile: { type: String, required: true },

    email: { type: String, default: "" },

    address: { type: String, default: "" },

    comingFrom: { type: String, default: "" },

    checkinDate: { type: String, required: true },

    checkinTime: { type: String, required: true },

    paymentBy: {
      type: String,
      enum: ["self", "company"],
      default: "self",
    },

    companyName: { type: String, default: "" },

    companyTariff: { type: Number, default: 0 },

    adults: { type: Number, required: true },

    checkoutDate: { type: String, required: true },

    checkoutTime: { type: String, required: true },

    Lodging: { type: Number, default: 0 },

    numberOfdays: { type: Number, default: 0 },

    food: { type: Number, default: 0 },

    Laundry: { type: Number, default: 0 },

    extraPerson: { type: Number, default: 0 },

    telephoneCalls: { type: Number, default: 0 },

    // ////
    paymentmode: {
      type: String,
      default: "CASH",
    },

    advancepayment: {
      type: Number,
      default: 0,
    },

    customerGstNo: {
      type: String,
      default: null,
    },

    foodSlip: {
      type: Boolean,
      required: true
    },

    laundrySlip: {
      type: Boolean,
      required: true,
    },

    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreateAccount",
      required: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkout", CheckoutSchema);


// If you want next:
// Migration for old checkout records
// Show guest name in food history without join
// Add checkout → food populate
// Just tell me 👍