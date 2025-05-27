// Pong Game Client
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Ces variables seront initialisées par le serveur
let PADDLE_HEIGHT = 100;
let PADDLE_WIDTH = 20;
let BALL_RADIUS = 10;

let paddleY = 0;
let opponentPaddleY = 0;
let ball = { x: 0, y: 0 };
let waitingForPlayers = true;
let gameEnded = false;
let score = { player1: 0, player2: 0 };
let myPlayerKey = null;

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ Connected to server');
  socket.emit('open', 'Client has connected with id : ' + socket.id);
});

socket.on('waitingForPlayers', (data) => {
  waitingForPlayers = true;
  drawWaiting();
});

socket.on('gameStarted', (data) => {
  waitingForPlayers = false;
  if (data && data.role && data.players) {
    myPlayerKey = data.role;
    // Récupérer la taille des paddles et de la balle depuis le serveur si dispo
    if (data.players.player1.width) PADDLE_WIDTH = data.players.player1.width;
    if (data.players.player1.height) PADDLE_HEIGHT = data.players.player1.height;
    if (data.ball && data.ball.width) BALL_RADIUS = data.ball.width / 2;

    // Positionner les raquettes selon les données serveur
    paddleY = data.players[myPlayerKey].y;
    const opponentKey = myPlayerKey === 'player1' ? 'player2' : 'player1';
    opponentPaddleY = data.players[opponentKey].y;

    // Position de la balle si envoyée
    if (data.ball) {
      ball = data.ball;
    }

    // Score
    score = data.players.score || { player1: 0, player2: 0 };
  }
});

socket.on('gameUpdate', (data) => {
  if (data && data.ball) {
    ball = data.ball;
  }
  if (data && data.players) {
    paddleY = data.players[myPlayerKey]?.y ?? paddleY;
    const opponentKey = myPlayerKey === 'player1' ? 'player2' : 'player1';
    opponentPaddleY = data.players[opponentKey]?.y ?? opponentPaddleY;
    if (data.score) {
      score = data.score;
    }
  }
});

function showGameEnded(data) {
  waitingForPlayers = true;
  gameEnded = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Partie terminée !', canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = '24px Arial';
  ctx.fillText(data.message || 'Fin de la partie.', canvas.width / 2, canvas.height / 2);
  if (data.winner) {
    ctx.fillText(`Gagnant : ${data.winner}`, canvas.width / 2, canvas.height / 2 + 40);
    if (myPlayerKey && (data.winner === myPlayerKey)) {
      ctx.fillStyle = 'lime';
      ctx.fillText('🎉 Victoire !', canvas.width / 2, canvas.height / 2 + 80);
    } else if (myPlayerKey && (data.winner === 'égalité')) {
      ctx.fillStyle = 'yellow';
      ctx.fillText('Match nul', canvas.width / 2, canvas.height / 2 + 80);
    } else if (myPlayerKey) {
      ctx.fillStyle = 'red';
      ctx.fillText('Défaite...', canvas.width / 2, canvas.height / 2 + 80);
    }
  }
  if (data.finalScore) {
    if (typeof data.finalScore === 'string') {
      ctx.fillStyle = 'white';
      ctx.fillText(`Score final : ${data.finalScore}`, canvas.width / 2, canvas.height / 2 + 120);
    } else if (data.finalScore.player1 !== undefined && data.finalScore.player2 !== undefined) {
      ctx.fillStyle = 'white';
      ctx.fillText(`Score final : ${data.finalScore.player1} - ${data.finalScore.player2}`, canvas.width / 2, canvas.height / 2 + 120);
    }
  }
}

socket.on('gameEnded', showGameEnded);

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawWaiting() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('En attente d\'un autre joueur...', canvas.width / 2, canvas.height / 2);
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${score.player1} - ${score.player2}`, canvas.width / 2, 40);
}

function draw() {
  if (waitingForPlayers && !gameEnded) {
    drawWaiting();
    return;
  }
  else if (gameEnded) {
    return; // Ne pas dessiner si la partie est terminée
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paddles
  if (myPlayerKey === 'player1') {
    drawRect(10, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(canvas.width - 10 - PADDLE_WIDTH, opponentPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
  } else {
    drawRect(canvas.width - 10 - PADDLE_WIDTH, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(10, opponentPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
  }

  // Ball
  drawCircle(ball.x, ball.y, BALL_RADIUS, 'white');

  // Score
  drawScore();
}

function sendPaddlePosition(y) {
  socket.emit('move', { paddleY: y });
}

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top - PADDLE_HEIGHT / 2;
  mouseY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, mouseY));
  sendPaddlePosition(mouseY);
});

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();