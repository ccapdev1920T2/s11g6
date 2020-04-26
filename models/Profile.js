const mongoose = require('mongoose');
const ProfileSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    description: {
        type: String
    },
    number_of_post_created: {
        type: Number,
        default: 0
    },
    number_of_comments_made: {
        type: Number,
        default: 0
    },
    date_join:{
        type: Date,
        default: Date.now
    },
    profilePic: {
        type: String,
        default: "/img/unknown.png"
    },
    url:{
        type: String
    }
    
    
    
    
    
    
    
    
    
    
});



module.exports = mongoose.model('Profile', ProfileSchema);

