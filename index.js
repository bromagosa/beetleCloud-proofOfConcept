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

app.use(express.static('static'));
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
    db.query('SELECT * FROM projects WHERE username = \'' + appGetRequest.params.username + '\' ORDER BY projectName', function(err, rows, fields) {
        if (err) throw err;
        var html = '<html><head><link rel="stylesheet" type="text/css" href="../style.css"></head><body><h1>Projects by ' + appGetRequest.params.username + '</h1>';
        rows.forEach(function(eachProject) {
            html 
                += '<a target="_blank" href="http://beetleblocks.com/run/#present:Username=' 
                + appGetRequest.params.username 
                + '&ProjectName=' + eachProject.projectName 
                + '"><div class="project"><img width="160" height="120" alt="' + eachProject.projectName 
                + '" src="' + eachProject.thumbnail + '"><p>'
                + eachProject.projectName + '</p></div></a>'
        });
        html += '</body></html>';
	appGetResponse.send(html);
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
