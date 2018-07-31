'use strict'

// сервер парсеров

const config = require('./config.json');
const childProcess = require('child_process');

const Datastore = require('nedb');	// файловая БД

const db = {};
db.test = new Datastore('db/test.db');

db.test.loadDatabase(function(error) {
	if (error)
		return console.log('Ошибка загрузки БД:', error);

	db.test.insert({test: "test"}, function (err, newDoc) {
		if (err) console.log(err);

		console.log(newDoc);
	});
});


runParser('./parsers/node_parsers/test.js', function (err) {
    if (err) throw err;
    console.log('test.js');
});

// запуск фонового скрипта парсера
function runParser(path, callback) {

    let invoked = false;
    let process = childProcess.fork(path);
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}