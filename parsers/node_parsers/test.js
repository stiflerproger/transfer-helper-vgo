'use strict'

// Стандартные настройки всех парсеров
const rootPath = "../../";	// префикс пути, к корневой папке сервера
const site = "test.js";	// название сайта, идентично названию текущего файла и файла БД
const config = require(rootPath + 'config.json');
const Datastore = require('nedb');	// файловая БД
const db = new Datastore({ filename: __dirname + "/" + rootPath + config.database_path + site + '.db' });

// Добавим уникальный индекс на имя предмета
db.ensureIndex({ fieldName: 'n', unique: true }, function (error) {
	if (error) throw new Error(error);
});

// загрузить текущие данные при запуске парсера
db.loadDatabase(function(error) {
	if (error) throw new Error(error);
});

// добавление нового скина в БД, или обновление старого
db.update(
	{ n: 'Some Weapon 2' },
	{ $set: { p: 102 } },
	{ upsert: true },
	function (error, numReplaced) {
		if (error) throw new Error(error);
	}
);

