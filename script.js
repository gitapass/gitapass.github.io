const GRID_SIZE = 20; // 20x20 网格
const MINE_COUNT = 40; // 地雷数量
let grid = [];
let gameOver = false;

const gridElement = document.getElementById('grid');
const minesLeftElement = document.getElementById('minesLeft');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restartButton');

// 初始化游戏
function initGame() {
    grid = [];
    gameOver = false;
    gridElement.innerHTML = '';
    messageElement.textContent = '';
    messageElement.classList.remove('show'); // 隐藏消息
    minesLeftElement.textContent = MINE_COUNT;

    // 创建空网格
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = { mine: false, revealed: false, flagged: false, count: 0 };
        }
    }

    // 随机放置地雷
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        if (!grid[x][y].mine) {
            grid[x][y].mine = true;
            minesPlaced++;
        }
    }

    // 计算每个格子周围的地雷数
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (!grid[i][j].mine) {
                grid[i][j].count = countMinesAround(i, j);
            }
        }
    }

    // 渲染网格
    renderGrid();
}

// 计算周围地雷数
function countMinesAround(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newX = x + i;
            const newY = y + j;
            if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
                if (grid[newX][newY].mine) count++;
            }
        }
    }
    return count;
}

// 渲染网格
function renderGrid() {
    gridElement.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (grid[i][j].revealed) {
                cell.classList.add('revealed');
                if (grid[i][j].mine) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else if (grid[i][j].count > 0) {
                    cell.textContent = grid[i][j].count;
                }
            } else if (grid[i][j].flagged) {
                cell.classList.add('flag');
                cell.textContent = '🚩';
            }
            cell.addEventListener('click', () => revealCell(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(i, j);
            });
            gridElement.appendChild(cell);
        }
    }
}

// 显示浮动消息
function showMessage(text) {
    messageElement.textContent = text;
    messageElement.classList.add('show');
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 3000); // 3秒后自动隐藏
}

// 揭开格子
function revealCell(x, y) {
    if (gameOver || grid[x][y].revealed || grid[x][y].flagged) return;

    grid[x][y].revealed = true;
    if (grid[x][y].mine) {
        gameOver = true;
        revealAllMines();
        showMessage('游戏结束！你踩到地雷了！');
        return;
    }

    // 递归展开周围无地雷区域
    if (grid[x][y].count === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newX = x + i;
                const newY = y + j;
                if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
                    revealCell(newX, newY);
                }
            }
        }
    }

    renderGrid();
    checkWin();
}

// 标记地雷
function flagCell(x, y) {
    if (gameOver || grid[x][y].revealed) return;

    grid[x][y].flagged = !grid[x][y].flagged;
    let minesLeft = MINE_COUNT;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j].flagged) minesLeft--;
        }
    }
    minesLeftElement.textContent = minesLeft;
    renderGrid();
}

// 揭开所有地雷
function revealAllMines() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j].mine) grid[i][j].revealed = true;
        }
    }
    renderGrid();
}

// 检查是否胜利
function checkWin() {
    let unrevealedCount = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (!grid[i][j].revealed && !grid[i][j].mine) unrevealedCount++;
        }
    }
    if (unrevealedCount === 0) {
        gameOver = true;
        showMessage('恭喜你！成功扫雷！');
    }
}

// 重新开始
restartButton.addEventListener('click', initGame);

// 启动游戏
initGame();