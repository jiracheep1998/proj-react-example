const conn = {
	config: function(){

		// if(process.env.NODE_ENV === 'production'){
		// 	return {
		// 		host: '10.130.253.242',
		// 		port: 3306,
		// 		user: 'baezenic',
		// 		password: '5X^495$8%r%*6e779!d$#c!w',
		// 		database: 'baezenic_config'
		// 	};
		// }

		if(process.env.NODE_ENV === 'production'){
			return {
				host: '159.65.142.2',
				port: 3306,
				user: 'baezenic',
				password: '5X^495$8%r%*6e779!d$#c!w',
				database: 'baezenic_config'
			};
		}
	
		if(process.env.NODE_ENV === 'development'){
			return {
				host: 'localhost',
				port: 3306,
				user: 'root',
				password: '',
				database: 'baezenic_config'
			};
		}
	},
	sketch_plans: function(){

		// if(process.env.NODE_ENV === 'production'){
		// 	return {
		// 		host: '10.130.253.242',
		// 		port: 3306,
		// 		user: 'baezenic',
		// 		password: '5X^495$8%r%*6e779!d$#c!w',
		// 		database: 'baezenic_sketch_plans'
		// 	};
		// }

		if(process.env.NODE_ENV === 'production'){
			return {
				host: '159.65.142.2',
				port: 3306,
				user: 'baezenic',
				password: '5X^495$8%r%*6e779!d$#c!w',
				database: 'baezenic_sketch_plans'
			};
		}
	
		if(process.env.NODE_ENV === 'development'){
			return {
				host: 'localhost',
				port: 3306,
				user: 'root',
				password: '',
				database: 'baezenic_sketch_plans'
			};
		}
	}
}

module.exports = conn;