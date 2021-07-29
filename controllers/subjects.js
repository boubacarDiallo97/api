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
        var Link = columns[3].value;
        result.push({ SubjectId, Name, LanguageId, Link});

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

// method for create entry in Subjects (POST)
exports.CreateSubject = function (req, res) {
    const cmdValue = "INSERT INTO Subjects (LanguageId, Name, Link) VALUES ((SELECT LanguageId FROM Languages WHERE Name = '"
        + req.query.Language  + "'), '" + req.query.Name  + "', '" + req.query.Link +"')";

    request = new Request(cmdValue, function (err) {
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
    }catch (e){
        console.log(e);
    }
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
            let startValue = type === 'update' ? "UPDATE Subjects SET Name ='" + req.query.Name + "', Link='" + req.query.Link + "' " : "DELETE FROM Subjects ";
            cmdValue = startValue + "WHERE LanguageId =(SELECT LanguageId from Languages WHERE Name='" + NameLanguage + "') AND Name='" + NameSubject + "'";
            console.log(cmdValue);
            let requestUpdate = new Request(cmdValue, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err.message);
                }else{
                    requestUpdate.on('requestCompleted', function () {
                        updateDataFile(req, res, cmdValue, type);
                    });
                }
            });


            requestSelectLanguage.on('requestCompleted', function () {
                try {
                    connection.execSql(requestUpdate);
                }catch (e) {
                    console.log(e);
                }

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
