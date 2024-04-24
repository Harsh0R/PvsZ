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
const resources = []
const winningScore = 50

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
            if (enemys[j] && projectiles[i] && collision(projectiles[i], enemys[j])) {
                enemys[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }

        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellsize) {
            projectiles.splice(i, 1);
            i--;
        }
        // console.log('projectiles ==> ', projectiles.length);
    }
}






// defenders
class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellsize - cellaGap * 2;
        this.height = cellsize - cellaGap * 2;
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
        ctx.fillText(Math.floor(this.health), this.x + 10, this.y + 30);

    }
    update() {
        if (this.shooting) {
            this.timer++;
            if (this.timer % 100 === 0) {
                projectiles.push(new Projectile(this.x + 70, this.y + 50))
            }
        } else {
            this.timer = 0;
        }
    }
}

function handleDefender() {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw()
        defenders[i].update()

        if (enemyPositions.indexOf(defenders[i].y) !== -1) {
            console.log("Shoot");
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }

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



// Floating Message
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.01) {
            this.opacity -= 0.01;
        }
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Arial';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessage() {
    for (let i = 0; i < floatingMessages.length; i++) {

        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }

    }
}


// enemies
class Enemy {
    constructor(verticalPossition) {
        this.x = canvas.width;
        this.y = verticalPossition;
        this.width = cellsize - cellaGap * 2;
        this.height = cellsize - cellaGap * 2;
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
            let gainResources = enemys[i].maxHealth / 10;
            floatingMessages.push(new floatingMessage( '+' + gainResources , enemys[i].x , enemys[i].y , 30 ,'black'))
            floatingMessages.push(new floatingMessage( '+' + gainResources , 150 , 40 , 20 ,'gold'))
            numberOfResources += gainResources;
            score += gainResources;
            const findThisIndex = enemyPositions.indexOf(enemys[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemys.splice(i, 1);
            i--;
            // console.log("pos ==> ", enemyPositions);
        }

    }
    if (frame % enemiesIntervals === 0 && score < winningScore) {
        let verticalPossition = Math.floor(Math.random() * 5 + 1) * cellsize + cellaGap;
        enemys.push(new Enemy(verticalPossition))
        enemyPositions.push(verticalPossition);
        if (enemiesIntervals > 120) {
            enemiesIntervals -= 50;
        }
    }

}


// resources
const amounts = [20, 30, 40];
class Resources {
    constructor() {
        this.x = Math.random() * (canvas.width - cellsize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellsize + 25;
        this.width = cellsize * 0.6;
        this.height = cellsize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(this.amount, this.x + 25, this.y + 25)
    }
}
function handleResources() {
    if (frame % 500 === 0) {
        resources.push(new Resources())
    }
    for (let i = 0; i < resources.length; i++) {

        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
            numberOfResources += resources[i].amount;
            floatingMessages.push(new floatingMessage( '+' + resources[i].amount , resources[i].x , resources[i].y , 30 ,'black'))
            floatingMessages.push(new floatingMessage( '+' + resources[i].amount , 250 , 50 , 20 ,'gold'))
            resources.splice(i, 1);
            i--;
        }
    }
}







// utilities
function handleGameStatus() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Score : ' + score, 20, 40);
    ctx.fillText('Resources : ' + numberOfResources, 20, 80);
    // console.log("Game Over ==?>>>> " , gameOver);
    if (gameOver) {
        console.log("Game Over ==? ", gameOver);
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemys.length === 0) {
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Arial';
        ctx.fillText('You Win with ' + score + ' Points! ', 134, 340)
    }
}




canvas.addEventListener('click', function () {
    const gridPositionX = mouse.x - (mouse.x % cellsize) + cellaGap;
    const gridPositionY = mouse.y - (mouse.y % cellsize) + cellaGap;
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
    } else {
        floatingMessages.push(new floatingMessage('Need more resources', mouse.x, mouse.y, 15, 'blue'))
    }
});








function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, controlBar.width, controlBar.height);
    handleGameGrid()
    handleDefender()
    handleResources()
    handleProjectiles()
    handlEnemies()
    handleGameStatus()
    handleFloatingMessage()
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


window.addEventListener('resize', function () {
    canvasPossiti0on = canvas.getBoundingClientRect();
})