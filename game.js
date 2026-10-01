/* ========================================
   GESTURE BATTLE - GAME ENGINE
   ======================================== */

// ============================
// Audio Manager (Web Audio API)
// ============================
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    }

    play(type) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch (type) {
            case 'correct':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.08);
                osc.frequency.setValueAtTime(784, now + 0.16);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'perfect':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.06);
                osc.frequency.setValueAtTime(784, now + 0.12);
                osc.frequency.setValueAtTime(1047, now + 0.18);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;

            case 'wrong':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.setValueAtTime(150, now + 0.1);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;

            case 'countdown':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'fight':
                osc.type = 'square';
                osc.frequency.setValueAtTime(330, now);
                osc.frequency.setValueAtTime(440, now + 0.1);
                osc.frequency.setValueAtTime(660, now + 0.2);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;

            case 'win':
                osc.type = 'sine';
                [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                });
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                osc.start(now);
                osc.stop(now + 0.8);
                break;

            case 'lose':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.6);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
                osc.start(now);
                osc.stop(now + 0.7);
                break;

            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
                break;
        }
    }
}

// ============================
// Particle System
// ============================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init(count = 60) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(x, y) {
        const colors = [
            'rgba(0, 240, 255, ',
            'rgba(176, 38, 255, ',
            'rgba(255, 45, 149, ',
            'rgba(57, 255, 20, ',
        ];
        return {
            x: x ?? Math.random() * this.canvas.width,
            y: y ?? Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01,
        };
    }

    burst(x, y, count = 15, color) {
        const colors = color ? [color] : [
            'rgba(0, 240, 255, ',
            'rgba(57, 255, 20, ',
            'rgba(255, 230, 0, ',
        ];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = Math.random() * 3 + 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                pulse: 0,
                pulseSpeed: 0,
                life: 1,
                decay: Math.random() * 0.02 + 0.015,
                isBurst: true,
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += p.pulseSpeed;

            if (p.isBurst) {
                p.life -= p.decay;
                p.alpha = p.life;
                p.vx *= 0.96;
                p.vy *= 0.96;
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            } else {
                p.alpha = (Math.sin(p.pulse) * 0.3 + 0.3);
                // Wrap around
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.canvas.height;
                if (p.y > this.canvas.height) p.y = 0;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + p.alpha + ')';
            this.ctx.fill();

            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + (p.alpha * 0.15) + ')';
            this.ctx.fill();
        }
    }

    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}

// ============================
// Game Constants
// ============================
const GESTURES = [
    {
        name: 'PUNCH',
        icon: '👊',
        counter: 'block',
        counterName: '🛡️ BLOCK',
    },
    {
        name: 'KICK',
        icon: '🦶',
        counter: 'jump',
        counterName: '⬆️ JUMP',
    },
    {
        name: 'UPPER',
        icon: '🤜',
        counter: 'duck',
        counterName: '⬇️ DUCK',
    },
    {
        name: 'SPECIAL',
        icon: '⚡',
        counter: 'dodge',
        counterName: '💨 DODGE',
    },
];

const ROUND_CONFIG = {
    1: { gestures: 8, timeLimit: 2500, enemyHP: 100, label: 'Pemula' },
    2: { gestures: 10, timeLimit: 2200, enemyHP: 120, label: 'Menengah' },
    3: { gestures: 12, timeLimit: 1900, enemyHP: 150, label: 'Sulit' },
    4: { gestures: 14, timeLimit: 1600, enemyHP: 180, label: 'Expert' },
    5: { gestures: 16, timeLimit: 1300, enemyHP: 220, label: 'Master' },
    6: { gestures: 20, timeLimit: 1100, enemyHP: 260, label: 'LEGEND' },
};

const MAX_ROUNDS = 6;

const KEY_MAP = {
    'a': 'block', 'ArrowLeft': 'block',
    'w': 'jump', 'ArrowUp': 'jump',
    's': 'duck', 'ArrowDown': 'duck',
    'd': 'dodge', 'ArrowRight': 'dodge',
};

