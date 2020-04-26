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



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


const postController = {

    getMain: async function (req, res) {
        var passedVariable = req.session.valid;
    req.session.valid = null;
    var username = "summoners";
    const limit = req.query.limit ? parseInt(req.query.limit): 10;
    const page = req.query.page ? parseInt(req.query.page): 1;

    if(req.isAuthenticated()){
        username = req.user.username
    }

   // console.log("req.user.email " +req.user.email);
    console.log("req.isAuthenticated() " + req.isAuthenticated());
    var resultArray = [];
    var isSearch = false;
    
    await mongoose.connect(url,
        { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        },async function(err,db){
        assert.equal(null, err);
        if(req.query.search){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            var cursor = await db.collection('posts').find({
                $or:[
                    {topic: regex},
                    {author: regex},
                    {domain: regex}
                ]
            })
                .skip((page - 1) * limit)
                .limit(limit);
            cursor.forEach(function(doc, err){
                assert.equal(null, err);
                resultArray.push(doc);
            },function(){
                if(err){
                    console.log(err);
                }
                else{
                    if(resultArray.length < 1){
                        isSearch = true;
                    }
                    res.render('index', {thread:resultArray, noMatch: isSearch, uname: username});
                    
                    
                }
            });
        } else{
            var cursor = db.collection('posts').find().skip((page - 1) * limit).limit(limit);
            cursor.forEach(function(doc, err){
                assert.equal(null, err);
                resultArray.push(doc);
            }, function(){
                res.render('index', {thread: resultArray, noMatch: isSearch, uname: username});
            });
        }
    });

    },

    getPostPages: async function (req, res) {
        var passedVariable = req.session.valid;
        req.session.valid = null;
        var username = "summoners";
        const limit = req.query.limit ? parseInt(req.query.limit): 10;
        const page = req.query.page ? parseInt(req.query.page): 1;
    
        if(req.isAuthenticated()){
            username = req.user.username
        }
    
       // console.log("req.user.email " +req.user.email);
        console.log("req.isAuthenticated() " + req.isAuthenticated());
        var resultArray = [];
        var isSearch = false;
        
        await mongoose.connect(url,
            { 
                useNewUrlParser: true,
                useUnifiedTopology: true
            },async function(err,db){
            assert.equal(null, err);
            if(req.query.search){
                const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                var cursor = await db.collection('posts').find({
                    $or:[
                        {topic: regex},
                        {author: regex},
                        {domain: regex}
                    ]
                })
                    .skip((page - 1) * limit)
                    .limit(limit);
                cursor.forEach(function(doc, err){
                    assert.equal(null, err);
                    resultArray.push(doc);
                },function(){
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(resultArray.length < 1){
                            isSearch = true;
                        }
                        res.render('index', {thread:resultArray, noMatch: isSearch, uname: username});
                        
                        
                    }
                });
            } else{
                var cursor = db.collection('posts').find().skip((page - 1) * limit).limit(limit);
                cursor.forEach(function(doc, err){
                    assert.equal(null, err);
                    resultArray.push(doc);
                }, function(){
                    res.render('index', {thread: resultArray, noMatch: isSearch, uname: username});
                });
            }
        });
       
    },
    getCreatePost: async function (req, res) {
        const email = req.user.email;
        var numberPost;
        var createdID;

        
        //update number of posts
        await mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
        async function(err, db) {
            if (err) throw err;
            assert.equal(null, err);
            var cursor = await db.collection('profiles').find({'email': email});
            cursor.forEach(async function(doc, err){
                assert.equal(null, err);
                numberPost =  doc.number_of_post_created;

                numberPost+=1;

                var myquery = { email: email};
                    var newvalues = { $set: {number_of_post_created:numberPost} };
                    await db.collection("profiles").updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                    });

            }, function(){
            
    
            });

      });

    
        //getting the data from post
        const post = new Post({
            domain: req.body.addtag,
            topic: req.body.topic,
            description: req.body.description,
            author: req.user.username
        });

        await  mongoose.connect(url,
            { 
                useNewUrlParser: true,
                useUnifiedTopology: true
            },async function(err, db){
                assert.equal(null, err);
                await  db.collection('posts').insertOne(post, function(err,result){

                    createdID = result.insertedId;

                assert.equal(null, err);
           
                res.redirect("/specposts/"+createdID)
            });
        });
    },

    getTop:async function (req, res) {
        var resultArray = [];
        var username = "summoners";
        const limit = req.query.limit ? parseInt(req.query.limit): 10;
        const page = req.query.page ? parseInt(req.query.page): 1;
    
        if(req.isAuthenticated()){
            username = req.user.username
        }
        await mongoose.connect(url,
            { 
                useNewUrlParser: true,
                useUnifiedTopology: true
            },async function(err,db){
            var sort = { number_of_comments: -1 };  
            assert.equal(null, err);
            var cursor = await db.collection('posts').find().sort(sort).skip((page - 1) * limit).limit(limit);
            cursor.forEach(function(doc, err){
                assert.equal(null, err);
                resultArray.push(doc);
            }, function(){
                res.render('index', {thread: resultArray,  uname:username});
            });
        });
    },
    getNew: async function (req, res) {
        var resultArray = [];
        var username = "summoners";
        const limit = req.query.limit ? parseInt(req.query.limit): 10;
        const page = req.query.page ? parseInt(req.query.page): 1;

        if(req.isAuthenticated()){
            username = req.user.username
        }
        mongoose.connect(url,
            { 
                useNewUrlParser: true,
                useUnifiedTopology: true
            },async function(err,db){
            var sort = { date_created: -1 };
            assert.equal(null, err);
            var cursor = await db.collection('posts').find().sort(sort).skip((page - 1) * limit).limit(limit);
            cursor.forEach(function(doc, err){
                assert.equal(null, err);
                resultArray.push(doc);
            }, function(){
                res.render('index', {thread: resultArray,  uname:username});
            });
        });
    },

    getUpdatePost:async function (req, res) {
        var emailSearch = req.user.email;
        const id = req.params.id;
        console.log("update id " + id);
    
    
    
        mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
            function(err, db) {
            if (err) throw err;
            var myquery = { _id: ObjectId(id)};
            var newvalues = { $set: {description:req.body.edit_post} };
            db.collection("posts").updateOne(myquery, newvalues, function(err, res) {
              if (err) throw err;
              console.log("1 document updated");
            });
            res.redirect('/specposts/'+id);
          });
      
    },
    getDeletePost:async function (req, res) {
        var postID = req.params.id;

        const email = req.user.email;
        var numberPost;
    
        
        //update number of posts
        await mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
           async function(err, db) {
            if (err) throw err;
            assert.equal(null, err);
            var cursor = await db.collection('profiles').find({'email': email});
            cursor.forEach(async function(doc, err){
                assert.equal(null, err);
                numberPost =  doc.number_of_post_created;
    
                numberPost-=1;
    
                var myquery = { email: email};
                    var newvalues = { $set: {number_of_post_created:numberPost} };
                    await  db.collection("profiles").updateOne(myquery, newvalues, function(err, res) {
                      if (err) throw err;
                      console.log("1 document updated");
                    });
    
            }, function(){
               
               
      
            });
    
     });
    
    
    
      await mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
           async function(err, db) {
            if (err) throw err;
            var myquery = { _id: ObjectId(postID)};
            await  db.collection("posts").deleteOne(myquery, function(err, res) {
              if (err) throw err;
              console.log("Post Deleted");
             
    
                   
            });
            res.render('sucdelete',{
            })
    
          });
    
    },

    getCreateComment:async function (req, res) {
        const email = req.user.email;
        var numberComments;
        var id = req.params.id;
        var postID = req.params.postID

        var numberCommentsPost;

console.log("create comment post ID " + postID) ;
   //update number of posts
     mongoose.connect(url, 
        {  useNewUrlParser: true, 
        useUnifiedTopology: true },
        
      async  function(err, db) {
        if (err) throw err;
        assert.equal(null, err);
        var cursor = await db.collection('profiles').find({'email': email});
        cursor.forEach(async function(doc, err){
            assert.equal(null, err);
            numberComments =  doc.number_of_comments_made;

            numberComments+=1;

            var myquery = { email: email};
                var newvalues = { $set: {number_of_comments_made:numberComments} };
                await  db.collection("profiles").updateOne(myquery, newvalues, function(err, res) {
                  if (err) throw err;
                  console.log("1 document updated");
                });

        }, async function(){
           
  
        });

      });

      //getting the data from post
      const comment = new Comment({
        author: req.user.username,
        postID: ObjectId(id),
        description: req.body.comment_post
    });
    console.log("test " + req.body.comment_post);


    await mongoose.connect(url,
        { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, async function(err, db){
            assert.equal(null, err);
            await  db.collection('comments').insertOne(comment, async function(err,result){
            assert.equal(null, err);
            console.log('Successful Comment');
            
        });
    });

         //update number of comments in post
         await mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
           async function(err, db) {
            if (err) throw err;
            assert.equal(null, err);
            var cursor = await db.collection('posts').find({'_id': ObjectId(id)});
            cursor.forEach(async function(doc, err){
                assert.equal(null, err);
                numberCommentsPost =  doc.number_of_comments;
    
                numberCommentsPost+=1;
    
                var myquery = { _id: ObjectId(id)};
                    var newvalues = { $set: {number_of_comments:numberCommentsPost} };
                    await  db.collection("posts").updateOne(myquery, newvalues, function(err, res) {
                      if (err) throw err;
                      console.log("Number of comments in Post updated");
                    });
    
            }, function(){
               
                res.redirect('/specposts/'+postID);
            });
            
    
     });


    },

    getUpdateComment:async function (req, res) {
        const id = req.params.id;
        var postID = req.params.postID
    
        console.log("update comment id " + id);
    
    
        mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
            function(err, db) {
            if (err) throw err;
            var myquery = { _id: ObjectId(id)};
            var newvalues = { $set: {description:req.body.edit_comment} };
            db.collection("comments").updateOne(myquery, newvalues, function(err, res) {
              if (err) throw err;
              console.log("1 document updated");
            });
            res.redirect('/specposts/'+postID);
          });
     
    },
    getDeleteComment:async function (req, res) {
        var commentID = req.params.id;
        var author = req.params.author;
        var postID = req.params.postID;



        var numberComments;

        var numberCommentsPost;
        
        
        //update number of comments
        await mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
        async function(err, db) {
            if (err) throw err;
            assert.equal(null, err);
            var cursor = await db.collection('profiles').find({'username': author});
            cursor.forEach(async function(doc, err){
                assert.equal(null, err);
                numberComments =  doc.number_of_comments_made;

                numberComments-=1;

                var myquery = { username: author};
                    var newvalues = { $set: {number_of_comments_made:numberComments} };
                    await  db.collection("profiles").updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    console.log("Number of comments made reduced");
                    });

            }, function(){
            
                res.redirect('/specposts/'+postID);
            });
            

    });

        //update number of comments in post
        await mongoose.connect(url, 
            {  useNewUrlParser: true, 
            useUnifiedTopology: true },
            
        async function(err, db) {
            if (err) throw err;
            assert.equal(null, err);
            var cursor = await db.collection('posts').find({'_id': ObjectId(postID)});
            cursor.forEach(async function(doc, err){
                assert.equal(null, err);
                numberCommentsPost =  doc.number_of_comments;

                numberCommentsPost-=1;

                var myquery = { _id: ObjectId(postID)};
                    var newvalues = { $set: {number_of_comments:numberCommentsPost} };
                    await  db.collection("posts").updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    console.log("Number of comments in Post updated");
                    });

            }, function(){
            
    
            });

        });



        await mongoose.connect(url, 
                {  useNewUrlParser: true, 
                useUnifiedTopology: true },
                
            async function(err, db) {
                if (err) throw err;
                var myquery = { _id: ObjectId(commentID)};
                await  db.collection("comments").deleteOne(myquery, function(err, res) {
                if (err) throw err;
                console.log("Post Deleted");
                    
                });
                res.redirect('/'); 

            });
       
    },
    getAboutUs:async function (req, res) {
        res.render('aboutus',{
        
        })
       
    },
    getSpecificPost:async function (req, res) {
        
    var resultArray = [];
    var comments = [];
    
    const id = req.params.id;

    const v1 = req.user.username;

    var compareUsers;
    

    var v2;
    await mongoose.connect(url,
        { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        },async function(err,db){
        assert.equal(null, err);
        var cursor = await db.collection('posts').find({'_id': ObjectId(id)});
        var cursor2 = await db.collection('comments').find({'postID': id});
        cursor.forEach(function(doc, err){
            assert.equal(null, err);
            v2 =  doc.author;

            resultArray.push(doc);
        }, function(){
            cursor2.forEach(function(doc2, err){
                assert.equal(null, err);
                comments.push(doc2);
            }, function(){
                console.log("v1 " + v1);
                console.log("v2 " + v2);
                if(v1 == v2){
                    compareUsers = true;
                }
                else
                compareUsers = false;
    
                console.log("compare user " + compareUsers);


                res.render('specposts', {
                    thread: resultArray, 
                    comment:comments , 
                    compUsers : compareUsers,
                    currentUser : v1,
                    postID : id

                });
            });
           
        });
    });
       
    }



    

    

}

module.exports = postController;
