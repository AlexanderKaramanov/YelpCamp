var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var User = require("../models/user");

// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
	// is a user logged in ?
	if (req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if (err || !foundCampground) {
				req.flash("error", "Campground was not found.");
				res.redirect("/campgrounds");
			} else {
				// does the logged in user own the campground ?
				if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin || req.user.isCampAdmin) {
					next();
				} else {
					// otherwise, redirect 
					req.flash("error", "You must be the creator of the campground in ordet to do that!");
					res.redirect("/campgrounds");
				}
			}
		});
	} else {
		// if not, redirect
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/login");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
	// is a user logged in ?
	if (req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if (err || !foundComment) {
				req.flash("error", "Comment was not found.");
				res.redirect("/campgrounds");
			} else {
				// does the logged in user own the comment ?
				if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin || req.user.isCampAdmin) {
					next();
				} else {
					// otherwise, redirect
					req.flash("error", "You must be the creator of the comment in ordet to do that!");
					res.redirect("/campgrounds");
				}
			}
		});
	} else {
		// if not, redirect
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/login");
	}
}

middlewareObj.checkReviewOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		Review.findById(req.params.review_id, function (err, foundReview) {
			if (err || !foundReview) {
				req.flash("error", "Review was not found.");
				res.redirect("/campgrounds");
			} else {
				// does user own the comment?
				if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin || req.user.isCampAdmin) {
					next();
				} else {
					req.flash("error", "You must be the creator of the review in ordet to do that!")
					res.redirect("/campgrounds");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/login");
	}
}

middlewareObj.checkReviewExistence = function (req, res, next) {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
			if (err || !foundCampground) {
				req.flash("error", "Campground was not found.");
				res.redirect("/campgrounds");
			} else {
				// check if req.user._id exists in foundCampground.reviews
				var foundUserReview = foundCampground.reviews.some(function (review) {
					return review.author.id.equals(req.user._id);
				});
				if (foundUserReview) {
					req.flash("error", "You already wrote a review.");
					return res.redirect("/campgrounds/" + foundCampground._id);
				}
				// if the review was not found, go to the next middleware
				next();
			}
		});
	} else {
		req.flash("error", "You need to login first.");
		res.redirect("/login");
	}
}

middlewareObj.checkUserExistence = function(req, res, next) {
	// is a user logged in ?
	if (req.isAuthenticated()){
		User.findById(req.params.id, function(err, foundUser){
			if (err || !foundUser) {
				req.flash("error", "User was not found.");
				res.redirect("/campgrounds");
			} else {
				next();
			} 
		});
	} else {
		// if not, redirect
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/login");
	}
}

middlewareObj.checkUserExistenceAndAdmin = function(req, res, next) {
	// is a user logged in
	if (req.isAuthenticated()) {
		// is the user an admin
		if (req.user.isAdmin) {
			User.findById(req.params.id, function(err, foundUser){
			if (err || !foundUser) {
				req.flash("error", "User was not found.");
				res.redirect("/campgrounds");
			} else {
				next();
			} 
			});
		}
	} else {
		// if not, redirect
		req.flash("error", "You have no permission to do that!");
		res.redirect("/campgrounds");
	}
}

middlewareObj.checkIsAdmin = function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.isAdmin) {
			next();
		} else {
			req.flash("error", "You have no permission to do that!");
			res.redirect("/campgrounds");
		}
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/login");
	}
}

middlewareObj.checkCurrentUserOrAdmin = function (req, res, next) {
	if (req.isAuthenticated()) {
		User.findById(req.params.id, function (err, foundUser) {
			if (err || !foundUser) {
				req.flash("error", "User was not found.");
				res.redirect("/campgrounds");
			} else {
				if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You have no permission to do that!");
					res.redirect("/campgrounds");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/login");
	}
}

middlewareObj.isLoggedIn = function (req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
}

module.exports = middlewareObj;










