// Game Configuration
const GAME_CONFIG = {
    timeLimit: 30,
    colors: [
        { name: 'RED', hex: '#e74c3c' },
        { name: 'BLUE', hex: '#3498db' },
        { name: 'GREEN', hex: '#2ecc71' },
        { name: 'YELLOW', hex: '#f1c40f' },
        { name: 'PURPLE', hex: '#9b59b6' },
        { name: 'ORANGE', hex: '#e67e22' },
        { name: 'PINK', hex: '#e91e63' },
        { name: 'CYAN', hex: '#00bcd4' },
        { name: 'BROWN', hex: '#795548' },
        { name: 'GRAY', hex: '#95a5a6' }
    ]
};

// Game State
let gameState = {
    score: 0,
    timeLeft: GAME_CONFIG.timeLimit,
    currentRound: 0,
    isPlaying: false,
    isPaused: false,
    timer: null,
    highScore: localStorage.getItem('colorMatchHighScore') || 0
};

// DOM Elements
const elements = {
    instructions: document.getElementById('instructions'),
    gameArea: document.getElementById('gameArea'),
    startBtn: document.getElementById('startBtn'),
    colorWord: document.getElementById('colorWord'),
    colorGrid: document.getElementById('colorGrid'),
    score: document.getElementById('score'),
    time: document.getElementById('time'),
    highScore: document.getElementById('highScore'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    gameOverModal: document.getElementById('gameOverModal'),
    pauseModal: document.getElementById('pauseModal'),
    finalScore: document.getElementById('finalScore'),
    finalHighScore: document.getElementById('finalHighScore'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    menuBtn: document.getElementById('menuBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    quitBtn: document.getElementById('quitBtn')
};

// Initialize the game
function initGame() {
    updateHighScore();
    setupEventListeners();
    createColorBoxes();
}

// Setup event listeners
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.playAgainBtn.addEventListener('click', startGame);
    elements.menuBtn.addEventListener('click', showMenu);
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.quitBtn.addEventListener('click', quitGame);
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
}

// Start the game
function startGame() {
    gameState.score = 0;
    gameState.timeLeft = GAME_CONFIG.timeLimit;
    gameState.currentRound = 0;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    
    updateScore();
    updateTime();
    hideModal('gameOverModal');
    hideModal('pauseModal');
    
    elements.instructions.style.display = 'none';
    elements.gameArea.style.display = 'block';
    
    startTimer();
    generateNewRound();
    
    // Add entrance animation
    elements.gameArea.style.animation = 'slideInUp 0.5s ease';
}

// Generate a new round
function generateNewRound() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    gameState.currentRound++;
    
    // Select random colors for this round
    const shuffledColors = shuffleArray([...GAME_CONFIG.colors]);
    const correctColor = shuffledColors[0];
    const wrongColor = shuffledColors[1];
    
    // Randomly decide if the word should match the color or not
    const shouldMatch = Math.random() > 0.5;
    
    if (shouldMatch) {
        // Word matches the color
        elements.colorWord.textContent = correctColor.name;
        elements.colorWord.style.color = correctColor.hex;
        createColorBoxes([correctColor, wrongColor], correctColor);
    } else {
        // Word doesn't match the color
        elements.colorWord.textContent = correctColor.name;
        elements.colorWord.style.color = wrongColor.hex;
        createColorBoxes([wrongColor, correctColor], correctColor);
    }
    
    // Add animation to color word
    elements.colorWord.style.animation = 'fadeIn 0.3s ease';
    setTimeout(() => {
        elements.colorWord.style.animation = '';
    }, 300);
}

// Create color boxes
function createColorBoxes(colors, correctColor) {
    elements.colorGrid.innerHTML = '';
    
    // Shuffle the colors for random positioning
    const shuffledColors = shuffleArray(colors);
    
    shuffledColors.forEach((color, index) => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color.hex;
        colorBox.dataset.color = color.name;
        colorBox.dataset.isCorrect = (color.name === correctColor.name).toString();
        
        colorBox.addEventListener('click', () => handleColorClick(colorBox));
        
        elements.colorGrid.appendChild(colorBox);
        
        // Add entrance animation with delay
        colorBox.style.animation = 'slideInUp 0.3s ease';
        colorBox.style.animationDelay = `${index * 0.1}s`;
    });
}

