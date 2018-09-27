const { check }  = require('express-validator/check');

var user = require('./user');


var me={};



me.sendErrorResponse=function(errors,req,res) {

    var error_response={
        "status":0,
        "errors":{}
    };
    errors=errors.array();

    for(var i=0;i<errors.length;i++){
        error_response.errors[errors[i].param]=[errors[i].msg];
    }

    return  res.status(400).end(JSON.stringify(error_response,null, 3));
};



me.getInfo=function(req,res,user_id) {


    console.log("User id:"+user_id);

    var User = mongoose.model("User", user.schema);
    UserModel= new User({"_id": user_id});

    UserModel.findbyId(function (err, result) {

        if(!result){
            return  res.end(JSON.stringify(error,null, 3));

        }else {

            let response={
                'status':1,
                'data':{}
            };
            response['data']=result;
            return res.end(JSON.stringify(response,null, 3));
        }


    }, {"id": 1, "name": 2,"username":3,"email":4,"created_at":5,"updated_at":6});


}
module.exports = me;
