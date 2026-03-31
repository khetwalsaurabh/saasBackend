const AddbookingSchema = require("../model/schema_folder/AddbookingSchema");
const CheckoutScheama = require('../model/schema_folder/CheckoutScheama');
const AddTariff = require('../model/schema_folder/AddTariffSchema');
const AddRoomSchema = require('../model/schema_folder/AddRoomSchema');
const RoomTypeSchema = require("../model/schema_folder/AddRoomType&Price");
const AddFoodSchema = require('../model/schema_folder/AddFoodSchema')
const AddLaundrySchema = require('../model/schema_folder/AddLaundrySchema');
const AddInvoiceSchema = require("../model/schema_folder/AddInvoiceSchema");
const bcrypt = require('bcrypt');
const jwtToken = require("jsonwebtoken");
const CreateAccountSchema = require("../model/schema_folder/CreateAccountSchema");
const Subscription = require("../model/schema_folder/SubscriptionSchema");
const SubscriptionSchema = require("../model/schema_folder/SubscriptionSchema");
const sendOTPEmail = require("../nodemail/mail");
const razorpay = require("../Razorpay/razorpay");
const crypto = require("crypto");


const CreateAccountApi = async (req, res) => {
  try {

    const { hotelName, ownerName, email, phone, password } = req.body;

    const existingUser = await CreateAccountSchema.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered"
      });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new CreateAccountSchema({
      hotelName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      otp: otp,
      isVerified: false
    });

    await user.save();

    // send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }
};


const VerifyOtpApi = async (req, res) => {

  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP required"
      });
    }

    const user = await CreateAccountSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        error: "OTP expired"
      });
    }

    if (user.otp != otp) {
      return res.status(400).json({
        error: "Invalid OTP"
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      hotelId: user._id
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error"
    });

  }

};


const LoginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const errorMsg = "Auth failed: email or password is wrong";

    const user = await CreateAccountSchema.findOne({ email });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: errorMsg
      });
    }

    const isPassEqual = await bcrypt.compare(password, user.password);

    if (!isPassEqual) {
      return res.status(403).json({
        success: false,
        message: errorMsg
      });
    }

    const token = jwtToken.sign(
      {
        email: user.email,
        hotelId: user._id,
        username: user.ownerName
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login Success",
      jwtToken: token,
      email: user.email,
      hotelId: user._id,
      username: user.ownerName
    });

  } catch (err) {

    console.error("Login error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};


const SendOtpForgetPassword = async (req, res) => {

  const { email } = req.body;

  const user = await CreateAccountSchema.findOne({ email });

  if (!user) {
    return res.json({
      success: false,
      message: "Email not registered"
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  user.otp = otp;

  // we will also save expiry time
  user.otpExpire = Date.now() + 5 * 60 * 1000;

  await user.save();

  await sendOTPEmail(email, otp);

  res.json({
    success: true,
    message: "OTP sent to email",
    email: email
  });

}


const VerifyOtpForgetPassword = async (req, res) => {

  try {

    const { email, otp } = req.body;
    console.log("req.body", req.body);

    const user = await CreateAccountSchema.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (user.otp != otp) {
      return res.json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired"
      });
    }
    res.json({
      success: true,
      message: "OTP verified"
    });

  } catch (err) {
    console.log(err);
  }


};


const ResetPassword = async (req, res) => {

  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await CreateAccountSchema.updateOne(
    { email },
    {
      password: hash,
      otp: null,
      otpExpire: null
    }

  );

  res.json({
    success: true,
    message: "Password updated successfully"
  });

};



const Addbooking = async (req, res) => {
  try {
    const booking = new AddbookingSchema({
      ...req.body,
      hotelId: req.user.hotelId
    });
    await booking.save();

    // UPDATE ROOM STATUS TO OCCUPIED
    // await AddRoomSchema.updateOne(
    //   { roomNumber: req.body.roomNumber },
    //   { $set: { roomStatus: "occupied" } }
    // );

    await AddRoomSchema.findOneAndUpdate(
      {
        roomNumber: Number(req.body.roomNumber),
        hotelId: req.user.hotelId
      },
      { roomStatus: "occupied" },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Arrival Booking created successfully", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: err });
  }
};


const GetBillingSummary = async (req, res) => {
  try {
    const { checkoutId } = req.params;
    const { hotelId } = req.user;

    // ===============================
    // Fetch checkout
    // ===============================

    // ****
    // const checkout = await CheckoutScheama.findById(checkoutId);

    const checkout = await CheckoutScheama.findOne({
      _id: checkoutId,
      hotelId: hotelId
    });

    // ****

    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: "Checkout not found",
      });
    }

    // ===============================
    // Fetch booking
    // ===============================
    const bookingId = checkout.bookingId;

    // ******
    // const booking = await AddbookingSchema.findById(bookingId);

    const booking = await AddbookingSchema.findOne({
      _id: bookingId,
      hotelId: hotelId
    });

    // *******

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ===============================
    // Lodging
    // ===============================
    const days = Number(checkout.numberOfdays || booking.numberOfdays || 1);
    const lodging = Number(checkout.Lodging || booking.Lodging || 0);
    const lodgingTotal = lodging * days;

    // ===============================
    // Food (billed only)
    // ===============================

    // ***********
    // const foodItems = await AddFoodSchema.find({
    //   bookingId,
    //   status: "billed",
    // });

    const foodItems = await AddFoodSchema.find({
      bookingId,
      hotelId: hotelId,
      status: "billed"
    });
    // ***********

    const foodTotal = foodItems.reduce(
      (sum, item) => sum + Number(item.foodAmount || 0),
      0
    );

    // ===============================
    // Laundry (billed only)
    // ===============================
    let laundryItems = [];
    let laundryTotal = 0;

    // *************
    if (checkout.laundrySlip === true) {

      // laundryItems = await AddLaundrySchema.find({
      //   bookingId,
      //   status: "billed",
      // });

      laundryItems = await AddLaundrySchema.find({
        bookingId,
        hotelId: hotelId,
        status: "billed"
      });

      laundryTotal = laundryItems.reduce(
        (sum, item) => sum + Number(item.laundryAmount || 0),
        0
      );
    }
    // *************

    // ===============================
    // Extra charges
    // ===============================
    const extraPerson = Number(checkout.extraPerson || 0);
    const telephoneCalls = Number(checkout.telephoneCalls || 0);

    // ===============================
    // Totals
    // ===============================
    const subtotal =
      lodgingTotal + foodTotal + laundryTotal + extraPerson + telephoneCalls;

    const cgst = +(subtotal * 0.025).toFixed(2);
    const sgst = +(subtotal * 0.025).toFixed(2);
    const totalWithTax = subtotal + cgst + sgst;

    const advance = Number(checkout.advancepayment || booking.advancepayment || 0);
    const finalPayable = totalWithTax - advance;

    const companyTariff = Number(checkout.companyTariff || 0);

    // ===============================
    // RESPONSE
    // ===============================
    return res.status(200).json({
      success: true,
      checkout,
      booking,
      summary: {
        lodging: { days, lodging, lodgingTotal },
        food: { items: foodItems, total: foodTotal },
        laundry: {
          items: laundryItems,
          total: laundryTotal,
        },
        extraPerson,
        telephoneCalls,
        subtotal,
        cgst,
        sgst,
        totalWithTax,
        advance,
        finalPayable,
        companyTariff,
      },
    });

  } catch (error) {
    console.error("Billing Summary Err:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const Getbooking = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "checked_in";

    const skip = (page - 1) * limit;

    // Base filter
    let filter = { hotelId, status };

    // Apply search only if search exists
    if (search) {
      filter.$or = [
        { guestName: { $regex: search, $options: "i" } },
        { roomNumber: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { roomType: { $regex: search, $options: "i" } },
      ];
    }

    const booking = await AddbookingSchema.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AddbookingSchema.countDocuments(filter);

    res.status(200).json({
      data: booking,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching bookings",
      error: err.message,
    });
  }
};



const EditBooking = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const booking = await AddbookingSchema.findOneAndUpdate(
      { _id: req.params.id, hotelId: hotelId },
      req.body,
      { new: true }
    );

    if (booking) {
      console.log("Edit Booking data success");
      res.status(200).json(booking);
    } else {
      res.status(404).send("Booking not found or unauthorized");
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};


const getBookingForEditById = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const booking = await AddbookingSchema.findOne({
      _id: req.params.id,
      hotelId
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or unauthorized"
      });
    }

    res.status(200).json(booking);

  } catch (err) {

    res.status(500).json({
      message: "Internal server error"
    });

  }
};

