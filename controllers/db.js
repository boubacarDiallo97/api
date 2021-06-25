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
        console.log("Connected db");
    }
});

connection.connect();
const fs = require('fs');

exports.db = function(req, res) {
    let fichier = fs.readFileSync(__dirname + '/../data.json')
    let data = JSON.parse(fichier);
    if(req.query.version !== undefined) {
        let version = parseInt(req.query.version);
        const maxVersion = parseInt(Object.keys(data)[Object.keys(data).length - 1]);
        console.log('version ', version);
        if(version < maxVersion) {
            let objects = [];
            while(version < maxVersion){
                version += 1;
                objects.push(Object.assign({}, data[`${version.toString()}`]));
            }
            let dataFinal = [];
            let i = 0;
            objects.forEach(obj => {
                Object.values(obj).forEach(value => {
                    dataFinal.push(value);
                    i += 1;
                });
            });
            objectVersion = {}
            objectVersion["version"] = maxVersion;
            dataFinal.push(Object.assign({}, objectVersion));
            let donnees = JSON.stringify(dataFinal);
            fs.writeFile('db.json', donnees, function (err) {
                if (err) throw err;
                console.log('Fichier créé !');
                var file = __dirname + '/../db.json';
                res.download(file);
            });
        }else{
            fs.writeFile('db.json', JSON.stringify([]), function (err) {
                if (err) throw err;
                console.log('Fichier créé !');
                var file = __dirname + '/../db.json';
                res.download(file);
            });
        }
    }else{
        return res.status(500).send('need version');
    }
}
