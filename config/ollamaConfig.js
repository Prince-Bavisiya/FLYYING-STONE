const { Ollama } = require("ollama");

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST,
});

module.exports = ollama;