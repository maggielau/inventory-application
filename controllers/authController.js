const req = require('express/lib/request');
const res = require('express/lib/response');
let User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                //passwords match, login
                return done(null, user);
            } else {
                //passwords do not match
                return done(null, false, { message: "Incorrect password" });
            }
        })
      });
    })
);

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


//Sign up page
exports.signup_get = function(req, res) {
    res.render('signup', { title: 'Sign Up'});
}

exports.signup_post = function(req, res, next) {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) { return next(err); }
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        }).save(err => {
            if (err) { return next(err); }
            res.redirect("/");
        });
    });
}

//Login page
exports.login_get = function(req, res) {
    res.render('login', { title: 'Log in'});
}

exports.login_post = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
    });

//Logout
exports.logout = function(req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("/");
    });
}