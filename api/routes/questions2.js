module.exports = function (db, BSON) {
    return{
        getUserQuestions: function (req, res) {

            //Get params
            var user_id = req.session.user._id;
            var type = req.params.type;
            var query = {spam: false};

            //Get User Queryes
            db.collection('queryes', function (err, collection) {
                collection.find({'user_id': user_id}, {'_id': 1}).toArray(function (err, items) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        //Update Query (Get only user queryes)
                        query._id = {'$in': items};
                        //Bulid query on type
                        switch (type) {
                            case 'unanswered':
                                query.answer = null;
                                break;
                            case 'answered':
                                //TODO
                                break;
                            case 'all':
                                break;
                            case 'spam':
                                query.spam = true;
                                break;
                        }
                        //Get Questions
                        db.collection('questions', function (err, collection) {
                            collection.find(query).sort({'insert_date': 1}).toArray(function (err, items) {
                               return res.send(items);
                            });
                        });

                    }
                });
            });


        },
        //RETURN ALL QUESTIONS
        getQuestions: function (req, res) {
            var sort = {};
            var skip = 0;
            var limit = 20;

            //Take skip
            skip = parseInt(req.params.skip);

            //Prepare sort parameters
            switch (req.params.type) {
                case 'newst':
                    sort = {insert_date: -1};
                    break;
                case 'best':
                    sort = {up_votes_count: -1};
                    break;
                case 'my':
                    //Get current user
                    if (req.session.hasOwnProperty('logged') && req.session.hasOwnProperty('user')) {
                        if (req.session.logged == true) {
                            sort = {user_id: req.session.user.id};
                        } else {
                            return res.send({});
                        }
                    } else {
                        return res.send({});
                    }
                    break;
                default:
                    sort = {};
                    break;
            }

            //Query
            db.collection('questions', function (err, collection) {
                collection.find({'querye_id': req.params.id}).sort(sort).skip(skip).limit(limit).toArray(function (err, items) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        console.log(items);
                        return res.send(items);
                    }
                });
            });
        },

        //Edit Question

        editQuestion: function (req, res) {
            //Varibles
            querye2_id = req.params.q_id;
            //Update Question
            db.collection('questions', function (err, collection) {
                collection.update({'querye_id': querye2_id}, {'$set': {body: "questions"}}, function (err, result) {
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

        //POST NEW QUESTION
        postQuestion: function (req, res) {
            //Check requiment params
            if (!req.body.hasOwnProperty('body')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."})
            }
            //Check question length
            if (req.body.body.length < 10) {
                res.statusCode = 400;
                return res.send({code: "E_2", message: "Question is too short!"})
            }

            //Create Question object
            var question = {
                body: req.body.body,
                querye_id: req.params.id,
                insert_date: new Date().toJSON(),
                up_votes_count: 0,
                down_votes_count: 0,
                up_voters: [],
                down_voters: [],
                spam: false,
                user_id: req.session.user._id,
                username: req.session.user.username
            };

            //Check Querye settings
            db.collection('queryes', function (err, collection) {
                collection.findOne({'_id': new BSON.ObjectID(req.params.id)}, {settings: 1}, function (err, item) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        if (item.settings.p_questions == 0) {
                            res.statusCode = 400;
                            return res.send({code: "E_L", message: "User not autohrized."});
                        } else {
                            //Insert Question to Database
                            db.collection('questions', function (err, collection) {
                                collection.insert(question, function (err, result) {
                                    if (err) {
                                        res.statusCode = 400;
                                        return res.send({code: "E_7", message: "Internal Database Error."});
                                    } else {
                                        //Incrase question count in Querye
                                        db.collection('queryes', function (err, collection) {
                                            collection.update({'_id': new BSON.ObjectID(req.params.id)}, {'$inc': {questions_count: 1}}, function (err, result) {
                                            });
                                        });
                                        return res.send(result);
                                    }
                                });
                            });
                        }
                    }
                });
            });
        },
        postQuestionToSpam: function (req, res) {
            //Varibles
            var question_id = new BSON.ObjectID(req.params.q_id);

            //Update Question
            db.collection('questions', function (err, collection) {
                collection.update({'_id': question_id}, {'$set': {spam: true}}, function (err, result) {
                    return res.send('success');
                });
            });
        },
        deleteQuestionFromSpam: function (req, res) {
            //Varibles
            var question_id = new BSON.ObjectID(req.params.q_id);

            //Update Question
            db.collection('questions', function (err, collection) {
                collection.update({'_id': question_id}, {'$set': {spam: false}}, function (err, result) {
                    return res.send('success');
                });
            });
        },
        //Delete Question
        deleteUserQuestion: function (req, res) {
            var question_id = new BSON.ObjectID(req.params.q_id);
            db.collection('questions', function (err, collection) {
                collection.remove({'_id': question_id}, {safe: true}, function (err, result) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        //Incrase question count in Querye
                        db.collection('queryes',function(err,collection){
                            collection.update({'_id':req.params.id},{'$inc': {questions_count: -1}},function(err,result){
                            });
                        });
                        return res.send(req.body);
                    }
                });
            });
        }
    }
}
