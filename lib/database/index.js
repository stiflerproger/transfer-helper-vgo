'use strict'


const Datastore = require('nedb');	// файловая БД

// конструктор
function DataBase(options) {

	if(!(this instanceof DataBase)) return new DataBase(options);

	let self = this;

	this.db = new Datastore({ filename: options.filename });

	// Добавим уникальный индекс на имя предмета
	this.db.ensureIndex({ fieldName: 'n', unique: true }, function (error) {
		if (error) throw new Error(error);
	});

	this.db.loadDatabase(function(error) {
		if (error) throw new Error(error);
	});

}

// добавить предмет к БД
DataBase.prototype.addItem = function addItem(item, callback) {
	/*
	item : {
		n : string // обязательно
		p : integer // цена, обязатльно
		c : string // количество на сайте, не обязательно
	}
	*/
	let self = this;
	self.db.update(
		{ n: item.n },
		{
			$set: {
				p: item.p,
				c: item.c || undefined
			}
		},
		{ upsert: true },
		function (error, numReplaced) {
			if (error) return callback(error);

			callback(null, numReplaced);
		}
	);
}

// обновить данные в файле, дубликаты удаляются
DataBase.prototype.compuct = function compuct(callback) {

	let self = this;
	self.db.loadDatabase(function(error) {
		if (error) return callback(error);
	});

}

module.exports = DataBase;