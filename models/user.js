const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/express-auth");

const db = mongoose.connection;

// User Schema
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  profileimage: {
    type: String
  }
});

const User = (module.exports = mongoose.model("User", UserSchema));

module.exports.createUser = (newUser, callback) => {
  newUser.save(callback);
};
