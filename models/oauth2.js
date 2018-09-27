const { check }  = require('express-validator/check');

var accesstoken = require('./accesstoken');


var oauth2={};

oauth2.user_id="";

oauth2.validate = [

    check('access_token').custom((value, { req,res }) => {
        return new Promise(function(resolve, reject){

            if(value.trim()){
                resolve(true);
            }else {
                reject(false);
            }
        });

}).withMessage('Access token is required'),

check('access_token').custom((value, { req,res }) => {

    if(!value){
       return true;
     }
   console.log("AT:"+value);


    return new Promise(function(resolve, reject){



        var AccessToken = mongoose.model("AccessToken", accesstoken.schema);
        AccessTokenModel= new AccessToken({"token": value});

        AccessTokenModel.findbyToken(function (err, result) {

            if(!result){
                reject(false);

            }else {

                oauth2.user_id=result.user_id;
                resolve(true);
            }

        }, {"token": 1, "expires_at": 2,"user_id":3});

    });

}).withMessage('Invalid Access token'),


];

module.exports = oauth2;
