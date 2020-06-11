var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var Review = require("../models/review");

// ===================
// CAMPGROUNDS ROUTES
// ===================

// GET route to display all campgrounds "INDEX"
router.get("/", function(req, res){
	//Get all Campgrounds from DB
	Campground.find({}, function(err, allCampgrounds) {
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
		}
	});
});

// POST route "CREATE" to input a new campground in the database and then redirect to "INDEX"
router.post("/", middleware.isLoggedIn, function(req, res) {
	//Get data from a form and add that to the campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, price: price, image: image, description: desc, author: author};
	//Create a new campground and save it to the database 
	Campground.create(newCampground, function(err, newlyCreated){
		if (err) {
			console.log(err);
		} else {
			//Redirect back to /campgrounds page
			res.redirect("/campgrounds");
		}
	});	
});

// GET route to a form to create a new campground "NEW"
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
});

// GET route to show more info about one specific campground "SHOW"  
router.get("/:id", function(req, res){
	//find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash("error", "Campground was not found.");
			res.redirect("back");
		} else {
			//render a show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err) {
			console.log(err);
			req.flash("error", "Something went wrong...");
			res.redirect("back");
		}
		res.render("campgrounds/edit", {campground: foundCampground});		
	});
});

// UPDATE CAMPGROUND ROUTE 
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res){
	delete req.body.campground.rating;
	// find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
		if(err){
			req.flash("error", "Something went wrong...");
			res.redirect("/campgrounds");
		} else {
			// redirect somewhere (show page)
			req.flash("success", "Campground updated successfully!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if (err) {
			req.flash("error", "Something went wrong...");
			res.redirect("/campgrounds");
		} else {
			// deletes all comments associated with the campground
			Comment.deleteMany({
				"_id": {$in: campground.comments}
			}, function (err) {
				if (err) {
					console.log(err);
					return res.redirect("/campgrounds");
				}
				// deletes all reviews associated with the campground
				Review.deleteMany({
					"_id": {$in: campground.reviews}
				}, function (err) {
					if (err) {
						console.log(err);
						return res.redirect("/campgrounds");
					}
					// delete the campground
					campground.deleteOne();
					req.flash("success", "Campground deleted successfully!");
					res.redirect("/campgrounds");
				});
			});
		}
	});
});

module.exports = router;
