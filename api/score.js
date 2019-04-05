const gameExists = require ("../utils/gameExists.js");
const questions = require ("../schema/questions.js").model;
const asyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();

router.get ("/", asyncHandler( async (req, res) => {
    const game = await gameExists (req.params.gameId, true);
    let result = {};
    let round = null;
    let scores = [];
    if (game.activeRound !== null) {
        round = game.rounds [game.activeRound];
    }
    for (let team of game.teams) {
        let score = {};
        score.team = team.name;
        score.roundPoints = team.roundPoints;
        if (round) {
            score.correctAnswers = 0;
            for (let answers of round.answers) {
                for (let teamAnswer of answers.answers) {
                    if (teamAnswer.team === score.team && teamAnswer.approved) {
                        score.correctAnswers++;
                    }
                }
            }
        }
        scores.push (score);
    }
    result.scores = scores;
    if (round) {
        result.roundNumber = game.activeRound + 1;
        if (round.activeAnswer !== null) {
            result.questionNumber = 1;
            result.maxQuestions = questionsPerRound;
            for (let elem of round.answers) {
                if (elem.closed && elem.question.toString () !== round.answers [round.activeAnswer].question.toString ()) {
                    result.questionNumber++;
                }
            }
            let currentQuestion = {};
            currentQuestion.closed = round.answers [round.activeAnswer].closed;
            currentQuestion.teamAnswers = [];
            for (let i = 0; i < round.answers [round.activeAnswer].answers.length; i++) {
                let teamAnswerSource = round.answers [round.activeAnswer].answers [i];
                let teamAnswer = {team: teamAnswerSource.team};
                if (currentQuestion.closed) {
                    teamAnswer.answer = teamAnswerSource.answer;
                    teamAnswer.approved = teamAnswerSource.approved;
                }
                if (teamAnswerSource.answer !== "") {
                    currentQuestion.teamAnswers.push (teamAnswer);
                }
            }
            result.currentQuestion = currentQuestion;
            const result2 = await questions.findOne ({_id: round.answers [round.activeAnswer].question});
            if (!result2) {
                throw  "Question not found";
            }
            result.currentQuestion.name = result2.question;
            result.currentQuestion.category = result2.category;
            res.json (result);
        }
    }

}));

module.exports = router;