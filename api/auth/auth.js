module.exports=function(){
    return{ //Chcek if user is logged
        isUserLogged:function(req,res,next){
            //Check session varibles isset
            if(!req.session.hasOwnProperty('logged') || !req.session.hasOwnProperty('user') || req.session.user==null){
                req.session.logged=false;
                req.session.user=null;
                res.statusCode=400;
                res.send({error: 'E_L',message:'User not logged.'})
            }
            console.log(req.session);
            //Chek if user logged
            if(req.session.logged==false){
                res.statusCode=400;
                res.send({error: 'E_L',message:'User not logged.'});
            } else {
                //Go next if user is logged
                next();
            }

        }
    }
}