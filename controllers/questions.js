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
const fs = require('fs');
// method for get entries in Questions (GET)
exports.GetQuestions =function(req, res) {
    var q = "Select * from Questions "
    var check = true;
    if(req.query.Type) {
        check = false;
        q += "WHERE QType = '" + req.query.Type + "' ";
    }
    if(req.query.Language) {
        q += check ? "WHERE " : "AND ";
        q += "QLanguage = '" + req.query.Language + "' ";
        check = false;
    }
    if(req.query.Subjects) {
        q += check ? "WHERE " : "AND ";
        q += "QSubject = '" + req.query.Subjects + "' ";
        check = false;
    }
    if(req.query.Difficulty) {
        q += check ? "WHERE " : "AND ";
        q += "QDifficulty = '" + req.query.Difficulty + "' ";
    }
    console.log(q);
    request = new Request(q, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    var result = [];
    request.on('row', function(columns) {
        var QuestionId = columns[0].value;
        var QType = columns[1].value;
        var QLanguage = columns[2].value;
        var QDifficulty = columns[3].value;
        var QSubject = columns[4].value;
        var Text = columns[5].value;
        var Auxiliar = columns[6].value;
        var Passed = columns[7].value;

        result.push({ QuestionId, QType, QLanguage, QDifficulty, QSubject, Text, Auxiliar, Passed});

    });

    request.on('requestCompleted', function () {
        return res.status(200).send(result);
    });
    connection.execSql(request);

}

// method for create entry in Questions (POST)
exports.CreateQuestion = function (req, res) {
    const q  = "INSERT INTO Questions (QType, QLanguage, QDifficulty, QSubject, Text, Passed, Auxiliar) VALUES (" +
        req.query.Type + ',' + req.query.Language + ',' + req.query.Difficulty + ',' + req.query.Subject + ', \'' + req.query.Text + '\', 0,' + req.query.Auxiliar + ')';
    request = new Request(q, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err.message);
        }
    });

    request.on('requestCompleted', function () {
        let fichier = fs.readFileSync(__dirname + '/../data.json')
        let data = JSON.parse(fichier);
        let length = Object.keys(data).length;
        var myObj = {};
        const version = length + 1;
        myObj[`${version.toString()}`] = [{"cmd": "INSERT INTO Questions (QType, QLanguage, QDifficulty, QSubject, Text, Passed, Auxiliar) VALUES (" +
                req.query.Type + ',' + req.query.Language + ',' + req.query.Difficulty + ',' + req.query.Subject + ', \'' + req.query.Text + '\', 0,' + req.query.Auxiliar + "')"}];
        Object.assign(data,  myObj);
        let donnees = JSON.stringify(data);
        fs.writeFile('data.json', donnees, function (err) {
            if (err) throw err;
            console.log('File Update !');
            return res.status(201).json({Create: true});
        });
    });
    connection.execSql(request);
}

// method for update entry in Questions (PUT)
exports.UpdateQuestion = async function (req, res) {
    const q = "UPDATE Questions SET "
        + 'QType = ' + req.query.Type + ' , QLanguage = ' + req.query.Language + ' , QDifficulty = '
        + req.query.Difficulty + ' , QSubject = ' + req.query.Subject + ' , Text = \'' + req.query.Text +
        '\' , Passed = '+ req.query.Passed + ' , Auxiliar = ' + req.query.Auxiliar + ' WHERE QuestionId = ' + req.query.QuestionId;
    request = new Request(q, function(err) {
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

// method for delete entry in Questions (DELETE)
exports.DeleteQuestion = function (req, res) {
    request = new Request("DELETE Questions WHERE QuestionId = " + req.query.QuestionId, function(err) {
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
