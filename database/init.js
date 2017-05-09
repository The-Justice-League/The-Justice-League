const Promise = require( 'bluebird' );
const mongoose = require( 'mongoose' );
mongoose.Promise = Promise;

const databaseUrl = process.env.MONGODB_URI || 'mongodb://localhost/tribal';

mongoose.connect( databaseUrl )
  .then( () => {
    console.log( `Connected to database at ${databaseUrl}.` );
  })
  .catch( (err) => {
    console.log( err );
  });

module.exports = mongoose;
