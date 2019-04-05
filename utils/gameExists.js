let games = require ("../schema/games.js").model;

let gameExists = async (password, score) => {
	await games.findOne ({_id: password}, (err, result) => {
		if (!result) {
			throw "Game does not exist";
		}
		if (result.closed && !score) {
			throw "Game is closed and cannot be reopened";
		}
		return result;
	});
};

module.exports = gameExists;