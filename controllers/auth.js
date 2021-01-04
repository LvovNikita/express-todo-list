const User = require('../models/user.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { check } = require('express-validator');
const { validationResult } = require('express-validator');

exports.getLoginPage = (req, res, next) => {
  res.render('login', {
    errorMessage: req.flash('error') // check postLogin()
  });
};

exports.postLogin = (req, res, next) => {
  User.findOne({'email': req.body.email})
    .then(user => {
      // if there is no user, redirect back to login page
      if (!user) {
        req.flash('error', 'Invalid email');
        return res.redirect('/login');
      }
      // else: check password
      bcrypt.compare(req.body.password, user.password)
        .then(isEqual => {
          if (isEqual) {
            // set session
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save();
            res.redirect('/tasks');
          } else {
            req.flash('error', `Invalid password`);
            res.redirect('/login');
          }
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        })
    })
    .catch(err => {
      console.log(err);
    })
  // User.find().limit(2)
  // .then(users => { // <----- use findById(user_id)
  //   req.session.user = users[0]; // [0] = admin. for testing
  //   // req.session.user = users[1]; // [1] = user . for testing
  //   req.session.isLoggedIn = true; // for testing
  //   res.redirect('/tasks');
  // }).catch(err => {
  //   console.log(err);
  // });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

exports.getSignupPage = (req, res, next) => {
  res.render('signup', {
    'errorMessage': req.flash('error')
  });
};

exports.postSignup = (req, res, next) => {
  // TODO: email validation & passwords equality check
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.array()[0].msg);
    return res.status(422).redirect('/signup');
  }
  User.findOne({'email': req.body.email})
    .then(user => {
      // if user already exists:
      if (user) {
        req.flash('error', 'User with this email address already exists!')
        return res.redirect('/signup');
      }
      // else: encrypt password,create new user and redirect to login page
      bcrypt.hash(req.body.password, 12)
        .then(hashedPassword => {
          const newUser = new User({
            email: req.body.email,
            password: hashedPassword
          });
          newUser.save()
            .then(result => {
              res.redirect('/login');
            })
        })
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getPasswordResetPage = (req, res, next) => {
  res.render('password_reset');
};

// FOR TESTING ONLY!
exports.postPasswordReset = (req, res, next) => {
  // TODO: изменить порядок: сначала проверяем пользователя, потом генерируем токен!
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    };
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          res.redirect('/reset');
        } else {
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; // 1 h = 60 min * 60 sec * 1000 ms
          return user.save();
        }
      })
      .then(result => {
        // SENDING EMAIL LOGIC!
        console.log(`to reset password go to /reset/${token}`);
        res.redirect('login');
      })
      .catch(err => {
        console.log(err);
      })
  })
};

exports.getNewPasswordPage = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {$gt: Date.now()}
  })
    .then(user => {
      res.render('new_password', {
        userId: user._id.toString(),
        resetToken: token
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/reset');
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  let userToReset;
  User.findOne({
    _id: userId,
    resetToken: resetToken,
    resetTokenExpiration: {$gt: Date.now()}
  })
    .then(user => {
      userToReset = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      userToReset.password = hashedPassword;
      userToReset.resetToken = undefined;
      userToReset.resetTokenExpiration = undefined;
      return userToReset.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    })
};
