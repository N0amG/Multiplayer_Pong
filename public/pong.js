// Pong Game Client
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_RADIUS = 10;

let playerId = null;
let paddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let opponentPaddleY = paddleY;
let ball = { x: canvas.width / 2, y: canvas.height / 2 };
let waitingForPlayers = true;
let score = { player1: 0, player2: 0 };
let myPlayerKey = null;


const socket = io('http://localhost:3000'); // ne pas utiliser ws:// ici

socket.on('connect', () => {
  console.log('✅ Connected to server');
  socket.emit('open', 'Client has connected with id : ' + socket.id);
});

socket.on('open', (msg) => {
  console.log('📩 Server replied:', msg);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Déconnecté du serveur. Raison :', reason);
  // Tu peux aussi envoyer un message ou faire un nettoyage ici si besoin
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err);
});



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

// Affichage du message d'attente
function drawWaiting() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('En attente d\'un autre joueur...', canvas.width / 2, canvas.height / 2);
}

socket.on('waitingForPlayers', (data) => {
  waitingForPlayers = true;
  drawWaiting();
});

socket.on('gameStarted', (data) => {
  waitingForPlayers = false;
  // Le serveur désigne le rôle du joueur
  if (data && data.role && data.players) {
    myPlayerKey = data.role;
    console.log(`Je suis ${myPlayerKey}`);
    // Positionner les raquettes
    paddleY = data.players[myPlayerKey].y;
    opponentPaddleY = data.players[myPlayerKey === 'player1' ? 'player2' : 'player1'].y;
    // Score
    score = data.players.score;
  }
});

socket.on('gameUpdate', (data) => {
  if (data && data.ball) {
    ball = data.ball;
  }
  if (data && data.players) {
    // Mettre à jour les positions des raquettes
    paddleY = data.players[myPlayerKey]?.y ?? paddleY;
    const opponentKey = myPlayerKey === 'player1' ? 'player2' : 'player1';
    opponentPaddleY = data.players[opponentKey]?.y ?? opponentPaddleY;
    // Mettre à jour le score
    if (data.score) {
      score = data.score;
    }
    console.log('Game update received:', data.players['player1'], data.players['player2']);
  }
});

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${score.player1} - ${score.player2}`, canvas.width / 2, 40);
}

function draw() {
  if (waitingForPlayers) {
    drawWaiting();
    return;
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
