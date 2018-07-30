'use strict'

var config = {};
var link = "https://ref.opskins.win/aff_c?offer_id=2&aff_id=1138&url_id=49&aff_sub=${item}&aff_sub2=1912_1";
var wears = {
	// Прямо с завода
	"fn" : " (Factory New)",
	"(fn)" : " (Factory New)",
	"factory new" : " (Factory New)",
	"(factory new)" : " (Factory New)",

	// Немного поношенное
	"mw" : " (Minimal Wear)",
	"(mw)" : " (Minimal Wear)",
	"minimal wear" : " (Minimal Wear)",
	"(minimal wear)" : " (Minimal Wear)",

	// После полевых испытаний
	"ft" : " (Field-Tested)",
	"(ft)" : " (Field-Tested)",
	"field-tested" : " (Field-Tested)",
	"(field-tested)" : " (Field-Tested)",
	"field tested" : " (Field-Tested)",
	"(field tested)" : " (Field-Tested)",

	// Поношенное
	"ww" : " (Well-Worn)",
	"(ww)" : " (Well-Worn)",
	"well-worn" : " (Well-Worn)",
	"(well-worn)" : " (Well-Worn)",
	"well worn" : " (Well-Worn)",
	"(well worn)" : " (Well-Worn)",

	// Закаленное в боях
	"bs" : " (Battle-Scarred)",
	"(bs)" : " (Battle-Scarred)",
	"battle-scarred" : " (Battle-Scarred)",
	"(battle-scarred)" : " (Battle-Scarred)",
	"battle scarred" : " (Battle-Scarred)",
	"(battle scarred)" : " (Battle-Scarred)"
}

// загрузим конфигурацию приложения
chrome.runtime.sendMessage(
	{
		id : 'th_load_config',
		site : window.location.hostname
	},
	function(_config)
	{
		// конфигурация приложения
		config = _config;

		prerun();	// ожидаем загрузки страницы
	}
);

// ожидаем загрузки страницы. Если есть элемент item_wrapper то запускаем run
function prerun() {
	if ($( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).length)
		run();
	else
		setTimeout(function(){ prerun(); }, 500);
}

// инициализация плагина
function run() {
	if (Object(config) !== config) return; // неизвестная ошибка

	if (config.error) return; 	// загрузка плагина дала ошибку

	// добавим кнопки плагина на сайт
	$('html').append(config.buttons);

	// установим события
	$( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).on('click', '.th_opskins_link', function(event) {
		// отключим дэф события
		event.stopPropagation();


	});

	// запустить установку кнопок на предметы
	setTimeout( function () { setButtons(); }, config.set_buttons_interval * 1000 );

	console.log(config);
}

// устанавливает кнопки на предметах
function setButtons() {

	var elements =  $( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).find( config.current.item ).not('.th_added');
	if (!elements.length) {
		return setTimeout( function () { setButtons(); }, config.set_buttons_interval * 1000 );
	}
	else {
														// выбрать N элементов для цикличиского добавления предметов
		elements.splice( config.set_buttons_amount ); 	// это типо скорости работы плагина, большее число быстрее загрузит кнопки, но будут зависания
														// чем меньше цифра тем меньше лагов, но работает медленней
	}

	elements.each(function() {
		$(this).addClass('th_added');	// чтобы предмет не выбирался повторно
		let name = getItemName($(this).find(config.current.weapon).text(), $(this).find(config.current.name).text(), $(this).find(config.current.wear).text());

		$(this).append('<a class="th_opskins_link" target="_blank" href="' + link.replace('${item}', name) + '" style="top: ' + config.link_top + '%; "><img src="' + config.opskins_logo + '"></a>');
	});

	// запустить установку кнопок на предметы
	setTimeout( function () { setButtons(); }, config.set_buttons_interval * 1000 );
}


// создаётся полное название предмета
function getItemName(weapon, name, wear) {
	// weapon - тип оружия, например: AWP, UMP-45, Tec-9
	// name - название скина, например: Dragon Lore, Poison Target
	// wear - поношенность оружия, например: FN, (FN), Factory New, (Factory New)

	if (weapon != name)
		return weapon.trim() + " | " + name.trim() + ( wears[ wear.toLowerCase().trim() ] ? wears[ wear.toLowerCase().trim() ] : "" );
	else
		return weapon.trim();
}