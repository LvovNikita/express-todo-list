const mongoose = require('mongoose');

// ----- MONGOOSE SCHEMAS -----

const Schema = mongoose.Schema;

const userSchema = new Schema({
  // id: ObjectId,
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date
});

const User = mongoose.model('User', userSchema);

// ----- EXPORT -----

module.exports = User;
