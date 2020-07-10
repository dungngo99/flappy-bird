// Select CVS
const cvs = document.getElementById("bird"); //Canvas tag
const ctx = cvs.getContext("2d"); //Context of the canvas
let submitbtn = document.getElementById('dn-submit');
let updatebtn = document.getElementById('dn-update');

//Game VARS & CONSTS
let frame = 0;

// An array to store all user records
let record = { 'name': 'NoName', 'level': '', 'time': '', 'score': '' };
let start_time = 0;
let is_on = false;

const DEGREE = Math.PI / 180;
// LOAD THE SPRITE IMAGE
const sprite = new Image();
sprite.src = "images/sprite.png";

// LOAD SOUND
const Score = new Audio();
Score.src = "audios/sfx_point.wav";

const Flap = new Audio();
Flap.src = "audios/sfx_flap.wav";

const Hit = new Audio();
Hit.src = "audios/sfx_hit.wav";

const Swoosh = new Audio();
Swoosh.src = "audios/sfx_swooshing.wav";

const Die = new Audio();
Die.src = "audios/sfx_die.wav";

// CONTROL THE GAME: The canvas will always listen to mouse click of user. 
// Whenever the user clicks, it will call below function to check the current state

cvs.addEventListener("click", function (evt) {
  switch (state.current) {
    // If the current state is ready and user just clicked, move to playing state
    case state.getReady:
      state.current = state.game;
      Swoosh.play();
      countDSound = 1;
      break;

    // If the current state is game state and user just clicked, bird flaps
    case state.game:
      bird.flap();  // Bird will flap when user clicks on canvas
      Flap.play();  //call play() method of Audio object
      break;

    // If the current state is over and user can only clicked on start button, move back to gerReady state
    case state.over:
      let rect = cvs.getBoundingClientRect();
      let clickX = evt.clientX - rect.left;
      let clickY = evt.clientY - rect.top;

      //Check if we click on the start button
      if (clickX >= start.x && clickX < start.x + start.w
        && clickY >= start.y && clickY < start.y + start.h) {
        state.current = state.getReady;

        // Remove all pipes - reset bird's speed to 0 - reset score to 0
        pipes.reset();
        bird.speedReset();
        score.reset();
        document.getElementById('dn-information').innerHTML = 'Please submit your information...'
      }
      break;
  }
});

window.addEventListener("keydown", function (evt) {
  //console.log('lskdnvksd')
  if (evt.keyCode != 13) {
    return;
  }
  switch (state.current) {
    // If the current state is ready and user just clicked, move to playing state
    case state.getReady:
      state.current = state.game;
      Swoosh.play();
      countDSound = 1;
      break;

    // If the current state is game state and user just clicked, bird flaps
    case state.game:
      bird.flap();  // Bird will flap when user clicks on canvas
      Flap.play();  //call play() method of Audio object
      break;

    // If the current state is over and user can only clicked on start button, move back to gerReady state
    case state.over:
      state.current = state.getReady;
      pipes.reset();
      bird.speedReset();
      score.reset();
      document.getElementById('dn-information').innerHTML = 'Please submit your information...'
      break;
  }
});

submitbtn.addEventListener('click', function submitForm() {
  let name = document.getElementById('dn-name-');
  let level = document.getElementById('level');

  //console.log(`${name.value} ${level.value}`)
  if ((name.value === '') || (level.value === '')) {
    return;
  }

  //console.log(`${name} ${level}`)
  if (level.value === "level1") {
    pipes.dx = 2;
    pipes.period = 100;
  } else if (level.value === 'level2') {
    pipes.dx = 4;
    pipes.period = 75;
  } else {
    pipes.dx = 6;
    pipes.period = 50;
  }

  //console.log(level.value)
  record = {
    'name': name.value,
    'level': level.value.charAt(5),
    'time': '',
    'score': ''
  }
  console.log(record)
  name.value = '';
  document.getElementById('dn-information').innerHTML = 'Your information has been recorded.';
})

// GAME STATE
const state = {
  current: 0, // current state of the game
  getReady: 0, // get-ready state of the game
  game: 1, // playing state of the game
  over: 2, // game-over state of the game
}

// START BUTTON COORDINATE
const start = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
}

// BACKGROUND
const bg = {
  //this extracts the background for the game
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,
  draw: function () { //This creates a background image for the game
    //drawImage(): clip an image fron source and add it to destination
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    // Draw another image
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);

  }
}

// FOREGROUND
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,
  dx: 2,
  draw: function () {
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w + this.w, this.y, this.w, this.h);
    // Add new foreground to help the update function below. must not lack of foreground.
  },
  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % this.w;
    }
  }
}

