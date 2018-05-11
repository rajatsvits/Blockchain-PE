var express = require('express');                                                                                         
var path = require('path');                                                                                               
var bodyParser = require('body-parser');                                                                                  
var app = express();                                                                                                      
var request = require('request');
var AWS = require('aws-sdk');   
var cryptico = require('cryptico');
var crypto = require("crypto");
var eccrypto = require("eccrypto");
var config = require("./config.json");
var count = require("./test.js");
var sort = require("./testsortjson.js")
var updateAccess  =require("./update.js")
module.exports = {
    grantaccess:function(req,res) {
        var counter = 0;
        var options = {
            uri: 'http://localhost:3000/api/UserServicePair',
            method: 'POST',
            json: {
                "$class": "org.lockerney.main.UserServicePair",
                "assetId": count.increment().toString(),
                "userServiceId": req.body.userServiceId,
                "userId": req.body.userId,
                "serviceId": req.body.serviceId,
                "userAccessDigiSign": req.body.userAccessDigiSign,
                "serviceAccess": {
                  "$class": "org.lockerney.main.ServiceAccess",
                  "name": req.body.name,
                  "dateOfBirth": req.body.dob,
                  "socialSecurityNo": req.body.ssno,
                  "memberIdNo": req.body.memid,
                  "emailAddress": req.body.email,
                  "mailingAddress": req.body.address,
                  "telephoneNo": req.body.mobno,
                  "bankAccNo": req.body.accno,
                  "clinicalInfo": req.body.clinical_info,
                  "claimsInfo": req.body.claims_info,
                  "id": "1"
                }
            } 
        };
        var x = options.json.assetId;
        var obj = {
                  "name": req.body.name,
                  "dateOfBirth": req.body.dob,
                  "socialSecurityNo": req.body.ssno,
                  "memberIdNo": req.body.memid,
                  "emailAddress": req.body.email,
                  "mailingAddress": req.body.address,
                  "telephoneNo": req.body.mobno,
                  "bankAccNo": req.body.accno,
                  "clinicalInfo": req.body.clinical_info,
                  "claimsInfo": req.body.claims_info
        }
        console.log(obj);
        
        var text = JSON.stringify(obj);
        var msg = crypto.createHash("sha256").update(text).digest();
        eccrypto.sign(Buffer.from(req.body.userAccessDigiSign, 'base64'), msg).then(function(sig) {
            var a = sig.toString('base64');
            options.json.userAccessDigiSign=a;
            console.log(options);
        request(options, function (error, response, body) {
            console.log(response.statusCode);
            console.log(count.increment(counter));
            if(response.statusCode==200)
            {
                var a = "resource:org.lockerney.main.UserServicePair#";
                a = a+x;
                console.log(a);
                var options = {
                    uri: 'http://localhost:3000/api/grantAccess',
                    method: 'POST',
                    json: {
                    "$class": "org.lockerney.main.grantAccess",
                    "userServicePair": a,
                    "detail": req.body.userServiceId
                    } 
                };
                request(options, function (error, response, body)
                {

                    if(response.statusCode==200)
                    {
                        res.send("Access Granted");
                    }

                })
            }
        });
    });

    } 
} 