// =========================================================
// AVENTURA EM PARNAÍBA - Em Busca do Tesouro
// Jogo de plataforma 2D - Canvas puro
// =========================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// HUD
const livesEl = document.getElementById('lives');
const crystalsEl = document.getElementById('crystals');
const phaseEl = document.getElementById('phase');
const phaseNameEl = document.getElementById('phase-name');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const overlayControls = document.getElementById('overlay-controls');
const startBtn = document.getElementById('start-btn');

// Constantes de física
const GRAVITY = 0.7;
const JUMP_POWER = -14;
const MOVE_SPEED = 4.5;
const FRICTION = 0.82;

// Estado do jogo
const state = {
    running: false,
    phase: 1,
    lives: 3,
    crystals: 0,
    totalCrystals: 0,
    keys: {},
    camera: { x: 0 },
    invulnerable: 0,
    gameOver: false,
    won: false
};

// Jogador
const player = {
    x: 80, y: 300, w: 28, h: 40,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    animFrame: 0,
    animTimer: 0
};

// Níveis das três fases
const phases = [
    {
        name: "Porto das Barcas",
        width: 3200,
        bg: { sky: "#ffb07a", horizon: "#ff7e5f", water: "#2d5a87" },
        groundY: 460,
        platforms: [
            { x: 0, y: 460, w: 3200, h: 80, type: "ground" },
            { x: 300, y: 380, w: 140, h: 20, type: "wood" },
            { x: 500, y: 320, w: 140, h: 20, type: "wood" },
            { x: 720, y: 380, w: 180, h: 20, type: "wood" },
            { x: 1000, y: 340, w: 120, h: 20, type: "wood" },
            { x: 1200, y: 400, w: 160, h: 20, type: "wood" },
            { x: 1450, y: 340, w: 140, h: 20, type: "wood" },
            { x: 1700, y: 380, w: 200, h: 20, type: "wood" },
            { x: 2000, y: 320, w: 140, h: 20, type: "wood" },
            { x: 2250, y: 380, w: 160, h: 20, type: "wood" },
            { x: 2500, y: 340, w: 140, h: 20, type: "wood" },
            { x: 2750, y: 400, w: 180, h: 20, type: "wood" }
        ],
        obstacles: [
            { x: 400, y: 420, w: 40, h: 40, type: "crate" },
            { x: 900, y: 420, w: 40, h: 40, type: "crate" },
            { x: 1600, y: 420, w: 40, h: 40, type: "crate" },
            { x: 2150, y: 420, w: 40, h: 40, type: "crate" },
            { x: 2650, y: 420, w: 40, h: 40, type: "crate" }
        ],
        crystals: [
            { x: 340, y: 340, collected: false },
            { x: 540, y: 280, collected: false },
            { x: 1040, y: 300, collected: false },
            { x: 1490, y: 300, collected: false },
            { x: 2040, y: 280, collected: false },
            { x: 2790, y: 360, collected: false }
        ],
        enemies: [
            { x: 600, y: 420, w: 36, h: 28, vx: 1.2, minX: 500, maxX: 780, alive: true },
            { x: 1300, y: 420, w: 36, h: 28, vx: 1.2, minX: 1200, maxX: 1500, alive: true },
            { x: 2300, y: 420, w: 36, h: 28, vx: 1.5, minX: 2200, maxX: 2550, alive: true }
        ],
        portal: { x: 3050, y: 380, w: 50, h: 80 },
        treasure: null,
        decorations: [
            { type: "boat", x: 200, y: 430 },
            { type: "boat", x: 1100, y: 430 },
            { type: "boat", x: 2400, y: 430 }
        ]
    },
    {
        name: "Delta do Parnaíba",
        width: 3600,
        bg: { sky: "#6ec1e4", horizon: "#a8e0d4", water: "#1e6091" },
        groundY: 460,
        platforms: [
            { x: 0, y: 460, w: 400, h: 80, type: "sand" },
            { x: 500, y: 420, w: 120, h: 20, type: "island" },
            { x: 700, y: 370, w: 100, h: 20, type: "island" },
            { x: 880, y: 320, w: 120, h: 20, type: "island" },
            { x: 1080, y: 380, w: 140, h: 20, type: "island" },
            { x: 1300, y: 460, w: 250, h: 80, type: "sand" },
            { x: 1620, y: 400, w: 120, h: 20, type: "island" },
            { x: 1820, y: 340, w: 120, h: 20, type: "island" },
            { x: 2020, y: 400, w: 140, h: 20, type: "island" },
            { x: 2240, y: 460, w: 300, h: 80, type: "sand" },
            { x: 2620, y: 390, w: 120, h: 20, type: "island" },
            { x: 2820, y: 330, w: 120, h: 20, type: "island" },
            { x: 3020, y: 400, w: 140, h: 20, type: "island" },
            { x: 3240, y: 460, w: 360, h: 80, type: "sand" }
        ],
        obstacles: [
            { x: 200, y: 420, w: 30, h: 40, type: "rock" },
            { x: 1400, y: 420, w: 30, h: 40, type: "rock" },
            { x: 2350, y: 420, w: 30, h: 40, type: "rock" },
            { x: 3350, y: 420, w: 30, h: 40, type: "rock" }
        ],
        crystals: [
            { x: 540, y: 380, collected: false },
            { x: 730, y: 330, collected: false },
            { x: 920, y: 280, collected: false },
            { x: 1660, y: 360, collected: false },
            { x: 1860, y: 300, collected: false },
            { x: 2660, y: 350, collected: false },
            { x: 2860, y: 290, collected: false },
            { x: 3400, y: 420, collected: false }
        ],
        enemies: [
            { x: 1350, y: 420, w: 36, h: 28, vx: 1.3, minX: 1300, maxX: 1520, alive: true },
            { x: 2300, y: 420, w: 36, h: 28, vx: 1.4, minX: 2240, maxX: 2500, alive: true },
            { x: 3300, y: 420, w: 36, h: 28, vx: 1.5, minX: 3240, maxX: 3550, alive: true }
        ],
        portal: { x: 3500, y: 380, w: 50, h: 80 },
        treasure: null,
        decorations: [
            { type: "mangrove", x: 100, y: 400 },
            { type: "mangrove", x: 1350, y: 400 },
            { type: "mangrove", x: 2300, y: 400 },
            { type: "mangrove", x: 3300, y: 400 }
        ]
    },
    {
        name: "Pedra do Sal",
        width: 3800,
        bg: { sky: "#ffd89b", horizon: "#f5a67a", water: "#3d7ea6" },
        groundY: 460,
        platforms: [
            { x: 0, y: 460, w: 450, h: 80, type: "salt" },
            { x: 550, y: 400, w: 120, h: 20, type: "rock" },
            { x: 750, y: 340, w: 140, h: 20, type: "rock" },
            { x: 970, y: 400, w: 120, h: 20, type: "rock" },
            { x: 1170, y: 460, w: 280, h: 80, type: "salt" },
            { x: 1530, y: 380, w: 140, h: 20, type: "rock" },
            { x: 1750, y: 320, w: 140, h: 20, type: "rock" },
            { x: 1970, y: 400, w: 140, h: 20, type: "rock" },
            { x: 2190, y: 460, w: 300, h: 80, type: "salt" },
            { x: 2570, y: 380, w: 140, h: 20, type: "rock" },
            { x: 2790, y: 320, w: 140, h: 20, type: "rock" },
            { x: 3010, y: 400, w: 140, h: 20, type: "rock" },
            { x: 3230, y: 460, w: 570, h: 80, type: "salt" }
        ],
        obstacles: [
            { x: 250, y: 410, w: 50, h: 50, type: "saltrock" },
            { x: 1250, y: 410, w: 50, h: 50, type: "saltrock" },
            { x: 2280, y: 410, w: 50, h: 50, type: "saltrock" },
            { x: 3400, y: 410, w: 50, h: 50, type: "saltrock" }
        ],
        crystals: [
            { x: 590, y: 360, collected: false },
            { x: 800, y: 300, collected: false },
            { x: 1570, y: 340, collected: false },
            { x: 1800, y: 280, collected: false },
            { x: 2610, y: 340, collected: false },
            { x: 2830, y: 280, collected: false },
            { x: 3600, y: 420, collected: false }
        ],
        enemies: [
            { x: 1200, y: 420, w: 36, h: 28, vx: 1.4, minX: 1170, maxX: 1420, alive: true },
            { x: 2250, y: 420, w: 36, h: 28, vx: 1.5, minX: 2190, maxX: 2460, alive: true },
            { x: 3300, y: 420, w: 36, h: 28, vx: 1.6, minX: 3230, maxX: 3750, alive: true }
        ],
        portal: null,
        treasure: { x: 3700, y: 380, w: 60, h: 80, found: false }
    }
];