// ============================
// Game State
// ============================
let state = {
    screen: 'menu',
    round: 1,
    score: 0,
    combo: 0,
    maxCombo: 0,
    playerHP: 100,
    playerMaxHP: 100,
    enemyHP: 100,
    enemyMaxHP: 100,
    currentGesture: null,
    gestureIndex: 0,
    totalGestures: 0,
    correctCount: 0,
    wrongCount: 0,
    timerStart: 0,
    timeLimit: 2500,
    timerInterval: null,
    timerRAF: null,
    isWaiting: false,
    isAnimating: false,
    highScore: parseInt(localStorage.getItem('gb_highScore') || '0'),
    bestCombo: parseInt(localStorage.getItem('gb_bestCombo') || '0'),
};

// ============================
// DOM Elements
// ============================
const $ = (id) => document.getElementById(id);

const elements = {
    // Screens
    menuScreen: $('menuScreen'),
    howToScreen: $('howToScreen'),
    gameScreen: $('gameScreen'),
    roundTransition: $('roundTransition'),
    gameOverScreen: $('gameOverScreen'),

    // Menu
    btnStart: $('btnStart'),
    btnHowTo: $('btnHowTo'),
    btnBackMenu: $('btnBackMenu'),
    menuHighScore: $('menuHighScore'),
    menuBestCombo: $('menuBestCombo'),

    // Game HUD
    playerHealth: $('playerHealth'),
    playerHealthText: $('playerHealthText'),
    enemyHealth: $('enemyHealth'),
    enemyHealthText: $('enemyHealthText'),
    roundNumber: $('roundNumber'),
    scoreValue: $('scoreValue'),
    comboDisplay: $('comboDisplay'),
    comboValue: $('comboValue'),

    // Battle
    battleArena: $('battleArena'),
    playerFighter: $('playerFighter'),
    enemyFighter: $('enemyFighter'),
    battleZone: $('battleZone'),
    gesturePrompt: $('gesturePrompt'),
    gestureIcon: $('gestureIcon'),
    gestureName: $('gestureName'),
    timerProgress: $('timerProgress'),
    battleResult: $('battleResult'),
    resultIcon: $('resultIcon'),
    resultText: $('resultText'),
    countdownDisplay: $('countdownDisplay'),
    countdownNumber: $('countdownNumber'),

    // Response
    responseButtons: $('responseButtons'),
    btnBlock: $('btnBlock'),
    btnJump: $('btnJump'),
    btnDuck: $('btnDuck'),
    btnDodge: $('btnDodge'),

    // Transition
    transitionRound: $('transitionRound'),

    // Game Over
    gameoverTitle: $('gameoverTitle'),
    gameoverSubtitle: $('gameoverSubtitle'),
    goScore: $('goScore'),
    goCombo: $('goCombo'),
    goAccuracy: $('goAccuracy'),
    goRound: $('goRound'),
    btnRestart: $('btnRestart'),
    btnToMenu: $('btnToMenu'),
    gameoverContainer: document.querySelector('.gameover-container'),

    // Effects
    screenFlash: $('screenFlash'),
    particleCanvas: $('particleCanvas'),
};

// ============================
// Init Systems
// ============================
const audio = new AudioManager();
const particles = new ParticleSystem(elements.particleCanvas);
particles.init(50);
particles.animate();

// ============================
// Screen Management
// ============================
function showScreen(screenName) {
    const screens = ['menuScreen', 'howToScreen', 'gameScreen', 'roundTransition', 'gameOverScreen'];
    screens.forEach(s => {
        elements[s].classList.remove('active');
    });
    elements[screenName].classList.add('active');
    state.screen = screenName;
}

// ============================
// Menu
// ============================
function updateMenuStats() {
    elements.menuHighScore.textContent = state.highScore.toLocaleString();
    elements.menuBestCombo.textContent = state.bestCombo + 'x';
}

elements.btnStart.addEventListener('click', () => {
    audio.init();
    audio.play('click');
    startGame();
});

elements.btnHowTo.addEventListener('click', () => {
    audio.init();
    audio.play('click');
    showScreen('howToScreen');
});

elements.btnBackMenu.addEventListener('click', () => {
    audio.play('click');
    showScreen('menuScreen');
});

elements.btnRestart.addEventListener('click', () => {
    audio.play('click');
    startGame();
});

elements.btnToMenu.addEventListener('click', () => {
    audio.play('click');
    showScreen('menuScreen');
    updateMenuStats();
});

// ============================
// Game Flow
// ============================
function startGame() {
    state.round = 1;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.playerHP = 100;
    state.playerMaxHP = 100;
    state.correctCount = 0;
    state.wrongCount = 0;

    updateHUD();
    startRound();
}

