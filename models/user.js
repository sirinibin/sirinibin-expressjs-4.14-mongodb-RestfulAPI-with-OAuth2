const { check }  = require('express-validator/check');

var bcrypt=require('bcrypt');



var user={};
user.schema =new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

user.schema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

user.validate = [
    check('email').isEmail().withMessage('Must be a Valid E-mail'),
    check('email').custom((value, { req }) => {
        return new Promise(function(resolve, reject){

            if(value.trim()){
                resolve(true);
            }else {
                reject(false);
            }
        });

}).withMessage('Email is required'),



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


check('username').custom((value, { req }) => {


    if(!value){
    return true;
    }
console.log("Username:"+value);

return new Promise(function(resolve, reject){

    value=value.trim();
    //console.log("Username:"+value);

    var User = mongoose.model("User", user.schema);
    model = new User({"username":value});

    model.findbyUsername(function(err, user){
        console.log(user);

        if (user&&value==user.username) {
            reject(false);

        }else {
            resolve(true);
        }


    },{ "_id":1,"username":2});

});



}).withMessage('Username already in use'),


check('email').custom((value, { req }) => {

    return new Promise(function(resolve, reject){

        var User = mongoose.model("User", user.schema);
        model = new User({"email":value});

        model.findbyEmail(function(err, user){
            console.log(user);

            if (user&&value==user.email) {
                reject(false);

            }else {
                resolve(true);
            }


        },{ "_id":1,"email":2});

    });

}).withMessage('E-mail already in use'),


];

user.sendErrorResponse=function(errors,req,res) {

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

user.parseAttributes=function(req){

    //Mondatory fields
    var attributes={
        'username':req.body.username.trim(),
        'email':req.body.email.trim(),
        'password':req.body.password.trim()
    };

    //Optional Fields
    if(req.body.name){
        attributes['name']=req.body.name.trim();
    }
    return attributes;
};

// assign a function to the "methods" object of our animalSchema
user.schema.methods.findbyId = function(cb,fields={}) {
    console.log("Inside findbyId:"+this.id);
    return this.model('User').findOne({ _id: this.id }, cb).select(fields);
};
user.schema.methods.findbyEmail = function(cb,fields={}) {
    console.log("Inside findbyEmail:"+this.id);
    return this.model('User').findOne({ email: this.email }, cb).select(fields);
};
user.schema.methods.findbyUsername = function(cb,fields={}) {
    console.log("Inside findbyUsername:"+this.username);
    return this.model('User').findOne({ username: this.username }, cb).select(fields);
};
user.create=function(req,res,attributes) {


    var attributes=this.parseAttributes(req);

    bcrypt.hash(attributes['password'], 10, function (err,   hash) {

        attributes['password']=hash; //Note:Bcrypt with 10 rounds is the default for Laravel Hash:make()


         var User = mongoose.model("User", user.schema);
         var model = new User(attributes);


              model.save()
                        .then(item => {
                        console.log("Saved");

                            console.log(item);

                                    model = new User({"_id":item.id});

                                    model.findbyId(function(err, user){

                                        let response={
                                            'status':1,
                                            'data':user
                                        };
                                        return res.end(JSON.stringify(response,null, 3));

                                    },{});


                })
                    .catch(err => {


                          console.log("Not Saved");
                          console.log(err);
                          return  res.status(400).end(JSON.stringify(err,null, 3));

            });


    });






}
module.exports = user;
