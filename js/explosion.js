class Explosion {
  constructor(animation, x, y, speed, height) {
    this.isDone = false;
    this.x = x;
    this.y = y - 20;
    this.speed = speed;
    this.height = height;
    this.animation = animation;
    this.w = this.animation[0].width;
    this.len = this.animation.length;
    this.index = 0;
  }

  show() {
    var idx = floor(this.index) % this.len;
    image(this.animation[idx], this.x, this.y, this.height, this.height);
    this.index += this.speed;
    if (floor(this.index) === this.len -1) {
      this.isDone = true;
    }
  }
}