// const deleteBooking = async (req, res) => {
//   try {

//     const { id } = req.params
//     await AddbookingSchema.findByIdAndDelete(id);

//     // 2️⃣ Update room status
//     await AddRoomSchema.updateOne(
//       { roomNumber },
//       { $set: { roomStatus: "available" } }
//     );

//     res.send({ message: "Booking deleted" })

//   } catch (err) {
//     console.log(err)
//     res.status(500).send('Internal error');

//   }
// }

const deleteBooking = async (req, res) => {
  try {

    const { id } = req.params;
    const { hotelId } = req.user;

    const booking = await AddbookingSchema.findOne({
      _id: id,
      hotelId
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    if (booking.status === "checked_out") {
      return res.status(400).json({
        message: "Cannot delete booking after checkout"
      });
    }

    await AddFoodSchema.deleteMany({
      bookingId: id,
      hotelId,
      status: "unbilled"
    });

    await AddLaundrySchema.deleteMany({
      bookingId: id,
      hotelId,
      status: "unbilled"
    });

    // await AddRoomSchema.updateOne(
    //   { roomNumber: booking.roomNumber, hotelId },
    //   { $set: { roomStatus: "available" } }
    // );

    await AddRoomSchema.findOneAndUpdate(
      {
        roomNumber: Number(booking.roomNumber),
        hotelId
      },
      { roomStatus: "available" }
    );

    await AddbookingSchema.deleteOne({
      _id: id,
      hotelId
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully"
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({
      message: "Internal server error"
    });

  }
};


const CheckoutPostapi = async (req, res) => {
  try {

    const { bookingId, roomNumber } = req.body;
    const { hotelId } = req.user;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const checkout = new CheckoutScheama({
      ...req.body,
      hotelId
    });

    await checkout.save();

    await AddRoomSchema.updateOne(
      { roomNumber, hotelId },
      { $set: { roomStatus: "available" } }
    );

    await AddFoodSchema.updateMany(
      { bookingId, hotelId },
      { $set: { status: "billed" } }
    );

    await AddLaundrySchema.updateMany(
      { bookingId, hotelId },
      { $set: { status: "billed" } }
    );

    await AddbookingSchema.updateOne(
      { _id: bookingId, hotelId },
      {
        $set: {
          status: "checked_out",
          checkoutAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: "Checkout successful",
      checkout,
      checkoutId: checkout._id
    });

  } catch (err) {

    console.error("Checkout error:", err);

    res.status(400).json({
      success: false,
      message: err.message
    });

  }
};


// const Finalcheckoutgetapi = async (req, res) => {
//   try {
//     const checkout = await CheckoutScheama.find();
//     res.status(200).json({
//       checkoutList: checkout
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching booking", error: err });
//   }
// };

const Finalcheckoutgetapi = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let searchFilter = {};

    if (search) {
      searchFilter = {
        $or: [
          { guestName: { $regex: search, $options: "i" } },
          { roomNumber: { $regex: search, $options: "i" } },
          { roomType: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { comingFrom: { $regex: search, $options: "i" } },
          { paymentBy: { $regex: search, $options: "i" } },
          { companyName: { $regex: search, $options: "i" } },
          { paymentmode: { $regex: search, $options: "i" } },

          !isNaN(search) ? { companyTariff: Number(search) } : null,
          !isNaN(search) ? { adults: Number(search) } : null,
          !isNaN(search) ? { Lodging: Number(search) } : null,
          !isNaN(search) ? { numberOfdays: Number(search) } : null,
          !isNaN(search) ? { food: Number(search) } : null,
          !isNaN(search) ? { Laundry: Number(search) } : null,
          !isNaN(search) ? { extraPerson: Number(search) } : null,
          !isNaN(search) ? { telephoneCalls: Number(search) } : null,
          !isNaN(search) ? { advancepayment: Number(search) } : null,
        ].filter(Boolean),
      };


      // searchFilter = {
      //   $or: [
      //     { guestName: { $regex: search, $options: "i" } },
      //     { roomType: { $regex: search, $options: "i" } },
      //     { mobile: { $regex: search, $options: "i" } },
      //     { email: { $regex: search, $options: "i" } },
      //     { address: { $regex: search, $options: "i" } },
      //     { comingFrom: { $regex: search, $options: "i" } },
      //     { paymentBy: { $regex: search, $options: "i" } },
      //     { companyName: { $regex: search, $options: "i" } },
      //     { paymentmode: { $regex: search, $options: "i" } },

      //     !isNaN(search) ? { roomNumber: Number(search) } : null,
      //     !isNaN(search) ? { companyTariff: Number(search) } : null,
      //     !isNaN(search) ? { adults: Number(search) } : null,
      //     !isNaN(search) ? { Lodging: Number(search) } : null,
      //     !isNaN(search) ? { numberOfdays: Number(search) } : null,
      //     !isNaN(search) ? { food: Number(search) } : null,
      //     !isNaN(search) ? { Laundry: Number(search) } : null,
      //     !isNaN(search) ? { extraPerson: Number(search) } : null,
      //     !isNaN(search) ? { telephoneCalls: Number(search) } : null,
      //     !isNaN(search) ? { advancepayment: Number(search) } : null,
      //   ].filter(Boolean),
      // };


    }

    const finalFilter = {
      hotelId,
      ...searchFilter
    };

    const checkoutData = await CheckoutScheama.find(finalFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await CheckoutScheama.countDocuments(finalFilter);

    res.status(200).json({
      checkoutList: checkoutData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {

    res.status(500).json({
      message: "Error fetching checkout data",
      error: err.message,
    });

  }
};



// Tariff api
const AddTariffApi = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const Tariff = new AddTariff({
      ...req.body,
      hotelId
    });

    await Tariff.save();

    res.status(200).json({
      success: true,
      message: "Data saved successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal error"
    });

  }
};



const GetTariffApi = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let searchFilter = {};

    if (search) {
      searchFilter = {
        $or: [
          { companyName: { $regex: search, $options: "i" } },
          !isNaN(search) ? { companyTariff: Number(search) } : null,
        ].filter(Boolean)
      };
    }

    const finalFilter = {
      hotelId,
      ...searchFilter
    };

    const tarrif = await AddTariff.find(finalFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AddTariff.countDocuments(finalFilter);

    res.status(200).json({
      data: tarrif,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};



const EditTariffApi = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const tariff = await AddTariff.findOneAndUpdate(
      { _id: req.params.id, hotelId },
      req.body,
      { new: true }
    );

    if (!tariff) {
      return res.status(404).json({
        message: "Tariff not found or unauthorized"
      });
    }

    res.status(200).json(tariff);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};


const GetTariffByIDforEdit = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const tariff = await AddTariff.findOne({
      _id: req.params.id,
      hotelId
    });

    if (!tariff) {
      return res.status(404).json({
        message: "Tariff not found or unauthorized"
      });
    }

    res.status(200).json(tariff);

  } catch (err) {

    res.status(500).json({
      message: "Internal server error"
    });

  }
};


const DeleteTariffApi = async (req, res) => {
  try {

    const { id } = req.params;
    const { hotelId } = req.user;

    const result = await AddTariff.deleteOne({
      _id: id,
      hotelId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Tariff not found or unauthorized"
      });
    }

    res.status(200).json({
      message: "Tariff deleted successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal error"
    });

  }
};

// Room api
// const AddRoomApi = async (req, res) => {
//   try {

//     const { hotelId } = req.user;

//     const room = new AddRoomSchema({
//       ...req.body,
//       hotelId,
//       roomStatus: "available"
//     });

//     await room.save();

//     res.status(200).json(room);

//   } catch (err) {

//     console.log(err);

//     if (err.code === 11000) {
//       return res.status(400).json({
//         message: "Room number already exists"
//       });
//     }

//     res.status(500).json({
//       message: "Internal server error"
//     });

//   }
// };

const AddRoomApi = async (req, res) => {
  try {

    const { hotelId } = req.user;
    // get active subscription
    const subscription = await SubscriptionSchema.findOne({
      hotelId,
      status: "active"
    });

    if (!subscription) {
      return res.status(403).json({
        message: "No active plan. Please subscribe."
      });
    }

    // check plan expiry
    const today = new Date();
    if (today > subscription.endDate) {
      subscription.status = "expired";
      await subscription.save();
      return res.status(403).json({
        message: "Plan expired. Please renew."
      });
    }

    // count existing rooms
    const roomCount = await AddRoomSchema.countDocuments({
      hotelId
    });

    if (
      subscription.roomLimit !== -1 &&
      roomCount >= subscription.roomLimit
    ) {
      return res.status(403).json({
        message: "Room limit reached. Please upgrade plan."
      });
    }

    // create room
    const room = new AddRoomSchema({
      ...req.body,
      hotelId,
      roomStatus: "available"
    });
    await room.save();
    res.status(200).json(room);
  }

  catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Room number already exists"
      });
    }
    res.status(500).json({
      message: "Internal server error"
    });
  }

};



