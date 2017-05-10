const express = require( 'express' );
const db = require( './database' );
const Promise = require( 'bluebird' );

const serverPort = process.env.PORT || 4242;

const app = express();

app.use( express.static(`${__dirname}/../client`) );
app.use( express.static(`${__dirname}/../node_modules`) );

app.use( '/test', (req, res) => {
  const message = `Server ${(db.mongoose.connection.readyState === 1) ? 'is' : 'is NOT'} connected to the database.`;
  res.status(200).send(message);
});

app.listen = Promise.promisify( app.listen );
app.start = function() {
  app.listen( serverPort )
    .then( () => {
      console.log( `Tribal server is listening on port ${serverPort}.` );
    });
};

module.exports = app;