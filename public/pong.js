


// Pong Game Client
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_RADIUS = 10;

let playerId = null;
let paddleY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let opponentPaddleY = paddleY;
let ball = { x: canvas.width / 2, y: canvas.height / 2 };


const socket = io('http://localhost:3000'); // ne pas utiliser ws:// ici

socket.on('connect', () => {
  console.log('✅ Connected to server');
  socket.emit('open', 'hello from client');
});

socket.on('open', (msg) => {
  console.log('📩 Server replied:', msg);
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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paddles
  if (playerId === 'player1') {
    drawRect(10, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(canvas.width - 10 - PADDLE_WIDTH, opponentPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
  } else {
    drawRect(canvas.width - 10 - PADDLE_WIDTH, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(10, opponentPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
  }

  // Ball
  drawCircle(ball.x, ball.y, BALL_RADIUS, 'white');
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
