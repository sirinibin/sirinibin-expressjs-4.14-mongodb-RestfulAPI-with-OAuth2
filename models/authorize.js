const { check }  = require('express-validator/check');
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcrypt');
var moment = require('moment');

var user = require('./user');



var authorize={};
authorize.schema =new mongoose.Schema({
    code: String,
    expires_at: { type: Date, default: Date.now },
    user_id: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

authorize.validate = [
    check('username').custom((value, { req }) => {
        return new Promise(function(resolve, reject){

            if(value.trim()){
                resolve(true);
            }else {
                reject(false);
            }
        });

}).withMessage('Username is required'),

check('password').custom((value, { req }) => {
    return new Promise(function(resolve, reject){

        if(value.trim()){
            resolve(true);
        }else {
            reject(false);
        }
    });

}).withMessage('Password is required'),


];

authorize.sendErrorResponse=function(errors,req,res) {

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

authorize.parseAttributes=function(req){

    //Mondatory fields
    var attributes={
        'username':req.body.username.trim(),
        'password':req.body.password.trim()
    };

    return attributes;
};
// assign a function to the "methods" object of our animalSchema
authorize.schema.methods.findbyId = function(cb,fields={}) {
    console.log("Inside findbyId:"+this.id);
    return this.model('AuthCode').findOne({ _id: this.id }, cb).select(fields);
};
authorize.schema.methods.findbyCode = function(cb,fields={}) {
    console.log("Inside findbyCode:"+this.code);
    return this.model('AuthCode').findOne({ code: this.code,expires_at:{'$gt':new Date()} }, cb).select(fields);
};

authorize.generateAuthToken=function(req,res,attributes) {

    var attributes=this.parseAttributes(req);

    var User = mongoose.model("User", user.schema);
    Usermodel = new User({"username":attributes['username']});


    Usermodel.findbyUsername(function(err, result) {
        console.log(result);

                        if(!result){

                            let response={
                                'status':0,
                                'errors':{
                                    'password':['Username or Password is Wrong']
                                }
                            };

                            //response['data']=results[0];

                            return res.status(400).end(JSON.stringify(response,null, 3));

                        }

        bcrypt.compare(attributes['password'], result.password, function(err, compareResult) {


                        if(compareResult) {

                            let code = uuidv4();
                            let now = moment();
                            let expires_at = now.add(3, 'minutes');

                            // expires_at=Date.parse(expires_at.format("YYYY-MM-DD hh:mm:ss"));
                            expires_at = expires_at.format("YYYY-MM-DD HH:mm:ss");

                            let auth_attributes = {
                                'code': code,
                                'user_id': result.id,
                                'expires_at': expires_at
                            };


                            var AuthCode = mongoose.model("AuthCode", authorize.schema);
                            var AuthCodeModel = new AuthCode(auth_attributes);

                            AuthCodeModel.save().then(item=> {
                                                    console.log("Saved");
                                                    console.log(item);

                                                    AuthCodeModel = new AuthCode({"_id": item.id});

                                                    AuthCodeModel.findbyId(function (err, result2) {

                                                        let response = {
                                                            'status': 1,
                                                            'data': {
                                                                "authorization_code":result2.code,
                                                                "expires_at":result2.expires_at
                                                            }
                                                        };
                                                        return res.end(JSON.stringify(response, null, 3));

                                                    }, {"code": 1, "expires_at": 2});

                           }).catch(err=> {
                                console.log("Not Saved");
                                console.log(err);
                                return res.status(400).end(JSON.stringify(err, null, 3));

                           });

                        }else {  //else compareResult

                                let response={
                                    'status':0,
                                    'errors':{
                                        'password':['Username or Password is Wrong']
                                    }
                                };

                                //response['data']=results[0];

                                return res.status(400).end(JSON.stringify(response,null, 3));

                             }


        });  //end bcrypt
    }); //end findbyusername

}
module.exports = authorize;
