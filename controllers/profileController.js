const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').ObjectID;
const bcrypt = require('bcryptjs');


const assert = require('assert');
const url = 'mongodb://test:test1@cluster0-shard-00-00-mglss.azure.mongodb.net:27017,cluster0-shard-00-01-mglss.azure.mongodb.net:27017,cluster0-shard-00-02-mglss.azure.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';

const passport = require('passport');
const config = require ('../config/database');
const session = require('express-session');

const exphbs = require('express-handlebars');

//passport config
require('../config/passport')(passport);

const db =require('../config/database').database;

//User Model
const User = require('../models/Profile');

//For dynamic Nav Bar
router.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

//connect to mongo
mongoose.connect(db,{useNewUrlParser: true,useUnifiedTopology: true })
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

//Multer to accept images
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/img/');
    },
    filename: function(req, file, cb) {
        
        cb(null, filename = Date.now() + file.originalname);
    }
});

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024*1024*5
    }
});

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/login/logreg");
    }
}



/*
    defines an object which contains functions executed as callback
    when a client requests for `signup` paths in the server
*/
const profileController = {

    /*
        executed when the client sends an HTTP GET request `/signup`
        as defined in `../routes/routes.js`
    */
  
    getProfile: async function (req, res) {
        var posts = []; 
        var profile = []; 


        var email = req.user.email;
        var username = req.user.username;

        console.log(email);
        console.log(username);

        
        
        mongoose.connect(url,{  useNewUrlParser: true, useUnifiedTopology: true },function(err,db){
            assert.equal(null, err);
            var cursor = db.collection('posts').find({'author':{$regex:username}});

            var cursor2 = db.collection('profiles').find({'email':email});
            cursor.forEach(function(doc, err){
                assert.equal(null, err);
                posts.push(doc);
            }, function(){
                cursor2.forEach(function(doc2, err){
                    assert.equal(null, err);
                    profile.push(doc2);
                }, function(){
                res.render('profile', {thread: posts, profile, profile});
                });
            });
        });
    },
    getProfileSpecific: async function (req, res) {
        var posts = []; 
        var profile = []; 
    
    
        var username = req.params.id;
    
        
        
        mongoose.connect(url,{  useNewUrlParser: true, useUnifiedTopology: true },function(err,db){
            assert.equal(null, err);
            var cursor = db.collection('posts').find({'author':{$regex:username}});
    
            var cursor2 = db.collection('profiles').find({'username':username});
            cursor.forEach(function(doc, err){
                assert.equal(null, err);
                posts.push(doc);
            }, function(){
                cursor2.forEach(function(doc2, err){
                    assert.equal(null, err);
                    profile.push(doc2);
                }, function(){
                res.render('profile', {thread: posts, profile, profile});
                });
            });
        });
    },
    getProfileUpdate: async function (req, res) {
        var emailSearch = req.user.email;
        var path = "/img/" + filename;
    
    
        mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
            function(err, db) {
            if (err) throw err;
            var myquery = { email: emailSearch};
            var newvalues = { $set: {description: req.body.bio, username:req.body.username, profilePic:path } };
            db.collection("profiles").updateOne(myquery, newvalues, function(err, res) {
              if (err) throw err;
              console.log("1 document updated");
              
              
            });
             res.redirect("/profile/status");
          });
    },


    

    

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
module.exports = profileController;
