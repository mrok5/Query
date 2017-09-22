//Inicialize ExpressJS module
var express = require('express'),
    fs = require("fs"),
    mongoStore = require('connect-mongo')(express),
    mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure,
    nodemailer = require("nodemailer");
    passport = require('passport')
    FacebookStrategy = require('passport-facebook').Strategy;
    bcrypt = require('bcrypt');

//Inicialize APP
var app = express();


//Remote dbStr
//var dbStr={server:'ds045978.mongolab.com',port:45978,database:'nodejitsu_norbertpisz_nodejitsudb8125817934',username:'nodejitsu_norbertpisz',password:'5g1h7volk25b57rqvdbc9kd0n1'};
//Local dbStr
var dbStr = {server: 'localhost', port: 27017, database: 'queryedb', username: '', password: ''};

//Connect to Database
var server = new Server(dbStr.server, dbStr.port, {auto_reconnect: true});
db = new Db(dbStr.database, server);
db.open(function (err, db) {
    if (!err) {
        db.authenticate(dbStr.username, dbStr.password, function (err2, data2) {
            if (!err2) {
                console.log("Database opened")
            } else {
                console.log('Authenticate to Database Error');
            }
        });
    } else {
        console.log('Connect to Database Error');
    }
});


//App Configuration
app.configure(function () {
    app.use(express.logger('dev'));
    /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    /* Include body parser module */
    app.use(express.cookieParser('querye'));
    /* Include coookie parser module */
    app.use(express.session({
        secret: 'SECRET',
        cookie: {
            maxAge: 100000000,             // expire the session(-cookie) after 10 seconds
            httpOnly: false
        },
        store: new mongoStore({
            //url: '',
            db: dbStr.database,
            host: dbStr.server,
            port: dbStr.port,
            username: dbStr.username,
            password: dbStr.password,
            auto_reconnect: true
            // see https://github.com/kcbanner/connect-mongo#options for more options
        })
    }));
    app.use(passport.initialize());   // passport initialize middleware
    app.use(passport.session());      // passport session middleware
});

//Mailer Functions
var mailer = require('./api/mailer/mailer.js')(nodemailer);
//Auth Functions
var auth = require('./api/auth/auth.js')();
//Helpers
var points = require('./api/helpers/points.js')(db, BSON);
var notifier = require('./api/helpers/notifier.js')();

//Facebook Auth
passport.use(new FacebookStrategy({
        clientID: 207092702788908,
        clientSecret: '4d11893278209c05a96ba6761a7a09c0',
        callbackURL: "http://querye.com/auth/facebook/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        //Check if profileID exist in database
        db.collection('users', function (err, collection) {
            collection.findOne({'fb_id': profile.id}, function (err, result) {
                if (err) {
                    return done(null,false);
                } else {
                    if (result) { //profileID exist in database
                        return done(null,{_id:result._id,username:result.username});
                    } else {//profileID exist in database, user not registered by facebook
                        //Bulid User Object to Database
                        var user = {
                            email: null,
                            password: null,
                            username: profile.displayName,
                            reg_source: 'fb',
                            fb_id: profile.id,
                            reg_date: new Date().toJSON(),
                            avatar_url: '/img/default_user.png',
                            first_name: profile._json.first_name,
                            last_name: profile._json.last_name,
                            points: 0,
                            favorites: []
                        };
                        //Get email if exist
                        if(profile.emails[0])
                            user.email=emails[0];

                        //Insert User Object to Database
                        db.collection('users', function (err, collection) {
                            collection.insert(user, {safe: true}, function (err, result) {
                                if (err) {
                                    return done(null,false);
                                } else {
                                    return done(null,{_id:result._id,username:result.username});
                                }
                            });
                        });
                    }
                }
            });
        });
    }
));

//Declare Static folder for js and css files
app.use(express.static(__dirname + '/app'));


//Requrie routes files
var queryes = require('./api/routes/queryes')(db, BSON, mailer, points, notifier);
var users = require('./api/routes/users')(db, BSON,mailer);
var votes = require('./api/routes/votes')(db, BSON, points);
var questions = require('./api/routes/questions2')(db, BSON);
var answers = require('./api/routes/answers')(db, BSON);
var favorites = require('./api/routes/favorites')(db, BSON);
var game=require('./api/routes/game')(db,BSON);

