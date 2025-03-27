const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {model} = mongoose;

const reviewSchema = new Schema({
    comment: String,
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    createAt: {
        type: Date,
        default: Date.now(),
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = model("Review", reviewSchema);