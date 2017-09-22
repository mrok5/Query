module.exports = function (db, BSON) {
    //Points counts
    var pointsTypes = [
        {points: 200}, //Type 0 - Add Querye
        {points: 10},//Type 1 -Add Querye UpVote
        {points: -5},//Type 2 - Add Querye DownVote
        {points: 10},//Type 3 -Add Querye Favorite
        {points: 10},//Type 4 -Add Question UpVote
        {points: -5}//Type 5 -Add Question DownVote
    ];

    return{
        addUserPoints: function (type, userId, targetItem, targetUser, change) {
            var pointsHistory = {
                user_id: userId,
                type: type,
                points_count: pointsTypes[type].points,
                target_item: targetItem,
                target_user: targetUser,
                insert_date: new Date().toJSON()
            };
            //Log History
            db.collection('points_history', function (err, collection) {
                collection.insert(pointsHistory, function (err, result) {
                    if (err) {
                        //TODO
                    } else {
                        if (change == true) {
                            pointsHistory.points_count= pointsHistory.points_count*2;
                            //Remove previous history
                            db.collection.remove({'user_id': pointsHistory.user_id, 'target_item': pointsHistory.target_item, 'target_user': pointsHistory.target_user}, function (err, result) {
                                console.log('Old item removed');
                            });
                        }

                        //Increase User Points
                        db.collection('users', function (err2, collection2) {
                            collection2.update({'_id': new BSON.ObjectID(userId)}, {'$inc': {points: pointsHistory.points_count}}, function (err, result) {
                                console.log('User points updated: '+pointsHistory.points_count)
                            });
                        });

                    }
                });
            });

        }
    }
};