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

//DB Config
const db =require('../config/database').database;

//User Model
const User = require('../models/Profile');


//connect to mongo
mongoose.connect(db,{useNewUrlParser: true,useUnifiedTopology: true })
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));







router.use(require('connect-flash')());
// router.use(function(req, res, next){
//     res.locals.messages = require('express-messages')(req,res);
//     next();

// });

//Global Vars
router.use((req,res,next) => {
    res.locals.succes_msg = req.flash('success_msg');
    res.locals.error = req.flash('error_msg');
    next();

});



router.get('/logreg',function(req,res){

    res.render('login',{
        
    });
});

router.post('/insert', function(req,res, next) {
    //getting the data from post

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

    
});

//Passport Config
router.use(flash());
require('../config/passport')(passport);

//For dynamic Nav Bar
router.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});


router.get('/logout', function (req, res){
    req.session.destroy(function (err) {
      res.redirect('/posts');
    });
});

passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});


//express session middleware as of Mar 23 based on Chris Courses set to false daw yung dalawa
//eto yung gumagawa ng session
router.use(session({
    secret: 'fsfdfghgfhdfgbfb',
    resave:false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection,
        ttl: 2 * 24 * 60 * 60
            })

    //cookie: {secure: true}
}));

// Passport Middleware
router.use(passport.initialize());
router.use(passport.session());

router.post('/logcheck', passport.authenticate('local', {
    successRedirect : '/posts',
    failureRedirect : '/login/logreg',
    failureFlash : true
}));


// Update a post
// router.patch('/:postId', async (req, res)=>{
//     try{
//         const updatePost = await Post.updateOne(
//             {_id: req.params.postId},
//             {$set:{date: req.body.date}   }
//         );
//         res.json(updatePost);
//     }
//     catch(err){
//         res.json({message: err});
//     }
    
// });

module.exports = router;