'use strict'

// фоновый скрипт плагина

var config = {};

async.auto({

	// загрузим конфигурацию
	get_config : function (cb) {
		$.get( {
			url : chrome.extension.getURL('config.json'),
			dataType : 'json',
			success : _config => {
				config = _config;
				return cb();
			}
		});
	},

	// загрузим кнопки плагина
	get_buttons : ['get_config', function (res, cb) {
		$.get( {
			url : chrome.extension.getURL(config.templates_path + 'buttons.html'),
			dataType : 'html',
			success : _buttons => {
				config.buttons = _buttons;
				return cb();
			}
		});
	}],

	// загрузим html профита
	get_profit_buttons : ['get_buttons', function (res, cb) {
		$.get( {
			url : chrome.extension.getURL(config.templates_path + 'profit.html'),
			dataType : 'html',
			success : _buttons => {
				config.profit = _buttons;
				return cb();
			}
		});
	}],

	// добавим сайты в html список
	add_sites_to_buttons : ['get_profit_buttons', function (res, cb) {

		// сформируем html строку списка
		let htmlString = "";
		for (let i = 0, l = config.sites.length; i < l; i++) {
			htmlString += "<option>" + config.sites[i].name + "</option>";
		}
		config.buttons = config.buttons.replace("${0}", htmlString);
		return cb();
	}],

	// добавим статичные ссылки: на картинки
	add_static_links : ['add_sites_to_buttons', function (res, cb) {
		// иконка логотипа опскинса
		config.opskins_logo = chrome.extension.getURL('static/icons/opskins.png');
	}]
})


chrome.runtime.onMessage.addListener( function(message, sender, callback) {

	// запрос конфигурации
	if (message.id == "th_load_config")
	{
		if (config.sites.find(site => site.name === message.site)) {
			// сайт есть в конфигурации
			$.ajax({
				type : 'GET',
				async : false,
				url : chrome.extension.getURL(config.sites_path + message.site + '.json'),
				success : file => {
					config.current = file;
					return callback( config );
				}
			});

		} else {
			// нет сайта в конфигурации
			return callback( { error : 'Данного сайта нет в конфигурации' } );
		}
	}

	// запрос на получение цен предметов
	if (message.id == "get_prices") {

		// загрузить цены
		$.ajax({
			type : 'GET',
			async : false,
			url : chrome.extension.getURL(config.parse_path + message.site + '.js'),
			success : file => {
				// запускаем парсер что предназначен для текущего сайта
				eval(file);
			},
			error : error => {
				return callback({
					'result': false,
					'message': error
				})
			}
		});

	}

})
