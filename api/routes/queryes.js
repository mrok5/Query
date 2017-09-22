module.exports = function (db, BSON, mailer, points, notifier) {
    return{
        findById: function (req, res) {
            //Check if Querye ID is a correct ObjectID
            try {
                var querye_id = new BSON.ObjectID(req.params.id);
            } catch (ex) {
                res.statusCode=400;
                return res.send({code: "E1", message: "Wrong Querye ID"});
            }
            //Get Params
            var querye = {};
            var logged = false;
            var fields = {};
            var query = {'querye_id': req.params.id};

            //Check if user is logged
            if (req.session.hasOwnProperty('logged')) {
                if (req.session.logged == true)
                    logged = true;
            }

            //Get Single Querye
            db.collection('queryes', function (err, collection) {
                collection.findOne({'_id': querye_id}, function (err, item) {
                    //Datbase error
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal server errror."});
                    } else {
                        //Check who can see the querye
                        if (item.settings.p_view == 0) { //0 - when nobody can see
                            return res.send({access: false, type: 0});
                        } else if (item.settings.p_view == 1 && logged == false) { //1 - only registered
                            return res.send({access: false, type: 1});
                        } else {//2 - everyone can see
                            querye = item;
                            //Check who can see questions
                            if (item.settings.p_view_questions == 0 || (item.settings.p_view_questions == 1 && logged == false)) {
                                return res.send(querye);
                            } else {
                                //Check who can see answers
                                if (item.settings.p_view_answers == 0 || (item.settings.p_view_answers == 1 && logged == false)) {
                                    fields = {'answer': 0};
                                }
                                //Check if question can be publih whith no answer
                                if (item.settings.p_questions_publish == 0) {
                                    query.answer = {'$exists': true };
                                }
                                //Get Questions and Answers
                                db.collection('questions', function (err, collection) {
                                    collection.find(query, fields).sort({insert_date: -1}).limit(20).toArray(function (err, items) {
                                        querye.questions = items;
                                        //Check if user profile can be display
                                        if (querye.settings.p_view_user == 0 || (querye.settings.p_view_user == 1 && logged == false)) { //0 - nobody can see user
                                            return res.send(querye);
                                        } else { //2 - anyone
                                            //Get user Info
                                            db.collection('users', function (err, collection) {
                                                collection.findOne({'_id': new BSON.ObjectID(querye.user_id)},{password:0}, function (err, item) {
                                                    querye.user = item;
                                                    return res.send(querye);
                                                })
                                            });
                                        }
                                    });
                                });
                            }
                        }
                    }
                });
            });
        },
        findAll: function (req, res) {
            //Check type parameter
            if (!req.params.hasOwnProperty('type')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."})
            }
            //Check sort parameter
            if (!req.params.hasOwnProperty('sort')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."})
            }

            var sort = {};
            var query = {};
            var skip = 0;
            var limit = 20;

            //Take skip value
            skip = parseInt(req.params.skip);


            //View settings
            if (req.session.logged == true) {
                query = {'settings.p_view': {'$ne': '0'}};
            } else {
                query = {'settings.p_view': '2'};
            }

            //Switch Sort type
            switch (req.params.sort) {
                case 'newst':
                    sort = {insert_date: -1};
                    break;
                case 'oldst':
                    sort = {insert_date: 1};
                    break;
                case 'best':
                    sort = {up_votes_count: -1};
                    break;
                case 'worst':
                    sort = {down_votes_count: -1};
                    break;
                default:
                    var sort = {};
                    break;
            }

            //Check if type exist
            if (req.params.type != '0') {
                query.type = req.params.type;
            }

            //Database Query
            db.collection('queryes', function (err, collection) {
                collection.find(query).sort(sort).skip(skip).limit(limit).toArray(function (err, items) {
                    return res.send(items);
                });
            });
        },
        findUserQueryes: function (req, res) {
            //Check Params
            if (!req.params.hasOwnProperty('user_id')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."})
            }

            //Check user exist
            var u_id = new BSON.ObjectID(req.params.user_id);   //TODO dodać try catch
            db.collection('users', function (err, collection) {
                collection.findOne({'_id': u_id}, function (err, item) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal server errror."});
                    } else {
                        if (!item) {
                            res.statusCode = 400;
                            return res.send({code: "E_6", message: "UserID doesn't exist in database."});
                        } else {
                            db.collection('queryes', function (err, collection) {
                                collection.find({'user_id': req.params.user_id}).toArray(function (err, items) {
                                    return res.send(items);
                                });
                            });
                        }
                    }
                });
            });
        },
        addQuerye: function (req, res) {

            //Check requiment params
            if (!req.body.hasOwnProperty('user_id') || !req.body.hasOwnProperty('title') || !req.body.hasOwnProperty('descr')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."})
            }
            //Check title length
            if (req.body.title.length < 6) {
                res.statusCode = 400;
                return res.send({code: "E_2", message: "Tittle too short."})
            }
            //Check description length
            if (req.body.descr.length < 10) {
                res.statusCode = 400;
                return res.send({code: "E_2", message: "Description too short."})
            }
            //Varibles
            var logged = false;

            //Check if user is logged
            if (req.session.hasOwnProperty('logged')) {
                if (req.session.logged == true)
                    logged = true;
            }
            //Create Querye if user logged
            if (logged == true) {
                //Querye object
                var querye = {
                    user_id: req.session.user._id,
                    title: req.body.title,
                    descr: req.body.descr,
                    type: req.body.type,
                    insert_date: new Date().toJSON(),
                    questions_count: 0,
                    up_votes_count: 0,
                    down_votes_count: 0,
                    up_voters: [],
                    down_voters: [],
                    settings: {
                        p_view: req.body.p_view,
                        p_view_questions: req.body.p_view_questions,
                        p_view_answers: req.body.p_view_answers,
                        p_questions: req.body.p_questions,
                        p_questions_publish: req.body.p_questions_publish,
                        p_view_user: req.body.p_view_user
                    }
                };

                //Insert Querye to Database
                db.collection('queryes', function (err, collection) {
                    collection.insert(querye, {safe: true}, function (err, result) {
                        if (err) {
                            res.statusCode = 400;
                            return res.send({code: "E_7", message: "Internal Database Error."});
                        } else {
                            //Add User Points
                            points.addUserPoints(0, querye.user_id, result._id);
                            return res.send(result[0]);
                        }
                    });
                });

            } else {
                res.statusCode = 400;
                return res.send({code: "E_2", message: "User not Logged."});
            }
        },
        updateQuerye: function (req, res) {
            var id = req.params.id;
            var update = {'$set': {
                title: req.body.title,
                descr: req.body.descr,
                type: req.body.type,
                "settings.p_view": req.body.p_view,
                "settings.p_view_answers": req.body.p_view_answers,
                "settings.p_view_questions": req.body.p_view_questions,
                "settings.p_view_user": req.body.p_view_user,
                "settings.p_questions": req.body.p_questions,
                "settings.p_question_publish": req.body.p_questions_publish
            }};

            db.collection('queryes', function (err, collection) {
                collection.update({'_id': new BSON.ObjectID(id)}, update, {safe: true}, function (err, result) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        return res.send('success');
                    }
                });
            });
        },
        //Edit Question
        sendQuestion: function (req, res) {
            //Varibles
            querye2_id = req.params.id;
            //Update Question
            db.collection('questions', function (err, collection) {
                collection.update({'querye_id': querye2_id}, {'$set': {body: "queryes2"}}, function (err, result) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        console.log(question_id);
                        return res.send('success');
                    }
                });
            });
        },
