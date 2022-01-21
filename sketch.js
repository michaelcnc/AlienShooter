const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Body = Matter.Body;
const Composites = Matter.Composites;
const Composite = Matter.Composite;
const Mouse = Matter.Mouse;
const MouseConstraint = Matter.MouseConstraint;

var assetpath = "assets/";

var engine;
var world;
var constr_m;

/*
  Game Status variables
*/
var score = 0;
var interval = 50;
var isAlienDestroyed = false;
var END = 0;
var PLAY = 1;
var gameState = PLAY;
var gameOverImg, WinImg;
var EndOfGame;

/*
  Background variables
*/
var canvas_width = 800;
var canvas_height = 600;
var bg_img;
var ground;

/*
  Aliens variables
*/
var alien_types = 9;
var alien;
var al_thread;
var aliens = [];
var al_images = [];
var green_p_img, blue_p_img, red_p_img;
var shift_cnt = 0;

var photonImage;
var photons = [];

/*
  Avatar variables
*/
var boy;
var boy1_img,boy2_img,boy3_img; 
var boy_spin = -1;
var boy_dx = 1;
var star_boy;
var boy_life = 2;

var girl;
var girl1_img,girl2_img,girl3_img;
var girl_spin = 1;
var girl_dx = -1;
var star_girl;
var girl_life = 2;

/*
  Explosion variables
*/
var ex_frame;
var ex_imgs = [];
var ex_spritesheet;
var ex_spritedata;
var explosions = [];

/*
  Buttons variables
*/
var m_btn_x = 450;
var m_btn_y = 0;
var m_btn_img, muted_image, unmuted_image;

/*
  Sound variables
*/
var bk_song;
var cut_sound;
var explode_sound;
var bshot_sound;
var gshot_sound;

function preload() {
  bg_img = loadImage(assetpath + 'background.png');
  gameOverImg = loadAnimation(assetpath + "gameOver.png");
  WinImg = loadAnimation(assetpath + "win.png");

  for (var i = 0; i < alien_types; i++) {
    var img_a = loadImage(assetpath + 'alien' + (i + 1) + '.png');
    al_images.push(img_a);
  }
  boy1_img = loadAnimation(assetpath + 'boy1.png');
  boy2_img = loadAnimation(assetpath + 'boy2.png');
  boy3_img = loadAnimation(assetpath + 'boy3.png');
  girl1_img = loadAnimation(assetpath + 'girl1.png');
  girl2_img = loadAnimation(assetpath + 'girl2.png');
  girl3_img = loadAnimation(assetpath + 'girl3.png');
  photonImage = loadImage(assetpath + 'photon.png');

  muted_image = loadImage(assetpath + 'mute.png');
  unmuted_image = loadImage(assetpath + 'unmute.png');
  m_btn_img = unmuted_image;

  green_p_img = loadImage(assetpath + 'green_peg.png');
  blue_p_img = loadImage(assetpath + 'blue_peg.png');
  red_p_img = loadImage(assetpath + 'red_peg.png');

  bk_song = loadSound(assetpath + 'sound1.mp3');
  cut_sound = loadSound(assetpath + 'rope_cut.mp3');
  bshot_sound = loadSound(assetpath + 'boy-gun.wav');
  gshot_sound = loadSound(assetpath + 'girl-gun.wav');
  explode_sound = loadSound(assetpath + 'explode_sound.wav');

  empty_star = loadAnimation(assetpath + 'empty.png');
  one_star = loadAnimation(assetpath + 'one_star.png');
  two_star = loadAnimation(assetpath + 'stars.png');

  /*
  Load json and png file for explosion images
  */
  ex_spritedata = loadJSON(assetpath + 'explosion.json');
  ex_spritesheet = loadImage(assetpath + 'explosion.png');
 

  /* 
    p5.play.js has bug, 
    Animated sprite does not work upon loadAnimation from a spritesheet loaded from a JSON
    Animated sprite does not work upon loadAnimation from a spritesheet loaded from fixed grid values
  
    ex_spritesheet = loadSpriteSheet(assetpath + 'explosion.png', 317, 254, 9);
    ex_animation = loadAnimation(ex_spritesheet);
    ex_animation.playing = true;
    ex_animation.looping = false;
  
    So need to use a separate class - explosion
  */
}

