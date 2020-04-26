const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


//MVC
// import module `signupController` from `../controllers/signupController.js` This is for Login and Signup
const signupController = require('../controllers/signupController.js');


//passport config
require('../config/passport')(passport);

//DB Config
const db =require('../config/database').database;



//connect to mongo
mongoose.connect(db,{useNewUrlParser: true,useUnifiedTopology: true })
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));


router.use(require('connect-flash')());


//Global Vars
router.use((req,res,next) => {
    res.locals.succes_msg = req.flash('success_msg');
    res.locals.error = req.flash('error_msg');
    next();

});


router.get('/logreg', signupController.getSignUp);


router.post('/insert', signupController.postSignUp);



//Passport Config
router.use(flash());

//For dynamic Nav Bar
router.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

router.get('/logout', signupController.getLogout);





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

router.post('/logcheck', signupController.getLogin);



passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});



module.exports = router;