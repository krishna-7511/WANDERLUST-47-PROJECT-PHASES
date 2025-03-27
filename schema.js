const Joi = require("joi");
const moment = require("moment");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .valid(
        "Rooms",
        "Iconic Cities",
        "Mountains",
        "Castles",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctic Domes",
        "Boats"
      )
      .required(),
    city: Joi.string().required(),
    price: Joi.number().required().min(0),
    country: Joi.string().required(),
    location: Joi.string().required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});

// Define a dynamic function to get the current date
const getCurrentDate = () => {
  return moment().startOf("day").toDate(); // Start of the current day
};

module.exports.bookingSchema = Joi.object({
  booking: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    contact: Joi.number().required(),
    govtId: Joi.string().required(),
    guests: Joi.number().required().min(1),
    checkin: Joi.date().min(getCurrentDate()).required(), // Set minimum date to current date
    checkout: Joi.date().required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
    amount: Joi.number().required().min(0),
  }).required(),
});