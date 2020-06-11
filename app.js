var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

// requiring routes
var commentRoutes = require("./routes/comments");
var reviewRoutes = require("./routes/reviews");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// this is shorthand for first requiring moment and then using it locally 
app.locals.moment = require('moment');

//seedDB(); // THIS SEEDS THE DATABASE WITH DATA 

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "camping is very fun and interactive",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this passes "currentUser", "error" and "success" to every single template !!!
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// this block here is to create a new campground in the database without using the site template 
//Campground.create(
//	{
//		name: "Granite Hill", 
//		image: "https://pixabay.com/get/57e8d0424a5bae14f1dc84609620367d1c3ed9e04e507440752e79d59048c4_340.jpg",
//		description: "This is a huge granite hill, no bathrooms. No water. Just beautiful granite!"
//	}, function(err, campground) {
//		if (err) {
//			console.log(err);
//		} else {
//			console.log("NEWLY CREATED CAMPGROUND: ");
//			console.log(campground);
//		}
//	});

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("The YelpCamp Server Has Started!");
});




























