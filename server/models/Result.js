const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user: {
        name: String,
        email: String
    },
    score: Number,
    total: Number,
    answers: [{
        question: String,
        userAnswer: String,
        correctAnswer: String,
        correct: Boolean
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Result', resultSchema); 