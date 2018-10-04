const { check }  = require('express-validator/check');
var bcrypt=require('bcrypt');

var employees={};
employees.schema =new mongoose.Schema({
    name: String,
    email: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
employees.schema.methods.findbyEmail = function(cb,fields={},id) {
    console.log("Inside findbyEmail:"+this.email);
    if(id){
        return this.model('Employee').findOne({ email: this.email,_id:{'$ne':id} }, cb).select(fields);
    }else {
        return this.model('Employee').findOne({ email: this.email }, cb).select(fields);
    }

};
employees.schema.methods.findbyId = function(cb,fields={}) {
    console.log("Inside findbyId:"+this.id);
    return this.model('Employee').findOne({ _id: this.id }, cb).select(fields);
};
employees.schema.methods.findAll = function(cb,fields={},offset=0,limit=10,order={},search={}) {
    console.log("Inside findAll:");
    return this.model('Employee').find(search, cb).select(fields).skip(offset).limit(limit).sort(order);
};
employees.schema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
employees.schema.methods.count = function(cb,search={}) {
    console.log("Inside Count:");
    return this.model('Employee').count(search, cb);
};
employees.schema.methods.update = function(cb,data={}) {
    console.log("Inside update:"+this.id);
    return this.model('Employee').updateOne({ _id: this.id },{$set: data},{upsert: true}, cb);
};
employees.schema.methods.delete = function(cb,data={}) {
    console.log("Inside Delete:"+this.id);
    return this.model('Employee').remove({ _id: this.id }, cb);
};


employees.validate = [
    check('email').isEmail().withMessage('Must be a Valid E-mail'),

    check('name').custom((value, { req }) => {
        return new Promise(function(resolve, reject){

            if(value.trim()){
                resolve(true);
            }else {
                reject(false);
            }
        });

}).withMessage('Name is required'),

check('email').custom((value, { req }) => {
    return new Promise(function(resolve, reject){

        if(value.trim()){
            resolve(true);
        }else {
            reject(false);
        }
    });

}).withMessage('E-mail is required'),


check('email').custom((value, { req }) => {



    return new Promise(function(resolve, reject){

        var Employee = mongoose.model("Employee", employees.schema);
        EmployeeModel = new Employee({"email":value});

        EmployeeModel.findbyEmail(function(err, result){
            console.log(result);

            if (result&&value==result.email) {
                reject(false);

            }else {
                console.log("TRUE");
                resolve(true);
            }


        },{ "_id":1,"email":2},req.params.id);

    });

}).withMessage('E-mail already in use'),



];

employees.sendErrorResponse=function(errors,req,res) {

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

employees.parseAttributes=function(req){

    //Mondatory fields
    var attributes={
        'name':req.body.name.trim(),
        'email':req.body.email.trim(),
    };

    return attributes;
};

employees.create=function(req,res) {



    //Perform Insertion
    params=employees.parseAttributes(req);

    var Employee = mongoose.model("Employee", employees.schema);

    var EmployeeModel = new Employee(params);

    EmployeeModel.save().then(item => {
                            console.log("Saved");

                        console.log(item);

                        EmployeeModel = new Employee({"_id":item.id});

                        EmployeeModel.findbyId(function(err, result){

                            let response={
                                'status':1,
                                'data':result
                            };

                            return res.end(JSON.stringify(response,null, 3));

                        },{ "_id":1, "name":2,"email":3,"created_at":4,"updated_at":5});


                    })
                    .catch(err => {


                        console.log("Not Saved");
                    console.log(err);
                    return  res.status(400).end(JSON.stringify(err,null, 3));

                    });


}

employees.update=function(req,res) {

    if(req.params.id){
        params2=employees.parseAttributes(req);


        var Employee = mongoose.model("Employee", employees.schema);
        EmployeeModel = new Employee({"_id":req.params.id});

        EmployeeModel.findbyId(function(err, result){

            if (!result) {

                let response={
                    'status':0,
                    'errors':{
                        'id':['Invalid Record']
                    }
                };


                return res.status(400).end(JSON.stringify(response,null, 3));
            }


            EmployeeModel.update(function(err, result){

                console.log(result);



                EmployeeModel = new Employee({"_id":req.params.id});

                EmployeeModel.findbyId(function(err, result) {

                     if (result) {


                        let response={
                            'status':1,
                            'data':result
                        };
                        return res.end(JSON.stringify(response,null, 3));



                    }

                });


            },params2);

        },{ "_id":1});

    }







}

employees.delete=function(req,res) {



    if(req.params.id){

        var Employee = mongoose.model("Employee", employees.schema);
        EmployeeModel = new Employee({"_id":req.params.id});

        EmployeeModel.findbyId(function(err, result){

            if (!result) {

                let response={
                    'status':0,
                    'errors':{
                        'id':['Invalid Record']
                    }
                };


                return res.status(400).end(JSON.stringify(response,null, 3));
            }


            EmployeeModel.delete(function(err, result){

                console.log(result);
                    if (result) {


                        let response={
                            'status':1,
                            'message':'Deleted Successfully',
                            'data':{
                                'id':req.params.id
                            }
                        };

                        return res.end(JSON.stringify(response,null, 3));


                    }




            });

        },{ "_id":1});

    }



}
employees.find=function(req,res,id) {

        var Employee = mongoose.model("Employee", employees.schema);
        EmployeeModel = new Employee({"_id":req.params.id});

        EmployeeModel.findbyId(function(err, result){

            if (!result) {

                let response={
                    'status':0,
                    'errors':{
                        'id':['Invalid Record']
                    }
                };


                return res.status(400).end(JSON.stringify(response,null, 3));
            }

            let response={
                'status':1,
                'data':result
            };

            return res.end(JSON.stringify(response,null, 3));



        });
}
employees.findAll=function(req,res) {

    let offset=0;
    let limit=2;
    let page=1;
    let search_condition='';

    params=[];

    if(req.query.limit){
        limit=parseInt(req.query.limit);
    }
    console.log("Page:"+req.query.page);
    if(req.query.page){
        page=parseInt(req.query.page);
        offset = (page - 1) * limit;
    }
    params.push(offset);
    params.push(limit);

    search_params={};
    search={};
    if(req.query.search){
        search_params=req.query.search;

        if(req.query.search.name){
            search['name']={ "$regex": req.query.search.name, "$options": "i" };
        }

        if(req.query.search.email){

            search['email']={ "$regex": req.query.search.email, "$options": "i" };
        }
    }
    //console.log(search);

    order={};

    if(req.query.sort){

        sort_string=req.query.sort;
        sort_string=sort_string.split(",");


            for(i=0;i< sort_string.length;i++){

                    if(sort_string[i].match("desc")){
                        str=sort_string[i].replace("desc","").trim();
                        order[str]=-1;
                    }else {
                        str=sort_string[i].replace("asc","").trim();
                        order[str]=1;
                    }

            }
    }
    



    //console.log(order);



    var Employee = mongoose.model("Employee", employees.schema);
    EmployeeModel = new Employee();

    EmployeeModel.findAll(function(err, result){

       // console.log(result);

        if (!result) {

            let response={
                'status':0,
                'errors':{
                    'id':['Invalid Record']
                }
            };


            return res.status(400).end(JSON.stringify(response,null, 3));
        }


        EmployeeModel.count(function(err, count) {

            console.log("Count:");
            console.log(count);

                let response = {
                    'status': 1,
                    'page': page,
                    'size': limit,
                    'totalCount': count,
                    'search_params': search_params,
                    'sort_by': order,
                    'data': {},
                };

                response['data'] = result;
                return res.end(JSON.stringify(response, null, 3));

        },search);






    },{},offset,limit,order,search);



}

module.exports = employees;
