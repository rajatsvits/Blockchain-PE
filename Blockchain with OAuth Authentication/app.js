const express = require("express");
const {google} = require('googleapis');
const app = express();

app.use(express.static('static'));


var server = app.listen(2000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});



const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2("895775525526-rsmoj893pn6eorui8no56uat16m9p67k.apps.googleusercontent.com",
 "sJNAyw8SNLgJToScuY3QczNy", "http://localhost:2000/oauthcallback/html");

// generate a url that asks permissions for Google+ and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/gmail.modify'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: scopes // If you only need one scope you can pass it as string
});

app.get("/url", function(req, res) {
  res.send(url);
});

app.get("/tokens", function(req, res) {

  var code = req.query.code;

  console.log(code);

  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      console.log(err);
      res.send(err);
      return;
    }

    console.log("allright!!!!");

    console.log(err);
    console.log(tokens);
    oauth2Client.setCredentials(tokens);

    res.send(tokens);
  });
});