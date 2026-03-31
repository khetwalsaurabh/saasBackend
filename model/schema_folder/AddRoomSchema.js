const mongoose = require('mongoose');

// const AddRoomSchema = mongoose.Schema({
//     roomNumber: {
//         type: String,
//         required: true,
     
//     },
//     roomType: {
//         type: String,
//         required: true
//     },
//     roomStatus: {
//         type: String,
//         required: true
//     },
//     roomPrice: {
//         type: Number,
//         required: true
//     },

//     hotelId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "CreateAccount",
//         required: true
//     }
// });

// module.exports = mongoose.model("Room", AddRoomSchema);


const AddRoomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true
  },

  roomType: {
    type: String,
    required: true
  },

  roomPrice: {
    type: Number,
    required: true
  },

  roomStatus: {
    type: String,
    default: "available"
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CreateAccount",
    required: true
  }

}, { timestamps: true });


// ⭐ IMPORTANT
AddRoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("AddRoom", AddRoomSchema);