function startRound() {
    const config = ROUND_CONFIG[Math.min(state.round, MAX_ROUNDS)];
    state.enemyHP = config.enemyHP;
    state.enemyMaxHP = config.enemyHP;
    state.timeLimit = config.timeLimit;
    state.totalGestures = config.gestures;
    state.gestureIndex = 0;
    state.isAnimating = false;

    updateHUD();

    // Show round transition
    elements.transitionRound.textContent = `ROUND ${state.round}`;
    showScreen('roundTransition');
    audio.play('fight');

    setTimeout(() => {
        showScreen('gameScreen');
        setFightersIdle();
        startCountdown();
    }, 1500);
}

function startCountdown() {
    let count = 3;
    elements.countdownDisplay.classList.add('visible');
    elements.gesturePrompt.classList.remove('visible');
    elements.battleResult.classList.remove('visible');
    disableButtons(true);

    const tick = () => {
        if (count > 0) {
            elements.countdownNumber.textContent = count;
            // Restart animation
            elements.countdownNumber.style.animation = 'none';
            void elements.countdownNumber.offsetWidth;
            elements.countdownNumber.style.animation = 'countdownPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            audio.play('countdown');
            count--;
            setTimeout(tick, 800);
        } else {
            elements.countdownNumber.textContent = 'FIGHT!';
            elements.countdownNumber.style.animation = 'none';
            void elements.countdownNumber.offsetWidth;
            elements.countdownNumber.style.animation = 'countdownPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            audio.play('fight');
            setTimeout(() => {
                elements.countdownDisplay.classList.remove('visible');
                nextGesture();
            }, 700);
        }
    };

    tick();
}

function nextGesture() {
    if (state.gestureIndex >= state.totalGestures) {
        // Round complete — enemy lost or next round
        if (state.enemyHP > 0) {
            // All gestures used but enemy alive? Take remaining damage
            endRound();
        } else {
            endRound();
        }
        return;
    }

    if (state.playerHP <= 0) {
        gameOver(false);
        return;
    }

    if (state.enemyHP <= 0) {
        endRound();
        return;
    }

    state.isWaiting = true;
    state.isAnimating = false;

    // Pick random gesture
    const gesture = GESTURES[Math.floor(Math.random() * GESTURES.length)];
    state.currentGesture = gesture;

    // Animate enemy attack
    clearFighterAnimations();
    elements.enemyFighter.classList.add('attack');
    setTimeout(() => {
        elements.enemyFighter.classList.remove('attack');
    }, 500);

    // Show gesture prompt
    elements.battleResult.classList.remove('visible', 'success', 'fail', 'perfect');
    elements.gesturePrompt.classList.add('visible');
    elements.gestureIcon.textContent = gesture.icon;
    elements.gestureName.textContent = gesture.name;

    // Re-trigger gesture icon animation
    elements.gestureIcon.style.animation = 'none';
    void elements.gestureIcon.offsetWidth;
    elements.gestureIcon.style.animation = 'gestureAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

    // Enable buttons
    disableButtons(false);
    clearButtonEffects();

    // Start timer
    startTimer();

    state.gestureIndex++;
}

// ============================
// Timer
// ============================
function startTimer() {
    state.timerStart = performance.now();
    const circumference = 2 * Math.PI * 54; // r=54

    if (state.timerRAF) cancelAnimationFrame(state.timerRAF);

    const updateTimer = () => {
        const elapsed = performance.now() - state.timerStart;
        const remaining = Math.max(0, state.timeLimit - elapsed);
        const fraction = remaining / state.timeLimit;

        elements.timerProgress.style.strokeDashoffset = circumference * (1 - fraction);

        // Color changes
        elements.timerProgress.classList.remove('warning', 'danger');
        if (fraction < 0.25) {
            elements.timerProgress.classList.add('danger');
        } else if (fraction < 0.5) {
            elements.timerProgress.classList.add('warning');
        }

        if (remaining <= 0) {
            // Time's up
            handleTimeout();
            return;
        }

        if (state.isWaiting) {
            state.timerRAF = requestAnimationFrame(updateTimer);
        }
    };

    state.timerRAF = requestAnimationFrame(updateTimer);
}

function stopTimer() {
    if (state.timerRAF) {
        cancelAnimationFrame(state.timerRAF);
        state.timerRAF = null;
    }
}

function handleTimeout() {
    if (!state.isWaiting) return;
    state.isWaiting = false;
    stopTimer();
    disableButtons(true);

    handleWrongAnswer();
}

