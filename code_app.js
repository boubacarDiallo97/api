// importing the only file required
var R = require("./controllers/onering.js");

var app = R.express();
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
	// If no error, then good to proceed.
	if(err){
		console.log("Non Connected", err);
	}else{
		console.log("Connected");
	}
});

connection.connect();

// allowing several oringin: servers and ports
const allowedOrigins = [
	'capacitor://localhost',
	'ionic://localhost',
	'http://localhost',
	'http://localhost:8080',
	'http://localhost:8100',
	'http://localhost:4200',
	'https://icy-flower-0408c9203.azurestaticapps.net'
];

// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  }
}

// Enable preflight requests for all routes
app.options('*', R.cors(corsOptions));

// API for questions
app.get('/questions', R.cors(corsOptions), R.GetQuestions);
app.post('/questions', R.cors(corsOptions), R.CreateQuestion);
app.put('/questions', R.cors(corsOptions), R.UpdateQuestion);
app.delete('/questions', R.cors(corsOptions), R.DeleteQuestion);

// API for types
app.get('/types', R.cors(corsOptions), R.GetTypes);
app.post('/types', R.cors(corsOptions), R.CreateType);
app.put('/types', R.cors(corsOptions), R.UpdateType);
app.delete('/types', R.cors(corsOptions), R.DeleteType);

// API for subjects
app.get('/subjects', R.cors(corsOptions), R.GetSubjects);
app.post('/subjects', R.cors(corsOptions), R.CreateSubject);
app.put('/subjects', R.cors(corsOptions), R.UpdateSubject);
app.delete('/subjects', R.cors(corsOptions), R.DeleteSubject);

// API for languages
app.get('/languages', R.cors(corsOptions), R.GetLanguages);
app.post('/languages', R.cors(corsOptions), R.CreateLanguage);
app.put('/languages', R.cors(corsOptions), R.UpdateLanguage);
app.delete('/languages', R.cors(corsOptions), R.DeleteLanguage);

// API for difficulties
app.get('/difficulties', R.cors(corsOptions), R.GetDifficulties);
app.post('/difficulties', R.cors(corsOptions), R.CreateDifficulty);
app.put('/difficulties', R.cors(corsOptions), R.UpdateDifficulty);
app.delete('/difficulties', R.cors(corsOptions), R.DeleteDifficulty);

// API for answers
app.get('/answers', R.cors(corsOptions), R.GetAnswers);
app.post('/answers', R.cors(corsOptions), R.CreateAnswer);
app.put('/answers', R.cors(corsOptions), R.UpdateAnswer);
app.delete('/answers', R.cors(corsOptions), R.DeleteAnswer);

// API for user
app.get('/user', R.cors(corsOptions), R.GetUser);

// API for db
app.get('/db', R.cors(corsOptions), R.GetDB);

app.set('port', process.env.PORT || 3000);

// entry point of the app
app.listen(app.get('port'), function() {
  console.log('Listen by port ', app.get('port'));
});


app.get('/', function(req, res, next) {
	res.sendFile('./index.html', {root: __dirname });
});


