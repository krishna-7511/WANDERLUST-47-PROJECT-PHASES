const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema, bookingSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// for listing
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// for review
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// for booking
module.exports.validateBooking = (req, res, next) => {
  let { error } = bookingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.capitalizeCity = async (req, res, next) => {
  if (req.query.search) {
    req.query.search = capitalizeWords(req.query.search);
  }
  next();
};

module.exports.capitalizeCategory = async (req, res, next) => {
  if (req.query.name) {
    req.query.name = capitalizeWords(req.query.name);
  }
  next();
};

// Middleware to capitalize the first letter of each word in a string
function capitalizeWords(input) {
  return input.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

// Middleware function to validate request body using Joi schema
module.exports.validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // Loop through each validation error
      error.details.forEach((error) => {
        // Check if it's a date.min error for 'checkin' field
        if (error.type === "date.min" && error.context.key === "checkin") {
          // Handle the specific error here
          // For example, set a custom error message
          req.flash(
            "error",
            "Check-in date must be from the present to the future"
          );
        } else {
          // For other errors, set the default error message
          req.flash("error", error.message.replace(/['"]+/g, "")); // Remove quotes from error message
        }
      });

      // Redirect back to the previous page
      return res.redirect("back");
    }

    // If no validation errors, proceed with the next middleware
    next();
  };
};