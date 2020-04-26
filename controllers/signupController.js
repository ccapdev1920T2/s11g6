const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const assert = require('assert');
const mongoose = require('mongoose');
const url = 'mongodb://test:test1@cluster0-shard-00-00-mglss.azure.mongodb.net:27017,cluster0-shard-00-01-mglss.azure.mongodb.net:27017,cluster0-shard-00-02-mglss.azure.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';

const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const passport = require('passport');
const config = require ('../config/database');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const expressValidator = require('express-validator');

//passport config
require('../config/passport')(passport);

const db =require('../config/database').database;

//User Model
const User = require('../models/Profile');

//connect to mongo
mongoose.connect(db,{useNewUrlParser: true,useUnifiedTopology: true })
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.use(passport.initialize());
router.use(passport.session());


/*
    defines an object which contains functions executed as callback
    when a client requests for `signup` paths in the server
*/
const signupController = {

    /*
        executed when the client sends an HTTP GET request `/signup`
        as defined in `../routes/routes.js`
    */
    getSignUp: function (req, res) {
        res.render('login');
    },

    /*
        executed when the client sends an HTTP POST request `/signup`
        as defined in `../routes/routes.js`
    */
    postSignUp: function (req, res) {

  
        req.checkBody('firstname', 'Firstname Field Cannot be Empty.').notEmpty();
        req.checkBody('lastname', 'Lastname Field Cannot be Empty.').notEmpty();
        req.checkBody('username', 'Username Field Cannot be Empty.').notEmpty();
        req.checkBody('emailadd', 'Email Field Cannot be Empty.').notEmpty();
        req.checkBody('pass', 'Password Field Cannot be Empty.').notEmpty();
        req.checkBody('pass2', 'Confirm Password Field Cannot be Empty.').notEmpty();
    
        
    
        
        req.checkBody('emailadd', 'The Email Is Invalid').isEmail();
        req.checkBody('pass2', 'Passwords do not match').equals(req.body.pass);
    
    
        const errors = req.validationErrors();
    
        if(errors)
        {
            console.log('errors: ${JSON.stringify(errors)}');
            res.render('login', {
                errors: errors
    
            });
    
        }
        else{
            var user = new Profile({
                fname: req.body.firstname,
                lname: req.body.lastname,
                email: req.body.emailadd,
                password:req.body.pass,
                username:req.body.username
            });
        
            bcrypt.genSalt(10, (err, salt) => 
                            bcrypt.hash(user.password, salt, (err,hash)=>{
                                if(err) throw err;
                                // set password to hashed
                                user.password = hash;
                        }));
            mongoose.connect(url,
                { 
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }, function(err, db){
                    assert.equal(null, err);
                db.collection('profiles').insertOne(user, function(err,result){
                    assert.equal(null, err);
                    console.log('User credentials saved');
                    console.log("I am here " + user.id);
    
                    // const user_id = user.id;
                    // //Login yung na register na
                    // req.login(user_id, function(err){
                    //     req.session.valid = true;
    
                    //      res.redirect('/');
                    //         //  res.render('/', {
                    //         //     id: user_id
    
                    //         // });
                    // });
                    res.render('succreg');
                });
            });
            // req.flash('success_msg', 'You are now registered!');
            // res.redirect('/login/logreg');
            
            // db.collection.find({}).sort({_id:-1}).limit(1);
    
            // db.query()
            // res.render('login', {
            //     success: true
    
            // });
    
        }
    },

  
    getLogout: function (req, res) {

        req.session.destroy(function (err) {
            res.redirect('/posts');
          });
    },
    getLogin: function (req, res, next) {
        passport.authenticate('local', {
            successRedirect : '/posts',
            failureRedirect : '/login/logreg',
            failureFlash : true
        })(req, res, next);
    }

    

}
passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});

/*
    exports the object `signupController` (defined above)
    when another script exports from this file
*/
module.exports = signupController;
