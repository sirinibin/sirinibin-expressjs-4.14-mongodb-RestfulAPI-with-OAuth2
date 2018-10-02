[![Express Logo](https://i.cloudup.com/zfY6lL7eFa-3000x3000.png)](http://expressjs.com/)

  Expressjs 4.15.5 + MongoDb  RESTful API with OAuth2(AWS LAMBDA/SERVERLESS ENABLED)

This is a Ready to deploy(Both on LAMBDA And Server) Node.js RESTful API with OAuth2 authentication/security developed using Expressjs 4.15.5.
You can use this if you want to quick start developing your own custom RESTful API by skipping 95% of your scratch works.
Hopefully this will save lot of your time as this API includes all the basic stuffs you need to get started.

This API also includes a developer dashboard with the API documentation which is developed in Angularjs 6.2. This will be useful to manage your developers access to the API documentation.

[DEMO](http://api.nodejs.mongodb.nintriva.net)
-------------------
```
http://developers.nodejs.mongodb.nintriva.net
Login: developer/developer
```



ENDPOINTS
-------------------
```
AWS LAMBDA: https://991fr47l2i.execute-api.us-east-1.amazonaws.com/dev
SERVER: http://api.nodejs.mongodb.nintriva.net
```

INSTALLATION
-------------------
```
Step1. cd /var/www
git clone -b master https://github.com/sirinibin/sirinibin-expressjs-4.14-mongodb-RestfulAPI-with-OAuth2.git expressjs_mongodb_api

Step2: Make a new file under config/db.js and edit Mysql Db details.

        db={
            url: 'mongodb://localhost:27017/expressjs_api'
        };

        module.exports = db;


Step3. Install App:
       cd expressjs_mongodb_api
       npm install



Step4. Start app
       DEBUG=expressjs_api_with_mongodb:* npm start


Step5: Configure the developer dashboard
       cd developers
       vim proxy.conf.json
        {
          "/v1/*": {
            "target": "<API_END_POINT>",
            "secure": false,
            "changeOrigin": true
          }
        }

Step6. Install App:
       npm install



Step7: Start Developer dashboard
       ng serve --port 4447  --proxy-config proxy.conf.json


```

## Security Vulnerabilities

If you discover a security vulnerability within this template, please send an e-mail to Sirin k at sirin@nintriva.com. All security vulnerabilities will be promptly addressed.

## License

The Expressjs 4.15.5 is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)

