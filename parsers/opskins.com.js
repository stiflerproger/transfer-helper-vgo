// загрузка цен с opskins.com
$.ajax({
	type: "GET",
	async: false,
	data: {
		appid:"1912"
	},
	url: "https://api.opskins.com/IPricing/GetAllLowestListPrices/v1/",
	success: res => {
		res = res.response;

		let items = {};
		$.each(res, function(ind, val){
			ind = ind.replace('(', '').replace(/[^a-zA-Z0-9\|]/g, ' ').replace('| ', '').toLowerCase().trim(); // преобразуем в нужный формат
			items[ind] = {
				price : val.price,		// цена предмета
				count : val.quantity	// количество integer или string если (имеется/максимум)
			};
		});

		return callback({
			'result': true,
			'items': items
		});
	},
	error: () => {
		return callback({
			'result': false,
			'message': 'Ошибка запроса на OPSkins. Повторите еще раз! Возможно сработало защита от ботов, просто посетите сайт opskins.com'
		});
	}
});
