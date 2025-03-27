const Booking = require("../models/booking");
const axios = require("axios");
const Listing = require("../models/listing");

// new booking
module.exports.newBooking = async(req,res)=>{
    let { id } = req.params;
    const data = req.body.booking;
    // console.log(id);
    // console.log(req.body);
    let checkin = new Date(data.checkin);
    let checkout = new Date(data.checkout);
    let count = (checkout - checkin) / (1000 * 60 * 60 * 24);
    const newBooking = new Booking(data);
    // find the owner of the listing by id
    const listing = await Listing.findById(id);
    newBooking.listingOwner = listing.owner;
    newBooking.owner = req.user._id;
    newBooking.listing = id;
    newBooking.save();
    req.flash("success", "Thank You! Visit Our Website Again.");
    // console.log(data.checkin+" "+id+" "+count);
    // res.send(data);
    res.redirect(`/bookings`);
}

// show booking
module.exports.showBookings = async(req,res)=>{
    // find the bookings of the current user from the database
    const curr = req.user._id;
    const bookings = await Booking.find({ owner: curr }).populate({
      path: "listing",
      populate: { path: "owner" },
    });
    const adminBooking = await Booking.find().populate({
      path: "listing",
      populate: { path: "owner" },
    });
    // write the condition 
    // console.log(res.locals.currUser._id);
    // console.log(adminBooking);
    res.render("./bookings/bookingShow.ejs", { bookings, adminBooking });
}