//DELETE QUERYE
        deleteUserQuerye: function (req, res) {
            res.header('Access-Control-Allow-Origin', "*");
            user_id = req.params.user_id;
            querye_id = req.params.id;
            var querye = {};

            //Get Single Querye
            db.collection('queryes', function (err, collection) {
                collection.findOne({'_id': new BSON.ObjectID(querye_id)}, function (err, item) {
                    //Datbase error
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal server errror."});
                    } else {
                        querye = item;
                        //Insert Querye to Database
                        db.collection('queryes_del', function (err, collection) {
                            collection.insert(querye, {safe: true}, function (err, result) {
                                if (err) {
                                    res.statusCode = 400;
                                    return res.send({code: "E_7", message: "Internal Database Error."});
                                } else {
                                    console.log('Success: ' + JSON.stringify(result[0]));
                                    return res.send(result[0]);
                                }
                            });
                        });
                    }
                });
            });


            db.collection('queryes', function (err, collection) {
                collection.remove({'_id': new BSON.ObjectID(querye_id)}, {safe: true}, function (err, result) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        return res.send(req.body);
                    }
                });
            });

        },
        //show deleted queryes
        deletedQueryes: function (req, res) {
            db.collection('queryes_del', function (err, collection) {
                collection.find({'user_id': req.params.user_id}).toArray(function (err, items) {
                    return res.send(items);
                });
            });
        }
    }


}