// BIRD
const bird = {
  //this extracts the source bird for the game
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 }
  ],
  period: 5,
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  frame: 0,

  speed: 0,
  gravity: 0.15,
  jump: 4,
  rotation: 0,

  radius: 12,

  draw: function () {
    let bird = this.animation[this.frame];

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, 0 - this.w / 2, 0 - this.h / 2, this.w, this.h);
    ctx.restore();
  },

  // Move the bird up when it flaps
  flap: function () {
    this.speed -= this.jump;
  },

  // Update the bird's frame every 5 canvas's frames. 5 is the period the bird flap its swing.
  // To not allow bird's frame bigger than 3, use % to update back the bird's frame
  update: function () {
    // If the game state is get ready, the bird must flap slowly. Otherwise, the bird must flap faster. 
    // 5 or 10 = period, mean every 5 or 10 'frames', the bird will change its state
    this.period = state.current == state.getReady ? 10 : 5;

    // Update the 'frame' every 5 'frames' is update
    this.frame += frame % this.period == 0 ? 1 : 0;

    // Limit the frame number to 0 to 3 (assume animation.length=4)
    this.frame = this.frame % this.animation.length;
    // IN THE GET-READY STATE
    if (state.current == state.getReady) {
      this.y = 150;
      this.speed = 0;
      this.rotation = 0;
    }
    // IN THE GAME-OVER STATE
    else if (state.current == state.over) {
      if (this.y + this.h / 2 < cvs.height - fg.h) {
        this.y += 6;
        this.rotation = 90 * DEGREE; // Rotate the bird down (90 degree)
      }
      else {
        this.y = cvs.height - fg.h - this.h / 2;
      }
      frame = 0; // to make the bird stops flapping
    }

    // IN THE PLAYING STATE
    else {
      // The bird keeps falling with gravity
      this.speed += this.gravity;
      this.y += this.speed;

      // If the bird hits the ceiling (min -450) or the floor (height of foreground), game over
      if ((this.y + this.h / 2 >= cvs.height - fg.h) || (this.y + this.h / 2 <= -450)) {
        state.current = state.over;
        Die.play();

        //Reset variables
        record['time'] = Math.floor((Date.now() - start_time) / 1000);
        is_on = false;
        start_time = 0;
        updateTable();
      }

      // If the speed is greater than the jumps, means the bird is falling down (rotaion is positive)
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
      }
      else { // Otherwise, the rotation is negative
        this.rotation = -25 * DEGREE;
      }

      if (is_on === false) {
        start_time = Date.now();
        is_on = true;
      }
    }
  },
  speedReset: function () {
    this.speed = 0;
  }

}

// GET READY MESSANGE
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    // The implementation of this function can only be called if the current state is get-ready state
    if (state.current == state.getReady) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

// GAME OVER MESSAGE
const getMessage = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    // The implementation of this function can only be called if the current state is game-over state
    if (state.current == state.over) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}

// PIPES
const pipes = {
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },

  bottom: {
    sX: 502,
    sY: 0,
  },
  w: 53,
  h: 400,
  gap: 85,
  maxYPos: -150,
  dx: 2,
  period: 100,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      // top pipe
      var x = ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

      // bottom pipe
      ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
    }
  },

  update: function () {
    if (state.current !== state.game) {
      return
    };

    // For every 100 frames, add 1 more pipe to position array
    if (frame % this.period == 0) {
      var element = {
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1)
      }
      this.position.push(element);
    };

    // Iterate over position array and update their x-position (Decrement x value).
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let bottomPipeY = p.y + this.gap + this.h; // Construct the y-position for bottom pipe

      // Collision Detection
      // Top pipe. Change to game-over state if bird touches either 1 out of 4 edges of the pipe (top, bottom, right, and left)
      if (bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h) {
        state.current = state.over;
        Hit.play();
        Die.play();

        //Reset variables
        record['time'] = Math.floor((Date.now() - start_time) / 1000);
        is_on = false;
        start_time = 0;
        updateTable();
      }
      // Bottom pipe: Change to game-over state if bird touches either 1 out of 4 edges of the pipe (top, bottom, right, and left)
      if (bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeY &&
        bird.y - bird.radius < bottomPipeY + this.h) {
        state.current = state.over;
        Hit.play();
        Die.play();

        //Reset variables
        record['time'] = Math.floor((Date.now() - start_time) / 1000);
        is_on = false;
        start_time = 0;
        updateTable();
      }

      // Move the pipe to the left
      p.x -= this.dx;

      if (p.x + this.w <= 0) {
        this.position.shift(); // Remove 1st pipe from position array. Ex: [1,2,3].shift() -> remove 1
        score.value += 1; // increment the score by 1
        Score.play();

        // Whenever 1 pipe is passed and removed, update score and save the best score
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
        //localStorage.setItem(key, value) and localStorage.getItem(key)

        record['score'] = score.value;
      }
    }
  },
  reset: function () {
    this.position = [];
  }

}