// =========================================================
// INPUT
// =========================================================
window.addEventListener('keydown', (e) => {
    state.keys[e.key] = true;
    if (["ArrowLeft", "ArrowRight", " ", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => {
    state.keys[e.key] = false;
});

startBtn.addEventListener('click', () => {
    if (state.gameOver || state.won) {
        resetGame();
    }
    state.running = true;
    overlay.classList.add('hidden');
});

// =========================================================
// INICIALIZAÇÃO DE FASE
// =========================================================
function loadPhase(n) {
    const p = phases[n - 1];
    player.x = 80;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    state.camera.x = 0;
    state.invulnerable = 0;
    state.phase = n;
    // Reset cristais da fase atual
    p.crystals.forEach(c => c.collected = false);
    p.enemies.forEach(e => { e.alive = true; });
    if (p.treasure) p.treasure.found = false;
    updateHUD();
}

function resetGame() {
    state.lives = 3;
    state.crystals = 0;
    state.totalCrystals = 0;
    state.gameOver = false;
    state.won = false;
    state.phase = 1;
    loadPhase(1);
}

function updateHUD() {
    livesEl.textContent = state.lives;
    crystalsEl.textContent = state.totalCrystals;
    phaseEl.textContent = state.phase;
    phaseNameEl.textContent = phases[state.phase - 1].name;
}

// =========================================================
// COLISÃO AABB
// =========================================================
function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

// =========================================================
// UPDATE
// =========================================================
function update() {
    if (!state.running) return;

    // Movimento horizontal
    if (state.keys["ArrowRight"]) {
        player.vx = MOVE_SPEED;
        player.facing = 1;
    } else if (state.keys["ArrowLeft"]) {
        player.vx = -MOVE_SPEED;
        player.facing = -1;
    } else {
        player.vx *= FRICTION;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    // Pulo
    if ((state.keys[" "] || state.keys["Spacebar"]) && player.onGround) {
        player.vy = JUMP_POWER;
        player.onGround = false;
    }

    // Gravidade
    player.vy += GRAVITY;
    if (player.vy > 18) player.vy = 18;

    // Move X e resolve colisão
    player.x += player.vx;
    const phase = phases[state.phase - 1];
    const solids = [...phase.platforms, ...phase.obstacles];
    for (const s of solids) {
        if (aabb(player, s)) {
            if (player.vx > 0) player.x = s.x - player.w;
            else if (player.vx < 0) player.x = s.x + s.w;
            player.vx = 0;
        }
    }

    // Move Y e resolve colisão
    player.y += player.vy;
    player.onGround = false;
    for (const s of solids) {
        if (aabb(player, s)) {
            if (player.vy > 0) {
                player.y = s.y - player.h;
                player.vy = 0;
                player.onGround = true;
            } else if (player.vy < 0) {
                player.y = s.y + s.h;
                player.vy = 0;
            }
        }
    }

    // Limites do nível
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > phase.width) player.x = phase.width - player.w;

    // Queda no água -> perde vida
    if (player.y > H + 100) {
        hurtPlayer(true);
    }

    // Câmera
    const targetCam = player.x - W / 2 + player.w / 2;
    state.camera.x = Math.max(0, Math.min(phase.width - W, targetCam));

    // Animação do jogador
    if (Math.abs(player.vx) > 0.5 && player.onGround) {
        player.animTimer++;
        if (player.animTimer > 8) {
            player.animTimer = 0;
            player.animFrame = (player.animFrame + 1) % 4;
        }
    } else {
        player.animFrame = 0;
    }

    // Coleta de cristais
    for (const c of phase.crystals) {
        if (!c.collected && aabb(player, { x: c.x, y: c.y, w: 20, h: 20 })) {
            c.collected = true;
            state.crystals++;
            state.totalCrystals++;
            updateHUD();
        }
    }

    // Inimigos (caranguejos)
    for (const e of phase.enemies) {
        if (!e.alive) continue;
        e.x += e.vx;
        if (e.x < e.minX) { e.x = e.minX; e.vx *= -1; }
        if (e.x + e.w > e.maxX) { e.x = e.maxX - e.w; e.vx *= -1; }

        if (aabb(player, e)) {
            // Pulo em cima mata o caranguejo
            if (player.vy > 2 && player.y + player.h - e.y < 20) {
                e.alive = false;
                player.vy = JUMP_POWER * 0.7;
            } else {
                hurtPlayer(false);
            }
        }
    }

    // Obstáculos (dano ao tocar)
    for (const o of phase.obstacles) {
        if (aabb(player, o)) {
            hurtPlayer(false);
        }
    }

    // Portal (próxima fase)
    if (phase.portal && aabb(player, phase.portal)) {
        if (state.phase < 3) {
            loadPhase(state.phase + 1);
        }
    }

    // Tesouro (vitória)
    if (phase.treasure && !phase.treasure.found && aabb(player, phase.treasure)) {
        phase.treasure.found = true;
        state.won = true;
        state.running = false;
        showOverlay(
            "🏆 Tesouro Encontrado!",
            `Parabéns, explorador! Você encontrou o tesouro lendário de Parnaíba! Cristais coletados: ${state.totalCrystals}`,
            "Jogar Novamente"
        );
    }

    // Invulnerabilidade temporária
    if (state.invulnerable > 0) state.invulnerable--;
}

function hurtPlayer(fell) {
    if (state.invulnerable > 0) return;
    state.lives--;
    state.invulnerable = 90;
    updateHUD();
    if (state.lives <= 0) {
        state.gameOver = true;
        state.running = false;
        showOverlay(
            "💀 Fim de Jogo",
            "O explorador não resistiu aos perigos de Parnaíba... O tesouro continua escondido.",
            "Tentar Novamente"
        );
    } else if (fell) {
        // Respawn
        player.x = 80;
        player.y = 300;
        player.vx = 0;
        player.vy = 0;
    } else {
        // Empurra para trás
        player.vx = -player.facing * 6;
        player.vy = -8;
    }
}

function showOverlay(title, text, btnText) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlayControls.style.display = "none";
    startBtn.textContent = btnText;
    overlay.classList.remove('hidden');
}

// =========================================================
// RENDER
// =========================================================
function draw() {
    const phase = phases[state.phase - 1];
    const cam = state.camera.x;

    // Céu
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, phase.bg.sky);
    skyGrad.addColorStop(0.6, phase.bg.horizon);
    skyGrad.addColorStop(1, phase.bg.water);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Sol
    ctx.fillStyle = "rgba(255, 230, 150, 0.9)";
    ctx.beginPath();
    ctx.arc(W - 100, 90, 45, 0, Math.PI * 2);
    ctx.fill();

    // Nuvens (parallax)
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let i = 0; i < 5; i++) {
        const cx = ((i * 400 - cam * 0.3) % (W + 200)) - 100;
        const cy = 60 + (i % 2) * 30;
        drawCloud(cx, cy);
    }

    // Água de fundo (parallax)
    ctx.fillStyle = phase.bg.water;
    ctx.fillRect(0, 380, W, 80);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < 20; i++) {
        const wx = ((i * 120 - cam * 0.5) % (W + 120));
        ctx.fillRect(wx, 400 + (i % 3) * 10, 60, 2);
    }

    ctx.save();
    ctx.translate(-cam, 0);

    // Decorações de fundo
    for (const d of phase.decorations) {
        if (d.type === "boat") drawBoat(d.x, d.y);
        else if (d.type === "mangrove") drawMangrove(d.x, d.y);
    }

    // Plataformas
    for (const p of phase.platforms) {
        drawPlatform(p);
    }

    // Obstáculos
    for (const o of phase.obstacles) {
        drawObstacle(o);
    }

    // Cristais
    const t = Date.now() / 200;
    for (const c of phase.crystals) {
        if (!c.collected) drawCrystal(c.x, c.y, t);
    }

    // Inimigos (caranguejos)
    for (const e of phase.enemies) {
        if (e.alive) drawCrab(e);
    }

    // Portal
    if (phase.portal) drawPortal(phase.portal);

    // Tesouro
    if (phase.treasure) drawTreasure(phase.treasure);

    // Jogador
    drawPlayer();

    ctx.restore();
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 5, 22, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 20, y + 8, 18, 0, Math.PI * 2);
    ctx.fill();
}

