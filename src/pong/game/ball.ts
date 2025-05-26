export class Ball {
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = 5; // Vitesse initiale en X
    this.speedY = 5; // Vitesse initiale en Y
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  bounceVertically() {
    this.speedY *= -1; // Inverser la direction verticale
  }

  bounceHorizontally() {
    this.speedX *= -1; // Inverser la direction horizontale
  }

  resetPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }
}
