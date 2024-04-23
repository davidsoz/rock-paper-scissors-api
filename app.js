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
  player1: { choice: "", ready: false },
  player2: { choice: "", ready: false },
  player3: { choice: "", ready: false }
};



app.use(express.json());
app.use(cors());

io.on('connection', (socket) => {
  console.log('A user connected');



  socket.on('choice', (data) => {
    
    console.log('Received choice:', data);
    const choice = data.choice;
    
    if (!(choice === "rock" || choice === "paper" || choice === "scissors")) {
      return socket.emit('errorMessage', { message: 'Incorrect choice' });
    }
  
    if (!storeData.player1.ready) {
      storeData.player1.choice = choice;
      storeData.player1.ready = true;
      socket.emit('waitingForPlayer', { message: 'Waiting for player 2 and player 3 to make a choice' });
    } else if (!storeData.player2.ready) {
      storeData.player2.choice = choice;
      storeData.player2.ready = true;
      socket.emit('waitingForPlayer', { message: 'Waiting for player 3 to make a choice' });
    } else {
      storeData.player3.choice = choice;
      storeData.player3.ready = true;
      const result = determineWinner(storeData.player1.choice, storeData.player2.choice, storeData.player3.choice);
      io.emit('gameResult', { player1: { choice: storeData.player1.choice }, player2: { choice: storeData.player2.choice }, player3: { choice: storeData.player3.choice }, winner: result });
      // Reset choices and readiness for the next round

      resetGameData();
    }
  });
});




function determineWinner(player1Choice, player2Choice, player3Choice) {
  if ((player1Choice === player2Choice && player1Choice === player3Choice && player2Choice === player3Choice) ||
    (player1Choice !== player2Choice && player1Choice !== player3Choice && player2Choice !== player3Choice) 
    ){
    return 'draw';
  } else if ((player1Choice === 'rock' && player2Choice === 'paper' && player3Choice === 'paper') ||
    (player1Choice === 'paper' && player2Choice === 'scissors' && player3Choice === 'scissors') ||
    (player1Choice === 'scissors' && player2Choice === 'rock' && player3Choice === 'rock')|| 
    (player1Choice === 'rock' && player2Choice === 'rock' && player3Choice === 'paper') 
    ) {
    return 'draw';
  } else if ((player1Choice === 'rock' && player2Choice === 'scissors' && player3Choice === 'scissors') ||
    (player1Choice === 'paper' && player2Choice === 'rock' && player3Choice === 'rock') ||
    (player1Choice === 'scissors' && player2Choice === 'paper' && player3Choice === 'paper')) {
    return 'Player 1';
  } else if ((player2Choice === 'rock' && player1Choice === 'scissors' && player3Choice === 'scissors') ||
    (player2Choice === 'paper' && player1Choice === 'rock' && player3Choice === 'rock') ||
    (player2Choice === 'scissors' && player1Choice === 'paper' && player3Choice === 'paper')) {
    return 'Player 2';
  } else {
    return 'Player 3';
  }
  
}

function resetGameData() {
  storeData.player1.choice = "";
  storeData.player1.ready = false;
  storeData.player2.choice = "";
  storeData.player2.ready = false;
  storeData.player3.choice = "";
  storeData.player3.ready = false;
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
