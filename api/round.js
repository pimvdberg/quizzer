const gameExists = require ("../utils/gameExists");
const calculateScores = require ("../utils/calculateScores");
const asyncHandler = require('express-async-handler');
const answer = require("./answer");
const question = require("./question");
const express = require('express');
const router = express.Router();

router.use('/current/answer', answer);
router.use('/current/question', question);

router.post ("/", asyncHandler( async (req, res) => {
	if (!req.params.gameId) {
		throw "No game ID specified";
	}
	let game = gameExists (req.params.gameId)
	if (game.teams.length > 1) {
		let round = {
			answers: [],
			activeAnswer: null
		};
		if (game.activeRound !== null) {
			game = calculateScores (game);
		}
		game.rounds.push (round);
		let roundNumber = game.rounds.length - 1;
		game.activeRound = roundNumber;
		await game.save ();
		//ws implemntation
	} else {
		throw "You need at least two teams to start a round";
	}
	res.json ({
		success: true,
		error: null,
		roundId: roundNumber
	});
}));

router.get ("/current", asyncHandler( async (req, res) => {
    if (!req.params.gameId) {
        throw "No game ID specified";
    } else {
        let game = await gameExists (req.params.gameId);
        await res.json ({
            activeRound: game.activeRound
        });
    }
}));

router.put ("/current", asyncHandler( async (req, res) => {
    if (!req.params.gameId) {
        throw "No game ID specified";
    } else if (!req.body.nextQuestion) {
        throw "No question or close flag specified";
    }
    let game = await gameExists (req.params.gameId);
    let roundId = game.activeRound;
    if (roundId == null) {
        throw "Round doesn't exist";
    }
    let activeAnswer = game.rounds[roundId].activeAnswer;
    if (activeAnswer !== null) {
        let activeQuestion = game.rounds [roundId].answers [activeAnswer];
        if (!activeQuestion.closed) {
            throw "Current question must be closed before you can move on";
        }
        game.playedQuestions.push (activeQuestion.question);
        let success = false;
        for (let i = 0; i < game.rounds [roundId].answers.length; i++) {
            if (game.rounds [roundId].answers [i].question.toString () === req.body.nextQuestion) {
                game.rounds [roundId].activeAnswer = i;
                success = true;
            }
        }
        if (!success) {
            throw "Couldn't change to new question";
        }
    }
    await game.save();
    //ws implementation

    res.json ({
        success: true,
        error: null
    });
}));
module.exports = router ;