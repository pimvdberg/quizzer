const path = require ("path");
const http = require ("http");
const express = require ("express");
const bodyParser = require ("body-parser");
const mongoose = require ("mongoose");
const cors = require ("cors");
const port = 8081;
const app = express ();
const server = http.createServer (app);
const game = require("./api/game");
const category = require("./api/category");

mongoose.connect ('mongodb://localhost:27017/quizzer', {useMongoClient: true}, (err) => {
	if (err) {
		console.log ("Error: "+err);
	} else {
		console.log ('Connected to MongoDB');
	}
});

app.use (cors ({origin: '*'}));
app.use (bodyParser.json ());

app.use('/game', game);
app.use('/category', category);

app.use (express.static (path.join (__dirname, "./public")));
app.use ("*", (req, res) => {
	res.sendFile (path.join (__dirname, "./public/index.html"));
});
app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).send(
		JSON.stringify(
			{succes:false, err: err}
		)
	);
});

server.listen (port, () => console.log (`Server listening on port ${port}`));
