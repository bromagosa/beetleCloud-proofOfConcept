var http = require('http'),
    express = require('express'),
    app = express(),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    httpServer = http.Server(app),
    options = require('fs').readFileSync('db.json', 'utf-8');

var db = mysql.createConnection(JSON.parse(options));

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(request, response, next) {
    response.setHeader('Access-Control-Allow-Origin', 'http://beetleblocks.com');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', function(appGetRequest, appGetResponse) {
    appGetResponse.send('<h2>BeetleCloud API</h2>');
});

app.get('/user/:username', function(appGetRequest, appGetResponse) {
    // Returns all projects by a user

    db.query(
            'SELECT * FROM projects WHERE username = \'' + appGetRequest.params.username
            + '\' ORDER BY projectName',
            function(err, rows, fields) {

		if (err) {
	    		console.error(err);
			return;
		}

                var html = 
                    '<html><head><link rel="stylesheet" type="text/css" href="../style.css"></head><body><h1>Projects by ' 
                    + appGetRequest.params.username + '</h1>'
                    + '<a class="back" href="../../users"><small>&larr;</small></a>';

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


app.get('/users', function(appGetRequest, appGetResponse) {
    // Returns a list of all users and their project count

    db.query(
            'SELECT username, COUNT(*) AS projectCount FROM projects GROUP BY username ORDER BY username',
            function(err, rows, fields) {

		if (err) {
	    		console.error(err);
			return;
		}

                var html = 
                    '<html><head><link rel="stylesheet" type="text/css" href="../style.css">'
                    + '</head><body><h1>Users with shared projects</h1><div class="users">';

                rows.forEach(function(eachUser) {
                    html
                        += '<p><a class="user" href="../user/' + eachUser.username
                        + '"><span>' + eachUser.username + '</a> ('
                        + eachUser.projectCount + ' projects)</span></p>';
                });

                html += '</dev></body></html>';
                appGetResponse.send(html);

            });
});

app.post('/project', function(appPostRequest, appPostResponse) {
    // Inserts a project into the database. If it exists, it updates its thumbnail

    var username = appPostRequest.body.username,
        projectName = appPostRequest.body.projectName,
        thumbnail = appPostRequest.body.thumbnail;

    ifProjectExists(username, projectName, thumbnail, updateProject, insertProject);
    
});

app.post('/delete-project', function(appPostRequest, appPostResponse) {
    // Deletes a project from the database

    var username = appPostRequest.body.username,
        projectName = appPostRequest.body.projectName,
        thumbnail = appPostRequest.body.thumbnail;

    ifProjectExists(username, projectName, thumbnail, deleteProject, nop);
    
});

nop = function() {};


ifProjectExists = function(username, projectName, thumbnail, ifTrue, ifFalse) {
    db.query(
            'SELECT COUNT(*) AS count FROM projects WHERE username=\'' + username 
            + '\' AND projectName=\'' + projectName + '\'', 
            function(err, rows, fields) {

		if (err) {
	    		console.error(err);
			return;
		}

                if (rows[0].count > 0) {
                    ifTrue(username, projectName, thumbnail);
                } else {
                    ifFalse(username, projectName, thumbnail);
                }

            });

}

updateProject = function(username, projectName, thumbnail) {
    db.query(
            'UPDATE projects SET thumbnail=\'' + thumbnail 
            + '\' WHERE username=\'' + username 
            + '\' AND projectName=\'' + projectName + '\'',
            function(err) {
		if (err) { console.log(err) }
	    }
            );
}

insertProject = function(username, projectName, thumbnail) {
    db.query(
            'INSERT INTO projects SET ?',
            { 
                username: username,
                projectName: projectName,
                thumbnail: thumbnail
            },
            function(err) {
		if (err) { console.log(err) }
	    }
            );
}

deleteProject = function(username, projectName) {
    db.query(
            'DELETE FROM projects WHERE username=\'' + username 
            + '\' AND projectName=\'' + projectName + '\'',
            function(err) {
		if (err) { console.log(err) }
	    }
            );
}

// dirty keepAlive

setInterval(function () {
    db.query('SELECT 1');
}, 5000);

httpServer.listen(9999);
