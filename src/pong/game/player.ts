import { Ball } from './ball';

export class Player {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = 20; // Default width for the paddle
    this.height = 100; // Default height for the paddle
  }

    move(dy: number, yMin: number = 0, yMax: number = 500): void {
      this.y = dy;
      if (this.y < yMin) {
          this.y = yMin;
      }
      if (this.y > yMax - this.height) {
          this.y = yMax - this.height;
      }
  }

  isCollidingWith(other: Ball): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }
}

