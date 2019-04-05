const gameExists = require ("../utils/gameExists");
const asyncHandler = require('express-async-handler');
const questions = require ("../schema/questions").model;
const express = require('express');
const router = express.Router();

router.put ("/:gameId/round/current/answer/current", asyncHandler( async (req, res) => {
    if (req.body.team && (req.body.hasOwnProperty ("correct")||req.body.answer)) {
        let game = await gameExists (req.params.gameId);
        let roundId = game.activeRound;
        if (roundId == null) {
            throw "Round doesn't exist";
        }

        let activeAnswer = game.rounds [roundId].activeAnswer;
        if (activeAnswer == null) {
            throw "No question is active";
        }

        if (!game.rounds [roundId].answers [activeAnswer].closed) {
            throw "Question is not closed";
        }

        let success = false;
        for (let i = 0; i < game.rounds [roundId].answers [activeAnswer].answers.length; i++) {
            if (game.rounds [roundId].answers [activeAnswer].answers [i].team === req.body.team) {
                game.rounds [roundId].answers [activeAnswer].answers [i].approved = req.body.correct;
                success = true;
            }
        }
        if (!success) {
            throw "Team not found";
        }
        await game.save ();
        await res.json ({
            success: true,
            error: null
        });
    } else {
        throw "No flag or answer specified";
    }
}));

router.get ("/:gameId/round/current/answer/current", asyncHandler( async (req, res) => {
    let game = await gameExists (req.params.gameId);
    let roundId = game.activeRound;

    if (game.activeRound == null) {
        throw ("Round doesn't exist");
    }
    let activeAnswer = game.rounds [roundId].activeAnswer;
    if (activeAnswer !== null) {
        throw ("No question is active");
    }
    let result = {};
    result.answer = null;
    result.questionId = game.rounds [roundId].answers [activeAnswer].question;
    result.teamAnswers = [];
    for (let elem of game.rounds [roundId].answers [activeAnswer].answers) {
        if (elem.answer !== "") {
            result.teamAnswers.push (elem);
        }
    }
    let questionId = result.questionId;
    delete result.questionId;
    const result2 = await questions.findOne ({_id: mongoose.Types.ObjectId (questionId)});
    if (!result2) {
        throw ("Question not found");
    }
    result.answer = result2.answer;
    await res.json (result);
}));
module.exports = router ;