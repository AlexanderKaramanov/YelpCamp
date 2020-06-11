var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");

// ===========
// ROOT ROUTE
// ===========

// GET route to the landing page 
router.get("/", function(req, res){
	res.render("landing");
});


// ============
// AUTH ROUTES
// ============

// show register form
router.get("/register", function(req, res){
	res.render("register", {page: "register"});
});

// handle "sign up" logic
router.post("/register", function(req, res){
	var newUser = new User(
		{
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			avatar: req.body.avatar
		});
	if (req.body.adminCode === "adminRights13!") {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if (err) {
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to YelpCamp " + user.username + " !");
			res.redirect("/campgrounds");
		});
	});
});

// show login form
router.get("/login", function(req, res){
	res.render("login", {page: "login"});
});

// handling login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}),	function(req, res){
});

// logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Successfully Logged Out.");
	res.redirect("/campgrounds");
});

// user profile "SHOW"
router.get("/users/:id", middleware.checkUserExistence, function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			req.flash("error", "Something went wrong...");
			res.redirect("/");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec(function (err, campgrounds) {
			if (err) {
			req.flash("error", "Something went wrong...");
			res.redirect("/");
			}
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});
	});
});

// users index route
router.get("/users", middleware.isLoggedIn, function (req, res) {
	// get all users from DB
	User.find({}, function (err, allUsers) {
	if (err) {
		req.flash("error", "Something went wrong...");
		res.redirect("back");
		} 
	res.render("users/index", {users: allUsers});
	});	
});

// users EDIT route 
router.get("/users/:id/edit", middleware.checkUserExistence, function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if (err) {
			console.log(err);
			req.flash("error", "Something went wrong...");
			res.redirect("back");
		}
		res.render("users/edit", {user: foundUser});		
	});
});

// users UPDATE route
router.put("/users/:id", middleware.checkUserExistence, function (req, res){
	// find and update the correct user
	User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser) {
		if(err){
			req.flash("error", "Something went wrong...");
			res.redirect("back");
		} else {
			// redirect somewhere
			req.flash("success", "User updated successfully!");
			res.redirect("/campgrounds");
		}
	});
});

// users DESTROY route
router.delete("/users/:id", middleware.checkUserExistence, function(req, res) {
	// findByIdAndRemove
	User.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			req.flash("error", "Something went wrong...");
			res.redirect("back");
		} else {
			req.flash("success", "User deleted successfully!");
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;










