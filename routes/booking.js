const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing,validateBody,validateBooking } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");
const { bookingSchema } = require("../schema.js");

router
  .route("/:id/bookings")
  .post(
    isLoggedIn,
    validateBody(bookingSchema),
    validateBooking,
    wrapAsync(bookingController.newBooking)
  );

module.exports = router;