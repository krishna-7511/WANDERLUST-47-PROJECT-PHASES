const Listing = require("../models/listing");
const axios = require("axios");

// Index Route
module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("./listings/index.ejs", { allListing });
};

// New Route
module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

// Show Route
module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  // console.log(listing);
  // console.log(listing.country + ".." + listing.location);
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exist!");
    res.redirect("/listings");
  }
  const query = `${listing.country},${listing.location}`;
  const encodedQuery = encodeURIComponent(query);
  const BING_MAPS_API_KEY = process.env.MAP_API;
  const RAZORPAY_API_KEY = process.env.RAZORPAY_API;
  const url = `http://dev.virtualearth.net/REST/v1/Locations?q=${encodedQuery}&key=${BING_MAPS_API_KEY}`;

  axios
    .get(url)
    .then((response) => {
      const data = response.data;
      if (data && data.resourceSets && data.resourceSets.length > 0) {
        const location = data.resourceSets[0].resources[0].point.coordinates;
        const latitude = location[0];
        const longitude = location[1];
        // console.log(latitude + "..." + longitude);
        res.render("./listings/show.ejs", { listing, latitude,longitude,BING_MAPS_API_KEY,RAZORPAY_API_KEY});
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

// Create Route
module.exports.createListings = async (req, res, next) => {
  // let {title,description,image,price,country,location} = req.body;
  // let listing = req.body.listing;
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send valid data for listing.");
  // }
  // const newListing = new Listing(req.body.listing);
  // if (!newListing.title) {
  //   throw new ExpressError(400, "Titile is missing.");
  // }
  // if (!newListing.description) {
  //   throw new ExpressError(400, "Description is missing.");
  // }
  // if (!newListing.price) {
  //   throw new ExpressError(400, "Price is missing.");
  // }
  // if (!newListing.country) {
  //   throw new ExpressError(400, "Country is missing.");
  // }
  // if (!newListing.location) {
  //   throw new ExpressError(400, "Location is missing.");
  // }
  // let result = listingSchema.validate(req.body);
  // console.log(result);
  // let result = listingSchema.validate(req.body);
  // // console.log(result);
  // if(result.error){
  //   throw new ExpressError(400,result.error);
  // }
  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(req.body);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  // console.log(listing);
  res.redirect("/listings");
};

// Edit Route
module.exports.editListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

// Update Route
module.exports.updateListings = async (req, res) => {
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send valid data for listing.");
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { filename, url };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// Delete Route
module.exports.destroyListings = async (req, res) => {
  let { id } = req.params;
  let deleteLisitng = await Listing.findByIdAndDelete(id);
  // console.log(deleteLisitng);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

// find lati. & longi.
// module.exports.find = (req, res) => {
//   const countryName = "India";
//   const cityName = "Delhi";
//   const query = `${countryName},${cityName}`;
//   const encodedQuery = encodeURIComponent(query);
//   const BING_MAPS_API_KEY = process.env.MAP_API;
//   const url = `http://dev.virtualearth.net/REST/v1/Locations?q=${encodedQuery}&key=${BING_MAPS_API_KEY}`;

//   axios
//     .get(url)
//     .then((response) => {
//       const data = response.data;
//       if (data && data.resourceSets && data.resourceSets.length > 0) {
//         const location = data.resourceSets[0].resources[0].point.coordinates;
//         const latitude = location[0];
//         const longitude = location[1];

//         res.render("./listings/show.ejs", { latitude, longitude,BING_MAPS_API_KEY });
//       } else {
//         res.send("No results found");
//       }
//     })
//     .catch((error) => {
//       res.send("Error fetching data");
//       console.error("Error:", error);
//     });
// };