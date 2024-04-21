// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import the CORS middleware

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const storeData = {
    player1: "",
    player2: ""
};

app.use(express.json());

app.use(cors());

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.post('/api/data/player1', (req, res) => {
    const data = req.body;
    if(data.choice !== "rock" || data.choice !== "paper" || data.choice !== "sccissor") {
        res.json({ status: 'error', message: 'inccorect choice' });
    }
    if(storeData.player1) {
        storeData.player2 = data.choice
        res.json({ status: 'success', message: 'Player2 received successfully' });
    } else {
        storeData.player1 = data.choice;
        res.json({ status: 'success', message: 'Player1 received successfully' });
    }

    console.log(storeData);

    if(storeData.player1 && storeData.player2) {
        if(storeData.player1 === "rock" && storeData.player2 === "paper") {
            res.json({ status: 'success', winner: 'Player2' });
        } else if (storeData.player1 === "rock" && storeData.player2 === "scissors") {
            res.json({ status: 'success', winner: 'Player1' });
        } else if(storeData.player1 === "paper" && storeData.player2 === "rock") {
            res.json({ status: 'success', winner: 'Player1' });
        } else if(storeData.player1 === "paper" && storeData.player2 === "scissors") {
            res.json({ status: 'success', winner: 'Player2' });
        } else if(storeData.player1 === storeData.player2) {
            res.json({ status: 'success', winner: 'draw' });
        }
        storeData.player1 = "";
        storeData.player2 = "";
    }
});

app.options('*', cors());


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
