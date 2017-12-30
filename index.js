'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { PetPost } = require('./models');
const jsonParser = bodyParser.json();

const path = require('path');
// const cookieParser = require('cookie-parser');
// const exphbs = require('express-handlebars');
// const expressValidator = require('express-validator'); // doc says to move after body parsers
// const flash = require('connect-flash');
const session = require('express-session');

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { PORT, DATABASE_URL, JWT_SECRET } = require('./config');
const db = mongoose.connection; //just added this might delete, but not affecting outcome

mongoose.Promise = global.Promise;

const { Users } = require('./users/');

//Passport initialization : not working had to put in routes folder, but will leave in here until otherwise noted
// app.use(passport.initialize());
// app.use(passport.session());

// Logging
app.use(morgan('common'));

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

app.get(
  '/app.html',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log(jwtAuth.authenticate);
    console.log(req.user);
    console.log('=======================');
    const token = req.headers.authorization;
    console.log(token);
    res.sendFile(path.join(__dirname + '/public0/app.html'));
  }
);

app.use(express.static('public0'));

//Set static folder
//app.use(express.static(path.join(__dirname, 'public')));

//Express session
// app.use(
//   session({
//     secret: JWT_SECRET,
//     saveUninitialized: true,
//     resave: true
//   })
// );

app.get('currentUser', (req, res) => {
  res.json(req.user.apiRepr()); //just sends back user
});

app.use(bodyParser.urlencoded({ extended: false })); //make extended false. find out why.
app.use(bodyParser.json()); //initializes body parser

app.use(morgan('common'));
app.use(bodyParser.json());

///////////// POST ///////////////////////////
app.post('/posts', (req, res) => {
  //Validating the field bodies
  req.checkBody('text', 'Please provide a brief description').notEmpty();
  //req.checkBody("userName", "Pleae provide a name").notEmpty();
  //Run the validators
  var errors = req.validationErrors();

  //create the post with schema found in the models
  var post = new PetPost();
  (post.text = req.body.text),
    (post.userName = req.user.username), //passport object
    (post.created = new Date());

  //Now if there are errors
  if (errors) {
    console.log('there are missing fields');
  } else {
    post.save((err, record) => {
      if (err) {
        res.send(err);
      }
      res.json(record);
    });
  }
});

/////////vvv GET Requests vvv////////////////vvGETvv/////////////
app.get('/posts', (req, res) => {
  PetPost.find()
    .then(posts => {
      res.json(posts.map(post => post.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

//for currentUser from user models
// app.get('/currentUser', (req, res) => {
//   res.json(req.user.apiRepr()); //just sends back user
// });

///////DELETE
app.delete('/posts/:id', (req, res) => {
  console.log(req.params.id);
  PetPost.findByIdAndRemove(req.params.id, error => {
    if (error) {
      res.send(error);
    } else {
      PetPost.find()
        .then(posts => {
          res.json(posts.map(post => post.apiRepr()));
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'something went wrong' });
        });
    }
  });
});

//PUT
app.put(`/posts/:id`, jsonParser, (req, res) => {
  console.log(req.body);
  console.log(req.params.id);

  PetPost.update(
    { _id: req.params.id },
    {
      text: req.body.text,
      userName: req.body.userName
    },
    err => {
      //issue was that it wasn't updating the name field, i was using name rather than userName on this line.
      if (err) {
        res.send(err);
      } else {
        PetPost.find()
          .then(posts => {
            res.json(posts.map(post => post.apiRepr())); //its reading the code but not updating?
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went wrong' });
          });
      }
    }
  );

  //res.status(204).end();
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({ message: 'Not Found' });
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

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
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