// SCORE: Draw the scores
const score = {
  // if the localStorage is empty, take 0 as best score
  best: parseInt(localStorage.getItem("best")) || 0,
  value: 0,

  draw: function () {
    ctx.fillStyle = "#FFF";
    if (state.current == state.game) { //If the current state is playing state -> draw the score at top
      ctx.lineWidth = 2;
      ctx.font = "35px Teko";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    }
    else if (state.current == state.over) { //If the current state is game over -> draw the score at box
      // Score value
      ctx.font = "20 Teko";
      ctx.fillText(this.value, 225, 190);
      ctx.strokeText(this.value, 225, 190);
      // Best score
      ctx.fillText(this.best, 225, 238);
      ctx.strokeText(this.best, 225, 238);
    }
  },

  reset: function () {
    this.value = 0;
  },

  isBest: function () {
    let best = localStorage.getItem('best') || 0;
    //console.log(`${best} ${score.value}`)
    if (score.value >= best) {
      document.getElementById('dn-information').innerHTML = document.getElementById('dn-information').innerHTML + ' You got the best score. Awesome!'
    }
  }
}

//MEDALS: Display when user finished the game
const medals = {
  sX: [317, 362, 317, 362],
  sY: [112, 112, 158, 158],
  w: 41,
  h: 41,
  dX: 90,
  dY: 180,

  draw: function () {
    if (state.current == state.over) {
      if (score.value <= 5) {
        ctx.drawImage(sprite, this.sX[0], this.sY[0], this.w, this.h, this.dX, this.dY, this.w, this.h);
        document.getElementById('dn-information').innerHTML = 'You got Stone medal.';
        //console.log(0)
      }else if (score.value <= 10){
        ctx.drawImage(sprite, this.sX[1], this.sY[1], this.w, this.h, this.dX, this.dY, this.w, this.h);
        document.getElementById('dn-information').innerHTML = 'You got Bronze medal.';
        //console.log(1)
      }else if (score.value <= 15){
        ctx.drawImage(sprite, this.sX[2], this.sY[2], this.w, this.h, this.dX, this.dY, this.w, this.h);
        document.getElementById('dn-information').innerHTML = 'You got Silver medal.'
        //console.log(2)
      }else{
        ctx.drawImage(sprite, this.sX[3], this.sY[3], this.w, this.h, this.dX, this.dY, this.w, this.h);
        document.getElementById('dn-information').innerHTML = 'You got Gold medal.'
      }
      //console.log('v;evnlw')
      score.isBest();
    }
  },
}

// DRAW: Move an image from sprite.png to destination, canvas
function draw() {
  ctx.fillStyle = "#70c5ce";  // fill the ctx object of cvs object with color  
  ctx.fillRect(0, 0, cvs.width, cvs.height); // fill the Rectangular from (0,0) to (cvs.width, cvs.height)

  bg.draw();  // draw background
  pipes.draw(); // draw pipes
  fg.draw(); // draw foreground
  bird.draw(); // draw the bird
  getReady.draw(); // draw getReady box
  getMessage.draw(); // draw getMessage box
  score.draw(); // draw score box
  medals.draw(); // draw the stone medal
}

// UPDATE THE GAME
function update() {
  bird.update();
  fg.update();
  pipes.update();
}

// LOOP
//Call draw and update function to update the Game 50 times every second. Clear the canvas each time we update
function loop() {
  update();
  draw();
  frame++;
  requestAnimationFrame(loop); // take call back function - loop function call 50 times per second
}

function updateTable() {
  let table = document.getElementById('myTable');
  let row = table.insertRow(-1);
  i = 0;
  //console.log(i)

  if (record['score'] === '') {
    record['score'] = 0;
  }
  if (record['level'] === '') {
    record['level'] = 1;
  }

  for (let key in record) {
    //console.log(key)
    let cell = row.insertCell(i);
    cell.innerHTML = record[key];
    i++;
  }

  record = { 'name': 'NoName', 'level': record['level'], 'time': '', 'score': '' }
  time = 0;
  document.getElementById('dn-information').innerHTML = 'Please submit your information...';
}

//RUN THE PROGRAM
loop()

/*
NOTE:
1. drawImage() method take these argument:
  source_X, source_Y,
  source_Width, source_Height,
  destination_X, destination_Y,
  destination_Width, destination_Height

2. The game keeps updating its images and changing their location using update function
3. The most important point is method requestAnimationFrame() to loop 50 times per second so that we always feel the game is running.
4. The truth is the web browser keep updating its frame.

5. In the game, we have 3 game state:
  1. getReady state: user click the start button - go to the game state
  2. game state: user tap on the screen - no change state - until he fails the game - move to game over state
  3. game over state: user click on the restart, move back to getReady state.

6. Each component will be a separate object and has folloing properties:
  1. source X-position
  2. source Y-position
  3. height of image
  4. width of image
  5. destination X-position
  6. destination Y-position
  7. draw() function
  8. update() function

7. Debugging:
  a. window.AddEventListener('keydown', functionHere(), false); not work for canvas in my case
  b. Check if using the same name for variables, especially between functions and variables
  c. Know how to construct scrollable table
  d. Update table as follow: take inputs from user form -> process it -> output to table by creating new row and populate its cells
  e. if button is inside form tag, it would have submit type by default -> always reset page when we click it
  f. Know what is keyCode of any key when pressing any key on keyboard
  g. Should not put tagElement.addEventListener() inside a function (maybe at the local scope of the function, the listeners will be deleted.)
  h. define function inside object or nested function. A variables of inner functions can use all variables of outside functions but not the other way around.
  */