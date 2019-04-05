const gameExists = require ("../utils/gameExists");
const questionsModel = require ("../schema/questions").model;
const asyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();

router.post ("/:gameId/round/current/question", asyncHandler( async (req, res) => {
    if (!req.body.categories) {
        throw "No game ID specified";

    }
    if (req.body.categories.length < 3) {
       throw "You need to specify three categories";
    }

    let game = await gameExists (req.params.gameId);
        if (game.activeRound == null) {
            throw "There's no active round";
        }
        if (game.rounds [game.activeRound].answers.length > 0) {
            throw "You've added questions to this round";
        }

        const questions = await questionsModel.findRandom (
            {_id: { $nin: game.playedQuestions }, category: { $in: req.body.categories }},
            {},
            {limit: questionsPerRound});

        let teamAnswers = [];
        for (let elem of game.teams) {
            teamAnswers.push ({
                team: elem.name,
                answer: "",
                approved: false
            });
        }
        for (let elem of questions) {
            game.rounds [game.activeRound].answers.push ({
                question: elem._id,
                closed: false,
                answers: teamAnswers
            });
        }
        await game.save ();
        res.json ({
            success: true,
            error: null
        });
}));

router.get ("/:gameId/round/current/question", asyncHandler( async (req, res) => {
    let game = await gameExists (req.params.gameId);

    if (game.activeRound == null) {
        throw ("Round doesn't exist");
    }
    let roundQuestions = [];
    for (let answer of game.rounds [game.activeRound].answers) {
        roundQuestions.push ({
            questionId: answer.question
        });
    }
    let playedQuestions = game.playedQuestions.map ((elem) =>  elem.toString ());
    roundQuestions = roundQuestions.filter (val => !playedQuestions.includes (val.questionId.toString ()));
    let questions = roundQuestions.map ((elem) =>  elem.questionId);

    let result = [];
    for (let i = 0; i < roundQuestions.length; i++) {
        for (let j = 0; j < questions.length; j++) {
            if (roundQuestions [i].questionId.toString () === questions [j]._id.toString ()) {
                result.push ({
                    questionId: roundQuestions [i].questionId,
                    question: questions [j].question,
                    answer: questions [j].answer
                });
            }
        }
    }
    res.json (result);
}));

router.get ("/:gameId/round/current/question/current", asyncHandler( async (req, res) => {
    const game = await gameExists (req.params.gameId);
    let roundId = game.activeRound;
    if (roundId == null) {
        throw "Round doesn't exist";
    }
    let activeAnswer = game.rounds[roundId].activeAnswer;
    if (activeAnswer !== null) {
        throw "No question is active";
    }
    const questionId = (game.rounds[roundId].answers[activeAnswer].question);
    questions.findOne ({_id: questionId});
    if (!result) {
        reject ("Question not found");
    }
    res.json ({question: result.question});
}));

router.put ("/:gameId/round/current/question/current", asyncHandler( async (req, res) => {
    if (!req.body.hasOwnProperty ('close')) {
        throw "No close flag specified";
    }
    let game = await gameExists (req.params.gameId);
    let roundId = game.activeRound;
    if (roundId == null) {
        throw ("Round doesn't exist");
    }
    let activeAnswer = game.rounds [roundId].activeAnswer;
    if (activeAnswer == null) {
        throw ("There is no active question");
    }
    if (!req.body.close) {
        throw ("You cannot reopen a question");
    }
    if (game.rounds [roundId].answers [activeAnswer].closed) {
        throw ("Question is already closed");
    }
    game.rounds [roundId].answers [activeAnswer].closed = true;
    game.playedQuestions.push (game.rounds [roundId].answers [activeAnswer].question);
    await game.save ();
    res.json ({
        success: true,
        error: null
    });
}));

module.exports = router ;