//Facebook Auth routes
app.get('/auth/facebook', function(req,res,next){
    passport.authenticate('facebook')(req, res, next);
    return;
});
app.get('/auth/facebook/callback',function(req,res,next){
        passport.authenticate('facebook',function(err,user,info){
            if(user){
                //Set session
                req.session.logged = true;
                req.session.user = {username: user.username, _id: user._id};
                res.redirect('/');
            }else{
                res.redirect('/');
            }
        })(req, res, next);
});

//-----------------------------API-----------------------------///
//Login API
app.post('/api/users', users.postUser);  //Register new User
app.post('/api/users/login', users.loginUser); //Login User
app.post('/api/users/logout', auth.isUserLogged, users.logoutUser); //Logout User
app.get('/api/users/status', users.statusUser); //Get User Session status (logged or not logged)
app.get('/api/users/:user_id', users.getUser); //Returns user data
app.get('/api/user/pointshistory', auth.isUserLogged, users.getPointsHistory); //Get Points history for user
app.put('/api/users/profile/:user_id', users.updateUserProfile); //Update user profile
app.put('/api/users/password/:user_id', users.updateUserPassword); //Update user password

//Quyeryes API 
app.get('/api/queryes/:type/:sort/:skip', queryes.findAll);  //Get all queryes for start page
app.get('/api/queryes/:id', queryes.findById); //Get single querye by id
app.post('/api/queryes', auth.isUserLogged, queryes.addQuerye);   //Insert new querye
app.put('/api/queryes/:id', auth.isUserLogged, queryes.updateQuerye); //Update single querye
app.get('/api/users/:user_id/queryes', queryes.findUserQueryes); //Show all user Queryes
app.delete('/api/users/:user_id/queryes/:id', auth.isUserLogged, queryes.deleteUserQuerye); //Delete user Querye
app.get('/api/users/:user_id/queryes_del', auth.isUserLogged, queryes.deletedQueryes); //Show all deleted Queryes
app.put('/api/queryes/:id/questions', auth.isUserLogged, queryes.sendQuestion); //edit Question


//Questions API
app.get('/api/questions/:id/:type/:skip', questions.getQuestions); //Get Questions for Querye
app.post('/api/queryes/:id/questions', auth.isUserLogged, questions.postQuestion); //Insert New Question
app.get('/api/user/questions/:type', auth.isUserLogged, questions.getUserQuestions); //Shows the last user Questions
app.post('/api/questions/:q_id/spam', auth.isUserLogged, questions.postQuestionToSpam); //Insert Question to spam
app.delete('/api/questions/:q_id/spam', auth.isUserLogged, questions.deleteQuestionFromSpam); //Delete Question from spam
app.delete('/api/questions/:q_id', auth.isUserLogged, questions.deleteUserQuestion); //Delete user Question
app.put('/api/queryes/:id/questions', auth.isUserLogged, questions.editQuestion); //edit Question


//Answers
app.post('/api/queryes/:id/questions/:q_id/answer', auth.isUserLogged, answers.postAnswer); //Insert New Answer
app.get('/api/users/answers/:type', auth.isUserLogged, answers.getUserAnswers);	//Show last answers for user Questions
app.put('/api/users/answers/:id', auth.isUserLogged, answers.editQuestion); //edit Question


//Votes API
app.post('/api/queryes/:id/votes/:type', auth.isUserLogged, votes.postQueryeVote);  // Insert vote for Querye
app.post('/api/queryes/:id/questions/:question_id/votes/:type', auth.isUserLogged, votes.postQuestionVote); //Insert Vote for Question
//app.post('/api/queryes/:id/questions/:question_id/answer/votes/:type',queryes.postAnswerVote); //Insert Vote for Question

//Favorites API
app.post('/api/users/favorites', auth.isUserLogged, favorites.postUserFavorite);   //Add Querye to user favorties list
app.delete('/api/users/favorites', auth.isUserLogged, favorites.deleteUserFavorite); //Delete Querye from favorites list
app.get('/api/users/:user_id/favorites', favorites.getUserFavorites);

//Game api
app.get('/gameapi/score/:username/:points',game.postScore);
app.get('/gameapi/scores',game.getScores);
app.get('/gameapi/:user/scores',game.getUserScores);

//Server Port
app.listen(80);