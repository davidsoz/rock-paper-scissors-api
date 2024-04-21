// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 8000;

// Store player choices
const storeData = {
    player1: null,
    player2: null
};

app.use(express.json());
app.use(cors());

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Game logic function
function playRound(player1Choice, player2Choice) {
    if (player1Choice === player2Choice) {
        return 'draw';
    } else if (
        (player1Choice === 'rock' && player2Choice === 'scissors') ||
        (player1Choice === 'paper' && player2Choice === 'rock') ||
        (player1Choice === 'scissors' && player2Choice === 'paper')
    ) {
        return 'Player1';
    } else {
        return 'Player2';
    }
}

// HTTP route for handling player choices
app.post('/api/data/player', (req, res) => {
    const choice = req.body.choice;

    if (!['rock', 'paper', 'scissors'].includes(choice)) {
        return res.status(400).json({ status: 'error', message: 'Incorrect choice' });
    }

    if (storeData.player1 !== null) {
        storeData.player2 = choice;
        const result = playRound(storeData.player1, storeData.player2);
        io.emit('gameResult', { winner: result });
        storeData.player1 = null;
        storeData.player2 = null;
        return res.json({ status: 'success', message: `Player 2 choice received. Winner: ${result}` });
    } else {
        storeData.player1 = choice;
        return res.json({ status: 'success', message: 'Player 1 choice received.' });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
