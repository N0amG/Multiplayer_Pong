import { Player } from "./player";
import { Ball } from "./ball";

export class Game {
	player1: Player
	player2: Player;
	ball: Ball;
	score: { player1: number; player2: number };
	constructor(player1: Player, player2: Player) {
		this.player1 = player1;
		this.player2 = player2;
		this.ball = new Ball(400 - 15, 250 - 15, 30, 30);
		this.score = { player1: 0, player2: 0 };
	}
	update() {
		this.ball.move();

		// Check for collisions with players
		if (this.player1.isCollidingWith(this.ball)) {
			this.ball.bounceHorizontally();
			const centerY = this.player1.getCenter().y;
			const ballCenterY = this.ball.y + this.ball.height / 2;
			const diffY = ballCenterY - centerY;
			this.ball.speedY += diffY * 0.1; // Adjust speed based on collision point
		} else if (this.player2.isCollidingWith(this.ball)) {
			this.ball.bounceHorizontally();
			const centerY = this.player2.getCenter().y;
			const ballCenterY = this.ball.y + this.ball.height / 2;
			const diffY = ballCenterY - centerY;
			this.ball.speedY += diffY * 0.1; // Adjust speed based on collision point
		}

		// Check for top and bottom boundaries
		if (this.ball.y <= 0 || this.ball.y + this.ball.height >= 500) {
			this.ball.bounceVertically();
		}

		// Check for scoring
		if (this.ball.x <= 0) {
			this.score.player2++;
			this.resetBall();
		} else if (this.ball.x + this.ball.width >= 800) {
			this.score.player1++;
			this.resetBall();
		}
	}
	resetBall() {
		this.ball.resetPosition(800 / 2 - this.ball.width / 2, 500 / 2 - this.ball.height / 2);
		this.ball.speedX = 5 * (Math.random() < 0.5 ? 1 : -1); // Randomize initial horizontal direction
		this.ball.speedY = 5 * (Math.random() < 0.5 ? 1 : -1); // Randomize initial vertical direction
	}
	getScore() {
		return this.score;
	}
	getBallPosition() {
		return { x: this.ball.x, y: this.ball.y };
	}
	getPlayerPositions() {
		return {
			player1: this.player1.getPosition(),
			player2: this.player2.getPosition(),
		};
	}
	getBallCenter() {
		return {
			x: this.ball.x + this.ball.width / 2,
			y: this.ball.y + this.ball.height / 2,
		};
	}
	getPlayerCenters() {
		return {
			player1: this.player1.getCenter(),
			player2: this.player2.getCenter(),
		};
	}
	getPlayer1() {
		return this.player1;
	}
	getPlayer2() {
		return this.player2;
	}
	getBall() {
		return this.ball;
	}
	getPlayer1Score() {
		return this.score.player1;
	}
	getPlayer2Score() {
		return this.score.player2;
	}
	getGameState() {
		return {
			player1: this.player1.getPosition(),
			player2: this.player2.getPosition(),
			ball: this.ball.getPosition(),
			score: this.score,
		};
	}
}