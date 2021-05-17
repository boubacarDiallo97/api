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
        console.log("Non Connected");
    }else{
        console.log("Connected");
    }
});

connection.connect();
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
// method for get entries in Subjects (GET)
exports.GetSubjects =function(req, res) {
    request = new Request("Select * from Subjects;", function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    var result = [];
    request.on('row', function(columns) {
        var SubjectId = columns[0].value;
        var LanguageId = columns[1].value;
        var Name = columns[2].value;
        result.push({ SubjectId, Name, LanguageId});

    });

    request.on('requestCompleted', function () {
        return res.status(200).send(result);
    });
    connection.execSql(request);

}

// method for create entry in Subjects (POST)
exports.CreateSubject = function (req, res) {
    request = new Request("INSERT INTO Subjects (LanguageId, Name) VALUES ((SELECT LanguageId FROM Languages WHERE Name = '"
        + req.query.Language  + "'), '" + req.query.Name  +"'); ", function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    request.on('requestCompleted', function () {
        return res.status(201).json({ Create: true });
    });
    connection.execSql(request);
}

// method for update entry in Subjects (PUT)
exports.UpdateSubject = async function (req, res) {
    request = new Request("UPDATE Subjects SET Name =\'" + req.query.Name  +"' WHERE SubjectId = " + req.query.SubjectId, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    request.on('requestCompleted', function () {
        return res.status(200).json({ Update: true });
    });
    connection.execSql(request);

}

// method for delete entry in Subjects (DELETE)
exports.DeleteSubject = function (req, res) {
    request = new Request("DELETE Subjects WHERE SubjectId = " + req.query.SubjectId, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    request.on('requestCompleted', function () {
        return res.status(200).json({ Delete: true });
    });
    connection.execSql(request);

}