function setup() {
  createCanvas(canvas_width, canvas_height);
  frameRate(80);

  bk_song.loop();
  bk_song.setVolume(0.5);

  engine = Engine.create();
  world = engine.world;

  /*
    button = createImg('cut_btn.png');
    button.position(50, 90);
    button.size(50, 50);
    button.mouseClicked(drop);
  */

  ground = new Ground(width / 2, height, width, 10);

  /*
    Create sprite of a Boy and a Girl
    Tint of the boy/girl depends on their life remained
  */
  boy = createSprite(200, height - 70, 100, 100);
  boy.scale = 0.3;
  boy.addAnimation('L2', boy1_img);
  boy.addAnimation('L1', boy2_img);
  boy.addAnimation('L0', boy3_img);

  girl = createSprite(600, height - 75, 100, 100);
  girl.scale = 0.3;
  girl.addAnimation('L2', girl1_img);
  girl.addAnimation('L1', girl2_img);
  girl.addAnimation('L0', girl3_img);


  /*
    Create a row of Aliens, and add them to matter_js world
  */
  createAliens();

  /*
    Read the series of explosion images into an array
  */
  ex_frames = ex_spritedata.frames;
  for (var i = 0; i < ex_frames.length; i++) {
    var pos = ex_frames[i].position;
    var img = ex_spritesheet.get(pos.x, pos.y, pos.width, pos.height);
    ex_imgs.push(img);
  }

  /*
    Stars at top left and top right corners 
  */
  star_boy = createSprite(50, 20, 30, 30);
  star_boy.scale = 0.2;
  star_boy.addAnimation('zero', empty_star);
  star_boy.addAnimation('one', one_star);
  star_boy.addAnimation('two', two_star);

  star_girl = createSprite(width-50, 20, 30, 30);
  star_girl.scale = 0.2;
  star_girl.addAnimation('zero', empty_star);
  star_girl.addAnimation('one', one_star);
  star_girl.addAnimation('two', two_star);

  /*
    End of Game sprite shown at the end
  */
  EndOfGame = createSprite(width/2, height/2);
  EndOfGame.addAnimation('GameOver', gameOverImg);
  EndOfGame.addAnimation('YouWin', WinImg);
  EndOfGame.scale = 1;
  EndOfGame.visible = false;

  rectMode(CENTER);
  ellipseMode(RADIUS);
  textSize(50);

  /*
    Mouse constrain for dragging the Aliens for fun
  */
  var canvasmouse = Mouse.create(canvas.elt);
  canvasmouse.pixelRatio = pixelDensity();
  var options_m = {
    mouse: canvasmouse
  }
  constr_m = MouseConstraint.create(engine, options_m);
  World.add(world, constr_m);

}

