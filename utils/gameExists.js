let games = require ("../schema/games.js").model;

let gameExists = async (password, score) => {
	const game = await games.findOne ({_id: password});
	console.log(game);
		if (!game) {
			throw "Game does not exist";
		}
		if (game.closed && !score) {
			throw "Game is closed and cannot be reopened";
		}
		return game;
};

module.exports = gameExists;