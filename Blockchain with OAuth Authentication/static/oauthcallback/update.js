
// app.post('/update', function (req, res) {
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
module.exports = {
    updateaccess: function (req, res) {
        var options = {
            uri: 'http://localhost:3000/api/User',
            method: 'POST',
            json: {
                "$class": "org.lockerney.main.User",
                "userId": req.body.userid,
            }
        };
        request(options, function (error, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 500) {
                console.log(res.statusCode);
                console.log(req.body);
                var docClient = new AWS.DynamoDB.DocumentClient();
                var table = "privatedata";
                var params = {
                    TableName: table,
                    Key: {
                        id: parseInt(req.body.userid)
                    },
                    ProjectionExpression: 'dob, address, bankAccNo, claimsInfo, clinicalInfo, email, ssn, telephone'
                };
                var old_data
                docClient.get(params, function (err, data) {
                    console.log(err);
                    old_data = data;
                    var oldPassPhrase = req.body.oldpassphrase.toString();


                    // console.log(id+" userid\n")
                    console.log(oldPassPhrase + " old Passphrase\n")
                    // console.log(old_data+" Rajat")
                    // let name = req.body.name.toString();


                    // console.log(name+" name of user");
                    console.log(old_data + " data");
                    // console.log(data.Item.dob.toString()+" Birthdate");
                    // console.log(data.Item.clinicInfo.toString()+" clinic info");

                    //Decrypting The data        
                    var Bits = 1024;
                    var MattsRSAkey = cryptico.generateRSAKey(oldPassPhrase, Bits);
                    // console.log(MattsRSAkey.toJSON()+"key\n")
                    // console.log("\nCI: \n"+old_data.Item.clinicalInfo.toString())
                    // console.log("\nDOB: \n"+old_data.Item.dob.toString())
                    // console.log("\nSSN: \n"+old_data.Item.ssn.toString())
                    // console.log("\nEmail: \n"+old_data.Item.email.toString())
                    // console.log("\nBAccNo: \n"+old_data.Item.bankAccNo.toString())
                    // console.log("\nCI: \n"+old_data.Item.claimsInfo.toString())
                    // console.log("\nAddress: \n"+old_data.Item.address.toString())
                    // console.log("\nTelephone: \n"+old_data.Item.telephone.toString())

                    var a = old_data.Item.clinicalInfo;
                    console.log(typeof (a) + " CI:\n");
                    var clinical_info = cryptico.decrypt(a, MattsRSAkey);
                    console.log(clinical_info);
                    // let name= cryptico.decrypt(old_data.Item.name, MattsRSAkey).plaintext;
                    let dob = cryptico.decrypt(old_data.Item.dob, MattsRSAkey).plaintext;
                    let ssno = cryptico.decrypt(old_data.Item.ssn, MattsRSAkey).plaintext;
                    let email = cryptico.decrypt(old_data.Item.email, MattsRSAkey).plaintext;
                    let bankaccno = cryptico.decrypt(old_data.Item.bankAccNo, MattsRSAkey).plaintext;
                    let claimsInfo = cryptico.decrypt(old_data.Item.claimsInfo, MattsRSAkey).plaintext;
                    let Address = cryptico.decrypt(old_data.Item.address, MattsRSAkey).plaintext;
                    let telephone = cryptico.decrypt(old_data.Item.telephone, MattsRSAkey).plaintext;

                    // console.log(name);
                    console.log("dob " + dob);
                    console.log("\nssno " + ssno);
                    console.log("\nemail " + email);
                    console.log("\nbankaccno " + bankaccno);
                    console.log("\nclaimsInfo " + claimsInfo);
                    console.log("\nAddress " + Address);
                    console.log("\ntelephone " + telephone);
                    //Filling the empty input from database
                    // console.log(clinical_info)
                    // $(document).ready(function(){
                    //     $('#clinicinfo').val(clinical_info) ;
                    // })

                    // $('#clinicinfo').val(clinical_info) 


                    // console.log(clinical_info + "clinical_info\n")
                    // console.log(req.body.clinicalinfo+"\n\n")

                    var updated_clinicalinfo, updated_Address, updated_bankaccno, updated_claimsInfo, updated_clinicalinfo, updated_dob, updated_email, updated_name, updated_ssno, updated_telephone


                    console.log('Updated info' + req.body.clinicinfo)
                    // console.log("updated_name" + req.body.name)
                    console.log("updated_dob " + req.body.dob)
                    console.log("updated_ssno  " + req.body.ssno)
                    console.log("updated_email  " + req.body.email)
                    console.log("updated_bankaccno " + req.body.bankaccno)
                    console.log("updated_claimsInfo " + req.body.claimsInfo)
                    console.log("updated_Address " + req.body.address)
                    console.log("updated_telephone " + req.body.mobn)

                    //Updating all the information
                    if (req.body.clinicinfo == undefined) {
                        updated_clinicalinfo = clinical_info
                    }
                    else {
                        updated_clinicalinfo = clinical_info + req.body.clinicinfo;
                    }
                    // if(req.body.name==undefined){
                    //     updated_name = name ;
                    // }
                    // else {
                    //     // updated_name = name + req.body.name;
                    //     updated_name = name ;
                    // }
                    if (req.body.dob == undefined) {
                        updated_dob = dob
                    }
                    else {
                        updated_dob = dob + req.body.dob;
                    }
                    if (req.body.ssno == undefined) {
                        updated_ssno = ssno;
                    }
                    else {
                        updated_ssno = ssno + req.body.ssno;
                    }
                    if (req.body.email == undefined) {
                        updated_email = email;
                    }
                    else {
                        updated_email = email + req.body.email;
                    }
                    if (req.body.bankaccno == undefined) {
                        updated_bankaccno = bankaccno + req.body.bankaccno;
                    }
                    else {
                        updated_bankaccno = bankaccno + req.body.bankaccno;
                    }
                    if (req.body.claimsInfo == undefined) {
                        updated_claimsInfo = claimsInfo;
                    }
                    else {
                        updated_claimsInfo = claimsInfo + req.body.claimsInfo;
                    }

                    if (req.body.address == undefined) {
                        updated_Address = Address;
                    }
                    else {
                        updated_Address = Address + req.body.address;
                    }
                    if (req.body.mobno == undefined) {
                        updated_telephone = telephone;
                    }
                    else {
                        updated_telephone = telephone + req.body.mobno;
                    }
                    // console.log('Updated info' + updated_info);
                    // updated_name = name + req.body.name;
                    // updated_dob = dob + req.body.dob;
                    // updated_ssno = ssno + req.body.ssno;
                    // updated_email =  email + req.body.email;
                    // updated_bankaccno = bankaccno + req.body.bankaccno;
                    // updated_claimsInfo =  + req.body.claimsInfo;
                    // updated_Address = Address + req.body.address;
                    // updated_telephone = telephone + req.body.mobno;


                    //getting new passphrase
                    var newPassphrase
                    if (req.body.newPassphrase == undefined) {
                        alert("Enter New PassPhrase")
                    }
                    else {
                        newPassphrase = req.body.newPassphrase.toString();
                    }


                    //Generating new key with new PassPhrase
                    MattsRSAkey = cryptico.generateRSAKey(newPassphrase, Bits);

                    //Creating a public key
                    var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);


                    //Encrypting with public key
                    console.log('Encrypt with Public');
                    // enc_clinicinfo = cryptico.encrypt(updated_info, MattsPublicKeyString);
                    // console.log(enc_clinicinfo);

                    console.log('Updated info' + updated_clinicalinfo)
                    // console.log("updated_name" + req.body.name)
                    console.log("updated_dob " + updated_dob)
                    console.log("updated_ssno  " + updated_ssno)
                    console.log("updated_email  " + updated_email)
                    console.log("updated_bankaccno " + updated_bankaccno)
                    console.log("updated_claimsInfo " + updated_claimsInfo)
                    console.log("updated_Address " + updated_Address)
                    console.log("updated_telephone " + updated_telephone)

                    msg_addr = cryptico.encrypt(updated_Address, MattsPublicKeyString);
                    msg_dob = cryptico.encrypt(updated_dob, MattsPublicKeyString);
                    msg_mail = cryptico.encrypt(updated_email, MattsPublicKeyString);
                    // msg_name = cryptico.encrypt(updated_name, MattsPublicKeyString);
                    msg_ssn = cryptico.encrypt(updated_ssno, MattsPublicKeyString);
                    msg_tele = cryptico.encrypt(updated_telephone, MattsPublicKeyString);
                    msg_bankaccno = cryptico.encrypt(updated_bankaccno, MattsPublicKeyString);
                    msg_clinicinfo = cryptico.encrypt(updated_clinicalinfo, MattsPublicKeyString);
                    msg_claimsInfo = cryptico.encrypt(updated_claimsInfo, MattsPublicKeyString);
                    var params2 = {
                        TableName: 'privatedata',
                        // Key: {
                        //     id: { N: (req.body.userid) }
                        // },
                        Item: {
                            // 'id': { N: req.body.userid },
                            'address': { S: msg_addr.cipher },
                            'dob': { S: msg_dob.cipher },
                            'email': { S: msg_mail.cipher },
                            // 'name': { S: msg_name.cipher },
                            'ssn': { S: msg_ssn.cipher },
                            'telephone': { S: msg_tele.cipher },
                            'bankAccNo': { S: msg_bankaccno.cipher },
                            'claimsInfo': { S: msg_claimsInfo.cipher },
                            'clinicalInfo': { S: msg_clinicinfo.cipher }

                        }
                    };

                    console.log("Data after encryption");
                    console.log(params2.Item);

                    console.log("user id" + req.body.userid);

                    // updating part

                    ddb.putItem(params2, function (err, data) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            var privateKey = crypto.randomBytes(32);
                            var msg1 = privateKey.toString('base64');
                            //console.log(cryptico.decrypt(msg_mail.cipher, MattsRSAkey).plaintext);
                            alert("Updation successfull!!Congratulation with user id " + req.body.userid + " Keep your passphrase safe " + req.body.newPassphrase + " Your signing key " + msg1 + " Your Public key :" + MattsPublicKeyString + " ....");
                            // res.send("Updation successfull!!Congratulation with user id " + req.body.userid + " Keep your passphrase safe " + req.body.passphrase + " Your signing key " + msg1+" Your Public key :"+" ....");
                        }
                    });

                    // var params2 = {
                    //     TableName: 'privatedata',
                    //     Key: {
                    //         id: { N: (req.body.userid) }
                    //     },
                    //     AttributeUpdates: {
                    //         clinicalInfo: {
                    //             Action: 'PUT',
                    //             Value: { S: enc_clinicinfo.cipher }
                    //         }
                    //     },
                    //     ReturnValues: 'ALL_NEW'
                    // };
                    // ddb.updateItem(params2, function (err, data) {
                    //     if (err) {
                    //         res.send(err);
                    //     }
                    //     else {
                    //         res.writeHead(302, {
                    //             'Location': 'http://localhost:1338/update.html'
                    //         });
                    //         res.end();
                    //     }
                    // })
                });
            }
        });
        // });
    }
}
