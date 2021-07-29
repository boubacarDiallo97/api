// file to manage the data from and to the db, via API and via sequelize library

// required libraries
const {updateDataFile} = require("./db");
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
    try {
        connection.execSql(request);
    }catch (e) {
        console.log(e);
    }

}

// method for create entry in Difficulties (POST)
exports.CreateDifficulty = function (req, res) {
    const value = req.query.Name;
    const cmdValue = "INSERT INTO Difficulties (Name) VALUES ('" + value  + "')";
    request = new Request(cmdValue, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }else{
            request.on('requestCompleted', function () {
                updateDataFile(req, res, cmdValue, 'creation');
            });
        }
    });

    try {
        connection.execSql(request);
    }catch (e) {
        console.log(e);
    }

}

// method for update entry in Difficulties (PUT)
exports.UpdateDifficulty = async function (req, res) {
    const cmdRequest = "SELECT * from Difficulties Where DifficultyId=" + req.query.DifficultyId;
    requestSelect = new Request(cmdRequest, function(err) {
        if (err) {
            console.log(err);
        }
    });

    requestSelect.on('row', function(columns) {
        var Name = columns[1].value;
        const cmdValue = "UPDATE Difficulties SET Name =\'" + req.query.Name  +"' WHERE Name='" + Name + "'";
        request = new Request(cmdValue, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err.message);
            }else {
                request.on('requestCompleted', function () {
                    updateDataFile(req, res, cmdValue, 'update');
                });
            }
        });

    });

    requestSelect.on('requestCompleted', function () {
        try {
            connection.execSql(request);
        }catch (e) {
            console.log(e);
        }

    });
    try {
        connection.execSql(requestSelect);
    }catch (e) {
        console.log(e);
    }


}

// method for delete entry in Difficulties (DELETE)
exports.DeleteDifficulty = function (req, res) {

    const cmdRequest = "SELECT * from Difficulties Where DifficultyId=" + req.query.DifficultyId;
    requestSelect = new Request(cmdRequest, function(err) {
        if (err) {
            console.log(err);
        }
    });

    requestSelect.on('row', function(columns) {
        var Name = columns[1].value;
        const cmdValue = "DELETE FROM Difficulties WHERE Name ='" + Name + "'";
        request = new Request(cmdValue, function(err) {
            if (err) {
                console.log(err);
            }else {
                request.on('requestCompleted', function () {
                    updateDataFile(req, res, cmdValue, 'delete');
                });
            }
        });

    });

    requestSelect.on('requestCompleted', function () {
        try {
            connection.execSql(request);
        }catch (e) {
            console.log(e);
        }

    });
    try {
        connection.execSql(requestSelect);
    }catch (e) {
        console.log(e);
    }


}
