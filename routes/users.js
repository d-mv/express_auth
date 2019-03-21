var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "./uploads" });
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.send("respond with a resource");
});
router.get("/register", (req, res, next) => {
  res.render("register", { title: "Register" });
});
router.get("/login", (req, res, next) => {
  res.render("login", { title: "Login" });
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Invalid username and/or password."
  }),
  (req, res) => {
    req.flash("success", "You are now logged in.");
    res.redirect("/");
  }
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

// check authentication
passport.use(
  new LocalStrategy((username, password, done) => {
    // does user match?
    User.getUserByUsername(username, (err, user) => {
      if (err) throw err;
      if (!user) {
        return done(null, false, { message: "Unknown user." });
      }
      // if does, does the password match?
      User.comparePassword(password, user.password, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid password." });
        }
      });
    });
  })
);

router.post("/register", upload.single("profileimage"), (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  let profileimage = "";
  if (req.file) {
    console.log("-> Uploading file...");
    profileimage = req.file.filename;
  } else {
    console.log("-> No file uploaded...");
    profileimage = "";
  }
  // Form validation
  req.checkBody("name", "Name field is required").notEmpty();
  req.checkBody("email", "Email field is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("username", "Username field is required").notEmpty();
  req.checkBody("password", "Password field is required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  // check for errors
  const errors = req.validationErrors();

  if (errors) {
    res.render("register", { errors: errors });
    console.log("Errors");
  } else {
    const newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });
    User.createUser(newUser, (err, user) => {
      if (err) throw err;
      console.log(user);
    });
    req.flash("success", "You are now registered and can login");
    res.location("/");
    res.redirect("/");
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are no logged out.");
  res.redirect("/");
});

module.exports = router;
