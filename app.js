const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

    socket.on('choice', (data) => {
        console.log('Received choice:', data);
        const choice = data.choice;

        if (!(choice === "rock" || choice === "paper" || choice === "scissors")) {
            return socket.emit('errorMessage', { message: 'Incorrect choice' });
        }

        if (storeData.player1) {
            storeData.player2 = choice;
            const result = determineWinner(storeData.player1, storeData.player2);
            io.emit('gameResult', { player1: storeData.player1, player2: storeData.player2, winner: result });
            storeData.player1 = "";
            storeData.player2 = "";

        } else {
            storeData.player1 = choice;
            socket.emit('waitingForPlayer', { message: 'Waiting for player 2 to make a choice' });
        }
    });
});

function determineWinner(player1Choice, player2Choice) {

    if (player1Choice === player2Choice) {
        return 'draw';
    } else if ((player1Choice === 'rock' && player2Choice === 'scissors') ||
               (player1Choice === 'paper' && player2Choice === 'rock') ||
               (player1Choice === 'scissors' && player2Choice === 'paper')) {
        return 'Player1';
    } else {
        return 'Player2';
    }
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
