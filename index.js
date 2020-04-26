const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const moment = require('moment');
const hbs = require('handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const port = 3000;

const url = 'mongodb://test:test1@cluster0-shard-00-00-mglss.azure.mongodb.net:27017,cluster0-shard-00-01-mglss.azure.mongodb.net:27017,cluster0-shard-00-02-mglss.azure.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';


const passport = require('passport');
const session = require('express-session');


//For dynamic Nav Bar
app.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

const { ensureAuthenticated } = require('./config/auth');

require('dotenv/config');

//Middle use for body parser for postman app
app.use(bodyParser.json());
//express validator Middleware Mar 23
app.use(expressValidator());

app.engine( 'hbs', exphbs({
    extname: 'hbs', // configures the extension name to be .hbs instead of .handlebars
    defaultView: 'main', // this is the default value but you may change it to whatever you'd like
    layoutsDir: path.join(__dirname, '/views/layouts'), // Layouts folder
    partialsDir: path.join(__dirname, '/views/partials'), // Partials folder
}));

hbs.registerHelper('formatdate', function(text){ 
    var date = moment(new Date((text)));
    return date.format("MM/DD/YYYY");
});

hbs.registerHelper( "when",function(operand_1, operator, operand_2, options) {
    var operators = {
     'eq': function(l,r) { return l == r; },
     'noteq': function(l,r) { return l != r; },
     'gt': function(l,r) { return Number(l) > Number(r); },
     'or': function(l,r) { return l || r; },
     'and': function(l,r) { return l && r; },
     '%': function(l,r) { return (l % r) === 0; }
    }
    , result = operators[operator](operand_1,operand_2);
  
    if (result) return options.fn(this);
    else  return options.inverse(this);
  });

hbs.registerHelper("setVar", function(varName, varValue, options) {
    options.data.root[varName] = varValue;
});


app.set('view engine', 'hbs');


//Import Routes
const postsRoute = require('./routes/posts');
app.use('/',postsRoute);

const profileRoute = require('./routes/profile');
app.use('/profile',profileRoute);

const loginRoute = require('./routes/login');
app.use('/login',loginRoute);

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/login/logreg");
    }
}



app.use(express.static(__dirname + '/public'));

//connect to DB
mongoose.connect(
    url,

    { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
     () =>{console.log('connected to DB!');
});


app.listen(port, function() {
    console.log('App listening at port '  + port)
});

