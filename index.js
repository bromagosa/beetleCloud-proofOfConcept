var http = require('http'),
    express = require('express'),
    app = express(),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    httpServer = http.Server(app),
    options = {
        'host': 'localhost',
        'user': 'BeetleRoot',
        'password': 'ModernTurtlesFly',
        'database': 'beetlecloud'
    };

var db = mysql.createConnection(options);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(request, response, next) {
    response.setHeader('Access-Control-Allow-Origin', 'http://beetleblocks.com');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', function(appGetRequest, appGetResponse) {
    appGetResponse.send('BeetleCloud proof of concept');
});

app.get('/user/:username', function(appGetRequest, appGetResponse) {
    // Returns all projects by a user
    db.query('SELECT * FROM projects WHERE username = \'' + appGetRequest.params.username + '\'', function(err, rows, fields) {
        if (err) throw err;
        var html = '<html><body>';
        rows.forEach(function(eachProject) {
            html 
                += '<a href="http://beetleblocks.com/run/#present:Username=' 
                + appGetRequest.params.username 
                + '&ProjectName=' + eachProject.projectName 
                + '"><img alt="' + eachProject.projectName 
                + '" src="' + eachProject.thumbnail + '"></a>'
        });
        html += '</body></html>';
    });
});

app.post('/project', function(appPostRequest, appPostResponse) {

    var dbObject = {
        username: appPostRequest.body.username,
        projectName: appPostRequest.body.projectName,
        thumbnail: appPostRequest.body.thumbnail
    };

    db.query('INSERT INTO projects SET ?', dbObject, function(err, result) {
        if (err) {
            appPostResponse.send(err);
            throw(err);
            console.error(err);
        } else {
            appPostResponse.send('OK');
        }
    });
});

httpServer.listen(9999);