function draw() {

  background(51);
  image(bg_img, 0, 0, width, height);
  ground.show();

  /*
    Instruction words at the top of the screen
  */
  textSize(20);
  textStyle(BOLD);
  fill("white");
  text("<- or -> to move, x or z to shoot", 120, 40);
  text("click to drag", 570, 40);
  text("SCORE :" + score, 250, 20);
  image(m_btn_img, m_btn_x, m_btn_y, 50, 50);

  /*
    Display all the sprites
  */
  drawSprites();

  if (gameState === PLAY) {
    /*
      If both the boy and the girl are dead, end the game
    */
      if (boy === null && girl === null) {
        gameState = END;
    }
  
    /*
      If all aliens are destroyed, end the game
    */
    if (aliens.length === 0) {
      gameState = END;
    }

    /* 
      Move the Aliens once per every <interval> frames,
      The checking <interval> becomes smaller as an Alien is destroyed, 
      So the rest of the Aliens will move faster
    
      If any of the Aliens moves outside of edges,
      shift all rows of Aliens downwards by once,
      if they have been shifter for 3 times, create a new rows of Aliens at the top
    */

    var isOutOfEdge = false;

    for (var i = 0; i < aliens.length; i++) {
      if (aliens[i] != null) {
        aliens[i].show();
        if ((frameCount % interval) === 0) {
          aliens[i].move();
          if (aliens[i].isOffScreen()) {
            isOutOfEdge = true;
          }
        }
      }
    }

    if (isOutOfEdge) {
      for (var i = 0; i < aliens.length; i++) {
        aliens[i].shiftDown();
      }
      shift_cnt += 1;
      if (shift_cnt > 0 && (shift_cnt % 3) === 0) {
        createAliens();
      }
    }

    if (boy != null) {
      /*
        Stars indicating how many life of boy
        change the Tint according to his life
      */
      switch (boy_life) {
        case 0:
          star_boy.changeAnimation('zero');
          boy.changeAnimation('L0');
          break;
        case 1:
          star_boy.changeAnimation('one');
          boy.changeAnimation('L1');
          break;
        case 2:
          star_boy.changeAnimation('two');
          boy.changeAnimation('L2');
          break;
        default:
          star_boy.changeAnimation('two');
          boy.changeAnimation('L2');
          break;
      }
    /*
      Make the boy roll and move horizontally within a range
    */
      boy.rotation += boy_spin;
      boy.x += boy_dx;
      if (boy.x < 100 || boy.x > 300) {
        boy_dx = boy_dx * (-1);
      }
    }
    
    if (girl != null) {
      /*
        Stars indicating how many life of girl
        change the Tint according to her life
      */
      switch (girl_life) {
        case 0:
          star_girl.changeAnimation('zero');
          girl.changeAnimation('L0');
          break;
        case 1:
          star_girl.changeAnimation('one');
          girl.changeAnimation('L1');
          break;
        case 2:
          star_girl.changeAnimation('two');
          girl.changeAnimation('L2');
          break;
        default:
          star_girl.changeAnimation('two');
          girl.changeAnimation('L2');
          break;
      }
      /*
        Make the girl roll and move horizontally within a range
      */
      girl.rotation += girl_spin;
      girl.x += girl_dx;
      if (girl.x < 500 || girl.x > 700) {
        girl_dx = girl_dx * (-1);
      }
    }

    /*
      Let matter_js engine to compute the movement of all Aliens
    */
    Engine.update(engine);

    /*
      Check whether any Alien has been hit by anything
    */
    checkHit();

    /*
      Check whether any Alien falls onto the ground
    */
    checkCrash();

    /*
      If any Alien fell on ground and destroyed
      speed up the game a little by shorten the <interval>
    */
    if (isAlienDestroyed) {
      interval = interval - 1;
      if (interval < 10) interval = 10;
      isAlienDestroyed = false;
    }

    /*
    Display explosion flames if any
    */
    for (var i = 0; i < explosions.length; i++) {
      if (explosions[i] != null) {
        if (explosions[i].isDone) {
          explosions[i] = null;
          explosions.splice(i, 1);
        } else {
          explosions[i].show();
        }
      }
    }

  } else if (gameState === END) {
    
    /*
      If game is ended, display the Game Over sprite
      and the restart game instrution text
    */
    if (boy===null && girl=== null) {
      EndOfGame.changeAnimation('GameOver');
    } else {
      EndOfGame.changeAnimation('YouWin');
    }
    EndOfGame.visible = true;
    textSize(20);
    fill("white")
    text("Press Up Arrow to Restart the Game! ", 200, 250);

    if (keyDown("UP_ARROW")) {
      reset();
    }
  }

}


