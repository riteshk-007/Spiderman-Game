const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");

let playerImage = new Image();
let enemyImage = new Image();
playerImage.src = "/hero.png"; // replace with actual path
enemyImage.src = "/villen.png"; // replace with actual path

const player = {
  x: 50,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
  dy: 0,
  health: 3,
  bullets: [],
  score: 0,
};

const enemy = {
  x: canvas.width - 100,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 2,
  dx: 0,
  dy: 0,
  health: 3,
  bullets: [],
};

let gameInterval;
let enemyMoveInterval;
let timeElapsed = 0;
let gameOverFlag = false;

function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawEnemy() {
  ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
}

function drawBullet(bullet) {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
  player.x += player.dx;
  player.y += player.dy;

  enemy.x += enemy.dx;
  enemy.y += enemy.dy;

  if (enemy.x < 0) {
    enemy.x = 0;
    enemy.dx = Math.random() * enemy.speed;
  } else if (enemy.x + enemy.width > canvas.width) {
    enemy.x = canvas.width - enemy.width;
    enemy.dx = -Math.random() * enemy.speed;
  }

  if (enemy.y < 0) {
    enemy.y = 0;
    enemy.dy = Math.random() * enemy.speed;
  } else if (enemy.y + enemy.height > canvas.height) {
    enemy.y = canvas.height - enemy.height;
    enemy.dy = -Math.random() * enemy.speed;
  }

  player.bullets.forEach((bullet) => {
    bullet.x += bullet.dx;
  });

  player.bullets = player.bullets.filter((bullet) => bullet.x < canvas.width);

  player.bullets.forEach((bullet) => {
    if (
      bullet.x + bullet.width >= enemy.x &&
      bullet.x <= enemy.x + enemy.width &&
      bullet.y + bullet.height >= enemy.y &&
      bullet.y <= enemy.y + enemy.height
    ) {
      enemy.health -= 1;
      bullet.x = canvas.width + 1;
      player.score += 10;
      updateScore();
    }
  });

  enemy.bullets.forEach((bullet) => {
    bullet.x -= bullet.dx;
  });

  enemy.bullets = enemy.bullets.filter((bullet) => bullet.x > 0);

  enemy.bullets.forEach((bullet) => {
    if (
      bullet.x + bullet.width >= player.x &&
      bullet.x <= player.x + player.width &&
      bullet.y + bullet.height >= player.y &&
      bullet.y <= player.y + player.height
    ) {
      player.health -= 1;
      bullet.x = -1;
      if (player.health <= 0 && !gameOverFlag) {
        gameOverFlag = true;
        gameOver();
      }
    }
  });

  if (
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y &&
    !gameOverFlag
  ) {
    gameOverFlag = true;
    gameOver();
  }
}

function update() {
  clear();
  drawPlayer();
  drawEnemy();
  player.bullets.forEach(drawBullet);
  enemy.bullets.forEach(drawBullet);
  newPos();
  if (!gameOverFlag) {
    requestAnimationFrame(update);
  }
}

function moveRight() {
  player.dx = player.speed;
}

function moveLeft() {
  player.dx = -player.speed;
}

function moveUp() {
  player.dy = -player.speed;
}

function moveDown() {
  player.dy = player.speed;
}

function shoot() {
  const bullet = {
    x: player.x + player.width,
    y: player.y + player.height / 2 - 5,
    width: 10,
    height: 5,
    color: "yellow",
    dx: 7,
  };
  player.bullets.push(bullet);
}

function enemyShoot() {
  const bullet = {
    x: enemy.x,
    y: enemy.y + enemy.height / 2 - 5,
    width: 10,
    height: 5,
    color: "red",
    dx: 5,
  };
  enemy.bullets.push(bullet);
}

function keyDown(e) {
  if (e.key === "ArrowRight") {
    moveRight();
  } else if (e.key === "ArrowLeft") {
    moveLeft();
  } else if (e.key === "ArrowUp") {
    moveUp();
  } else if (e.key === "ArrowDown") {
    moveDown();
  } else if (e.key === " ") {
    shoot();
  }
}

function keyUp(e) {
  if (
    e.key === "ArrowRight" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown"
  ) {
    player.dx = 0;
    player.dy = 0;
  }
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${player.score}`;
}

function updateTime() {
  timeElapsed++;
  timeDisplay.textContent = `Time: ${timeElapsed}`;
  if (timeElapsed % 10 === 0) {
    enemy.speed += 0.1; // Increase speed every 10 seconds
  }
}

function randomizeEnemyDirection() {
  enemy.dx = (Math.random() - 0.5) * enemy.speed;
  enemy.dy = (Math.random() - 0.5) * enemy.speed;
}

function startGame() {
  player.health = 3;
  player.score = 0;
  enemy.health = 3;
  timeElapsed = 0;
  player.bullets = [];
  enemy.bullets = [];
  player.x = 50;
  player.y = canvas.height - 100;
  enemy.x = canvas.width - 100;
  enemy.y = canvas.height - 100;
  enemy.speed = 2; // Reset enemy speed

  updateScore();
  timeDisplay.textContent = `Time: 0`;

  startButton.style.display = "none";
  canvas.style.display = "block";
  gameOverFlag = false;

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  gameInterval = setInterval(() => {
    enemyShoot();
    updateTime();
  }, 1000);

  enemyMoveInterval = setInterval(randomizeEnemyDirection, 500);

  update();
}

function gameOver() {
  clearInterval(gameInterval);
  clearInterval(enemyMoveInterval);
  alert(`Game Over! Your score: ${player.score}, Time: ${timeElapsed}`);
  startButton.style.display = "block";
  canvas.style.display = "none";
}

startButton.addEventListener("click", startGame);