// ============================
// Player Response
// ============================
function handleResponse(response) {
    if (!state.isWaiting || state.isAnimating) return;

    state.isWaiting = false;
    state.isAnimating = true;
    stopTimer();
    disableButtons(true);

    const elapsed = performance.now() - state.timerStart;
    const isCorrect = response === state.currentGesture.counter;

    if (isCorrect) {
        handleCorrectAnswer(elapsed);
    } else {
        handleWrongAnswer();
    }

    // Highlight button
    const btnMap = {
        block: elements.btnBlock,
        jump: elements.btnJump,
        duck: elements.btnDuck,
        dodge: elements.btnDodge,
    };
    const pressedBtn = btnMap[response];
    if (pressedBtn) {
        pressedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    // Also highlight correct button if wrong
    if (!isCorrect) {
        const correctBtn = btnMap[state.currentGesture.counter];
        if (correctBtn) correctBtn.classList.add('correct');
    }
}

function handleCorrectAnswer(elapsed) {
    state.combo++;
    state.correctCount++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;

    // Calculate score based on speed
    const speedBonus = Math.max(0, Math.floor((1 - elapsed / state.timeLimit) * 100));
    const comboMultiplier = Math.min(state.combo, 10);
    const isPerfect = elapsed < state.timeLimit * 0.3;
    const baseScore = isPerfect ? 150 : 100;
    const points = (baseScore + speedBonus) * comboMultiplier;

    state.score += points;

    // Damage enemy
    const damage = 10 + Math.floor(state.combo * 2);
    state.enemyHP = Math.max(0, state.enemyHP - damage);

    // Show result
    elements.gesturePrompt.classList.remove('visible');

    if (isPerfect) {
        showResult('⚡', 'PERFECT!', 'perfect');
        audio.play('perfect');
        flashScreen('success');
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 25, 'rgba(255, 230, 0, ');
    } else {
        showResult('✅', 'CORRECT!', 'success');
        audio.play('correct');
        flashScreen('success');
        particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15);
    }

    // Player attack animation
    clearFighterAnimations();
    elements.playerFighter.classList.add('attack');
    setTimeout(() => {
        elements.playerFighter.classList.remove('attack');
        elements.enemyFighter.classList.add('hit');
        setTimeout(() => elements.enemyFighter.classList.remove('hit'), 400);
    }, 200);

    updateHUD();
    scheduleNextGesture();
}

function handleWrongAnswer() {
    state.combo = 0;
    state.wrongCount++;

    // Player takes damage
    const damage = 15 + (state.round * 3);
    state.playerHP = Math.max(0, state.playerHP - damage);

    // Show result
    elements.gesturePrompt.classList.remove('visible');
    showResult('❌', 'MISS!', 'fail');
    audio.play('wrong');
    flashScreen('hit');
    shakeArena();

    // Player hit animation
    clearFighterAnimations();
    elements.playerFighter.classList.add('hit');
    setTimeout(() => elements.playerFighter.classList.remove('hit'), 400);

    updateHUD();
    scheduleNextGesture();
}

function scheduleNextGesture() {
    setTimeout(() => {
        elements.battleResult.classList.remove('visible');
        state.isAnimating = false;

        if (state.playerHP <= 0) {
            gameOver(false);
        } else if (state.enemyHP <= 0) {
            endRound();
        } else {
            nextGesture();
        }
    }, 800);
}

// ============================
// UI Helpers
// ============================
function showResult(icon, text, type) {
    elements.resultIcon.textContent = icon;
    elements.resultText.textContent = text;
    elements.battleResult.className = 'battle-result visible ' + type;
}

function flashScreen(type) {
    elements.screenFlash.className = 'screen-flash ' + type;
    setTimeout(() => {
        elements.screenFlash.className = 'screen-flash';
    }, 300);
}

function shakeArena() {
    elements.battleArena.classList.add('shake');
    setTimeout(() => elements.battleArena.classList.remove('shake'), 300);
}

function disableButtons(disabled) {
    [elements.btnBlock, elements.btnJump, elements.btnDuck, elements.btnDodge].forEach(btn => {
        btn.disabled = disabled;
    });
}

function clearButtonEffects() {
    [elements.btnBlock, elements.btnJump, elements.btnDuck, elements.btnDodge].forEach(btn => {
        btn.classList.remove('correct', 'wrong');
    });
}

