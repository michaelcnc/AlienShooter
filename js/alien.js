class Alien {
    constructor(x, y, r, a_img, p_img) {
        var options = {
            friction : 0.1, 
            restitution : 0.2
        }
        this.r = r;
        this.x = x;
        this.y = y;
        this.dx = 25;
        this.a_img = a_img;
        this.p_img = p_img;
        this.thread = null;
        this.link = null;
        this.body = Bodies.circle(x, y, r, options);
        World.add(world, this.body);
    }

    addThread(thread) {
        this.thread = thread;
        Composite.add(thread.body, this); 

        var lastlink = thread.body.bodies.length-1;
        this.link = Constraint.create(
           {
             bodyA:thread.body.bodies[lastlink],
             pointA:{x:0,y:0},
             bodyB:this.body,
             pointB:{x:0,y:0},
             length:10,
             stiffness:0.1
           });
        World.add(world, this.link);
    }

    cutThread(sound) {
        sound.play();
        if (this.link != null) {
            World.remove(world, this.thread);
            World.remove(world, this.link);
            this.thread.body = null;
            this.link = null;
        }
    }
    
    move() {
        //Composite.translate(this.thread.body, { x: this.dx, y: 0 });
        this.thread.pointA.x += this.dx;
    }

    shiftDown() {
        this.dx *= -1;
        this.thread.pointA.y += this.r;
    }

    isOffScreen() {
        return(this.thread.pointA.x > width - 25 || this.thread.pointA.x < 25);
    }

    removeFromWorld() {
        World.remove(world, this.body);
    }

    show() {
        imageMode(CENTER);
        var pos = this.body.position;
        image(this.a_img, pos.x, pos.y, 70, 70);
        image(this.p_img, this.thread.pointA.x, this.thread.pointA.y, 20, 20);
        this.thread.show()
    }
}
