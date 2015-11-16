var http = require('http'),
    express = require('express'),
    app = express(),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    httpServer = http.Server(app),
    options = {
        "host": "localhost",
        "user": "BeetleRoot",
        "password": "ModernTurtlesFly",
        "database": "beetlecloud"
    };

var db = mysql.createConnection(options);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(appGetRequest, appGetResponse) {
    appGetResponse.send('BeetleCloud');
});

app.get('/user/:username', function(appGetRequest, appGetResponse) {
    // Returns all projects by a user
    db.query('SELECT * FROM projects WHERE username = \'' + appGetRequest.params.username + '\'', function(err, rows, fields) {
        if (err) throw err;

        appGetResponse.send(rows);
    });
});

app.post('/project', function(appPostRequest, appPostResponse) {

    var dbObject = {
        username: appPostRequest.body.username,
        projectName: appPostRequest.body.projectName,
        projectURL: appPostRequest.body.projectURL,
        thumbnail: appPostRequest.body.thumbnail
    };

    db.query('INSERT INTO projects SET ?', dbObject, function(err, result) {
        if (err) {
            appPostResponse.send(err);
            throw(err);
            console.error(err);
        } else {
            appPostResponse.send('entry added');
        }
    });

});

httpServer.listen(9999);