function drawBoat(x, y) {
    // Casco
    ctx.fillStyle = "#6b3410";
    ctx.beginPath();
    ctx.moveTo(x - 40, y);
    ctx.lineTo(x + 40, y);
    ctx.lineTo(x + 30, y + 20);
    ctx.lineTo(x - 30, y + 20);
    ctx.closePath();
    ctx.fill();
    // Mastro
    ctx.fillStyle = "#3d2008";
    ctx.fillRect(x - 2, y - 50, 4, 50);
    // Vela
    ctx.fillStyle = "#f5e8c7";
    ctx.beginPath();
    ctx.moveTo(x, y - 48);
    ctx.lineTo(x + 25, y - 10);
    ctx.lineTo(x, y - 10);
    ctx.closePath();
    ctx.fill();
}

function drawMangrove(x, y) {
    // Raízes
    ctx.strokeStyle = "#5a3a1a";
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 8, y + 60);
        ctx.quadraticCurveTo(x + i * 12, y + 30, x + i * 6, y);
        ctx.stroke();
    }
    // Copa
    ctx.fillStyle = "#2d5a2d";
    ctx.beginPath();
    ctx.arc(x, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x - 15, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 15, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatform(p) {
    if (p.type === "ground" || p.type === "sand" || p.type === "salt") {
        let top, body;
        if (p.type === "sand") { top = "#f4d58d"; body = "#d4a857"; }
        else if (p.type === "salt") { top = "#ffffff"; body = "#e0e0e0"; }
        else { top = "#c9a66b"; body = "#8b6f3f"; }
        ctx.fillStyle = body;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = top;
        ctx.fillRect(p.x, p.y, p.w, 8);
        // Textura
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        for (let i = 0; i < p.w; i += 30) {
            ctx.fillRect(p.x + i, p.y + 12, 2, p.h - 12);
        }
    } else if (p.type === "wood") {
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#6b3f1a";
        ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);
        ctx.strokeStyle = "#5a3015";
        ctx.lineWidth = 1;
        for (let i = 0; i < p.w; i += 20) {
            ctx.beginPath();
            ctx.moveTo(p.x + i, p.y);
            ctx.lineTo(p.x + i, p.y + p.h);
            ctx.stroke();
        }
    } else if (p.type === "island") {
        ctx.fillStyle = "#d4a857";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#f4d58d";
        ctx.fillRect(p.x, p.y, p.w, 5);
        // Grama
        ctx.fillStyle = "#4a7c3a";
        for (let i = 0; i < p.w; i += 8) {
            ctx.fillRect(p.x + i, p.y - 3, 3, 3);
        }
    } else if (p.type === "rock") {
        ctx.fillStyle = "#7a7a7a";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#9a9a9a";
        ctx.fillRect(p.x, p.y, p.w, 4);
        ctx.fillStyle = "#5a5a5a";
        ctx.fillRect(p.x, p.y + p.h - 3, p.w, 3);
    }
}

