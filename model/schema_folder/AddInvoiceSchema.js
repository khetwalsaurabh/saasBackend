const mongoose = require("mongoose");

const AddInvoiceSchema = new mongoose.Schema({
    hotelName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    gstin: {
        type: String
    },
    hsn: {
        type: String
    },
    place: {
        type: String
    },
    logo: {
        type: String
    },
    invoicePrefix: {
        type: String
    },
    // termsAndconditions:{
    //     type: String
    // },
    // logo: {
    //     type: String
    // },
    
    termsAndconditions_Checkouttime: {
        type: String
    },
    termsAndconditions_lineOne: {
        type: String
    },
    termsAndconditions_lineTwo: {
        type: String
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CreateAccount",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("InvoiceSetting", AddInvoiceSchema);




// Good question 👍 This is a very important concept in MongoDB + Mongoose called referencing (relation between collections).

// Let’s break it simply.

// 1️⃣ type: mongoose.Schema.Types.ObjectId

// This means the field will store MongoDB document ID.

// Example MongoDB ID:

// 65f4a7c2b6e4a7f92d1b1234

// So this field will store ID of another document.

// Example:

// hotelId: {
//   type: mongoose.Schema.Types.ObjectId
// }

// Means:

// hotelId = "65f4a7c2b6e4a7f92d1b1234"

// That ID belongs to a Hotel document.

// 2️⃣ ref: "Hotel"

// ref tells Mongoose:

// 👉 This ObjectId belongs to Hotel collection.

// Example:

// hotelId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "Hotel"
// }

// Meaning:

// InvoiceSetting → belongs to → Hotel
// 3️⃣ Real Example
// Hotel Collection
// hotels
// {
//   "_id": "65f4a7c2b6e4a7f92d1b1234",
//   "hotelName": "Star City Guest House",
//   "address": "Faridabad"
// }
// InvoiceSetting Collection
// invoiceSettings
// {
//   "_id": "77g8c3d9e4f7a2b98c3e4567",
//   "hotelId": "65f4a7c2b6e4a7f92d1b1234",
//   "gstin": "06ANHPB5494M1ZN",
//   "hsn": "996311"
// }

// Here:

// hotelId → points to Hotel document