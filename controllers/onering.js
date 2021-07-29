// "One Ring to rule them all, One Ring to find them, One Ring to bring them all"
// file to centralize the import (by requires) of all the data managment via API of the diffents data types

// required libraries
exports.express = require('express');
exports.mysql = require('mysql2');
exports.cors = require('cors');

// for the questions
exports.GetQuestions = require('./questions.js').GetQuestions;
exports.CreateQuestion = require('./questions.js').CreateQuestion;
exports.UpdateQuestion = require('./questions.js').UpdateQuestion;
exports.DeleteQuestion = require('./questions.js').DeleteQuestion;

// for the subjects
exports.GetSubjects = require('./subjects').GetSubjects;
exports.CreateSubject = require('./subjects').CreateSubject;
exports.UpdateSubject = require('./subjects').UpdateSubject;
exports.DeleteSubject = require('./subjects').DeleteSubject;

// for the languages
exports.GetLanguages = require('./languages').GetLanguages;
exports.CreateLanguage = require('./languages').CreateLanguage;
exports.UpdateLanguage = require('./languages').UpdateLanguage;
exports.DeleteLanguage = require('./languages').DeleteLanguage;

// for the difficulties
exports.GetDifficulties = require('./difficulties').GetDifficulties;
exports.CreateDifficulty = require('./difficulties').CreateDifficulty;
exports.UpdateDifficulty = require('./difficulties').UpdateDifficulty;
exports.DeleteDifficulty = require('./difficulties').DeleteDifficulty;

// for the types
exports.GetTypes = require('./types').GetTypes;
exports.CreateType = require('./types').CreateType;
exports.UpdateType = require('./types').UpdateType;
exports.DeleteType = require('./types').DeleteType;

// for the User
exports.GetUser = require('./users').GetUser;

// for the db
exports.GetDB = require('./db').db;
