import { create_element, append_element } from "./dom_functions.js";
import RegistrationForm from "./registration.js";
import TableOfRecords from "./table_of_records.js";

export default class Game {
    constructor(parentElement) {
        this.parent = parentElement;
        this.board = null;
        this.canvas = null;
        this.ctx = null;
        this.currentUser = RegistrationForm.getCurrentUser();
        this.previewContainer = null;
        this.previewBlocks = [];
        this.table_of_records = null;

        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPlaying = false;
        this.boardMatrix = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.nextPieceColor = null;
        this.currentX = 0;
        this.currentY = 0;
        
        this.SHAPES = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[0, 1, 1], [1, 1, 0]], // S
            [[1, 1, 0], [0, 1, 1]],  // Z
        ];
        
        this.COLORS = ['#00FFFF', '#FFFF00', '#800080', '#FFA500', '#0000FF', '#00FF00', '#FF0000'];
        
        this.init();
    }

    init() {
        if (!this.currentUser) {
            this.showLoginPrompt();
            return;
        }
        this.createGame();
        this.startGame();
    }

    createGame() {
        this.parent.innerHTML = '';
        
        this.gameContainer = append_element('div', this.parent);
        this.gameContainer.className = 'game-container';
        
        append_element('h2', this.gameContainer, `Игрок: ${this.currentUser.username}`);
        
        this.stats = append_element('div', this.gameContainer);
        this.stats.className = 'game-stats';

        this.createPreview(this.gameContainer);
        
        this.canvas = append_element('canvas', this.gameContainer);
        this.canvas.width = this.BOARD_WIDTH * this.BLOCK_SIZE;
        this.canvas.height = this.BOARD_HEIGHT * this.BLOCK_SIZE;
        this.canvas.style.border = '2px solid #333';
        this.ctx = this.canvas.getContext('2d');

        this.table_of_records = new TableOfRecords(this.gameContainer);
        
        const controls = append_element('div', this.gameContainer);
        controls.className = 'game-controls';
        
        const startBtn = append_element('button', controls, 'Старт');
        startBtn.addEventListener('click', () => this.startGame());
        
        const pauseBtn = append_element('button', controls, 'Пауза');
        pauseBtn.addEventListener('click', () => this.togglePause());
        
        const logoutBtn = append_element('button', controls, 'Выйти');
        logoutBtn.addEventListener('click', () => this.logout());
        
        document.addEventListener('keydown', (e) => this.handleInput(e));
    }

    createPreview(parent) {
        this.previewContainer = append_element('div', parent);
        this.previewContainer.className = "preview-container"
        this.previewBlocks = [];

        let previewRow;
        let previewBlock;
        for (let blockRow = 1; blockRow <= 4; blockRow++) {
            previewRow = append_element('div', this.previewContainer);
            this.previewBlocks.push([]);

            for (let blockCol = 1; blockCol <= 4; blockCol++) {
                previewBlock = append_element('div', previewRow);
                previewBlock.className = 'preview-block';
                this.previewBlocks[blockRow-1].push(previewBlock);
            }
        }
        
    }

    drawPreview() {
        let previewBlock;
        for (let blockRow of this.previewBlocks) {
            for (let previewBlock of blockRow) {
                previewBlock.style.backgroundColor = '#333';
            }
        }

        for (let blockRow = 0; blockRow < this.nextPiece.length; blockRow++) {
            for (let blockCol = 0; blockCol < this.nextPiece[blockRow].length; blockCol++) {
                previewBlock = this.previewBlocks[blockRow][blockCol];
                if (this.nextPiece[blockRow][blockCol])
                    previewBlock.style.backgroundColor = this.nextPieceColor;
                
            }
        }
    }

    startGame() {
        this.initBoard();
        this.isPlaying = true;
        this.score = 0;
        this.level = 1;
        this.lines = 0;

        this.table_of_records.delete();

        this.generateNextPiece();
        this.spawnPiece();

        this.generateNextPiece();
        
        this.updateStats();
        this.gameLoop();
    }

    initBoard() {
        this.boardMatrix = Array(this.BOARD_HEIGHT).fill().map(() => 
            Array(this.BOARD_WIDTH).fill(0)
        );
    }

    generateNextPiece() {
        const shapeIndex = Math.floor(Math.random() * this.SHAPES.length);
        this.nextPiece = this.SHAPES[shapeIndex];
        this.nextPieceColor = this.COLORS[shapeIndex];
        this.drawPreview();
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.pieceColor = this.nextPieceColor;
        
        this.currentX = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece[0].length / 2);
        this.currentY = 0;
        
        if (this.checkCollision(this.currentX, this.currentY, this.currentPiece)) {
            this.gameOver();
        }
    }

    gameLoop() {
        this.update();
        if (!this.isPlaying) return;
        this.render();
        
        const speed = Math.max(100, 1000 - (this.level - 1) * 100);
        setTimeout(() => this.gameLoop(), speed);
    }

    update() {
        if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
            this.currentY++;
        } else {
            this.lockPiece();
            this.clearLines();
            this.spawnPiece();
            this.generateNextPiece();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBoard();
        
        this.drawPiece(this.currentX, this.currentY, this.currentPiece, this.pieceColor);
    }

    drawBoard() {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.boardMatrix[y][x]) {
                    this.drawBlock(x, y, this.boardMatrix[y][x]);
                }
            }
        }
    }

    drawPiece(x, y, piece, color) {
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    this.drawBlock(x + col, y + row, color);
                }
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        this.ctx.strokeStyle = '#000';
        this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }

    checkCollision(x, y, piece) {
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT || 
                        (newY >= 0 && this.boardMatrix[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        for (let row = 0; row < this.currentPiece.length; row++) {
            for (let col = 0; col < this.currentPiece[row].length; col++) {
                if (this.currentPiece[row][col]) {
                    const y = this.currentY + row;
                    const x = this.currentX + col;
                    if (y >= 0) {
                        this.boardMatrix[y][x] = this.pieceColor;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.boardMatrix[y].every(cell => cell !== 0)) {
                this.boardMatrix.splice(y, 1);
                this.boardMatrix.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateStats();
        }
    }

    rotatePiece() {
        const rotated = this.currentPiece[0].map((_, index) =>
            this.currentPiece.map(row => row[index]).reverse()
        );
        
        if (!this.checkCollision(this.currentX, this.currentY, rotated)) {
            this.currentPiece = rotated;
        }
    }

    handleInput(event) {
        if (!this.isPlaying) return;
        
        switch(event.key) {
            case 'ArrowLeft':
                if (!this.checkCollision(this.currentX - 1, this.currentY, this.currentPiece)) {
                    this.currentX--;
                    this.render();
                }
                break;
            case 'ArrowRight':
                if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece)) {
                    this.currentX++;
                    this.render();
                }
                break;
            case 'ArrowDown':
                if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
                    this.currentY++;
                    this.render();
                }
                break;
            case 'ArrowUp':
                this.rotatePiece();
                this.render();
                break;
            case ' ':
                while (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
                    this.currentY++;
                }
                this.update();
                if (!this.isPlaying) break;
                this.render();
                break;
        }
    }

    updateStats() {
        this.currentUser = RegistrationForm.getCurrentUser();   
        this.stats.innerHTML = '';
        append_element('div', this.stats, `Счет: ${this.score}`);
        append_element('div', this.stats, `Линии: ${this.lines}`);
        append_element('div', this.stats, `Уровень: ${this.level}`);
        append_element('div', this.stats, `Рекорд: ${this.currentUser.bestScore}`);
    }

    togglePause() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.gameLoop();
        }
    }

    gameOver() {
        this.isPlaying = false;
        RegistrationForm.updateUserStats(this.score);
        this.updateStats();
        alert(`Игра окончена! Ваш счет: ${this.score}`);
        this.table_of_records.show();
    }

    logout() {
        RegistrationForm.logout();
        location.reload();
    }

    showLoginPrompt() {
        this.parent.innerHTML = '';
        const message = append_element('div', this.parent, 'Пожалуйста, войдите в систему');
        const reloadBtn = append_element('button', this.parent, 'Обновить');
        reloadBtn.addEventListener('click', () => location.reload());
    }
}

