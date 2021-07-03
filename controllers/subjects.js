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
    const cmdValue = "INSERT INTO Subjects (LanguageId, Name) VALUES ((SELECT LanguageId FROM Languages WHERE Name = '"
        + req.query.Language  + "'), '" + req.query.Name  +"')";
    request = new Request(cmdValue, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    request.on('requestCompleted', function () {
        updateDataFile(req, res, cmdValue, 'creation');
    });
    connection.execSql(request);
}

// method for update entry in Subjects (PUT)
exports.UpdateSubject = function (req, res) {
    UpdateAndDelete(req, res, 'update');
}

// method for delete entry in Subjects (DELETE)
exports.DeleteSubject = function (req, res) {
    UpdateAndDelete(req, res, 'delete');
}

UpdateAndDelete = function(req, res, type) {
    let NameSubject;
    let LanguageId = 0;
    let NameLanguage;
    let cmdValue = '';
    const cmdRequest = "SELECT * from Subjects Where SubjectId=" + req.query.SubjectId;
    let requestSelect = new Request(cmdRequest, function (err) {
        if (err) {
            console.log(err);
        }
    });

    requestSelect.on('row', function (columns) {
        LanguageId = columns[1].value;
        NameSubject = columns[2].value;
        let requestSelectLanguage = new Request("SELECT * from Languages Where LanguageId=" + LanguageId, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err.message);
            }
        });

        requestSelectLanguage.on('row', function (columns) {
            NameLanguage = columns[1].value;
            let startValue = type === 'update' ? "UPDATE Subjects SET Name =\'" + req.query.Name + "'" : "DELETE FROM Subjects";
            cmdValue = startValue + " WHERE LanguageId =(SELECT LanguageId from Languages WHERE Name='" + NameLanguage + "') AND Name='" + NameSubject + "'";
            console.log(cmdValue);
            let requestUpdate = new Request(cmdValue, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err.message);
                }
            });

            requestUpdate.on('requestCompleted', function () {
                updateDataFile(req, res, cmdValue, type);
            });

            requestSelectLanguage.on('requestCompleted', function () {
                connection.execSql(requestUpdate);
            });
        });

        requestSelect.on('requestCompleted', function () {
            try {
                connection.execSql(requestSelectLanguage);
            } catch (e) {
                console.error(e);
            }
        });
    });


    try {
        connection.execSql(requestSelect);
    } catch (e) {
        console.error(e);
    }
}
