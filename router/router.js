const express = require("express");
const { Addbooking, Getbooking, EditBooking, getBookingForEditById, deleteBooking, CheckoutPostapi, Finalcheckoutgetapi, AddTariffApi, GetTariffApi, AddRoomApi, GetRoomApi, UpdateRoomStatus, EditRoom, addRoomTypeorPrice, EditTariffApi, DeleteTariffApi, EditRoomTypeOrPrice, DeleteRoomTypeOrPrice, GetTariffByIDforEdit, GetforEditRoomTypeOrPrice, DeleteRoomApi, AddFoodApi, GetFoodApi, GetFoodByBooking, AddLundaryApi, GetLaundary, GetLaundaryByBooking, GetroomTypeorpriceWithoutPage, GetBillingSummary, AddInvoicePostAPI, GetInvoiceSetting, CreateAccountApi, LoginUser, CreateOrUpdateSubscription, GetHotelInfo, GetSubscribtion, EditInvoice, VerifyOtpApi, SendOtpForgetPassword, VerifyOtpForgetPassword, ResetPassword, CreateOrder, verifyPayment } = require("../controller/Api.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const checkSubscription = require("../middleware/checkSubscription.js");
const upload = require("../Multer/upload.js");

const router = express.Router();

router.post("/addbooking", authMiddleware, Addbooking);
router.get("/getbooking",authMiddleware, Getbooking);
router.put("/editbooking/:id", authMiddleware,EditBooking);
router.get('/getbookingforedit/:id',authMiddleware, getBookingForEditById);
router.delete('/deletebooking/:id',authMiddleware, deleteBooking);

// Checkout
router.post('/postcheckout',authMiddleware, CheckoutPostapi);
router.get('/finalcheckout',authMiddleware, Finalcheckoutgetapi);

// Tariff
router.post('/addtariff',authMiddleware, AddTariffApi);
router.get('/gettariff',authMiddleware, GetTariffApi);
router.put('/editTariff/:id',authMiddleware, EditTariffApi);
router.get('/GetTariffByIDforEdit/:id',authMiddleware, GetTariffByIDforEdit)
router.delete('/deletetariff/:id',authMiddleware, DeleteTariffApi);


// Room
router.post('/addroom',authMiddleware, checkSubscription , AddRoomApi);
router.get('/getroom',authMiddleware, GetRoomApi);
router.put("/room/status/:id",authMiddleware, UpdateRoomStatus);
router.put("/editroom/:id",authMiddleware, EditRoom);
router.delete('/DeleteRoomapi/:id',authMiddleware, DeleteRoomApi)
// room type & price
router.post("/addRoomTypeorPrice", authMiddleware , addRoomTypeorPrice);
router.put('/editroomtypeorprice/:id',authMiddleware,EditRoomTypeOrPrice);
router.get('/GetRoomTypeOrPrice/:id',authMiddleware, GetforEditRoomTypeOrPrice);
router.delete('/DeleteRoomTypeOrPrice/:id',authMiddleware, DeleteRoomTypeOrPrice);
router.get('/GetroomTypeorpriceWithoutPage',authMiddleware, GetroomTypeorpriceWithoutPage);
// food billing apis
router.post('/addfood',authMiddleware, AddFoodApi);
router.get('/getfood',authMiddleware, GetFoodApi);
router.get("/food-by-booking/:bookingId",authMiddleware, GetFoodByBooking);
//Add laundary api
router.post('/addlaundary',authMiddleware, AddLundaryApi);
router.get('/getLaundary',authMiddleware, GetLaundary);
router.get('/getLaundaryByBooking/:bookingId',authMiddleware, GetLaundaryByBooking);

// router.get("/billing/:bookingId/summary", GetBillingSummary)
// In your routes file
router.get("/billing-summary/:checkoutId",authMiddleware, GetBillingSummary); // 👈 Use :checkoutId

// Settings
router.post("/addInvoice",authMiddleware, upload.single("logo"), AddInvoicePostAPI);
router.get("/invoice-setting",authMiddleware, GetInvoiceSetting);
router.put("/edit-invoice", authMiddleware, upload.single("logo"), EditInvoice);

// create account
router.post("/createAccount", CreateAccountApi);
router.post("/LoginUser", LoginUser)
router.post("/verify-otp", VerifyOtpApi)
// send otp
router.post( "/send-otp-forgot-password", SendOtpForgetPassword);
// verify otp
router.post( "/verify-otp-forgot-password", VerifyOtpForgetPassword);
// reset password
router.post( "/reset-password", ResetPassword );


// subscribtion
// router.post( "/subscription", CreateOrUpdateSubscription );
router.post("/subscription/create", CreateOrUpdateSubscription);
router.post("/subscription/upgrade", authMiddleware, CreateOrUpdateSubscription);


// get register info
router.get("/GetHotelInfo" ,authMiddleware, GetHotelInfo);
router.get("/getSubscribtion", authMiddleware, GetSubscribtion);

// payment gateway
router.post("/create-order", CreateOrder);
router.post("/verify-payment", verifyPayment);



module.exports = router;
