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
	if (Object(config) !== config) return; // неизвестная ошибка
	if (config.error) return; 	// загрузка плагина дала ошибку

	if ($( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).length)
		run();
	else
		setTimeout(function(){ prerun(); }, 500);
}

// инициализация плагина
function run() {


	// добавим кнопки плагина на сайт
	$('html').append(config.buttons);
	// визуальные скрипты кнопок
	$('#th_buttons_header').click(function() {
		$('#th_cart_body').slideToggle();
	});


	// установим события
	$( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).on('click', '.th_opskins_link', function(event) {
		// отключим дэф события
		event.stopPropagation();
	});

	$('#th_scan').click(function (event){
		// идёт ли предыдущий скан
		if ($(this).text() != 'SCAN') return;

		$(this).text("Loading..");

		let self = this;
		chrome.runtime.sendMessage({
			id : 'get_prices',
			site : $('#th_select').val()
		}, function(res) {
			$(self).text('SCAN');

			console.log(res);
			if (res.result)
				setPrices(res.items);	// успешный скан предметов
			else
				setPrices({}); 			// очищаем предыдущие результаты
		});

	});

	// сортировки
	$('#th_up').click(function(){
		tinysort( $( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).find( config.current.item ), {attr:'th_deposit', order:'asc'});
	});
	$('#th_down').click(function(){
		tinysort( $( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).find( config.current.item ), {attr:'th_withdraw', order:'asc'});
	});

	// запустить установку кнопок на предметы
	setTimeout( function () { setButtons(); }, config.set_buttons_interval * 1000 );
}

// устанавливает цены предметов что были просканированы
function setPrices(items) {
	$( $(config.current.item_wrapper)[ config.current.item_wrapper_index - 1 ] ).find( config.current.item ).each(function(){

		// удаляем проценты депозиты и вывода из атрибутов
		$(this).removeAttr('th_deposit').removeAttr('th_withdraw');

		// удалим визуальное представление данных если оно было
		$(this).find('.th_price_wrap').remove();

		// посчитаем данные что нам нужны
		let item_name = getItemName($(this));

		// есть ли в скане цена нужного предмета
		if (!items[ item_name ]) {
			return true; // continue
		}

		// получим цену предмета, на текущем сайте
		let item_price = getPrice($(this));

		// прибыль при депозите на сайт, и при выводе с сайта
		let dep_profit = parseFloat( 100 - items[ item_name ].price * ( 100 + config.sites.find( site => site.name === window.location.hostname ).comission ) / item_price ).toFixed(2);
		let wit_profit = parseFloat( -( 100 - items[ item_name ].price  * (100 - config.sites.find( site => site.name === $('#th_select').val() ).comission ) / item_price  ) ).toFixed(2);

		// шаблон профита из конфига
		let profitHtml = config.profit;

		profitHtml = profitHtml
			.replace('${top}', config.profit_top)
			.replace('${green}', dep_profit + "%")
			.replace('${red}', wit_profit + "%")
			.replace('${price}', "$" + (items[ item_name ].price / 100).toFixed(2))
			.replace('${count}', items[ item_name ].count ? items[ item_name ].count : "");

		// добавим профит к HTML
		$(this)
			.attr('th_deposit', dep_profit)
			.attr('th_withdraw', wit_profit)
			.append(profitHtml);
	});
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
		let name = getItemName($(this));
		// на добавлять ссылки на предметы что не удалось определить
		if (!name)
			$(this).append('<a class="th_opskins_link"></a>');
		else
			$(this).append('<a class="th_opskins_link" target="_blank" href="' + link.replace('${item}', name) + '" style="top: ' + config.link_top + '%; left: ' + config.link_left + '%;"><img src="' + config.opskins_logo + '"></a>');
	});

	// запустить установку кнопок на предметы
	setTimeout( function () { setButtons(); }, config.set_buttons_interval * 1000 );
}


// создаётся полное название предмета
function getItemName(element) {
	// weapon - тип оружия, например: AWP, UMP-45, Tec-9
	// name - название скина, например: Dragon Lore, Poison Target
	// wear - поношенность оружия, например: FN, (FN), Factory New, (Factory New)

	let reg = new RegExp("(?:http(?:s?):\/\/files.opskins.media\/file\/vgo-img\/item\/)([a-z0-9\-]+)(?:(?:-300|-600).png)", 'mi');
	let matches = $(element).html().match(reg);

	//если есть совпадение по регулярке, то запомнить его
	if (matches)
	{
		let item_name = matches[1];	// получем такие данные famas-bristlecone-battle-scarred

		// заменим качество предмета
		item_name = item_name.replace(/-/g, ' ');

		return item_name;
	}
	return undefined;
}

// возвращается цена предмета в центах
function getPrice(element) {
	let price = $( $(element).find(config.current.price)[ config.current.price_index ? (config.current.price_index - 1) : 0 ] ).text();
	// price - цена, например: $101.84

	return (price.replace('$', '').replace(',', '')  * 100);
}