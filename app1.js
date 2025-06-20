const express=require("express");
const mongoose=require("mongoose");
const app=express();
const Listing=require("./models/listing.js");
const path=require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require('method-override');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");

const port =8080;

const MONGODB_URL=("mongodb://127.0.0.1:27017/Wanderlust");

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGODB_URL);
}

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
 app.use(express.static(path.join(__dirname,"/public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine("ejs",ejsMate);


const validateListing=(req,res,next)=>{
    let {error} =listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError (400,errMsg);
    }else{
        next();
    }
}


const validateReview=(req,res,next)=>{
    let {error} =reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError (400,errMsg);
    }else{
        next();
    }
};


app.get("/",(req,res)=>{
    res.send("Hi iam root path");
})

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "kpd, Hyd",
//     country: "India"
//   });
//   await sampleListing.save();
//   res.send("Successful testing");
// });

// index route
app.get('/listings',wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render('listings/index', { allListings });
}));

// new route
app.get('/listings/new', (req, res) => {
    res.render('listings/new')
})


// Show Route

// app.get('/listings/:id',wrapAsync( async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate('owner').populate({
//         path: 'reviews',
//         populate: {
//             path: 'author'
//         }
//     });
//     if (!listing) {
//         return res.status(404).send("Listing not found");
//     }
//     res.render('listings/show.ejs', { listing });
// }));


app.get('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate('owner') // ✅ This line is crucial
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    });

  if (!listing) {
    return res.status(404).send("Listing not found");
  }

  res.render('listings/show', { listing, currUser: req.user });
});


// Create route

app.post('/listings', validateListing, wrapAsync((async (req, res,next) => {
     listingSchema.validate(req.body);
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');

})));




//edit
// app.get('/listings/:id/edit',async (req, res) => {
//     const { id } = req.params;

//     const listing = await Listing.findById(id);

//     res.render('listings/edit.ejs', { listing});
// });


app.get('/listings/:id/edit',wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const originalImageUrl = listing.image?.url || '/default.jpg'; // fallback image if not present
  res.render('listings/edit', { listing, originalImageUrl });
}));



//put
app.put('/listings/:id', validateListing,wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect('/listings');

}));


//delete
app.delete('/listings/:id',wrapAsync( async(req, res) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/listings');

}));



//review
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review (req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
}));

// app.post("/listings/:id/reviews", async (req, res) => {
//   const { id } = req.params;
//   const listing = await Listing.findById(id);
//   const newReview = new Review(req.body.review);
//   listing.reviews.push(newReview);
//   await newReview.save();
//   await listing.save();
//   res.redirect(`/listings/${id}`);
// });

app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
   let { id,reviewId}=req.params;
  await  Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findByIdAndDelete(reviewId);
   res.redirect(`/listings/${id}`);
}));

app.use(/.*/, (req, res) => {
    res.status(404).send("There is no path matched.");
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
});

app.listen(port,()=>{
    console.log(`port is listened sucessfully ${port}`);
})
   

