const express = require('express');
const router = express.Router();
const passport = require('passport');


//MVC
// import module `signupController` from `../controllers/signupController.js` This is for Login and Signup
const profileController = require('../controllers/profileController.js');


//Passport Config
require('../config/passport')(passport);


//For dynamic Nav Bar
router.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});
//getting the value of body
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



//route to view profile

router.get('/status', profileController.getProfile);


//View A user na pwedeng hindi same sa naka login
router.get('/status/:id', profileController.getProfileSpecific);


router.post('/update', upload.single('editimageprof'),profileController.getProfileUpdate);




passport.serializeUser((user_id, done) =>{
    done(null, user_id);
  });
  
passport.deserializeUser((user_id, done) =>{

        done(err, user_id);
  
});

module.exports = router;