/*
  HOW TO CREATE ALIENS
*/
function createAliens() {
  for (var i = 0; i < alien_types; i++) {

    /*
      a_num randomly choose 1 from 9 types of aliens
      p_num randomly choose from 3 types of pegs (green, blue, red)
    */
    var al_posx = 70 * i + 60;
    var al_posy = 120
    var a_num = floor(random(50)) % alien_types;
    var p_num = a_num % 3;
    var img_p = red_p_img;
    
    switch (p_num) {
      case 0:
        img_p = green_p_img;
        break;
      case 1:
        img_p = blue_p_img;
        break;
      case 2:
        img_p = red_p_img;
        break;
      default:
        break;
    }
    
    /*
      To create an Alien,
         pass position x, position y, image of alien, image of peg
      Create a rope to hang the alien from the peg
      Add the alien to array for sake of management
    */
    alien = new Alien(al_posx, al_posy, 20, al_images[a_num], img_p);
    al_thread = new Rope(3, { x: al_posx, y: al_posy - 70 });
    alien.addThread(al_thread);
    aliens.push(alien);
  }
}

function checkHit() {
  
  for (var i = 0; i < aliens.length; i++) {
    if (aliens[i] != null) {
      var explosion;
      var pos = aliens[i].body.position;
  
      /*
        For each alien, if it touches the boy
          display a big explosion and play explosion sound
          remove the alien from world and from the array
        if the boy has no life left, vanish the boy
      */
      if (boy != null) {
        var db = dist(aliens[i].body.position.x, aliens[i].body.position.y, boy.x, boy.y);
        if (db < 60) {
          explosion = new Explosion(ex_imgs, pos.x, pos.y, 0.1, 300);
          explosions.push(explosion);
          explode_sound.play();
          aliens[i].removeFromWorld();
          aliens[i] = null;
          aliens.splice(i, 1);
          if (boy_life > 0) {
            boy_life -= 1;
          } else {
            boy.destroy();
            boy = null;
          }
          return;
        }
      }
      /*
        For each alien, if it touches the girl
          display a big explosion and play explosion sound
          remove the alien from world and from the array
          if the girl has no life left, vanish the girl
      */
      if (girl != null) {
        var db = dist(aliens[i].body.position.x, aliens[i].body.position.y, girl.x, girl.y);
        if (db < 60) {
          explosion = new Explosion(ex_imgs, pos.x, pos.y, 0.1, 300);
          explosions.push(explosion);
          explode_sound.play();
          aliens[i].removeFromWorld();
          aliens[i] = null;
          aliens.splice(i, 1);
          if (girl_life > 0) {
            girl_life -= 1;
          } else {
            girl.destroy();
            girl = null;
          }
          return;
        }
      }
      /*
        For each alien, if any photon in the array touches it
          make the alien hanging rope to break
          vanish the photon that hit it
      */
      for (var j = 0; j < photons.length; j++) {
        if (photons[j] != null) {
          var dp = dist(aliens[i].body.position.x, aliens[i].body.position.y, photons[j].x, photons[j].y);
          if (dp < 30) {
            aliens[i].cutThread(cut_sound);
            photons[j].life = 0;
            photons[j] = null;
            photons.splice(j, 1);
            return;
          }
        }
      }
    }
  }
}

/*
  For each alien, if it touches the ground
    display a small explosion and play explosion sound
    increment the score by 1
    vanish the alien by removing it from the matter_js world and the array
*/
function checkCrash() {
  for (var i = 0; i < aliens.length; i++) {
    var pos = aliens[i].body.position;
    if (aliens[i] != null && pos.y >= height - 30) {
      var explosion = new Explosion(ex_imgs, pos.x, pos.y, 0.1, 100);
      explosions.push(explosion);
      explode_sound.play();
      score += 1;
      aliens[i].removeFromWorld();
      aliens[i] = null;
      aliens.splice(i, 1);
      isAlienDestroyed = true;
      return;
    }
  }
}