const GetRoomApi = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let searchFilter = {};

    // if (search) {
    //   searchFilter = {
    //     $or: [
    //       { roomNumber: { $regex: search, $options: "i" } },
    //       { roomType: { $regex: search, $options: "i" } },
    //       { roomStatus: { $regex: search, $options: "i" } },
    //       !isNaN(search) ? { roomPrice: Number(search) } : null
    //     ].filter(Boolean)
    //   };
    // }

    if (search) {
      const isNumber = !isNaN(search);
      searchFilter = {
        $or: [
          { roomType: { $regex: search, $options: "i" } },
          { roomStatus: { $regex: search, $options: "i" } },
          ...(isNumber
            ? [
              { roomNumber: Number(search) },
              { roomPrice: Number(search) }
            ]
            : []
          )
        ]
      };

    }

    const finalFilter = {
      hotelId,
      ...searchFilter
    };

    const roomData = await AddRoomSchema.find(finalFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AddRoomSchema.countDocuments(finalFilter);

    res.status(200).json({
      data: roomData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};


const UpdateRoomStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { hotelId } = req.user;

    const status = req.body.status || req.body.roomStatus;

    const room = await AddRoomSchema.findOne({
      _id: id,
      hotelId
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found or unauthorized"
      });
    }

    // 🚫 BLOCK maintenance for occupied rooms
    if (room.roomStatus === "occupied" && status === "maintenance") {
      return res.status(400).json({
        message: "Cannot move occupied room to maintenance."
      });
    }

    room.roomStatus = status;

    await room.save();

    res.status(200).json(room);

  } catch (err) {

    res.status(500).json({
      message: "Internal server error"
    });

  }
};


