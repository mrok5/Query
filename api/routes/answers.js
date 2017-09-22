module.exports = function (db,BSON) {
    return{
        getUserAnswers: function (req, res) {
            //Get params
            var user_id = req.session.user._id;
            var query={'user_id':user_id};

            //Switch type
            switch (req.params.type){
                case 'answered':
                   query.answer={'$exists': true };
                    break;
                case 'unanswered':
                    query.answer={'$exists': false};
                    break;
            }

            //Get Questions
            db.collection('questions', function (err, collection) {
                collection.find(query).sort({'insert_date':1}).toArray(function (err, items) {
                    if(err){
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    }else {
                        return res.send(items);
                    }

                });
            });

        },
		//Edit Question
		
		 editQuestion: function (req, res) {               
             //Varibles
            question_id=req.params.id;
			//Update Question
            db.collection('questions',function(err,collection){
                collection.update({'_id':question_id},{'$set':{body:"answers"}},function(err,result){
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
						}else{
                    console.log(question_id);
                    return res.send('success');
					}
                });
            });
        },

        postAnswer: function (req, res) {
            //Check params
            if (!req.body.hasOwnProperty('body')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."})
            }
            //Check body length
            if (req.body.body.length < 10) {
                res.statusCode = 400;
                return res.send({code: "E_2", message: "Answer is too short."})
            }

            //Get params
            var question_id = new BSON.ObjectID(req.params.q_id);
            var querye_id = req.params.id;

            //Bulid answer
            var answer = req.body;
            answer.insert_date = new Date();

            //Update Question - insert answer
            db.collection('questions', function (err, collection) {
                collection.update({'_id': question_id}, {$set: {'answer': answer}}, function (err, result) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        return res.send(answer);
                    }
                });
            });

        }

    }
}