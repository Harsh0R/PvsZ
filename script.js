const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
canvas.width = 900;
canvas.height = 600;

// global variables
const cellsize = 100;
const cellaGap = 3;
const gameGrid = [];
const defenders = [];
let numberOfResources = 300;
const enemys = [];
let frame = 0;
const enemyPositions = [];
let enemiesIntervals = 600;
let gameOver = false;
const projectiles = []
let score = 0;

// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1
}
let canvasPossiti0on = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPossiti0on.left;
    mouse.y = e.y - canvasPossiti0on.top;
})
canvas.addEventListener('mouseleave', function (e) {
    mouse.x = undefined;
    mouse.y = undefined;
})



// game board
const controlBar = {
    width: canvas.width,
    height: cellsize,
}
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellsize;
        this.height = cellsize;
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid() {
    for (let y = cellsize; y < canvas.height; y += cellsize) {
        for (let x = 0; x < canvas.width; x += cellsize) {
            gameGrid.push(new Cell(x, y))
        }
    }
}
createGrid()
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}



// projectiles
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2)
        ctx.fill();
    }
}
function handleProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update()
        projectiles[i].draw();

        for (let j = 0; j < enemys.length; j++) {
            if (enemys[j] && projectiles[i] && collision(projectiles[i] , enemys[j])) {
                enemys[j].health -= projectiles[i].power;
                projectiles.splice(i,1);
                i--;
            }
            
        }


        if (projectiles[i] && projectiles[i].x > canvas.width - cellsize) {
            projectiles.splice(i, 1);
            i--;
        }
        console.log('projectiles ==> ', projectiles.length);
    }
}






// defenders
class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellsize;
        this.height = cellsize;
        this.shooting = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
    }
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '20px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 10, this.y + 30); // Adjust positioning within the cell

    }
    update() {
        if (this.shooting) {
            
            this.timer++;
            if (this.timer % 100 === 0) {
                projectiles.push(new Projectile(this.x + 70, this.y + 50))
            }
        }else{
            this.timer = 0;
        }
    }
}
canvas.addEventListener('click', function () {
    const gridPositionX = mouse.x - (mouse.x % cellsize);
    const gridPositionY = mouse.y - (mouse.y % cellsize);
    if (gridPositionY < cellsize) {
        return; // Avoid placing anything in the control bar area
    }

    for (let i = 0; i < defenders.length; i++) {

        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
            return
        }
    }

    let defenderCost = 100;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    }
});

function handleDefender() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw()
        defenders[i].update()        

        for (let j = 0; j < enemys.length; j++) {
            // if (!defenders[i] || !enemys[j]) {
            //     console.log("Defender or enemy is undefined:", defenders[i], enemys[j]);
            //     continue;
            // }

            if (defenders[i] && collision(defenders[i], enemys[j])) {
                enemys[j].movement = 0
                defenders[i].health -= 0.2;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1)
                i--;
                enemys[j].movement = enemys[j].speed
            }
        }
    }
}



// enemies
class Enemy {
    constructor(verticalPossition) {
        this.x = canvas.width;
        this.y = verticalPossition;
        this.width = cellsize;
        this.height = cellsize;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
    }
    update() {
        this.x -= this.movement;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '20px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 10, this.y + 30); 
    }
}

function handlEnemies() {
    for (let i = 0; i < enemys.length; i++) {

        enemys[i].update();
        enemys[i].draw();
        // console.log("game ==> " , gameOver);
        if (enemys[i].x < 0) {
            gameOver = true;
        }
        if (enemys[i].health <= 0) {
            let gainResources = enemys[i].maxHealth/10;
            numberOfResources += gainResources;
            score += gainResources;
            // const findThisIndex = enemyPositions.indexOf(enemys[i].y);
            // enemyPositions.splice(findThisIndex , 1);
            // enemys.splice(i ,1);
            // i--;
            // console.log("pos ==> " , enemyPositions);
        }

    }
    if (frame % enemiesIntervals === 0) {
        let verticalPossition = Math.floor(Math.random() * 5 + 1) * cellsize;
        enemys.push(new Enemy(verticalPossition))
        enemyPositions.push(verticalPossition);
        if (enemiesIntervals > 120) {
            enemiesIntervals -= 50;
        }
    }

}


// resources
// utilities
function handleGameStatus() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Jersey';
    ctx.fillText('Score : ' + score, 20, 40);
    ctx.fillText('Resources : ' + numberOfResources, 20, 80);
    // console.log("Game Over ==?>>>> " , gameOver);
    if (gameOver) {
        console.log("Game Over ==? ", gameOver);
        ctx.fillStyle = 'black';
        ctx.font = '60px Jersey';
        ctx.fillText('GAME OVER', 135, 330);
    }
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, controlBar.width, controlBar.height);
    handleGameGrid()
    handleDefender()
    handleProjectiles()
    handlEnemies()
    handleGameStatus()
    // ctx.fillText('Resources : ' + numberOfResources  ,20 ,55)
    frame++;
    if (!gameOver) {
        requestAnimationFrame(animate);
    }
}
animate();

function collision(first, second) {
    if (!(
        first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y
    )) {
        return true;
    } else {
        return false;
    }
}
