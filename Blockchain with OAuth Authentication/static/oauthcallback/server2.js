var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var AWS = require('aws-sdk');
var cryptico = require('cryptico');
var crypto = require("crypto");
var eccrypto = require("eccrypto");
var config = require("./config1.json");
var count = require("./test.js");
var sort = require("./testsortjson.js")
var grantAccess = require("./grantAccess.js")
var registration = require("./registration.js");
var askaccess = require("./AskAccess.js");
awsConfig = {
    "region": config.region.toString(),
    "endpoint": config.endpoint.toString(),
    "accessKeyId": config.accessKeyId.toString(),
    "secretAccessKey": config.secretAccessKey.toString()


};
AWS.config.update(awsConfig);
ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'html')))
app.get('/registration', function (req, res) {
    //cmd.run('openssl rsa -in my-server.key.pem -pubout -out my-server.pub');
    request({
        url: 'http://localhost:3000/api/User?filter={"%24class"%3A "org.lockerney.main.User"}',
        method: 'GET'
    }, function (error, response, body) {
        console.log("aaa");
        console.log(JSON.parse(body));
        var data = JSON.parse(body);
        data = sort.sortReg(data, "userId");
        console.log(data);
        res.json(data);
    });
    //res.sendFile('Registration.html');
    //res.end(JSON.stringify(req.query)
})


app.get('/update', function (req, res) {
    //cmd.run('openssl rsa -in my-server.key.pem -pubout -out my-server.pub');
    res.sendFile('update.html');
    //res.end(JSON.stringify(req.query)
})

app.get('/grantaccess', function (req, res) {
    //cmd.run('openssl rsa -in my-server.key.pem -pubout -out my-server.pub');
    res.sendFile('grantAccess.html');
    //res.end(JSON.stringify(req.query)
})

