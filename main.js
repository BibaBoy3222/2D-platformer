
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
let mapData = null;

const tilesetImage = new Image();
tilesetImage.src = 'tileset.png';

const playerImage = new Image();
playerImage.src = 'player.png';

// Игрок
const player = {
    x: 64,
    y: 0,
    width: TILE_SIZE,
    height: TILE_SIZE,
    dx: 0,
    dy: 0,
    onGround: false,
    speed: 3,
    jumpPower: -10
};

let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function isSolidTile(gid) {
    return gid === 1;
}

function getTile(x, y) {
    if (!mapData) return 0;
    if (x < 0 || y < 0 || x >= mapData.width || y >= mapData.height) return 0;
    const index = y * mapData.width + x;
    return mapData.layers[0].data[index];
}

function checkCollision(px, py) {
    const left = Math.floor(px / TILE_SIZE);
    const top = Math.floor(py / TILE_SIZE);
    const right = Math.floor((px + player.width - 1) / TILE_SIZE);
    const bottom = Math.floor((py + player.height - 1) / TILE_SIZE);
    for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
            if (isSolidTile(getTile(x, y))) return true;
        }
    }
    return false;
}

function updatePlayer() {
    player.dx = 0;
    if (keys['ArrowLeft'] || keys['a']) player.dx = -player.speed;
    if (keys['ArrowRight'] || keys['d']) player.dx = player.speed;

    player.dy += 0.5; // gravity

    if ((keys['ArrowUp'] || keys['w']) && player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
    }

    // Horizontal move
    player.x += player.dx;
    if (checkCollision(player.x, player.y)) {
        player.x -= player.dx;
    }

    // Vertical move
    player.y += player.dy;
    if (checkCollision(player.x, player.y)) {
        player.y -= player.dy;
        player.dy = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }
}

function drawMap() {
    if (!mapData) return;
    const tilesPerRow = 8;
    for (let y = 0; y < mapData.height; y++) {
        for (let x = 0; x < mapData.width; x++) {
            const tile = getTile(x, y);
            if (tile > 0) {
                const sx = ((tile - 1) % tilesPerRow) * TILE_SIZE;
                const sy = Math.floor((tile - 1) / tilesPerRow) * TILE_SIZE;
                ctx.drawImage(tilesetImage, sx, sy, TILE_SIZE, TILE_SIZE, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mapData) {
        updatePlayer();
        drawMap();
        drawPlayer();
    }
    requestAnimationFrame(gameLoop);
}

fetch('level1.json')
    .then(res => res.json())
    .then(json => {
        mapData = json;
        gameLoop();
    });
