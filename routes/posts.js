const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const assert = require('assert');
const mongoose = require('mongoose');
const url = 'mongodb://test:test1@cluster0-shard-00-00-mglss.azure.mongodb.net:27017,cluster0-shard-00-01-mglss.azure.mongodb.net:27017,cluster0-shard-00-02-mglss.azure.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';

var ObjectId = require('mongodb').ObjectId;



//Passport and session
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


const passport = require('passport');


//MVC
// import module `signupController` from `../controllers/signupController.js` This is for Login and Signup
const postController = require('../controllers/postController.js');



//express session middleware as of Mar 23 based on Chris Courses set to false daw yung dalawa
//eto yung gumagawa ng session
router.use(session({
    secret: 'fsfdfghgfhdfgbfb',
    resave:false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection,
        ttl: 2 * 24 * 60 * 60
            })
}));

// Passport Middleware
router.use(passport.initialize());
router.use(passport.session());



function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/login/logreg");
    }
}

//For dynamic Nav Bar
router.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});



router.get('/', postController.getMain);

router.get('/posts', postController.getPostPages);

router.get('/top', postController.getTop);

router.get('/new', postController.getNew);



const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

// create post
router.post('/createpost', postController.getCreatePost);




router.post('/updatePost/:id', postController.getUpdatePost);

router.get('/delete/:id', postController.getDeletePost);




// create Comment

router.post('/createComment/:id/:postID', postController.getCreateComment);



// update comment
router.post('/comment/edit/:id/:postID', postController.getUpdateComment);

router.get('/comment/delete/:id/:author/:postID', postController.getDeleteComment);



router.get('/hello/aboutus', postController.getAboutUs);


router.get('/specposts/:id',checkAuthentication, postController.getSpecificPost);



passport.serializeUser(function(id, done) {
    done(null, id);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});


module.exports = router;