app.get('/', function (req, res) {
    //cmd.run('openssl rsa -in my-server.key.pem -pubout -out my-server.pub');
    res.sendFile('index.html');
    //res.end(JSON.stringify(req.query)
})
app.post('/registration', function (req, res) {
    var options = {
        uri: 'http://localhost:3000/api/User',
        method: 'POST',
        json: {
            "$class": "org.lockerney.main.User",
            "userId": req.body.userid,
        }
    };
    request(options, function (error, response, body) {
        if (response.statusCode == 200) {
            var PassPhrase = req.body.passphrase;
            // The length of the RSA key, in bits.
            var Bits = 1024;
            var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
            var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey);
            console.log('Encrypt with Public');
            msg_addr = cryptico.encrypt(req.body.line1, MattsPublicKeyString);
            msg_dob = cryptico.encrypt(req.body.dob, MattsPublicKeyString);
            msg_mail = cryptico.encrypt(req.body.email, MattsPublicKeyString);
            msg_name = cryptico.encrypt(req.body.name, MattsPublicKeyString);
            msg_ssn = cryptico.encrypt(req.body.ssno, MattsPublicKeyString);
            msg_tele = cryptico.encrypt(req.body.mobno, MattsPublicKeyString);
            msg_bankaccno = cryptico.encrypt(req.body.bankaccno, MattsPublicKeyString);
            msg_clinicinfo = cryptico.encrypt(req.body.clinicinfo, MattsPublicKeyString);
            msg_claiminfo = cryptico.encrypt(req.body.claiminfo, MattsPublicKeyString);
            var params = {
                TableName: 'privatedata',
                Item: {
                    'id': { N: req.body.userid },
                    'address': { S: msg_addr.cipher },
                    'dob': { S: msg_dob.cipher },
                    'email': { S: msg_mail.cipher },
                    'user_name': { S: msg_name.cipher },
                    'ssn': { S: msg_ssn.cipher },
                    'telephone': { S: msg_tele.cipher },
                    'bankAccNo': { S: msg_bankaccno.cipher },
                    'claimsInfo': { S: msg_claiminfo.cipher },
                    'clinicalInfo': { S: msg_clinicinfo.cipher }
                }
            };
            console.log("Data after encryption");
            console.log(params.Item);
            ddb.putItem(params, function (err, data) {
                if (err) {
                    res.send(err);
                }
                else {
                    var privateKey = crypto.randomBytes(32);
                    var msg1 = privateKey.toString('base64');
                    var publicKey = eccrypto.getPublic((privateKey));
                    var msg2 = publicKey.toString('base64');
                    var returndata = {
                        "status": "Registration Successfull",
                        "userId": req.body.userid,
                        "Passphrase": req.body.passphrase,
                        "Signing Key": msg1,
                        "Public Key": msg2
                    };
                    //console.log(returndata);
                    //app.get('/test',function(req,res){
                    res.json(returndata);
                    //});

                    //res.redirect("/Registration_Success.html");

                    //console.log(cryptico.decrypt(msg_mail.cipher, MattsRSAkey).plaintext);
                }
            });
        }
        else {
            var returndata = {
                "status": "Registration Failed already exists",
                "UserId": req.body.userid
            };
            console.log(returndata);
            // app.get('/test',function(req,res){
            res.json(returndata);
            //});

            //res.redirect("/Registration_Success.html");

        }


    });
});
app.post('/grantaccess', function (req, res) {
    console.log("aa");
    grantAccess.grantaccess(req, res);

});
app.post('/askaccess', function (req, res) {
    var a = req.body.userServiceId;
    var b = req.body.userId;
    request({
        url: 'http://localhost:3000/api/grantAccess?filter[where][detail]=' + a, //URL to hit
        qs: { userServiceId: a }, //Query string data
        method: 'GET', // specify the request type//Set the body as a string
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log("eeee");
            console.log("Data from ask access");
            console.log(req.body);
            console.log("Data from transactionn");
            var obj1 = JSON.parse(response.body);
            console.log(sort.sortByKey(obj1, "timestamp"))
            console.log("ccccc");
            console.log(obj1[0]);
            var str = obj1[0].userServicePair;
            var n = str.indexOf("#");
            console.log(n);
            var x = str.charAt(n + 1);
            for (var i = n + 2; i < str.length; i++) {
                x = x + str.charAt(i);
            }
            console.log(x);
            x = parseInt(x);
            request({
                url: 'http://localhost:3000/api/UserServicePair?filter[where][assetId]=' + x,
                method: 'GET'
            }, function (error, response, body) {

                //console.log(response.body);
                var obj = JSON.parse(response.body);
                console.log(typeof obj[0].serviceAccess.name.toString());
                console.log(obj);
                var perm_from_user = {
                    name: obj[0].serviceAccess.name.toString(),
                    dateOfBirth: obj[0].serviceAccess.dateOfBirth.toString(),
                    socialSecurityNo: obj[0].serviceAccess.socialSecurityNo.toString(),
                    memberIdNo: obj[0].serviceAccess.memberIdNo.toString(),
                    emailAddress: obj[0].serviceAccess.emailAddress.toString(),
                    mailingAddress: obj[0].serviceAccess.mailingAddress.toString(),
                    telephoneNo: obj[0].serviceAccess.telephoneNo.toString(),
                    bankAccNo: obj[0].serviceAccess.bankAccNo.toString(),
                    clinicalInfo: obj[0].serviceAccess.clinicalInfo.toString(),
                    claimsInfo: obj[0].serviceAccess.claimsInfo.toString()
                }
                console.log("aaaa");
                console.log(perm_from_user);
                //var privateKey = req.body.serviceAccessDigiSign;
                var msg = crypto.createHash("sha256").update(JSON.stringify(perm_from_user)).digest();
                console.log(msg);
                // Corresponding uncompressed (65-byte) public key.
                var publicKey = Buffer.from(req.body.serviceAccessDigiSign, 'base64');
                console.log(obj[0].userAccessDigiSign);
                eccrypto.verify(publicKey, msg, Buffer.from(obj[0].userAccessDigiSign, 'base64')).then(function () {
                    console.log("Signature is OK");
                    AWS.config.update({
                        "region": config.region,
                        "endpoint": config.endpoint,
                        "accessKeyId": config.accessKeyId,
                        "secretAccessKey": config.secretAccessKey

                    });
                    console.log(req.body);
                    var docClient = new AWS.DynamoDB.DocumentClient()
                    var table = "privatedata";
                    var params = {
                        TableName: table,
                        Key: {
                            id: parseInt(req.body.userId)
                        },
                        ProjectionExpression: 'dob, address, bankAccNo, claimsInfo, clinicalInfo, email, ssn, telephone, user_name'


                    };
                    docClient.get(params, function (err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Data from DB");
                            console.log(data.Item);
                            console.log("I am here");
                            console.log(req.body);
                            var user_grant_access = JSON.parse(response.body);
                            console.log(user_grant_access[0]);
                            var dob, bankAccNo, claimsInfo, clinical_info, address, telephone, ssn, email, name;
                            var PassPhrase = req.body.userPublicKey;
                            var Bits = 1024;
                            var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
                            if (user_grant_access[0].serviceAccess.dateOfBirth.toString() == req.body.dob && (req.body.dob == "true")) {
                                console.log("1");
                                a = data.Item.dob.toString();
                                console.log(data.Item.dob);
                                dob = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            //console.log(user_grant_access[0].serviceAccess.bankAccNo.toString());
                            //console.log(req.body.accno);
                            if (user_grant_access[0].serviceAccess.bankAccNo.toString() == req.body.accno && (req.body.accno == "true")) {
                                console.log("now I am here2");
                                a = data.Item.bankAccNo.toString();
                                console.log(data.Item.dob);
                                bankAccNo = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            if (user_grant_access[0].serviceAccess.claimsInfo.toString() == req.body.claims_info && (req.body.claims_info == "true")) {
                                console.log("now I am here3");
                                a = data.Item.claimsInfo.toString();
                                console.log(data.Item.dob);
                                claimsInfo = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            if (user_grant_access[0].serviceAccess.clinicalInfo.toString() == req.body.clinical_info && (req.body.clinical_info == "true")) {
                                console.log("now I am here4");
                                a = data.Item.claimsInfo.toString();
                                console.log(data.Item.dob);
                                clinical_info = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            if (user_grant_access[0].serviceAccess.mailingAddress.toString() == req.body.address && (req.body.address == "true")) {
                                console.log("now I am here5");
                                a = data.Item.address.toString();
                                console.log(data.Item.dob);
                                address = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            if (user_grant_access[0].serviceAccess.telephoneNo.toString() == req.body.mobno && (req.body.mobno == "true")) {
                                console.log("now I am here6");
                                a = data.Item.telephone.toString();
                                console.log(data.Item.dob);
                                telephone = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            if (user_grant_access[0].serviceAccess.emailAddress.toString() == req.body.email && (req.body.email == "true")) {
                                console.log("now I am here7");
                                a = data.Item.email.toString();
                                console.log(data.Item.dob);
                                email = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            if (user_grant_access[0].serviceAccess.socialSecurityNo.toString() == req.body.ssno && (req.body.ssno == "true")) {
                                console.log("now I am here8");
                                a = data.Item.ssn.toString();
                                console.log(data.Item.dob);
                                ssn = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            if (user_grant_access[0].serviceAccess.name.toString() == req.body.username && (req.body.username == "true")) {
                                console.log("now I am here8");
                                a = data.Item.user_name.toString();
                                console.log(data.Item.user_name);
                                name = cryptico.decrypt(a, MattsRSAkey).plaintext;
                            }
                            var returndata = {
                                "Status": "Data from user " + b,
                                "Name": name,
                                "dateOfBirth": dob,
                                "socialSecurityNo": ssn,
                                "emailAddress": email,
                                "mailingAddress": address,
                                "telephoneNo": telephone,
                                "bankAccNo": bankAccNo,
                                "clinicalInfo": clinical_info,
                                "claimsInfo": claimsInfo,
                            }

                            console.log(returndata);
                            //res.json(returndata);
                            //setTimeout(function(){
                            //app.get('/test1', function(req, res, next) {
                            console.log(returndata);
                            res.json(returndata);
                            //});
                            //console.log("aaa");
                            //res.redirect("/Data.html");
                            //},2000);
                        }
                    });

                }).catch(function () {
                    res.send("Signature is BAD");
                });


            });

        }
    });

});


app.post('/update', function (req, res) {
    // var express = require('express');
    // var path = require('path');
    // var bodyParser = require('body-parser');
    // var app = express();
    // var request = require('request');
    // var AWS = require('aws-sdk');
    // var cryptico = require('cryptico');
    // var crypto = require("crypto");
    // var eccrypto = require("eccrypto");
    // var config = require("./config.json");
    // var count = require("./test.js");
    // var sort = require("./testsortjson.js")
    // var grantAccess = require("./grantAccess.js")
    // module.exports = {
    //     updateaccess: function (req, res) {
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

                //Filling the empty input from database
                // console.log(clinical_info)
                // $(document).ready(function(){
                //     $('#clinicinfo').val(clinical_info) ;
                // })

                // $('#clinicinfo').val(clinical_info) 


                console.log(clinical_info + "clinical_info\n")
                // console.log(req.body.clinicalinfo+"\n\n")

                console.log("dob " + dob);
                console.log("\nssno " + ssno);
                console.log("\nemail " + email);
                console.log("\nbankaccno " + bankaccno);
                console.log("\nclaimsInfo " + claimsInfo);
                console.log("\nAddress " + Address);
                console.log("\ntelephone " + telephone);


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
                // var params2 = {
                //     TableName: 'privatedata',
                //     // Key: {
                //     //     id: { N: (req.body.userid) }
                //     // },
                //     Item: {
                //         // 'id': { N: req.body.userid },
                //         'address': { S: msg_addr.cipher },
                //         'dob': { S: msg_dob.cipher },
                //         'email': { S: msg_mail.cipher },
                //         // 'name': { S: msg_name.cipher },
                //         'ssn': { S: msg_ssn.cipher },
                //         'telephone': { S: msg_tele.cipher },
                //         'bankAccNo': { S: msg_bankaccno.cipher },
                //         'claimsInfo': { S: msg_claimsInfo.cipher },
                //         'clinicalInfo': { S: msg_clinicinfo.cipher }

                //     }
                // };

                // console.log("Data after encryption");
                // console.log(params2.Item);

                // console.log("user id " + req.body.userid);

                // // updating part

                // ddb.putItem(params2, function (err, data) {
                //     if (err) {
                //         res.send(err);
                //     }
                //     else {
                //         var privateKey = crypto.randomBytes(32);
                //         var msg1 = privateKey.toString('base64');
                //         //console.log(cryptico.decrypt(msg_mail.cipher, MattsRSAkey).plaintext);
                //         alert("Updation successfull!!Congratulation with user id " + req.body.userid + " Keep your passphrase safe " + req.body.newPassphrase + " Your signing key " + msg1 + " Your Public key :" + MattsPublicKeyString + " ....");
                //         // res.send("Updation successfull!!Congratulation with user id " + req.body.userid + " Keep your passphrase safe " + req.body.passphrase + " Your signing key " + msg1+" Your Public key :"+" ....");
                //     }
                // });

                var params2 = {
                    TableName: 'privatedata',
                    Key: {
                        id: { N: (req.body.userid) }
                    },
                    AttributeUpdates: {
                        // clinicalInfo: {
                        //     Action: 'PUT',
                        //     Value: { S: enc_clinicinfo.cipher }
                        // },
                        clinicalInfo: {
                            Action: 'PUT',
                            Value: { S: msg_clinicinfo.cipher }
                        },
                        address: {
                            Action: 'PUT',
                            Value: { S: msg_addr.cipher }
                        },
                        dob: {
                            Action: 'PUT',
                            Value: { S: msg_dob.cipher }
                        },
                        email: {
                            Action: 'PUT',
                            Value: { S: msg_mail.cipher }
                        },
                        // 'name': { 
                        // Action: 'PUT',
                        //             Value: {S: msg_name.cipher }
                        // },
                        ssn: {
                            Action: 'PUT',
                            Value: { S: msg_ssn.cipher }
                        },
                        telephone: {
                            Action: 'PUT',
                            Value: { S: msg_tele.cipher }
                        },

                        bankAccNo: {
                            Action: 'PUT',
                            Value: { S: msg_bankaccno.cipher }
                        },
                        claimsInfo: {
                            Action: 'PUT',
                            Value: { S: msg_claimsInfo.cipher }
                        },
                        
                    },
                    ReturnValues: 'ALL_NEW'
                };

                console.log("Data after encryption");
                console.log(params2.Item);

                console.log("user id " + req.body.userid);


                ddb.updateItem(params2, function (err, data) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        
                        res.json("Updation successfull!!Congratulation with user id " + req.body.userid + " Keep your passphrase safe " + req.body.newPassphrase + " Your signing key " +MattsRSAkey+" Your Public key :"+" ....");


                        // res.writeHead(302, {
                        //     'Location': 'http://localhost:1338/update.html'
                        // });
                        // // res.send("Successfully Updated")
                        // res.end();
                        // console.log("Successfully Updated")
                        

                        // alert("Successfully Updated")
                    }
                })
            });
        }
    });
});
// }
// }


app.listen(1338, function (params) {
    console.log('I am listening at 1338');

})