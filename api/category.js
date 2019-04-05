const questions = require ("../schema/questions").model;
const asyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();

router.get ("/api/categories", asyncHandler( async (req, res) => {
	const categories = await questions.find ().distinct ('category');
		let response = [];
		for (let elem of categories) {
			response.push ({name: elem});
		}
		res.json (response);
}));
module.exports = router ;