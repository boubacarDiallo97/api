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
// method for get entries in Languages (GET)
exports.GetLanguages =function(req, res) {
	request = new Request("Select * from Languages;", function(err) {
		if (err) {
			console.log(err);
			return res.status(500).send(err.message);
		}
	});

	var result = [];
	request.on('row', function(columns) {
		var LanguageId = columns[0].value;
		var Name = columns[1].value;
		result.push({ LanguageId, Name});

	});

	request.on('requestCompleted', function () {
		return res.status(200).send(result);
	});
	connection.execSql(request);

}

// method for create entry in Languages (POST)
exports.CreateLanguage = function (req, res) {
	const value = req.query.Name;
    request = new Request("INSERT INTO Languages (Name) VALUES ('" + value  +"'); ", function(err) {
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
		myObj[`${version.toString()}`] = [{"cmd": "INSERT INTO Languages (Name) VALUES ('" + value  + "')"}];
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

// method for update entry in Languages (PUT)
exports.UpdateLanguage = async function (req, res) {
    request = new Request("UPDATE Languages SET Name =\'" + req.query.Name  +"' WHERE LanguageId = " + req.query.LanguageId, function(err) {
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

// method for delete entry in Languages (DELETE)
exports.DeleteLanguage = function (req, res) {
	request = new Request("DELETE Languages WHERE LanguageId = " + req.query.LanguageId, function(err) {
        if (err) {
            console.log(err);
		}
	});

	request.on('requestCompleted', function () {
		return res.status(200).json({ Delete: true });
	});
	connection.execSql(request);

}
