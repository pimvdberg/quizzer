const mongoose = require('mongoose');
const fs = require('fs');
const Questions = require ("./schema/questions").model;
const questions = JSON.parse (fs.readFileSync ("./questions.json"));

const dbName = 'quizzer';
const db = mongoose.connection;

mongoose.connect(`mongodb://localhost:27017/${dbName}`,  {useNewUrlParser: true } ).then(() => {
    return seedQuiz();
}).catch(err => {
    console.log(err);
}).then(() => {
    db.close();
});

async function seedQuiz() {
    await Questions.deleteMany();
    await Questions.insertMany(questions);
}