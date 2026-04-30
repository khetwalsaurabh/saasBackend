const Subscription = require("../model/schema_folder/SubscriptionSchema");

const checkSubscription = async (req, res, next) => {

  try {

    const { hotelId } = req.user;

    const subscription = await Subscription.findOne({
      hotelId,
      status: "active"
    });

    if (!subscription) {

      return res.status(403).json({

        message: "No active plan. Please subscribe."

      });

    }

    // check expiry
    const today = new Date();

    if (today > subscription.endDate) {

      subscription.status = "expired";
      await subscription.save();
      return res.status(403).json({
        message: "Plan expired. Please renew."
        
      });

    }

    req.subscription = subscription;

    next();

  } catch (error) {

    console.log(error);
    res.status(500).json({
      
      // message: "error checking plan"
      // message : "Room limit reached. Please upgrade plan."
      message : "Error checking subscription"

    });

  }

};

module.exports = checkSubscription;