/*
  If the song button is clicked
    toggle the song button image
    and mute/unmute the music
*/
function mouseClicked() {
  var d = dist(mouseX-30, mouseY-30, m_btn_x, m_btn_y);
  if (d <= 25) {
    if (bk_song.isPlaying()) {
      bk_song.stop();
      m_btn_img = muted_image;
    }
    else {
      bk_song.loop();
      m_btn_img = unmuted_image;
    }
  }
}

function keyReleased() {
}


function keyPressed() {
    /*
      If 'z' key is pressed
        create a new photon as a sprite 
        this photon should be shot from the boy's gun
        so need to compute the photon starting position according boy's gun
        and compute the photon shooting direction (setSpeed) according to boy's angle
    */  
    if (key === 'z' && boy!=null) {
    bshot_sound.play();
    var px = boy.x + ((-65) * cos(boy.rotation + 55));
    var py = boy.y + ((-50) * sin(boy.rotation + 55));
    var photon = createSprite(px, py);
    photon.scale = 0.2;
    photon.addImage(photonImage);
    photon.life = 50;
    photon.setSpeed(10, boy.rotation - 160);
    photons.push(photon);
  }

  /*
    If 'x' key is pressed
      create a new photon as a sprite 
      this photon should be shot from the girl's gun
      so need to compute the photon starting position according girl's gun
      and compute the photon shooting direction (setSpeed) according to girl's angle
  */  
  if (key === 'x' && girl!=null) {
    gshot_sound.play();
    var px = girl.x + ((80) * cos(girl.rotation - 45));
    var py = girl.y + ((80) * sin(girl.rotation - 45));
    var photon = createSprite(px, py);
    photon.scale = 0.2;
    photon.addImage(photonImage);
    photon.life = 50;
    photon.setSpeed(10, girl.rotation - 15);
    photons.push(photon);
  }

  /*
    If -> key is pressed
      move boy to the left
      move girl to the right
    If <- key is pressed
      move boy to the right
      move girl to the left  
  */  
  if (keyCode === RIGHT_ARROW) {
    boy_dx = -1;
    girl_dx = 1;
  } else if (keyCode === LEFT_ARROW) {
    boy_dx = 1;
    girl_dx = -1;
  }
}

/*
Reset the game for restart :
  1. Clear everything still remain in matter_js world
  2. Clear the maths computed by matter_js engine
  3. Empty the aliens array
  4. Empty the photons array
  5. Empty the explosions array  
  6. Destroy the boy if he is not already dead
  7. Destroy the girl if she is not already dead
  8. Reset the score to zero
  9. Reset the alien moving <interval>
 10. Recreate the boy from scratch 
 11. Recreate the girl from scratch
 12. Recreate a new rows of aliens
 13. Set game state to PLAY
 14. Remove the End of Game sprite
*/  
function reset() {
  
  World.clear(world);
  Engine.clear(engine);
  aliens.splice(0, aliens.length);
  photons.splice(0, photons.length);
  explosions.splice(0, explosions.length);
  if (boy!=null) {
    boy.destroy();
    boy = null;
  }
  if (girl!=null) {
    girl.destroy();
    girl = null;
  }

  score = 0;
  interval = 50;
  isAlienDestroyed = false;

  boy_life = 2;
  boy = createSprite(200, height - 70, 100, 100);
  boy.scale = 0.3;
  boy.addAnimation('L2', boy1_img);
  boy.addAnimation('L1', boy2_img);
  boy.addAnimation('L0', boy3_img);

  girl_life = 2;
  girl = createSprite(600, height - 75, 100, 100);
  girl.scale = 0.3;
  girl.addAnimation('L2', girl1_img);
  girl.addAnimation('L1', girl2_img);
  girl.addAnimation('L0', girl3_img);
  
  createAliens();

  gameState = PLAY;
  EndOfGame.visible = false;
}
