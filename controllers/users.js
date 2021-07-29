// file to manage the data from and to the db, via API and via sequelize library

// required libraries
var Connection = require('tedious').Connection;
var config = {
    server: 'gpe.database.windows.net',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'gpeAdmin', //update me
            password: 'Password@'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'gpebd'  //update me
    }
};
var connection = new Connection(config);
connection.on('connect', function(err) {
    // If no err, then good to proceed.
    if(err){
        console.log("Non Connected", err);
    }else{
        console.log("Connected");
    }
});

connection.connect();
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
// method for get entries in Types (GET)
exports.GetUser =function(req, res) {
    const q = "Select * from Users WHERE Username ='" + req.query.username + "' AND Password ='" + req.query.password + "'";
    console.log(q);
    request = new Request(q, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    var result = [];
    request.on('row', function(columns) {
        var UserId = columns[0].value;
        var Username = columns[1].value;
        var Password = columns[2].value;
        result.push({ UserId, Username, Password});

    });

    request.on('requestCompleted', function () {
        return res.status(200).send(result);
    });
    try {
        connection.execSql(request);
    } catch (e) {
        console.error(e);
    }

}
