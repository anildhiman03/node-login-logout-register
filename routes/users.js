var express = require('express');
var router = express.Router();

var multer = require('multer');
var upload = multer({dest: './uploads'});

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.get('/register', isLoggedOut, function(req, res, next) {
  res.render('register', { title: 'register' });
});

/* GET users listing. */
router.get('/login', isLoggedOut, function(req, res, next) {
  res.render('login', { title: 'login' });
});


/* GET users listing. */
router.post('/register', upload.single('profileimage') ,function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var cpassword = req.body.cpassword;

  if(req.file){
  	console.log('Uploading File...');
  	var profileimage = req.file.filename;
  } else {
  	console.log('No File Uploaded...');
  	var profileimage = 'noimage.jpg';
  }

  req.checkBody('name','name field is required').notEmpty()
  req.checkBody('email','email field is required').notEmpty()
  req.checkBody('email','valid email field is required').isEmail()
  req.checkBody('username','username field is required').notEmpty()
  req.checkBody('password','password field is required').notEmpty()
  req.checkBody('cpassword','password 2 not matched').equals(req.body.password)

  var errors = req.validationErrors();

  if (errors) {
  	console.log(errors);
  	res.render('register',{errors:errors});
  } else {
  	var newUser = new User({
  		name: name,
  		email: email,
  		username: username,
  		password: password,
  		profileimage: profileimage
  	});
  	User.createUser(newUser,function(err, user){
  		if (err) throw err;
  		console.log(user);
  	});

  	req.flash('success','Registration done. Please login')

  	res.location('/');
  	res.redirect('/');
  }
})

// validating
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username,password,done) {
  User.getUserByUsername(username,function(err,user) {
    if (err) throw err;

    if(!user) {
      return done(null,false,{message:'unknown user'});
    }

    User.comparePassword(password,user.password,function(err, isMatch){
        if (err) return done(err);

        if (isMatch) {
          return done(null,user);
        } else {
          return done(null,false,{message:'invalid password'});
        }
    })
  })
}))

router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','user logged successfully');
  res.redirect('/users/login');
})


function isLoggedOut(req,res,next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}

module.exports = router;