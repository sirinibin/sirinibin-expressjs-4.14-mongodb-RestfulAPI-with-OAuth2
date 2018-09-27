const { check }  = require('express-validator/check');
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcrypt');
var moment = require('moment');

var authorize = require('./authorize');


var accesstoken={};

accesstoken.schema =new mongoose.Schema({
    token: String,
    auth_code: String,
    expires_at: { type: Date, default: Date.now },
    user_id: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});



accesstoken.validate = [
    check('authorization_code').custom((value, { req }) => {
        return new Promise(function(resolve, reject){

            if(value.trim()){
                resolve(true);
            }else {
                reject(false);
            }
        });

}).withMessage('Authorization Code is required'),



];

accesstoken.sendErrorResponse=function(errors,req,res) {

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

accesstoken.parseAttributes=function(req){

    //Mondatory fields
    var attributes={
        'authorization_code':req.body.authorization_code.trim(),
    };
    return attributes;
};

// assign a function to the "methods" object of our animalSchema
accesstoken.schema.methods.findbyId = function(cb,fields={}) {
    console.log("Inside findbyId:"+this.id);
    return this.model('AccessToken').findOne({ _id: this.id }, cb).select(fields);
};
accesstoken.schema.methods.findbyToken = function(cb,fields={}) {
    console.log("Inside findbyToken:"+this.token);
    return this.model('AccessToken').findOne({ token: this.token,expires_at:{'$gt':new Date()} }, cb).select(fields);
};

accesstoken.generateAccessToken=function(req,res,attributes) {
    //var d = new Date();
    //d.setTimezone('Asia/Calcutta');


    console.log("cool2");
    var attributes=this.parseAttributes(req);

    console.log("cool3");
    attributes={
        'code':attributes['authorization_code']
    };


    var AuthCode = mongoose.model("AuthCode", authorize.schema);
    AuthCodeModel = new AuthCode({"code":attributes['code']});



    AuthCodeModel.findbyCode(function(err, result) {

        console.log("Inside findByCode");
        console.log(result);
        if(!result){

            let response={
                'status':0,
                'errors':{
                    'authorization_code':['Invalid Authorization Code']
                }
            };
            return res.status(400).end(JSON.stringify(response,null, 3));
        }

        let token=uuidv4();
        let now = moment();
        let expires_at = now.add((60*24*60), 'minutes'); // 60 days

        //expires_at=Date.parse(expires_at.format("YYYY-MM-DD hh:mm:ss"));
        expires_at=expires_at.format("YYYY-MM-DD HH:mm:s");

        let token_attributes={
            'token':token,
            'user_id':result.user_id,
            'auth_code':result.code,
            'expires_at':expires_at
        };

        var AccessToken = mongoose.model("AccessToken", accesstoken.schema);
        AccessTokenModel = new AccessToken(token_attributes);

        AccessTokenModel.save().then(item=> {
                                            console.log("Saved");
                                            console.log(item);

                                          AccessTokenModel= new AccessToken({"_id": item.id});

                                          AccessTokenModel.findbyId(function (err, result2) {
                                                let response = {
                                                    'status': 1,
                                                    'data': {
                                                        "access_token":result2.token,
                                                        "expires_at":result2.expires_at
                                                    }
                                                };
                                                return res.end(JSON.stringify(response, null, 3));

                                            }, {"token": 1, "expires_at": 2});

                                }).catch(err=> {
                                    console.log("Not Saved");
                                console.log(err);
                                return res.status(400).end(JSON.stringify(err, null, 3));

                            });


      }); //End findbyCode


}
module.exports = accesstoken;
