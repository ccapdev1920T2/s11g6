const mongoose = require('mongoose');
const CommentSchema = mongoose.Schema({
    

    author: {
        type: String,
    },
    postID: {
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    
    date_created:{
        type: Date,
        default: Date.now
    },
    url: {
        type: Number
    }
});


module.exports = mongoose.model('Comments', CommentSchema);

