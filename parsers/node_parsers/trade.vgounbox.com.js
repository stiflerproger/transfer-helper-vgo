'use strict'

// Стандартные настройки всех парсеров
const rootPath = "../../";	// префикс пути, к корневой папке сервера
const site = "trade.vgounbox.com";	// название сайта, идентично названию текущего файла и файла БД
const config = require(rootPath + 'config.json'); // загрузка конфига
const db = new require(rootPath + 'lib/database/')({	// подключение к БД сайта
	filename : __dirname + "/" + rootPath + config.database_path + site + '.db'
});
const request = require('request');

// парсинг сайта

function parse() {

	request({
		method: "GET",
		uri: "https://vgounbox.com/api/trade/market?"
	}, function (error, response, body) {
		let res = JSON.parse(body).result.items;	// массив предметов

		let items = {};
		for (let i = 0, l = res.length; i < l; i++) {
			let name = res[i].name.replace('(', '').replace(/[^a-zA-Z0-9\|]/g, ' ').replace('| ', '').toLowerCase().trim(); // преобразуем в нужный формат
			if (!items[ name ]) {
				items[ name ] = {
					count : 0
				}
			}

			items[ name ].price = res[i].price.toFixed(2) * 100;
			items[ name ].count++;
		}


		Object.keys(items).map(function(item_name, index) {
		    var item = items[item_name];

		    db.addItem({
				n : item_name,
				p : item.price,
				c : item.count
			}, function (error, numReplaced) {
				if (error) throw new Error(error);
			});
		});

		// удаляем дубликаты
		db.compuct(function(error) {
			if (error) throw new Error(error);
		});
	});
	setTimeout( function () { parse(); }, 20000); // повторить парсинг через 20 секунд

}
parse();


