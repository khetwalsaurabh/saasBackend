const mongoose = require('mongoose');

const AddTariffSchema = mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    companyTariff: {
        type: Number,
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreateAccount",
        required: true
    }
});

const tariff = mongoose.model("Tariff", AddTariffSchema);
module.exports = tariff;