const EditRoom = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const updatedRoom = await AddRoomSchema.findOneAndUpdate(
      { _id: req.params.id, hotelId },
      req.body,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({
        message: "Room not found or unauthorized"
      });
    }

    res.status(200).json(updatedRoom);

  } catch (err) {

    res.status(500).json({
      message: "Internal server error"
    });

  }
};


const DeleteRoomApi = async (req, res) => {
  try {

    const { id } = req.params;
    const { hotelId } = req.user;

    const result = await AddRoomSchema.deleteOne({
      _id: id,
      hotelId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Room not found or unauthorized"
      });
    }

    res.status(200).json({
      message: "Room deleted successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal error"
    });

  }
};

// room(Type&price) api
// const addRoomTypeorPrice = async (req, res) => {
//   try {

//      console.log("req.user:", req.user);

//     const { hotelId } = req.user;

//     const type = new RoomTypeSchema({
//       ...req.body,
//       hotelId
//     });

//     await type.save();

//     // res.status(201).json(type);

//      res.status(201).json({
//       success: true,
//       message: "Room type added successfully.",
//       data: type
//     });

//   } catch (err) {

//     // res.status(500).json({
//     //   message: "Error adding type"
//     // });

//     console.error("addRoomTypeorPrice error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error adding room type."
//     });

//   }
// };


const addRoomTypeorPrice = async (req, res) => {
  try {
    const { hotelId } = req.user;

    const type = new RoomTypeSchema({
      ...req.body,
      hotelId
    });

    await type.save();

    res.status(201).json({
      success: true,
      message: "Room type added successfully.",
      data: type
    });

  } catch (err) {

    // ✅ Handle duplicate key error cleanly
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyValue)[0];
      const duplicatedValue = err.keyValue[duplicatedField];

      return res.status(409).json({
        success: false,
        message: `"${duplicatedValue}" already exists. Please use a different room type name.`
      });
    }

    console.error("addRoomTypeorPrice error:", err);
    res.status(500).json({
      success: false,
      message: "Error adding room type."
    });
  }
};



const GetroomTypeorpriceWithoutPage = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const get = await RoomTypeSchema.find({ hotelId });

    res.status(200).json(get);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};


