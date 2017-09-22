module.exports = function (db, BSON, points) {
    return{
        postQueryeVote: function (req, res) {

            //Get params
            var user_id = req.session.user._id;
            var querye_id = new BSON.ObjectID(req.params.id);
            var type = req.params.type;

            //Build vote object
            var vote = user_id;

            //Check vote exist
            db.collection('queryes', function (err, collection) {
                //Get Querye
                collection.findOne({'_id': querye_id}, function (err, item) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error. Query 1", err: err});
                    } else {
                        if(type==1){
                            //Check if vote alredy exist
                            if(item.up_voters.indexOf(vote)!=-1){
                                return res.send('Vote exist');
                            }else{
                                //Insert Up Vote
                                collection.update({'_id':querye_id},{'$push': {up_voters: vote}, '$inc': {up_votes_count: 1}},function(err,result){
                                    //Check if down vote exist
                                    if(item.down_voters.indexOf(vote)!=-1){ //change==true
                                        //Remove down vote
                                        collection.update({'_id':querye_id},{'$pull': {down_voters: vote}, '$inc': {down_votes_count: -1}},function(err,result){
                                            return res.send('success');
                                        });
                                    } else {
                                        //Insert UPVote(no change)
                                        points.addUserPoints(1,item.user_id,item._id,user_id,false);
                                        return res.send('success');
                                    }
                                });
                            }

                        } else if(type==0){
                            if(item.down_voters.indexOf(vote)!=-1){
                                return res.send('Vote exist');
                            }else{
                                //Insert Down Vote
                                collection.update({'_id':querye_id},{'$push': {down_voters: vote}, '$inc': {down_votes_count: 1}},function(err,result){
                                    //Check if Up Vote exist
                                    if(item.up_voters.indexOf(vote)!=-1){//change==true
                                        //Remove up vote
                                        collection.update({'_id':querye_id},{'$pull': {up_voters: vote}, '$inc': {up_votes_count: -1}},function(err,result){
                                            return res.send('success');
                                        });
                                    } else{
                                        //Insert Down Vote (no change)
                                        points.addUserPoints(2,item.user_id,item._id,user_id,false);
                                        return res.send('success');
                                    }
                                    console.log('Down vote inserted');
                                });
                            }
                        }
                    }
                });
            });
        },

//POST QUESTION VOTE
        postQuestionVote: function (req, res) {
            //Get params
            var user_id = new BSON.ObjectID(req.session.user._id);
            var querye_id = new BSON.ObjectID(req.params.id);
            var question_id = new BSON.ObjectID(req.params.question_id);
            var type = req.params.type;

            //Build vote object
            var vote = req.session.user._id;

            db.collection('questions', function (err, collection) {
                //Prepare Query
                if (type == 1) {
                    var query = {'_id': question_id, up_voters: {'$ne': vote}};
                    var update = {'$push': {up_voters: vote}, '$inc': {up_votes_count: 1}};
                    var query2 = {'_id': question_id, down_voters: {'$not': {'$ne': vote}}};
                    var update2 = {'$pull': {down_voters: vote}, '$inc': {down_votes_count: -1}};
                } else {
                    var query = {'_id': question_id, down_voters: {'$ne': vote}};
                    var update = {'$push': {down_voters: vote}, '$inc': {down_votes_count: 1}};
                    var query2 = {'_id': question_id, up_voters: {'$not': {'$ne': vote}}};
                    var update2 = {'$pull': {up_voters: vote}, '$inc': {up_votes_count: -1}};
                }

                //Insert Vote
                collection.update(query, update, function (err, result) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error. Query 1", err: err});
                    }
                });
                //Chek if vote is changed and remove old one
                collection.update(query2, update2, function (err, result) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error. Query 2", err: err});
                    }
                });
            });
            return res.send('success');
        }
    }
}