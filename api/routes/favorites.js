module.exports = function (db,BSON) {
    return{
        postUserFavorite: function (req, res) {
            //Chek params
            if (!req.body.hasOwnProperty('querye_id')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."});
            }
            //Varibles
            var logged = req.session.logged;

            //Get Params
            var querye_id = req.body.querye_id;
            var user_id = new BSON.ObjectID(req.session.user._id);
            console.log(req.session.user._id);

            //Bulid favorite object
            var favorite = querye_id;

            //Insert to Favorites
            db.collection('users', function (err, collection) {
                collection.update({'_id': user_id,'favorites':{'$nin':[favorite]}}, {'$push': {'favorites': favorite}}, function (err, result) {
                    if(err){
                        res.statusCode=400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        return res.send(result);
                    }
                });
            });



        },
        deleteUserFavorite: function (req, res) {

            //Chek params
            if (!req.body.hasOwnProperty('querye_id')) {
                res.statusCode = 400;
                return res.send({code: "E_1", message: "Params error."});
            }

            //Get Params
            var querye_id = req.body.querye_id;
            var user_id = new BSON.ObjectID(req.params.user_id);

            //Bulid favorite object
            var favorite = req.body.querye_id;

            //Insert to Favorites
            db.collection('users', function (err, collection) {
                collection.update({'_id': user_id}, {'$pull': {'favorites': favorite}}, function (err, items) {
                    return res.send(items);
                });
            });

        },
        getUserFavorites: function (req, res) {

            //Get params
            var user_id = new BSON.ObjectID(req.params.user_id);

            //Database Query Function
            db.collection('users', function (err, collection) {
                collection.findOne({'_id': user_id}, function (err, item) {
                    if (err) {
                        res.statusCode = 400;
                        return res.send({code: "E_7", message: "Internal Database Error."});
                    } else {
                        if(item.hasOwnProperty('favorites')){
                        //Convert to Objects IDs
                        for (var i = 0; i < item.favorites.length; i++)
                            item.favorites[i] = new BSON.ObjectID(item.favorites[i]);
                        //Query
                        db.collection('queryes', function (err, collection) {
                            collection.find({_id: {'$in': item.favorites}}).toArray(function (err, items) {
                                if (err) {
                                    res.statusCode = 400;
                                    return res.send({code: "E_7", message: "Internal Database Error 2."});
                                } else {
                                    return res.send(items);
                                }

                            });
                        });
                        } else {
                            return res.send([]);
                        }
                    }
                });
            });

        }


    }
}