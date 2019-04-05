const questions = require ("../schema/questions").model;
const asyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();

router.get ("/", asyncHandler( async (req, res) => {
	const categories = await questions.find ().distinct ('category');
	const response = categories.map((item) => {
		return {name: item}; 
	});
	res.json (response);
}));
module.exports = router ;