let gameExists = require ("../utils/gameExists");
let teams = require ("../schema/teams").model;
const asyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();

router.post ("/:gameId/team/", asyncHandler( async (req, res) => {
    if (!req.body.name || req.body.name === "") {
        throw "No name specified";
    } 
    let team = new teams ({
        name: req.body.name,
        appliedGame: req.params.gameId
    });
    const game = await gameExists (req.params.gameId);
    
    for (let elem of game.teams) {
        if (req.body.name === elem.name) {
            throw "Team has already been accepted into the game";
        }
    }
  
    const teamResult = await teams.findOne ({appliedGame: req.params.gameId, name: req.body.name});
    if (teamResult) {
        throw "Team has already applied for this game";
    }
    await team.save();
    res.send ({
        success: true,
        error: null,
        teamId: team._id
    });
    // ws implemtation
}));

router.get ("/:gameId/team/", asyncHandler( async (req, res) => {
    let entries = [];
    const result = await teams.find ({appliedGame: req.params.gameId});
    if (result) {
        for (let i = 0; i < result.length; i++) {
            let entry = result [i].toObject ();
            delete entry.appliedGame;
            delete entry.__v;
            entry.approved = false;
            entries.push (entry);
        }
    }

    if (entries.length <= 0) {
        throw "No teams have applied yet";
    }

    const game = await gameExists (req.params.gameId);
    for (let elem of game.teams) {
        let entry = elem.toObject ();
        delete entry.__v;
        delete entry.roundPoints;
        entry.approved = true;
        entries.push (entry);
    }
    
    res.json (entries);

}));

router.put ("/:gameId/team/:teamId", asyncHandler( async (req, res) => {
    if (!req.body.hasOwnProperty ('approved')) {
        throw "No approved flag specified";
    } else if (req.body.approved) {

        const game = await gameExists (req.params.gameId);       
        const team = teams.findOne ({_id: req.params.teamId, appliedGame: req.params.gameId})
        if (!team) {
            throw "Team not found, or has already been accepted";
        }
        await teams.deleteOne ({_id: team._id});
        delete team.appliedGame;
        team.roundPoints = 0;
        game.teams.push (team);
        await game.save ();
        res.json ({
            success: true,
            error: null
        });
            //ws implementation
    } else if (!req.body.approved) {
        const game = await gameExists (req.params.gameId);
        let success = false;
        let removedTeam;
        for (let i = 0; i < game.teams.length; i++) {
            if (game.teams [i]._id.toString () === req.params.teamId) {
                removedTeam = game.teams [i].toObject ();
                game.teams.splice (i, 1);
                success = true;
                i--;
            }
        }
        if (!success) {
            await "Team not found in game";
        }
        delete removedTeam.roundPoints;
        delete removedTeam.__v;
        removedTeam.appliedGame = game._id;
        let team = new teams (removedTeam);
        await team.save ();
        await game.save ();
        res.json ({
            success: true,
            error: null
        });
        //ws implementation
    }
}));

router.get ("/:gameId/team/:teamId", asyncHandler( async (req, res) => {
    const game = await gameExists (req.params.gameId);
    let approved = false;
    for (elem of game.teams) {
        if (elem._id.toString () === req.params.teamId) {
            approved = true;
        }
    }
    res.json ({
        approved: approved
    });
}));

module.exports = router ;