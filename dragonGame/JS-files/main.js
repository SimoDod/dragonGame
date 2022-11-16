const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameOver = document.querySelector('.game-over');
const gameScore = document.querySelector('.game-score');
const goHome = document.querySelector('.go-home')
const gamePoints = document.querySelector('.points');

gameStart.addEventListener('click', onGameStart);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);


let keys = {};
let player = {
    x: 150,
    y: 100,
    width: 0,
    height: 0,
    lastTimeFiredFireball: 0,
};
let game = {
    speed : 2,
    movingMultiplier: 4,
    fireBallMultiplier: 5,
    fireInterval: 800,
    cloudSpawnInterval: 2800,
    bugSpawnInterval: 900,
    bugKillBonus: 2000
};
let scene = {
    score: 0,
    lastCloudSpawn: 0,
    lastBugSpawn: 0,
    isActiveGame: true
}

function onKeyDown(e) {
    keys[e.code] = true;
}

function onKeyUp(e) {
    keys[e.code] = false; 
}

function onGameStart(e) {
    gameStart.classList.add('hide');
    goHome.classList.add('hide')

    //render dragon
    let dragon = document.createElement('div');
    dragon.classList.add('dragon');
    dragon.style.top = player.y + 'px';
    dragon.style.left = player.x +'px';
    gameArea.appendChild(dragon);

    player.width = dragon.offsetWidth;
    player.height = dragon.offsetHeight;

    //game infinite loop
    window.requestAnimationFrame(gameAction)
}


    //game engine
function gameAction(timestamp) {
    const dragon = document.querySelector('.dragon')
    
    //modify firebalsl positions
    const fireBalls = document.querySelectorAll('.fire-ball');
    fireBalls.forEach(fireBall => {
        fireBall.x += game.speed * game.fireBallMultiplier;
        fireBall.style.left = fireBall.x + 'px';

        if(fireBall.x + fireBall.offsetWidth > gameArea.offsetWidth) {
            fireBall.parentElement.removeChild(fireBall);
        }
    })

    //modify bug position
    let bugs = document.querySelectorAll('.bug');
    bugs.forEach(bug => {
        
        //collision detection
        if(isCollision(dragon, bug)) {
            gameOverAction();
        }
        
        fireBalls.forEach(fireBall=> {
            if(isCollision(fireBall, bug)) {
                scene.score += game.bugKillBonus;
                bug.parentElement.removeChild(bug);
                fireBall.parentElement.removeChild(fireBall);
            }
        })

        bug.x -= game.speed * 3;
        bug.style.left = bug.x + 'px';
        if(bug.x + bugs.offsetWidth <= 0) {
            bug.parentElement.removeChild(bug)
        }
    })

    //modify cloud position
    const clouds = document.querySelectorAll('.cloud');
    clouds.forEach(cloud => {
        cloud.x -= game.speed;
        cloud.style.left = cloud.x + 'px';

        if(cloud.x + clouds.offsetWidth <= 0) {
            cloud.parentElement.removeChild(cloud);
        }
    })

    //register user input
    if(keys.ArrowUp && player.y > 0) {
        player.y -= game.speed * game.movingMultiplier;
    }

    if(keys.ArrowDown && player.y + player.height < gameArea.offsetHeight){
        player.y += game.speed * game.movingMultiplier;
    }

    if(keys.ArrowLeft && player.x > 0) {
        player.x -= game.speed * game.movingMultiplier;
    }
    
    if(keys.ArrowRight && player.x + player.width < gameArea.offsetWidth) {
        player.x += game.speed * game.movingMultiplier;
    }

    if(keys.Space && timestamp - player.lastTimeFiredFireball > game.fireInterval) {
        dragon.classList.add('dragon-fire');
        addFireBall(player);
        player.lastTimeFiredFireball = timestamp;
        
    } else {
        dragon.classList.remove('dragon-fire');
    }

    let isInAir = (player.y + player.height) <= gameArea.offsetHeight;

    if(isInAir) {
        player.y += game.speed;
    }
    
    //apply movement
    dragon.style.top = player.y + 'px';
    dragon.style.left = player.x + 'px';

    //increment score count
    scene.score++;
    gamePoints.textContent = scene.score;

    //Add clouds
    if(timestamp - scene.lastCloudSpawn > game.cloudSpawnInterval + 20000 * Math.random()) {
        let cloud = document.createElement('div');
        cloud.classList.add('cloud');
        cloud.x = gameArea.offsetWidth - 200;
        cloud.style.left = cloud.x + 'px';
        cloud.style.top = (gameArea.offsetHeight - 200) * Math.random() + 'px';

        gameArea.appendChild(cloud)
        scene.lastCloudSpawn = timestamp;
    }

    //Add bugs
    if(timestamp - scene.lastBugSpawn > game.bugSpawnInterval + 5000 * Math.random()) {
        let bug = document.createElement('div');
        bug.classList.add('bug');
        bug.x = gameArea.offsetWidth - 60;
        bug.style.left = bug.x + 'px';
        bug.style.top = (gameArea.offsetHeight - 60) * Math.random() + 'px';
        gameArea.appendChild(bug);
        scene.lastBugSpawn = timestamp;
    }
   
    if(scene.isActiveGame) {
        window.requestAnimationFrame(gameAction)
    }
}

function addFireBall() {
    let fireBall = document.createElement('div');
    
    fireBall.classList.add('fire-ball');
    fireBall.style.top = (player.y + player.height / 4.5 - 5) + 'px';
    fireBall.x = player.x + player.width;
    fireBall.style.left = fireBall.x + 'px';
    gameArea.appendChild(fireBall)

}

function isCollision(firstElement, secondElement) {
    let firstRect = firstElement.getBoundingClientRect();
    let secondRect = secondElement.getBoundingClientRect();
    
    return !(firstRect.top > secondRect.bottom ||
        firstRect.bottom < secondRect.top ||
        firstRect.right < secondRect.left ||
        firstRect.left > secondRect.right)
}

function gameOverAction() {
    scene.isActiveGame = false;
    gameOver.classList.remove('hide');
}

