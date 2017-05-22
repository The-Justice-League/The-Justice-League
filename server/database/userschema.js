const mongoose = require( './init' );

const FacebookUserSchema = new mongoose.Schema({
  facebookID: {type: String, unique: true},
  name: String,
  email: String
});

const User = mongoose.model('User', FacebookUserSchema);
module.exports = User;