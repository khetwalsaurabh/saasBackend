const mongoose = require("mongoose");


const SubscriptionSchema = new mongoose.Schema({

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  planName: String,

  price: Number,

  roomLimit: Number,

  startDate: Date,

  endDate: Date,

  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
  }

}, { timestamps: true });


module.exports = mongoose.model("Subscription", SubscriptionSchema);