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

// method for get entries in Difficulties (GET)
exports.GetDifficulties =function(req, res) {
    request = new Request("Select * from Difficulties;", function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    var result = [];
    request.on('row', function(columns) {
        var DifficultyId = columns[0].value;
        var Name = columns[1].value;
        result.push({ DifficultyId, Name});

    });

    request.on('requestCompleted', function () {
        return res.status(200).send(result);
    });
    connection.execSql(request);

}

// method for create entry in Difficulties (POST)
exports.CreateDifficulty = function (req, res) {
    const value = req.query.Name;
    request = new Request("INSERT INTO Difficulties (Name) VALUES ('" + value  +"'); ", function(err) {
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

// method for update entry in Difficulties (PUT)
exports.UpdateDifficulty = async function (req, res) {
    request = new Request("UPDATE Difficulties SET Name =\'" + req.query.Name  +"' WHERE DifficultyId = " + req.query.DifficultyId, function(err) {
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

// method for delete entry in Difficulties (DELETE)
exports.DeleteDifficulty = function (req, res) {
    request = new Request("DELETE Difficulties WHERE DifficultyId = " + req.query.DifficultyId, function(err) {
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
