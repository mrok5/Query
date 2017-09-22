module.exports = function (db, BSON, mailer) {
    return{
        postScore:function(req,res){
            res.header('Access-Control-Allow-Origin', "*");
            //username,score
            if(!req.params.hasOwnProperty('username')){
                return res.send('username error');
            }
            if(!req.params.hasOwnProperty('points')){
                return res.send('points error');
            }

            var score={
                username:req.params.username,
                score:parseInt(req.params.points),
                date: new Date()
                };

                    db.collection('gameapi',function(err,collection){
                        collection.insert(score,{safe: true},function(err,result){
                            return res.send('success');
                        });
                    })
        },
        getScores:function(req,res){
            res.header('Access-Control-Allow-Origin', "*");
            var query={};
            var sort={score:-1};
            var skip=0;
            var limit=10;

            db.collection('gameapi',function(err,collection){
                collection.find(query).sort(sort).skip(skip).limit(limit).toArray(function (err, items) {
                    return res.send(items[0].score+' BY '+items[0].username.toUpperCase());
                });
            })
        },
        getUserScores:function(req,res){
            res.header('Access-Control-Allow-Origin', "*");
            if(!req.params.hasOwnProperty('username')){
                return res.send('username error');
            }

            var query={username:req.params.username};
            var sort={score:-1};
            var skip=0;
            var limit=10;

            db.collection('gameapi',function(err,collection){
                collection.find(query).sort(sort).skip(skip).limit(limit).toArray(function (err, items) {
                    return res.send(items);
                });
            })
        }
    }
    }
