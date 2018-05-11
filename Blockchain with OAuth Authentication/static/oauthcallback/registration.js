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
var grantAccess = require("./grantAccess.js")
var updateAccess  =require("./update.js")
module.exports = {
    registration:function(req,res) {
//console.log("Data from user");
//console.log(req.body);
var options = {
    uri: 'http://localhost:3000/api/User',
    method: 'POST',
    json: {
    "$class": "org.lockerney.main.User",
    "userId": req.body.userid,
    } 
};
request(options, function (error, response, body) {
if(response.statusCode==200)
{
    var PassPhrase = req.body.passphrase; 
// The length of the RSA key, in bits.
    var Bits = 1024; 
    var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
    var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);       
    console.log('Encrypt with Public');
    msg_addr = cryptico.encrypt(req.body.line1, MattsPublicKeyString);
    msg_dob =cryptico.encrypt(req.body.dob, MattsPublicKeyString);
    msg_mail =cryptico.encrypt(req.body.email, MattsPublicKeyString);
    msg_name =cryptico.encrypt(req.body.name, MattsPublicKeyString);
    msg_ssn =cryptico.encrypt(req.body.ssno, MattsPublicKeyString);
    msg_tele =cryptico.encrypt(req.body.mobno, MattsPublicKeyString);
    msg_bankaccno =cryptico.encrypt(req.body.bankaccno, MattsPublicKeyString);
    msg_clinicinfo =cryptico.encrypt(req.body.clinicinfo, MattsPublicKeyString);
    msg_claiminfo =cryptico.encrypt(req.body.claiminfo, MattsPublicKeyString);
    var params = {
        TableName: 'privatedata',
        Item: {
          'id' : {N:req.body.userid },
          'address' : {S: msg_addr.cipher},
          'dob':{S:msg_dob.cipher},
          'email':{S:msg_mail.cipher},
          'user_name':{S:msg_name.cipher},
          'ssn':{S:msg_ssn.cipher},
          'telephone':{S:msg_tele.cipher},
          'bankAccNo':{S:msg_bankaccno.cipher},
          'claimsInfo':{S:msg_claiminfo.cipher},
          'clinicalInfo':{S:msg_clinicinfo.cipher}
        }
    };
    console.log("Data after encryption");
    console.log(params.Item);
    ddb.putItem(params, function(err, data) {
        if (err) {
          res.send(err);
        }
        else {
        var privateKey = crypto.randomBytes(32);
        var msg1 = privateKey.toString('base64');
        var publicKey = eccrypto.getPublic((privateKey));
        var msg2 = publicKey.toString('base64');
        var returndata = {
            "status":"Registration Successfull",
            "userId":req.body.userid,
            "Passphrase":req.body.passphrase,
            "Signing Key":msg1,
            "Public Key":msg2
        };
        console.log(returndata);
        res.json(returndata);
        //res.redirect("/Registration_Success.html");
       
        //console.log(cryptico.decrypt(msg_mail.cipher, MattsRSAkey).plaintext);
        }
    });
}

});
    }
}