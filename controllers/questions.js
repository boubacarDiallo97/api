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

// method for get entries in Questions (GET)
exports.GetQuestions =function(req, res) {
    var q = "SELECT Q.QuestionId, T.Name, L.Name, D.Name, S.Name, Q.Text, Q.Passed, Q.Auxiliar from Questions Q, Languages L, Types T, Difficulties D, Subjects S where Q.QType=T.TypeId AND Q.QLanguage=L.LanguageId AND Q.QDifficulty=D.DifficultyId AND Q.QSubject=S.SubjectId";
    const cmdType = "(SELECT TypeId from Types Where Name='" + req.query.Type + "'),";
    const cmdDifficulty = "(SELECT DifficultyId from Difficulties Where Name='" + req.query.Difficulty + "')";
    const cmdLanguage = "(SELECT LanguageId from Languages Where Name='" + req.query.Language + "')";
    const cmdSubject = "(SELECT SubjectId from Subject Where Name='" + req.query.Subject + "' AND WHERE LanguageId="
        + "(SELECT LanguageId from Languages Where Name='" + req.query.Language + "'))";
    if(req.query.Type) {
        q += " AND QType =" + cmdType;
    }
    if(req.query.Language) {
        q += " AND QLanguage =" + cmdLanguage;
    }
    if(req.query.Subjects) {
        q += " AND QSubject =" + cmdSubject;
    }
    if(req.query.Difficulty) {
        q += " AND QDifficulty =" + cmdDifficulty;
    }
    request = new Request(q, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    var result = [];
    request.on('row', async function(columns) {
        var QuestionId = columns[0].value;
        var Text = columns[5].value;
        var Auxiliar = columns[6].value;
        var Passed = columns[7].value;
        var QType = columns[1].value;
        var QLanguage = columns[2].value;
        var QDifficulty = columns[3].value;
        var QSubject = columns[4].value;
        result.push({ QuestionId, QType, QLanguage, QDifficulty, QSubject, Text, Auxiliar, Passed});
    });
    request.on('requestCompleted', function () {
        return res.status(200).send(result);
    });
    try {
        connection.execSql(request);
    }catch (e){
        console.log(e);
    }


}

// method for create entry in Questions (POST)
exports.CreateQuestion = function (req, res) {
    const cmdValue  = "INSERT INTO Questions (QType, QLanguage, QDifficulty, QSubject, Text, Passed, Auxiliar) VALUES (" +
        "(SELECT TypeId FROM Types WHERE Name='" + req.query.Type + "')," +
        "(SELECT LanguageId FROM Languages WHERE Name='" + req.query.Language + "')," +
        "(SELECT DifficultyId FROM Difficulties WHERE Name='" + req.query.Difficulty + "')," +
        "(SELECT SubjectId FROM Subjects WHERE Name='" + req.query.Subject + "' AND LanguageId=(SELECT LanguageId FROM Languages WHERE Name='"+ req.query.Language + "'))" +
        ', \'' + req.query.Text + '\', 0,' + req.query.Auxiliar + ')';

    console.log(cmdValue);
    let request = new Request(cmdValue, function(err) {
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

// method for update entry in Questions (PUT)
exports.UpdateQuestion = async function (req, res) {

    const cmdRequest = "SELECT Q.QuestionId, T.Name, L.Name, D.Name, S.Name, Q.Text, Q.Passed, Q.Auxiliar from Questions Q, Languages L, Types T, Difficulties D, Subjects S where Q.QType=T.TypeId AND Q.QLanguage=L.LanguageId" +
        "AND Q.QDifficulty=D.DifficultyId AND Q.QSubject=S.SubjectId AND QuestionId=" + req.query.QuestionId;
    let requestSelect = new Request(cmdRequest, function(err) {
        if (err) {
            console.log(err);
        }
    });

    requestSelect.on('row', function(columns) {
        var Text = columns[5].value;
        var QType = columns[1].value;
        var QLanguage = columns[2].value;
        var QDifficulty = columns[3].value;
        const cmdValue = "UPDATE Questions SET " +
            "QType= (SELECT TypeId FROM Types WHERE Name='" + req.query.Type + "')," +
            "QDifficulty= (SELECT DifficultyId FROM Difficulties WHERE Name='" + req.query.Difficulty + "')," +
            "QLanguage=(SELECT LanguageId FROM Languages WHERE Name='" + req.query.Language + "')," +
            "QSubject= (SELECT SubjectId FROM Subjects WHERE Name='" + req.query.Subject + "' AND LanguageId=(SELECT LanguageId FROM Languages WHERE Name='"+ req.query.Language + "'))" +
            ', Text= \'' + req.query.Text + '\', Passed =' + req.query.Passed + ', Auxiliar=' + req.query.Auxiliar
             + " WHERE QType=(SELECT TypeId FROM Types WHERE Name='" + QType + "')," +
            " AND QLanguage=(SELECT LanguageId FROM Languages WHERE Name='" + QLanguage + "')," +
            " AND QSubject=(SELECT DifficultyId FROM Difficulties WHERE Name='" + QDifficulty + "')," +
            "  AND Text ='" + Text + "'";
        let request = new Request(cmdValue, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err.message);
            }else{
                request.on('requestCompleted', function () {
                    updateDataFile(req, res, cmdValue, 'update');
                });
            }
        });

    });

    requestSelect.on('requestCompleted', function () {
        try  {
            connection.execSql(request);
        }
        catch (e) {
            console.error(e);
        }
    });

    try {
        connection.execSql(requestSelect);
    }
    catch (e) {
        console.error(e);
    }

}

// method for delete entry in Questions (DELETE)
exports.DeleteQuestion = function (req, res) {
    const cmdRequest = "SELECT Q.QuestionId, T.Name, L.Name, D.Name, S.Name, Q.Text, Q.Passed, Q.Auxiliar from Questions Q, Languages L, Types T, Difficulties D, Subjects S where Q.QType=T.TypeId AND Q.QLanguage=L.LanguageId" +
        "AND Q.QDifficulty=D.DifficultyId AND Q.QSubject=S.SubjectId AND QuestionId=" + req.query.QuestionId;
    let requestSelect = new Request(cmdRequest, function(err) {
        if (err) {
            console.log(err);
        }
    });

    requestSelect.on('row', function(columns) {
        var Text = columns[5].value;
        var QType = columns[1].value;
        var QLanguage = columns[2].value;
        var QDifficulty = columns[3].value;
        const cmdValue = "DELETE FROM Questions WHERE" +
            " QType=(SELECT TypeId FROM Types WHERE Name='" + QType + "')," +
            " AND QLanguage=(SELECT LanguageId FROM Languages WHERE Name='" + QLanguage + "')," +
            " AND QSubject=(SELECT DifficultyId FROM Difficulties WHERE Name='" + QDifficulty + "')," +
            "  AND Text ='" + Text + "'";
        let request = new Request(cmdValue, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err.message);
            }else{
                request.on('requestCompleted', function () {
                    updateDataFile(req, res, cmdValue, 'update');
                });
            }
        });

    });

    requestSelect.on('requestCompleted', function () {
        try  {
            connection.execSql(request);
        }
        catch (e) {
            console.error(e);
        }
    });

    try {
        connection.execSql(requestSelect);
    }
    catch (e) {
        console.error(e);
    }

}

