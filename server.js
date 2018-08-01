'use strict'

// сервер парсеров

const config = require('./config.json');
const childProcess = require('child_process');
const Datastore = require('nedb');	// файловая БД
const db = {};	// список баз данных
const fs = require('fs');
const express = require('express');
const app = express();

// ================================== ЗАПУСК ВЕБ СЕРВЕРА ============================================

app.get('/parser/:site', function (req, res) {
	if (!db[ req.params.site ]) {
		return res.send({
			error: 'Ошибка получения данных с парсера ' +  req.params.site
		});
	}

	// загрузим последнюю информацию с БД
	db[ req.params.site ].loadDatabase(function(error) {
		if (error) return res.send({
			error: 'Ошибка получения данных с парсера ' +  req.params.site
		});

		db[ req.params.site ].find({}, function (error, docs) {
			res.send( (error || docs) );
		});
	});


});

app.listen(config.port, function () {
	console.log('Сервер запущен на порте: ', config.port);
});


// ================================== ЗАПУСК ПАРСЕРОВ ==============================================

// прочитаем все файлы парсеров
fs.readdir(config.node_parsers_path, function (error, files) {

    if (error) return console.error('Не удалось прочитать файлы парсеров: ' + error);

    // переберем парсеры
    files.forEach(function (file) {

    	// запустим парсер
        runParser(config.node_parsers_path + "/", file, function(error) {
        	if (error) return console.error('Не удалось запустить парсер ', file, error );
        });

    });
});

// запуск фонового скрипта парсера
function runParser(path, file, callback) {

	console.info('Запускаю парсер :', file);
    // запустим скрипт с помощью Node.js
    let process = childProcess.fork(path + file);

    process.on('error', function (error) {
        callback(error);
    });

    process.on('exit', function (code) {
        var error = code === 0 ? null : new Error('exit code ' + code);
        callback(error);
    });

    // подключимся к БД парсера
    db[ file ] = new Datastore(config.database_path + file + '.db');
}