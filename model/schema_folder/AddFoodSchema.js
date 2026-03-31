const mongoose = require('mongoose');


const AddFoodSchema = mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
    },
    roomNumber: {
        type: Number,
        required: true
    },
    serialNumber: {
        type: Number,
        required: true
    },
    foodItem: {
        type: String,
        required: true
    },
    foodRate: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    foodAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "unbilled",
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreateAccount",
        required: true
    }
})

module.exports = mongoose.model("Food", AddFoodSchema);


// https://chatgpt.com/s/t_693ef7967c78819188c35d067558212e


// NEXT LOGICAL STEP (OPTIONAL, BUT RECOMMENDED)

// After checkout success:

// await Food.updateMany(
//   { bookingId, status: "unbilled" },
//   { $set: { status: "billed" } }
// );