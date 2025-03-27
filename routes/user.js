const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {
  saveRedirectUrl,
  isLoggedIn,
  capitalizeCity,
  capitalizeCategory,
} = require("../middleware");
const userController = require("../controllers/userOperations");
const bookingController = require("../controllers/booking");

// router.route
// for signup
router
  .route("/signup")
  // render route
  .get(userController.renderSignup)
  // signup route
  .post(wrapAsync(userController.signUp));

// for login
router
  .route("/login")
  // router --> /login to render
  .get(userController.renderLogin)
  // router --> /login data check/authenticate
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.logIn
  );

// for logout
router.get("/logout", userController.logOut);

// for bookings
router
  .route("/bookings")
  .get(isLoggedIn, wrapAsync(bookingController.showBookings));

// for search city hotels/villa's
router
  .route("/search")
  .get(capitalizeCity, wrapAsync(userController.searchCity));

// for filter category
router
  .route("/filter")
  .get(capitalizeCategory, wrapAsync(userController.filterCategory));

// for getDirection
router
  .route("/map/:id")
  .get(isLoggedIn, wrapAsync(userController.getDirection));

// for error
router.route("/error").post(wrapAsync(bookingController.error));

// for payment
// router
//   .route("/create/orderId")
//   .post(wrapAsync(bookingController.createOrderId));

// for payment success
router
  .route("/api/payment/verify")
  .post(wrapAsync(bookingController.paymentSuccess));
  
module.exports = router;