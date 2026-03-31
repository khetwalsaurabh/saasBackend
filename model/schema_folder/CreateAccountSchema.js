const mongoose = require('mongoose');


const CreateAccountSchema = mongoose.Schema({
    hotelName: {
        type: String,
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        required: true
    },

    otp: String,
    
    isVerified: {
        type: Boolean,
        default: false
    },

     otpExpire: Date,

})

module.exports = mongoose.model("CreateAccount", CreateAccountSchema)