// Handle color box click
function handleColorClick(colorBox) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const isCorrect = colorBox.dataset.isCorrect === 'true';
    
    if (isCorrect) {
        // Correct answer
        colorBox.classList.add('correct');
        gameState.score += 10;
        updateScore();
        
        // Add bonus for quick answers
        if (gameState.timeLeft > 20) {
            gameState.score += 5;
            updateScore();
        }
        
        // Show success feedback
        showFeedback('Correct! +10', 'success');
        
        setTimeout(() => {
            colorBox.classList.remove('correct');
            generateNewRound();
        }, 500);
    } else {
        // Wrong answer
        colorBox.classList.add('incorrect');
        gameState.score = Math.max(0, gameState.score - 5);
        updateScore();
        
        // Show error feedback
        showFeedback('Wrong! -5', 'error');
        
        setTimeout(() => {
            colorBox.classList.remove('incorrect');
        }, 500);
    }
}

// Show feedback message
function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 15px 30px;
        border-radius: 25px;
        font-weight: 600;
        font-size: 1.2rem;
        z-index: 1001;
        animation: slideInUp 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1000);
}

// Start the timer
function startTimer() {
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            updateTime();
            
            if (gameState.timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
}

// Pause the game
function pauseGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = true;
    elements.pauseModal.style.display = 'flex';
}

// Resume the game
function resumeGame() {
    gameState.isPaused = false;
    hideModal('pauseModal');
}

// Restart the game
function restartGame() {
    endGame();
    setTimeout(() => {
        startGame();
    }, 100);
}

// Quit the game
function quitGame() {
    endGame();
    showMenu();
}

// End the game
function endGame() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('colorMatchHighScore', gameState.highScore);
        updateHighScore();
    }
    
    // Show game over modal
    elements.finalScore.textContent = gameState.score;
    elements.finalHighScore.textContent = gameState.highScore;
    elements.gameOverModal.style.display = 'flex';
}

// Show main menu
function showMenu() {
    elements.gameArea.style.display = 'none';
    elements.instructions.style.display = 'block';
    hideModal('gameOverModal');
    hideModal('pauseModal');
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update score display
function updateScore() {
    elements.score.textContent = gameState.score;
}

// Update time display
function updateTime() {
    elements.time.textContent = gameState.timeLeft;
    
    // Add visual feedback for low time
    if (gameState.timeLeft <= 10) {
        elements.time.style.color = '#e74c3c';
        elements.time.style.animation = 'pulse 1s infinite';
    } else {
        elements.time.style.color = '';
        elements.time.style.animation = '';
    }
}

// Update high score display
function updateHighScore() {
    elements.highScore.textContent = gameState.highScore;
}

// Utility function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Add pulse animation for low time
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying) return;
    
    switch(e.key) {
        case ' ':
        case 'Escape':
            e.preventDefault();
            if (gameState.isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }
            break;
        case 'r':
        case 'R':
            if (gameState.isPaused) {
                restartGame();
            }
            break;
    }
});

// Add touch/swipe support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!gameState.isPlaying) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Swipe up to pause
    if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
        if (gameState.isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
});

// Add sound effects (optional)
function playSound(type) {
    // You can add sound effects here
    // For now, we'll just create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = type === 'correct' ? 800 : 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Enhanced color click handler with sound
const originalHandleColorClick = handleColorClick;
handleColorClick = function(colorBox) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const isCorrect = colorBox.dataset.isCorrect === 'true';
    
    // Play sound effect
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    // Call original handler
    originalHandleColorClick.call(this, colorBox);
};