function drawObstacle(o) {
    if (o.type === "crate") {
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeStyle = "#3d2008";
        ctx.lineWidth = 2;
        ctx.strokeRect(o.x, o.y, o.w, o.h);
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.moveTo(o.x + o.w, o.y);
        ctx.lineTo(o.x, o.y + o.h);
        ctx.stroke();
    } else if (o.type === "rock") {
        ctx.fillStyle = "#6a6a6a";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h);
        ctx.lineTo(o.x + 5, o.y + 10);
        ctx.lineTo(o.x + o.w / 2, o.y);
        ctx.lineTo(o.x + o.w - 5, o.y + 10);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#8a8a8a";
        ctx.beginPath();
        ctx.moveTo(o.x + 5, o.y + 10);
        ctx.lineTo(o.x + o.w / 2, o.y);
        ctx.lineTo(o.x + o.w - 5, o.y + 10);
        ctx.closePath();
        ctx.fill();
    } else if (o.type === "saltrock") {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h);
        ctx.lineTo(o.x + 8, o.y + 15);
        ctx.lineTo(o.x + o.w / 2, o.y);
        ctx.lineTo(o.x + o.w - 8, o.y + 15);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#c0c0c0";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawCrystal(x, y, t) {
    const bob = Math.sin(t + x) * 3;
    const cy = y + bob;
    ctx.save();
    ctx.translate(x + 10, cy + 10);
    ctx.rotate(Math.sin(t * 0.5) * 0.2);
    // Brilho
    ctx.fillStyle = "rgba(100, 200, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    // Cristal
    ctx.fillStyle = "#4fc3f7";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b3e5fc";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#0277bd";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function drawCrab(e) {
    const dir = e.vx > 0 ? 1 : -1;
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    const t = Date.now() / 100;
    const legMove = Math.sin(t) * 3;

    // Pernas
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy + 4);
        ctx.lineTo(cx - 18, cy + 10 + (i === 0 ? legMove : -legMove));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy + 4);
        ctx.lineTo(cx + 18, cy + 10 + (i === 0 ? -legMove : legMove));
        ctx.stroke();
    }

    // Corpo
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.ellipse(cx, cy, e.w / 2, e.h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c0392b";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, e.w / 2 - 2, e.h / 2 - 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pinças
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(cx - 18 * dir, cy - 4, 6, 0, Math.PI * 2);
    ctx.arc(cx + 18 * dir, cy - 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Olhos
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 8, 3, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(cx - 6 + dir, cy - 8, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 6 + dir, cy - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawPortal(p) {
    const t = Date.now() / 300;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    // Anel externo
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(150, 100, 255, ${0.8 - i * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2 + i * 4, p.h / 2 + i * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Centro brilhante
    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.5, "rgba(180,130,255,0.6)");
    grad.addColorStop(1, "rgba(100,50,200,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + Math.sin(t) * 3, 0, Math.PI * 2);
    ctx.fill();
    // Texto
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("→", 0, 5);
    ctx.restore();
}

function drawTreasure(tr) {
    const t = Date.now() / 400;
    const bob = Math.sin(t) * 2;
    // Brilho
    ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + Math.sin(t) * 0.15})`;
    ctx.beginPath();
    ctx.arc(tr.x + tr.w / 2, tr.y + tr.h / 2 + bob, 50, 0, Math.PI * 2);
    ctx.fill();
    // Baú
    ctx.fillStyle = "#6b3410";
    ctx.fillRect(tr.x, tr.y + 20 + bob, tr.w, tr.h - 20);
    // Tampa
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.moveTo(tr.x, tr.y + 20 + bob);
    ctx.quadraticCurveTo(tr.x + tr.w / 2, tr.y - 10 + bob, tr.x + tr.w, tr.y + 20 + bob);
    ctx.lineTo(tr.x + tr.w, tr.y + 30 + bob);
    ctx.lineTo(tr.x, tr.y + 30 + bob);
    ctx.closePath();
    ctx.fill();
    // Detalhes dourados
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(tr.x - 2, tr.y + 28 + bob, tr.w + 4, 4);
    ctx.fillRect(tr.x + tr.w / 2 - 5, tr.y + 35 + bob, 10, 10);
    // Fechadura
    ctx.fillStyle = "#000";
    ctx.fillRect(tr.x + tr.w / 2 - 2, tr.y + 38 + bob, 4, 4);
    // Estrelas brilhantes
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 4; i++) {
        const a = t + i * 1.5;
        const sx = tr.x + tr.w / 2 + Math.cos(a) * 40;
        const sy = tr.y + tr.h / 2 + Math.sin(a) * 30 + bob;
        ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
}

function drawPlayer() {
    // Piscar quando invulnerável
    if (state.invulnerable > 0 && Math.floor(state.invulnerable / 5) % 2 === 0) return;

    const x = player.x;
    const y = player.y;
    const f = player.facing;
    const walking = Math.abs(player.vx) > 0.5 && player.onGround;
    const frame = player.animFrame;

    ctx.save();
    ctx.translate(x + player.w / 2, y + player.h / 2);
    if (f < 0) ctx.scale(-1, 1);
    ctx.translate(-player.w / 2, -player.h / 2);

    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(player.w / 2, player.h + 2, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pernas
    const legOffset = walking ? Math.sin(frame * Math.PI / 2) * 4 : 0;
    ctx.fillStyle = "#3d2817";
    ctx.fillRect(6, 28, 6, 12 + legOffset);
    ctx.fillRect(16, 28, 6, 12 - legOffset);

    // Botas
    ctx.fillStyle = "#1a0f08";
    ctx.fillRect(5, 38 + legOffset, 8, 3);
    ctx.fillRect(15, 38 - legOffset, 8, 3);

    // Corpo (camisa caqui)
    ctx.fillStyle = "#c19a6b";
    ctx.fillRect(5, 16, 18, 14);
    // Cinto
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(5, 27, 18, 3);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(12, 27, 4, 3);

    // Braços
    const armOffset = walking ? Math.sin(frame * Math.PI / 2) * 3 : 0;
    ctx.fillStyle = "#c19a6b";
    ctx.fillRect(1, 18 + armOffset, 5, 10);
    ctx.fillRect(22, 18 - armOffset, 5, 10);
    // Mãos
    ctx.fillStyle = "#f4c8a0";
    ctx.fillRect(1, 26 + armOffset, 5, 3);
    ctx.fillRect(22, 26 - armOffset, 5, 3);

    // Cabeça
    ctx.fillStyle = "#f4c8a0";
    ctx.fillRect(7, 4, 14, 13);
    // Cabelo
    ctx.fillStyle = "#3d2817";
    ctx.fillRect(7, 4, 14, 4);
    // Olhos
    ctx.fillStyle = "#000";
    ctx.fillRect(11, 10, 2, 2);
    ctx.fillRect(17, 10, 2, 2);
    // Boca
    ctx.fillRect(13, 14, 4, 1);

    // Chapéu de explorador
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(4, 2, 20, 3);
    ctx.fillRect(8, -2, 12, 4);
    ctx.fillStyle = "#6b3f1a";
    ctx.fillRect(8, 1, 12, 1);

    ctx.restore();
}

// =========================================================
// LOOP PRINCIPAL
// =========================================================
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Inicialização
loadPhase(1);
loop();