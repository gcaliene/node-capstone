const express = require('express');
const mongoose = require('mongoose');

const app = express();
// const app = require('../app/app');
const morgan = require('morgan')
const { PORT, DATABASE_URL } = require('../config');

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

app.use(morgan('common'));
app.get('/api/ping', (req, res) => {
  console.log('ggg')
  res.send('hi')
})

//testing commit

app.use(express.static('public0'));


// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Time to work! Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
      return server
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later. gives error if not used.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('I guess this means you are done. Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node index.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
//   console.log(require.main);
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