function clearFighterAnimations() {
    ['attack', 'hit', 'dodge', 'idle'].forEach(cls => {
        elements.playerFighter.classList.remove(cls);
        elements.enemyFighter.classList.remove(cls);
    });
}

function setFightersIdle() {
    clearFighterAnimations();
    elements.playerFighter.classList.add('idle');
    elements.enemyFighter.classList.add('idle');
}

function updateHUD() {
    // Health bars
    const playerPercent = Math.max(0, (state.playerHP / state.playerMaxHP) * 100);
    const enemyPercent = Math.max(0, (state.enemyHP / state.enemyMaxHP) * 100);

    elements.playerHealth.querySelector('.health-fill').style.width = playerPercent + '%';
    elements.enemyHealth.querySelector('.health-fill').style.width = enemyPercent + '%';
    elements.playerHealthText.textContent = Math.ceil(state.playerHP);
    elements.enemyHealthText.textContent = Math.ceil(state.enemyHP);

    // Score
    elements.scoreValue.textContent = state.score.toLocaleString();
    elements.roundNumber.textContent = state.round;

    // Combo
    if (state.combo > 0) {
        elements.comboDisplay.classList.add('visible');
        elements.comboValue.textContent = state.combo + 'x';

        elements.comboDisplay.classList.remove('fire', 'legendary');
        if (state.combo >= 10) {
            elements.comboDisplay.classList.add('legendary');
        } else if (state.combo >= 5) {
            elements.comboDisplay.classList.add('fire');
        }
    } else {
        elements.comboDisplay.classList.remove('visible', 'fire', 'legendary');
    }
}

// ============================
// Round End
// ============================
function endRound() {
    stopTimer();
    disableButtons(true);
    elements.gesturePrompt.classList.remove('visible');
    elements.battleResult.classList.remove('visible');

    if (state.round >= MAX_ROUNDS) {
        // Won the game!
        gameOver(true);
    } else {
        // Next round
        state.round++;
        setTimeout(() => startRound(), 1000);
    }
}

// ============================
// Game Over
// ============================
function gameOver(won) {
    stopTimer();
    disableButtons(true);

    // Save records
    if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('gb_highScore', state.highScore.toString());
    }
    if (state.maxCombo > state.bestCombo) {
        state.bestCombo = state.maxCombo;
        localStorage.setItem('gb_bestCombo', state.bestCombo.toString());
    }

    // Set game over screen content
    if (won) {
        elements.gameoverTitle.textContent = '🏆 KEMENANGAN!';
        elements.gameoverSubtitle.textContent = 'Kamu mengalahkan semua musuh!';
        elements.gameoverContainer.className = 'gameover-container win';
        audio.play('win');
        // Victory particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                particles.burst(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight * 0.5,
                    20,
                    'rgba(255, 230, 0, '
                );
            }, i * 200);
        }
    } else {
        elements.gameoverTitle.textContent = '💀 KALAH!';
        elements.gameoverSubtitle.textContent = 'Kamu dikalahkan...';
        elements.gameoverContainer.className = 'gameover-container lose';
        audio.play('lose');
    }

    const totalAttempts = state.correctCount + state.wrongCount;
    const accuracy = totalAttempts > 0 ? Math.round((state.correctCount / totalAttempts) * 100) : 0;

    elements.goScore.textContent = state.score.toLocaleString();
    elements.goCombo.textContent = state.maxCombo + 'x';
    elements.goAccuracy.textContent = accuracy + '%';
    elements.goRound.textContent = state.round;

    setTimeout(() => {
        showScreen('gameOverScreen');
        updateMenuStats();
    }, 500);
}

// ============================
// Keyboard Input
// ============================
document.addEventListener('keydown', (e) => {
    const response = KEY_MAP[e.key];
    if (response && state.screen === 'gameScreen') {
        e.preventDefault();
        handleResponse(response);
    }

    // Space or Enter to start from menu
    if ((e.key === ' ' || e.key === 'Enter') && state.screen === 'menuScreen') {
        e.preventDefault();
        audio.init();
        audio.play('click');
        startGame();
    }
});

// ============================
// Touch / Click Input
// ============================
document.querySelectorAll('.response-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const response = btn.dataset.response;
        if (response) {
            handleResponse(response);
        }
    });
});

// ============================
// Initialize
// ============================
updateMenuStats();
showScreen('menuScreen');
