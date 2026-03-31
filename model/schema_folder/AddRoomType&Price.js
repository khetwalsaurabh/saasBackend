const mongoose = require("mongoose");

const RoomTypeSchema = new mongoose.Schema({
  typeName: {
    type: String,
    required: true,
    trim: true
  },

  roomPrice: {
    type: Number,
    required: true,
    min: 1
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CreateAccount",
    required: true
  }
  
});

// ✅ Add this one line — unique per hotel, not globally
RoomTypeSchema.index({ typeName: 1, hotelId: 1 }, { unique: true });

module.exports = mongoose.model("RoomType", RoomTypeSchema);
