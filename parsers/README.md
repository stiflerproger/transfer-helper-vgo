# Парсеры

Парсеры сканируют данные с сайтов дял трейда, преобразуют в единый формат и сохраняют её

## Типы парсеров в `TH-VGO`

В `TH-VGO` используются два типа пасреров:
  - `JS парсеры` - запускается средствами клиентской части расширения один раз при запросе цен, и возвращают результат
  - `Node.js парсеры` - запускается средствами `Node.js`, сканирует сайт с заданной периодичностью, и сохраняет результат в файловую базу данных

## JS парсеры

JS находятся в папке `/parsers/` по дефолту. Можно заменить в `config.json`.

Код парсера должен быть синхронный.
Файл парсера выполняется командой `eval()` и должен вернуть функцию с параметрами:

```
return callback({
  'result': true,
  'items': {
    'item_name' : {
      'price' : 100, // цена предмета в центах
      'count' : 1 // количество предметов на сканируемом сайте
    }
  }
});
```
Формат `item_name`: `awp polycat minimal wear`, т.е. lowerCase с пробелами между словами

В случае ошибки парсинга возвращается объект:

```
return callback({
  'result': false,
  'message': 'Описание ошибки'
});
```

Чтобы при запросе цен, данные запускался этот парсер, в `config.json` в массиви `sites`, нужно чтобы параметр `node_parser` либо отсутствовал, либо был установлен как `false`, например:

```
{
  "name" : "vgotrading.com",
  "link" : "http://vgotrading.com",
  "comission" : 7.5,
  "node_parser" : false
}
```

## Node.js парсеры с хранением в базе данных

Node.js находятся в папке `/parsers/node_parsers/` по дефолту. Можно заменить в `config.json`.

Пример кода парсера `trade.vgounbox.com`:
```
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
```
Что содержится в базе данных можно посмотреть по пути `/db/` по умолчанию. Либо по адресу `localhost:3000/parser/{site_name}`. 

## Запуск парсеров Node.js

Для работы с парсерами Node.js вам нужно установить [Node.js](https://nodejs.org).
  После установки запустите файл `start_parsers.bat` в корневой папке `TH-VGO`. Если запуск неудастся по причине того, что какой-то модуль не найден, то выполните команду `npm i` в консоли, и повторите запуск.