const EditRoomTypeOrPrice = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const room = await RoomTypeSchema.findOneAndUpdate(
      { _id: req.params.id, hotelId },
      req.body,
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        message: "Room type & price not found or unauthorized"
      });
    }

    res.status(200).json(room);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};

const GetforEditRoomTypeOrPrice = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const room = await RoomTypeSchema.findOne({
      _id: req.params.id,
      hotelId
    });

    if (!room) {
      return res.status(404).json({
        message: "Room type & price not found or unauthorized"
      });
    }

    res.status(200).json(room);

  } catch (err) {

    res.status(500).json({
      message: "Internal server error"
    });

  }
};

const DeleteRoomTypeOrPrice = async (req, res) => {
  try {

    const { id } = req.params;
    const { hotelId } = req.user;

    const result = await RoomTypeSchema.deleteOne({
      _id: id,
      hotelId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Room type & price not found or unauthorized"
      });
    }

    res.status(200).json({
      message: "Room type & price deleted successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Internal error"
    });

  }
};

// Food bill apis

const AddFoodApi = async (req, res) => {
  try {

    const { hotelId } = req.user;

    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Food items array is required",
      });
    }

    const foodDocs = req.body.map(item => {

      if (!item.bookingId) {
        throw new Error("bookingId is required for each food item");
      }

      return {
        ...item,
        hotelId,
        status: "unbilled"
      };

    });

    const savedFoods = await AddFoodSchema.insertMany(foodDocs);

    res.status(200).json({
      success: true,
      count: savedFoods.length,
      data: savedFoods,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message || "Internal error",
    });

  }
};


const GetFoodApi = async (req, res) => {
  try {

    const { hotelId } = req.user;
    const { status } = req.query;

    const filter = { hotelId };

    if (status) {
      filter.status = status;
    }

    const food = await AddFoodSchema
      .find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: food,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};


const GetFoodByBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { status } = req.query;
    const { hotelId } = req.user;

    const filter = { bookingId, hotelId };

    if (status) {
      filter.status = status;
    }

    const food = await AddFoodSchema
      .find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: food,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch food",
    });

  }
};


const AddLundaryApi = async (req, res) => {
  try {

    const { hotelId } = req.user;

    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Laundry items array is required",
      });
    }

    const laundryDocs = req.body.map(item => {

      if (!item.bookingId) {
        throw new Error("bookingId is required for each laundry item");
      }

      return {
        ...item,
        hotelId,
        status: "unbilled"
      };

    });

    const savedLaundry = await AddLaundrySchema.insertMany(laundryDocs);

    res.status(200).json({
      success: true,
      count: savedLaundry.length,
      data: savedLaundry,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message || "Internal error",
    });

  }
};

const GetLaundary = async (req, res) => {
  try {

    const { hotelId } = req.user;
    const { status } = req.query;

    const filter = { hotelId };

    if (status) {
      filter.status = status;
    }

    const laundry = await AddLaundrySchema
      .find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: laundry,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};


const GetLaundaryByBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { status } = req.query;
    const { hotelId } = req.user;

    const filter = { bookingId, hotelId };

    if (status) {
      filter.status = status;
    }

    const Laundary = await AddLaundrySchema
      .find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: Laundary,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch Laundary",
    });

  }
};


const AddInvoicePostAPI = async (req, res) => {
  try {

    const { hotelId } = req.user;
    const logo = req.file?.filename;
    // if (req.file) {
    //   invoiceData.logo = req.file.filename; // ✅ just the filename
    // }

    const invoice = new AddInvoiceSchema({
      ...req.body,
      hotelId,
      logo
    });

    await invoice.save();

    res.status(201).json(invoice);

  } catch (err) {

    res.status(500).json({
      message: "Error Adding Invoice"
    });

  }
};


