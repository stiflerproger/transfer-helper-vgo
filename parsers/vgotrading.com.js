// загрузка цен с vgotrading.com
$.ajax({
	type: "GET",
	async: false,
	url: "https://vgotrading.com/api/site/inventory",
	success: res => {
		res = res.data;	// массив предметов

		let items = {};
		for (let i = 0, l = res.length; i < l; i++) {
			if (!items[ res[i].name ]) {
				items[ res[i].name ] = {
					count : 0
				}
			}

			items[ res[i].name ].price = res[i].suggested_price_floor;
			items[ res[i].name ].count++;

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
