// загрузка цен с vgotrading.com
$.ajax({
	type: "GET",
	async: false,
	url: "https://vgounbox.com/api/trade/market?",
	success: res => {
		res = res.result.items;	// массив предметов

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

		return callback({
			'result': true,
			'items': items
		});
	},
	error: () => {
		return callback({
			'result': false,
			'message': 'Ошибка получения цен с Vgounbox'
		});
	}
});
