// ----- NODE/NPM MODULES -----

const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
// "The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. The flash is typically used in combination with redirects, ensuring that the message is available to the next page that is to be rendered."

// ----- APP + MIDDLEWARE -----

const app = express();

const DB = 'mongodb://localhost:27017/todo-list-express';
const store = new MongoDBStore({ // sessions store
  uri: DB,
  collection: 'sessions'
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

const sessionSettings = {
  secret: 'O1(_}.A2YbDSp{qJE)i', // sessions key
  resave: false,
  saveUninitialized: false,
  store: store
};

app.use(session(sessionSettings));
app.use(flash());

// ----- AUTHORIZATION MIDDLEWARE -----

// bind req.user equal to req.session.user for every request!
// than use req.user for creating tasks etc.
app.use((req, res, next) => {
  if (Boolean(req.session.user)) {
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user; // IMPORTANT!
        next();
      }).catch(err => {
        console.log(err);
      });
  } else {
    next();
  };
});

// ----- CSRF PROTECTION -----

const csrfProtection = csrf();
app.use(csrfProtection);

// ----- CSRF TOKENS + AUTH MIDDLEWARE -----

app.use((req, res, next) => {
  // res.locals is available only to the view rendered during that request
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

// ----- VIEW ENGINE (HANDLEBARS) -----

  // └── views
  //     ├── ${view_name}.handlebars
  //     └── layouts
  //         └── main.handlebars
  //     └── partials
  //         └── ${partial_name}.handlebars

const handlebarsSettings = {
  helpers: {
    'dateFormat': require('handlebars-dateformat'),
  },
};

app.engine('handlebars', handlebars(handlebarsSettings));
app.set('view engine', 'handlebars');

// ----- MODELS ------

const User = require("./models/user.js");

// ----- ROUTES -----

const tasks = require('./routes/routes.js');
const auth = require('./routes/auth.js');

  // + /login GET – login page;
  // + /login POST – login attempt request;
  // + /logout POST – logout request;
  app.use(auth.routes);

  // + /tasks GET — show tasks;
  // + /tasks POST — add task;
  // + /:id GET — task's info;
  // + /:id/update POST — update task;
  // + /:id/remove POST — remove task;
  app.use('/tasks', tasks.routes);

  // + 404-page
  app.use('/', (req, res, next) => {
    // TODO: use res.render(handlebars_template)
    res.status(404).render('404'); // 404-page
  });

// ----- SERVER + DATABASE -----

const mongooseSettings = {
  // fixes for MongoDB deprecation warnings:
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
};

mongoose
  .connect(DB, mongooseSettings)
  // if no users: create users for testing
  .then(result => {
    // server listen
    app.listen(3000, () => {
      console.log(`----- SERVER: http://localhost:${process.env.PORT || 3000}. DB:`, DB, ' -----')
    });
  })
  .catch(err => {
    console.log(err);
  });
