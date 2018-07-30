// загрузка цен с vgotrading.com
$.ajax({
	type: "GET",
	async: false,
	url: "https://vgotrading.com/api/site/inventory",
	success: res => {
		res = res.data;	// массив предметов

		let items = {};
		for (let i = 0, l = res.length; i < l; i++) {
			let name = res[i].name.replace('(', '').replace(/[^a-zA-Z0-9\|]/g, ' ').replace('| ', '').toLowerCase().trim(); // преобразуем в нужный формат
			if (!items[ name ]) {
				items[ name ] = {
					count : 0
				}
			}

			items[ name ].price = res[i].suggested_price_floor;
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
			'message': 'Ошибка получения цен с Vgotrading'
		});
	}
});
