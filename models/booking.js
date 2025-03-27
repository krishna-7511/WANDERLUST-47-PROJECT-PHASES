const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  govtId: {
    type: String,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  checkin: {
    type: Date,
    required: true,
  },
  checkout: {
    type: Date,
    required: true,
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  listingOwner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    required: true,
  },
  razorpaySignature: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

// bookingSchema.post("findOneAndDelete", async (listing) => {
//   if (listing) {
//     await Review.deleteMany({ _id: { $in: listing.reviews } });
//   }
// });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;