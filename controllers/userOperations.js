const User = require("../models/user");
const Listing = require("../models/listing");
const axios = require("axios");
const Razorpay = require("razorpay");
// const bodyparse = require("body-parser");
// app.use(bodyparse.json());

// Signup Page --> Render
module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

// SignUp
module.exports.signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome to Wanderlust! ${req.user.username}`);
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

// For Login
// Render Login
module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

// login
module.exports.logIn = async (req, res) => {
  req.flash("success", "Welcome to Wanderlust! You are logged in!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// logout
module.exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};

// for city search
module.exports.searchCity = async (req, res) => {
  const city = req.query.search;
  const allListing = await Listing.find({ city: city });
  // console.log(allListing.length);
  if (allListing.length == 0) {
    req.flash("error", "Nothing is available at this location.");
    res.redirect("/listings");
  }
  res.render("./listings/index.ejs", { allListing });
};

// for filters
module.exports.filterCategory = async (req, res) => {
  const allListing = await Listing.find({ category: req.query.name });
  // console.log(allListing);
  if (allListing.length == 0) {
    req.flash("error", `No ${req.query.name} are available.`);
    res.redirect("/listings");
  }
  res.render("./listings/index.ejs", { allListing });
};

// for direction to google map
module.exports.getDirection = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "There is a technical Error!");
    res.redirect("/bookings");
  }
  console.log(listing);
  const query = `${listing.country},${listing.location}`;
  const encodedQuery = encodeURIComponent(query);
  const BING_MAPS_API_KEY = process.env.MAP_API;
  const url = `http://dev.virtualearth.net/REST/v1/Locations?q=${encodedQuery}&key=${BING_MAPS_API_KEY}`;

  axios
    .get(url)
    .then((response) => {
      const data = response.data;
      if (data && data.resourceSets && data.resourceSets.length > 0) {
        const location = data.resourceSets[0].resources[0].point.coordinates;
        const latitude = location[0];
        const longitude = location[1];
        res.redirect(
          `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        );
        // console.log(latitude + "..." + longitude);
        // console.log(latitude + "..." + longitude);
      } else {
        res.send("No results found");
      }
    })
    .catch((error) => {
      res.send("Error fetching data");
      console.error("Error:", error);
    });
};

// razorpay error
module.exports.error = (req, res) => {
  req.flash("error", "Payment is failed! Kindly try again.");
  res.redirect("/listings");
};

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_API,
  key_secret: process.env.RAZORPAY_SECRETKEY,
});

// razorpay create order
module.exports.createOrder = async (req, res) => {
  // console.log(req.body.listingId);
  const listing = await Listing.findById(req.body.listingId);
  // console.log(listing);
  let options = {
    amount: listing.price * 1.18, // amount in the smallest currency unit
    currency: "INR",
    receipt: "rcp11",
  };
  instance.orders.create(options, function (err, order) {
    // console.log(order);
    res.json(order);
  });
};

// razorpay verify payment
module.exports.verifyPayment = (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto
    .createHmac("sha256", "Wok5mJv2F0pa5HKLeXZfUr9r")
    .update(body.toString())
    .digest("hex");
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  var response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
};