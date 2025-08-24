class KukuSingSimulator {
    constructor() {
        this.grid = [];
        this.problems = [];
        this.currentProblemIndex = 0;
        this.isRunning = false;
        this.startTime = 0;
        this.completedProblems = 0;
        this.currentSingPosition = 0;
        this.isCurrentlySinging = false;
        
        this.initializeElements();
        this.attachEventListeners();
    }
    
    initializeElements() {
        this.generateBtn = document.getElementById('generateBtn');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gridElement = document.getElementById('grid');
        this.currentProblemElement = document.getElementById('currentProblem');
        this.progressElement = document.getElementById('progress');
        this.timerElement = document.getElementById('timer');
        this.singProgressElement = document.getElementById('singProgress');
        this.resultsElement = document.getElementById('results');
        this.totalTimeElement = document.getElementById('totalTime');
        this.averageTimeElement = document.getElementById('averageTime');
    }
    
    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateGrid());
        this.startBtn.addEventListener('click', () => this.startSimulation());
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    generateGrid() {
        this.grid = [];
        this.problems = [];
        
        // 縦軸と横軸の数字をランダムに並び替え（九九なので1~9）
        this.rowNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.colNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(this.rowNumbers);
        this.shuffleArray(this.colNumbers);
        
        // ヘッダー行を作成（ランダムな順序で）
        const headerRow = ['×'];
        for (let i = 0; i < 9; i++) {
            headerRow.push(this.colNumbers[i].toString());
        }
        this.grid.push(headerRow);
        
        // 各行を作成（ランダムな順序で）
        for (let gridRow = 1; gridRow <= 9; gridRow++) {
            const currentRow = [this.rowNumbers[gridRow - 1].toString()];
            for (let gridCol = 1; gridCol <= 9; gridCol++) {
                // 実際の九九の数値
                const actualRow = this.rowNumbers[gridRow - 1];
                const actualCol = this.colNumbers[gridCol - 1];
                
                const problem = {
                    row: actualRow,
                    col: actualCol,
                    answer: actualRow * actualCol,
                    position: this.getMultiplicationPosition(actualRow, actualCol),
                    gridRow: gridRow,
                    gridCol: gridCol,
                    problemOrder: (gridRow - 1) * 9 + (gridCol - 1) // 左上から右下への順序
                };
                this.problems.push(problem);
                currentRow.push('?');
            }
            this.grid.push(currentRow);
        }
        
        // 問題を左上から右下の順序でソート
        this.problems.sort((a, b) => a.problemOrder - b.problemOrder);
        
        this.renderGrid();
        this.startBtn.disabled = false;
        this.generateBtn.textContent = '新しい問題を生成';
        
        this.updateStatus();
    }
    
    getMultiplicationPosition(a, b) {
        // 九九の順番を計算 (1×1=1, 1×2=2, ..., 9×9=81)
        let position = 0;
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 9; j++) {
                position++;
                if (i === a && j === b) {
                    return position;
                }
            }
        }
        return position;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    renderGrid() {
        this.gridElement.innerHTML = '';
        
        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = this.grid[row][col];
                
                if (row === 0 || col === 0) {
                    cell.classList.add('header');
                } else {
                    cell.classList.add('problem');
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                }
                
                this.gridElement.appendChild(cell);
            }
        }
    }
    
    startSimulation() {
        if (this.problems.length === 0) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.currentProblemIndex = 0;
        this.completedProblems = 0;
        
        this.generateBtn.disabled = true;
        this.startBtn.disabled = true;
        
        this.startTimer();
        this.solveNextProblem();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.isRunning) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                this.timerElement.textContent = `経過時間: ${elapsed}秒`;
            }
        }, 1000);
    }
    
    async solveNextProblem() {
        if (this.currentProblemIndex >= this.problems.length) {
            this.completeSimulation();
            return;
        }
        
        const problem = this.problems[this.currentProblemIndex];
        
        // 現在の問題を強調表示
        this.highlightCurrentProblem(problem);
        this.updateCurrentProblemDisplay(problem);
        
        // 九九の歌を歌って答えを見つける
        await this.singToFindAnswer(problem);
        
        // 答えを表示
        this.fillAnswer(problem);
        
        this.completedProblems++;
        this.currentProblemIndex++;
        
        this.updateStatus();
        
        // 次の問題へ（少し間を空ける）
        setTimeout(() => {
            this.solveNextProblem();
        }, 500);
    }
    
    async singToFindAnswer(problem) {
        this.isCurrentlySinging = true;
        const targetPosition = problem.position;
        
        return new Promise((resolve) => {
            let currentPosition = 1;
            
            const singInterval = setInterval(() => {
                this.singProgressElement.textContent = 
                    `♪ ${Math.floor((currentPosition - 1) / 9) + 1} × ${((currentPosition - 1) % 9) + 1} ♪ (${currentPosition}/${targetPosition})`;
                
                // セルを歌っている状態にする
                this.addSingingEffect(problem);
                
                if (currentPosition >= targetPosition) {
                    clearInterval(singInterval);
                    this.singProgressElement.textContent = `答えが見つかりました！ ${problem.row} × ${problem.col} = ${problem.answer}`;
                    this.removeSingingEffect(problem);
                    this.isCurrentlySinging = false;
                    resolve();
                } else {
                    currentPosition++;
                }
            }, 6000 / Math.max(1, Math.log(targetPosition))); // 位置が後ろになるほど少し早く歌える（慣れ効果）
        });
    }
    
    highlightCurrentProblem(problem) {
        // 前の問題のハイライトを削除
        document.querySelectorAll('.cell.current').forEach(cell => {
            cell.classList.remove('current');
        });
        
        // 現在の問題をハイライト
        const cell = document.querySelector(`[data-row="${problem.gridRow}"][data-col="${problem.gridCol}"]`);
        if (cell) {
            cell.classList.add('current');
        }
    }
    
    addSingingEffect(problem) {
        const cell = document.querySelector(`[data-row="${problem.gridRow}"][data-col="${problem.gridCol}"]`);
        if (cell) {
            cell.classList.add('singing');
        }
    }
    
    removeSingingEffect(problem) {
        const cell = document.querySelector(`[data-row="${problem.gridRow}"][data-col="${problem.gridCol}"]`);
        if (cell) {
            cell.classList.remove('singing');
        }
    }
    
    fillAnswer(problem) {
        this.grid[problem.gridRow][problem.gridCol] = problem.answer.toString();
        
        const cell = document.querySelector(`[data-row="${problem.gridRow}"][data-col="${problem.gridCol}"]`);
        if (cell) {
            cell.textContent = problem.answer;
            cell.classList.remove('current');
            cell.classList.add('completed');
        }
    }
    
    updateCurrentProblemDisplay(problem) {
        this.currentProblemElement.textContent = `現在の問題: ${problem.row} × ${problem.col}`;
    }
    
    updateStatus() {
        this.progressElement.textContent = `進行状況: ${this.completedProblems}/81`;
    }
    
    completeSimulation() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        const averageTime = (totalTime / 81).toFixed(1);
        
        this.currentProblemElement.textContent = '完了！';
        this.singProgressElement.textContent = 'お疲れ様でした！';
        
        this.totalTimeElement.textContent = `総時間: ${totalTime}秒`;
        this.averageTimeElement.textContent = `1問あたりの平均時間: ${averageTime}秒`;
        
        this.resultsElement.classList.remove('hidden');
        
        this.generateBtn.disabled = false;
        this.startBtn.disabled = true;
    }
    
    reset() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        
        this.grid = [];
        this.problems = [];
        this.currentProblemIndex = 0;
        this.completedProblems = 0;
        this.currentSingPosition = 0;
        this.isCurrentlySinging = false;
        
        this.gridElement.innerHTML = '';
        this.currentProblemElement.textContent = '';
        this.progressElement.textContent = '進行状況: 0/81';
        this.timerElement.textContent = '経過時間: 0秒';
        this.singProgressElement.textContent = '';
        
        this.resultsElement.classList.add('hidden');
        
        this.generateBtn.disabled = false;
        this.startBtn.disabled = true;
        this.generateBtn.textContent = '百ます計算を生成';
    }
}

// アプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    new KukuSingSimulator();
});