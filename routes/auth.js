const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// ----- MODELS ------

const User = require('../models/user.js');

// ----- CONTROLLERS -----

  // + authController.getLoginPage()
  // + authController.postLogin()
  // + authController.postLogout()

const authController = require('../controllers/auth.js');

// ----- ROUTES -----

  // + /login GET – login page;
  // + /login POST – login attempt request;
  // + /logout POST – logout request;

router.get('/login', authController.getLoginPage);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

  // +/signup GET – signup page;
  // +/signup POST – signup attempt;

router.get('/signup', authController.getSignupPage);
router.post('/signup', 
  check('email').isEmail().withMessage('Please enter a valid email').normalizeEmail().trim(), 
  check('password').isLength({min: 5}).withMessage('Please use password at least 5 characters long'),
  authController.postSignup
);

router.get('/reset', authController.getPasswordResetPage);
router.post('/reset', authController.postPasswordReset);
router.get('/reset/:token', authController.getNewPasswordPage);
router.post('/new-password', authController.postNewPassword);

exports.routes = router;
