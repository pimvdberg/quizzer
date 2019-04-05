const randomstring = require ("randomstring");
const games = require ("../schema/games").model;
const asyncHandler = require('express-async-handler');
const gameExists = require ("../utils/gameExists");
const calculateScores = require ("../utils/calculateScores");
const express = require('express');
const router = express.Router();

const round = require("./round");
const team = require("./team");
router.use('/', round);
router.use('/', team);

router.post ("/", asyncHandler( async (req, res) => {
	let password;
	password = randomstring.generate (7);
	await games.findOne({_id: password}, (err, result) => {
		if (result) {
			throw "Game already exists";
		}
	});
	const game = new games ({_id: password});
	await game.save();
	await res.json ({
		success: true,
		error: null,
		password: password
	});
	// ws implementation
}));

router.put ("/:gameId", asyncHandler( async (req, res) => {
	if (!req.body.hasOwnProperty ('closed')) {
        throw "No closed flag specified";
    }
    let game = await gameExists (req.params.gameId);
    if (req.body.closed) {
        if (game.activeRound !== null) {
            let roundId = game.activeRound;
            let activeAnswer = game.rounds [roundId].activeAnswer;
            if (game.rounds [roundId].activeAnswer !== null) {
                game.playedQuestions.push (game.rounds [roundId].answers [activeAnswer].question);
                game.rounds [roundId].activeAnswer = null;
            }
            game = calculateScores (game);
            game.activeRound = null;
        }
        game.closed = true;
        await game.save ();
        // ws implementatie
    } else {
        throw "This game is already open";
    }
    res.send ({
        success: true,
        error: null
    }); 
}));


router.get ("/:gameId/exists", asyncHandler( async (req, res) => {
    const game = await gameExists(req.params.gameId);
    res.send ({
        success: true,
        error: null
    });
}));

module.exports = router ;