const GetInvoiceSetting = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const setting = await AddInvoiceSchema.findOne({ hotelId });

    res.status(200).json({
      success: true,
      data: setting
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// GET HOTEL INFO
const GetHotelInfo = async (req, res) => {

  try {
    const { hotelId } = req.user;
    const hotel = await CreateAccountSchema.findById(hotelId);

    res.status(200).json({
      success: true,
      data: hotel
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const EditInvoice = async (req, res) => {
  try {
    const { hotelId } = req.user;

    // Pick only known fields to avoid overwriting with empty strings
    const {
      gstin,
      hsn,
      place,
      invoicePrefix,
      termsAndconditions_Checkouttime,
      termsAndconditions_lineOne,
      termsAndconditions_lineTwo,
    } = req.body;

    // Build update object — only include fields that were actually sent
    const updateData = {};

    if (gstin !== undefined) updateData.gstin = gstin;
    if (hsn !== undefined) updateData.hsn = hsn;
    if (place !== undefined) updateData.place = place;
    if (invoicePrefix !== undefined) updateData.invoicePrefix = invoicePrefix;
    if (termsAndconditions_Checkouttime !== undefined)
      updateData.termsAndconditions_Checkouttime = termsAndconditions_Checkouttime;
    if (termsAndconditions_lineOne !== undefined)
      updateData.termsAndconditions_lineOne = termsAndconditions_lineOne;
    if (termsAndconditions_lineTwo !== undefined)
      updateData.termsAndconditions_lineTwo = termsAndconditions_lineTwo;

    // Fix Windows backslash path issue — normalize to forward slashes
    if (req.file) {
      // updateData.logo = req.file.path.replace(/\\/g, "/");
      updateData.logo = req.file.filename;
    }

    const updatedInvoice = await AddInvoiceSchema.findOneAndUpdate(
      { hotelId },
      { $set: updateData },   // ← use $set so only provided fields are updated
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice settings not found for this hotel" });
    }

    res.status(200).json({
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });

  } catch (err) {
    console.error("EditInvoice error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const CreateOrUpdateSubscription = async (req, res) => {
  try {
    let hotelId;
    if (req.user) {
      // logged in user upgrading plan
      hotelId = req.user.hotelId;
    }
    else {
      // new user during signup
      hotelId = req.body.hotelId;
    }

    const { planName, price, roomLimit } = req.body;
    const startDate = new Date();
    const endDate = new Date();

    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await Subscription.findOneAndUpdate(
      { hotelId },   // find existing plan of this hotel
      {
        planName,
        price,
        roomLimit,
        startDate,
        endDate,
        status: "active"
      },
      {
        new: true,      // return updated data
        upsert: true    // create if not exists
      }
    );

    res.status(200).json({
      success: true,
      message: "Plan activated",
      data: subscription
    });

  }

  catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }

};



const GetSubscribtion = async (req, res) => {
  try {

    const { hotelId } = req.user;

    const subscribe = await Subscription.findOne({ hotelId, status: "active" });

    res.status(200).json(subscribe);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
}



const CreateOrder = async (req, res) => {

  try {

    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json(order);

  } catch (error) {

    res.status(500).json({
      error: "Order creation failed"
    });

  }

};



const verifyPayment = async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planName,
    price,
    roomLimit,
    hotelId
  } = req.body;

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {

    const startDate = new Date();

    const endDate = new Date();

    endDate.setDate(
      endDate.getDate() + 30
    );

    // save subscription
    // example
    /*
    await Subscription.create({
      hotelId,
      planName,
      price,
      roomLimit,
      paymentId: razorpay_payment_id,
      startDate,
      endDate
    })
    */

    res.json({
      success: true
    });

  } else {

    res.status(400).json({
      success: false
    });

  }

};






module.exports = {
  Addbooking, Getbooking, EditBooking, getBookingForEditById, deleteBooking, CheckoutPostapi, Finalcheckoutgetapi, AddTariffApi, GetTariffApi,
  AddRoomApi, GetRoomApi, UpdateRoomStatus, EditRoom, addRoomTypeorPrice, EditTariffApi, DeleteTariffApi, EditRoomTypeOrPrice, DeleteRoomTypeOrPrice, GetTariffByIDforEdit,
  GetforEditRoomTypeOrPrice, DeleteRoomApi, AddFoodApi, GetFoodApi, GetFoodByBooking, AddLundaryApi, GetLaundary, GetLaundaryByBooking, GetroomTypeorpriceWithoutPage, GetBillingSummary, AddInvoicePostAPI,
  GetInvoiceSetting, CreateAccountApi, LoginUser, CreateOrUpdateSubscription, GetHotelInfo, GetSubscribtion, EditInvoice, VerifyOtpApi, SendOtpForgetPassword, VerifyOtpForgetPassword, ResetPassword, CreateOrder,
  verifyPayment
};
