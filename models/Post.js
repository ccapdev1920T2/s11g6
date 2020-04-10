const mongoose = require('mongoose');
const PostSchema = mongoose.Schema({
    
    domain: {
        type: String
    },
    author: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    comments: {
        type: Array
    },
    
    date_created:{
        type: Date,
        default: Date.now
    },
    number_of_comments: {
        type: Number,
        default: 0
    },
    url: {
        type: Number
    }
});


// const UserSchema = mongoose.Schema({
//     username: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     }
// });


module.exports = mongoose.model('Posts', PostSchema);

