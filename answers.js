// file to manage the data from and to the db, via API and via sequelize library

// required libraries
var answers_model = require('./models/answers');
var Sequelize = require('sequelize');
var mysql = require('mysql');

// creating "sequelize" object. Is the one who is going to connect with the db
const sequelize = new Sequelize('etest', 'application', 'passw0rd', {
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false
    }
  });
  
// authentication
sequelize.authenticate()
    .then(() => {
        console.log('sequelize.authenticate: OK')
    })
    .catch(err => {
        console.log('sequelize.authenticate: KO')
    })

// method for get entries in Answers (GET)
exports.GetAnswers = function(req, res) {
    const Answers = sequelize.define('answers', answers_model);
    var whereStatement = {};

    if (req.query.AnswerId) {
        whereStatement.AnswerId = req.query.AnswerId;
    }

    // here the moment when the find occurs
    Answers.findAll({ attributes: ['AnswerId', 'QuestionId', 'answer'],  where: whereStatement })
    .then(answer => {
        res.send(answer);
    })
    .catch(err => {
        console.log(err)
    })
}

// method for create entry in Answers (PUT)
exports.CreateAnswer = function (req, res) {
    const Answers = sequelize.define('answers', answers_model);

    try {
        // here the moment when the create occurs
        const answer = Answers.create(req.body);
        return res.status(201).json({ answer });        
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// method for update entry in Answers (POST)
exports.UpdateAnswer = function (req, res) {
    const Answers = sequelize.define('answers', answers_model);

    try {
        const { AnswerId } = req.params;
        // here the moment when the update occurs
        const deleted = Answers.update(req.body, {
            where: { AnswerId: AnswerId }
        });
        if (deleted) {
            const updatedAnswer = Answers.findOne({ where: { AnswerId: AnswerId } });
            return res.status(200).json({ Answer: updatedAnswer });
        }
        throw new Error("Answer not found");
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// method for delete entry in Answers (DELETE)
exports.DeleteAnswer = function (req, res) {
    const Answers = sequelize.define('answers', answers_model);

    try {
        const { AnswerId } = req.query;
        // here the moment when the delete occurs
        const deleted = Answers.destroy({
            where: { AnswerId: AnswerId }
        });
        if (deleted) {
            return res.status(204).send("Answer deleted");
        }
        throw new Error("Answer not found");
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

// method for create entry in Answers (PUT) not using sequelize
exports.CreateAnswerNoSequelize = async function(req, res) {
    // create object to connect with the db
    var connection = mysql.createConnection({
        host: "localhost",
        user: "application",
        password: "passw0rd"
    });

    var wellFormed = false;

    var q = 'INSERT INTO etest.Answers (QuestionId, Answer) VALUES (\'';

    if (req.query.QuestionId){
        q += req.query.QuestionId + ', ';
        if (req.query.Answer){
            wellFormed = true;
            q += req.query.Answer + ')';
            
        }
    }

    if (wellFormed) {
        // if the query is well formed (has the Answer and AnswerId) we proceed to create the entry in db
        connection.query(q, function (err, result) {  
            if (err) throw err;  
            console.log("1 record inserted");
            res.send("201: insertion ok");
        });
    }
    connection.end();
}

// method for update entry in Answers (POST) not using sequelize
exports.UpdateAnswerNoSequelize = async function(req, res) {
    // create object to connect with the db
    var connection = mysql.createConnection({
        host: "localhost",
        user: "application",
        password: "passw0rd"
    });

    var wellFormed = false;

    var q = 'UPDATE etest.Answers SET Answer =';

    if (req.query.Answer) {
        q += req.query.Answer;
        if (req.query.LanguageId) {
            q += ' WHERE AnswerId = ' + req.query.AnswerId;
            wellFormed = true;
        }
    }

    if (wellFormed) {
        // if the query is well formed (has the Answer and AnswerId) we proceed to update the entry in db
        connection.query(q, function (err, result) {  
            if (err) throw err;  
            console.log("1 record updated");
            res.send("200: updated ok");
        });
    }
    connection.end();
}
