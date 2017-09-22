module.exports = function (db, BSON, mailer) {
    return{
        statusUser: function (req, res) {       //Return User status from Session (Server Side)
            //Check if session exist
            if (!req.session.hasOwnProperty('logged') || !req.session.hasOwnProperty('user')) {
                return res.send({logged: false, user: null});
            }
            //Check if user logged
            if (req.session.logged == true) {
                db.collection('users', function (err, collecton) {
                    collecton.findOne({'_id': new BSON.ObjectID(req.session.user._id)}, {username: 1, email: 1, points: 1, favorites: 1, avatar_url: 1}, function (err, item) {
                        if (err) {
                            res.statusCode = 400;
                            return res.send({code: "E_7", message: "Internal Database Error."});
                        } else {
                            if (item) {
                               return res.send({logged: true, user: item})
                            } else {
                               return res.send({logged: false, user: null});
                            }
                        }
                    });
                });
            } else {
                return res.send({logged: false, user: null});
            }
        },
        //LOGIN USER
        loginUser: function (req, res) {

            //Check requiment params
            if (!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."});
            }

            //Check email format
            var re = /\S+@\S+\.\S+/;
            if (!re.test(req.body.email) || req.body.email.length < 5 || req.body.email > 64) {
                res.statusCode = 400;
                return res.send({code: "E_2", message: "Email format error."});
            }

            //Check password length
            if (req.body.password.length < 6 || req.body.password > 64) {
                res.statusCode = 400;
                return res.send({code: "E_4", message: "Password is too short."});
            }

            //Database Query Function
            db.collection('users', function (err, collection) {
                collection.findOne({'email': req.body.email}, {'_id': 1, 'username': 1, 'password': 1, 'points': 1, favorites: 1, avatar_url: 1}, function (err, item) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        if (!item) {
                            res.statusCode = 400;
                            return res.send({code: "E_8", message: "Incorrect Login"});
                        } else {
                            if(bcrypt.compareSync(req.body.password, item.password)){
                                delete item.password;
                                //Set session
                                req.session.logged = true;
                                req.session.user = {_id: item._id, username: item.username};
                                //Send response
                               return res.send(item);

                            } else {
                                res.statusCode = 400;
                                return res.send({code: "E_8", message: "Incorrect Password."});
                            }
                        }
                    }
                });
            });
        },
        logoutUser: function (req, res) {       //LOGOUT USER
            req.session.logged = false;
            req.session.user = null;
            return res.send('success')
        },
        postUser: function (req, res) {          //POST NEW USER
            //Check requiment params
            if (!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('reg_source')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."});
            }
            //Check email format
            var re = /\S+@\S+\.\S+/;
            if (!re.test(req.body.email) || req.body.email.length < 5 || req.body.email > 64) {
                res.statusCode = 400;
                return res.send({code: "E_2", message: "Email format error."});
            }
            //Check password length
            if (req.body.password.length < 6 || req.body.password > 64) {
                res.statusCode = 400;
                return res.send({code: "E_4", message: "Password is too short."});
            }
            //Check regsource
            if (req.body.reg_source != 1) {
                res.statusCode = 400;
                return res.send({code: "E_5", message: "Invalid Regsource."});
            }

            //Chek Email exist in database
            db.collection('users', function (err, collection) {
                collection.findOne({'email': req.body.email}, function (err, item) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        if (item) {
                            res.statusCode = 400;
                            return res.send({code: "E_6", message: "Email alredy exist in database."});
                        } else {
                            //Bulid User Object to Database
                            var user = {
                                email: req.body.email,
                                password: req.body.password,
                                reg_source: req.body.reg_source,
                                fb_id: 0,
                                reg_date: new Date().toJSON(),
                                avatar_url: '/img/default_user.png',
                                first_name: '',
                                last_name: '',
                                points: 0,
                                favorites: []
                            };

                            //Create Username
                            var email = user.email;
                            for (var i = 0; i < email.length; i++) {
                                if (email.charAt(i) === "@") {
                                    user.username = email.substring(0, i);
                                }
                            }

                            //Crypt password
                            var salt = bcrypt.genSaltSync(10);
                            user.password = bcrypt.hashSync(user.password, salt);

                            //Insert User Object to Database
                            db.collection('users', function (err, collection) {
                                collection.insert(user, {safe: true}, function (err, result) {
                                    if (err) {
                                        res.statusCode = 400;
                                        return res.send({code: "E_7", message: "Internal Database Error."});
                                    } else {
                                        //Set session
                                        req.session.logged = true;
                                        req.session.user = {username: result[0].username, _id: result[0]._id};
                                        //Send welcome email
                                        mailer.sendWelcome(user.email);
                                        return res.send({username: result[0].username, _id: result[0]._id, points: 0});
                                    }
                                });
                            });
                        }
                    }
                });
            });
        },
        //GET USER
        getUser: function (req, res) {
            //Get params
            try {
                var user_id = new BSON.ObjectID(req.params.user_id);
            } catch (ex) {
                res.statusCode = 400;
                return res.send({code: "E1", message: "Wrong User ID"});
            }

            //Database Query Function
            db.collection('users', function (err, collection) {
                collection.findOne({'_id': user_id}, {'password': 0, 'reg_source': 0, 'reg_date': 0}, function (err, item) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        return res.send(item);
                    }
                });
            });
        },
        getPointsHistory: function (req, res) {
            //Varibles
            var user_id = req.session.user._id;

            //Query to Database
            db.collection('points_history', function (err, collection) {
                collection.find({'user_id': user_id}).sort({'insert_date': -1}).toArray(function (err, items) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        return res.send(items);
                    }
                });
            });
        },
        //Send User
        updateUserProfile: function (req, res) {
            //Check requiment params
            if (!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('first_name') || !req.body.hasOwnProperty('last_name')) {
                res.statusCode = 400;
                return res.send({code: 0, message: "Params error."});
            }
            //Check username length
            if (req.body.username.length < 2 || req.body.username.length > 30) {
                res.statusCode = 400;
                return res.send({code: 1, message: "Username is too short."});
            }
            //Check first_name length
            if ((req.body.first_name.length < 2 || req.body.first_name.length > 30) && req.body.first_name!='') {
                res.statusCode = 400;
                return res.send({code: 2, message: "First Name is too short."});
            }
            //Check last_name length
            if ((req.body.last_name.length < 2 || req.body.last_name.length > 30) && req.body.last_name!='' ) {
                res.statusCode = 400;
                return res.send({code: 3, message: "Last Name is too short."});
            }
            //Check email format
            var re = /\S+@\S+\.\S+/;
            if (!re.test(req.body.email) || req.body.email.length < 5 || req.body.email.length > 64) {
                res.statusCode = 400;
                return res.send({code: 4, message: "Email format error."});
            }

            //Varibles
            user_id = new BSON.ObjectID(req.session.user._id);

            //Check Email Exist
            db.collection('users',function(err,collection){
                collection.findOne({'email':req.body.email},function(err,result){
                    if(err){
                        res.statusCode = 400;
                        return res.send({code: 10, message: "Internal Database Error."});
                    } else {
                        if(result && result._id!=req.session.user._id){
                            res.statusCode = 400;
                            return res.send({code: 5, message: "Email alredy exist"});
                        } else {
                            //Check username
                            collection.findOne({'username':req.body.username},function(err,result){
                                if(err){
                                    res.statusCode = 400;
                                    return res.send({code: 10, message: "Internal Database Error."});
                                } else {
                                    if(result && result.username!=req.session.user.username){
                                        res.statusCode = 400;
                                        return res.send({code: 6, message: "Username alredy exist"});
                                    } else {
                                        //Update profile
                                        var update={'$set':{
                                            username:req.body.username,
                                            email:req.body.email,
                                            first_name:req.body.first_name,
                                            last_name:req.body.last_name
                                        }};
                                        //Query
                                        collection.update({'_id':user_id},update,function(err,result){
                                            if(err){
                                                res.statusCode = 400;
                                                return res.send({code: 10, message: "Internal Database Error."});
                                            }else {
                                               return res.send('succes');
                                            }
                                        });
                                    }
                                }

                            });
                        }
                    }
                });
            });
        },
        updateUserPassword: function(req,res){
            //Check requiment params
            if (!req.body.hasOwnProperty('old') || !req.body.hasOwnProperty('new')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."});
            }


            //Check new password length
            if (req.body.new.length < 4 || req.body.new.length > 30) {
                res.statusCode = 400;
                return res.send({code: "E_4", message: "New password is too short."});
            }

            //Varibles
            user_id = new BSON.ObjectID(req.session.user._id);

            //Chek if password is valid for user
            db.collection('users',function(err,collection){
                collection.findOne({'_id':user_id},function(err,result){
                    if(err){
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    }else{
                        if(!bcrypt.compareSync(req.body.old, result.password) && result.password!=null){
                            res.statusCode = 400;
                            return res.send({code: "E_4", message: "Wrong old password"});
                        } else {
                            //Crypt password
                            var salt = bcrypt.genSaltSync(10);
                            var password= bcrypt.hashSync(req.body.new, salt);
                            collection.update({'_id':user_id},{'$set':{password:password}},function(err,result){
                                return res.send('success');
                            })
                        }

                    }
                })
            })

        }

    }
}