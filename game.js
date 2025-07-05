class ParticleSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.particles = [];
    this.maxParticles = 200;
  }

  createParticle(x, y, options = {}) {
    if (this.particles.length >= this.maxParticles) return;

    const particle = document.createElement("div");
    particle.className = "particle";

    const {
      color = "#ffffff",
      size = Math.random() * 5 + 3,
      velocityX = (Math.random() - 0.5) * 8,
      velocityY = (Math.random() - 0.5) * 8,
      lifetime = 1000 + Math.random() * 600,
      gravity = 0.1,
      fade = true,
      shape = "circle",
    } = options;

    Object.assign(particle.style, {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      left: `${x}px`,
      top: `${y}px`,
      position: "absolute",
      pointerEvents: "none",
      borderRadius: shape === "circle" ? "50%" : "0",
      transform: shape === "star" ? "rotate(45deg)" : "none",
    });

    if (shape === "star") {
      particle.innerHTML = "★";
      particle.style.fontSize = `${size}px`;
      particle.style.lineHeight = `${size}px`;
      particle.style.textAlign = "center";
      particle.style.backgroundColor = "transparent";
    }

    this.container.appendChild(particle);

    const particleData = {
      element: particle,
      x,
      y,
      velocityX,
      velocityY,
      gravity,
      lifetime,
      createdAt: Date.now(),
      fade,
    };

    this.particles.push(particleData);
    return particleData;
  }

  createExplosion(x, y, count = 50, color = "#ff4d4d", shape = "circle") {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 4;

      this.createParticle(x, y, {
        color,
        size: Math.random() * 10 + 5,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        gravity: 0.2,
        lifetime: 1000 + Math.random() * 500,
        fade: true,
        shape,
      });
    }
  }

  createTrail(x, y, color = "#4da6ff") {
    this.createParticle(x, y, {
      color,
      size: Math.random() * 4 + 2,
      velocityX: -2 - Math.random() * 2,
      velocityY: (Math.random() - 0.5) * 1.5,
      gravity: -0.02,
      lifetime: 500 + Math.random() * 300,
      fade: true,
    });
  }

  createSparkle(x, y, color = "#ffcc00") {
    this.createParticle(x, y, {
      color,
      size: Math.random() * 6 + 4,
      velocityX: (Math.random() - 0.5) * 3,
      velocityY: (Math.random() - 0.5) * 3,
      gravity: 0,
      lifetime: 600 + Math.random() * 400,
      fade: true,
      shape: "star",
    });
  }

  update() {
    const now = Date.now();
    const particlesToRemove = [];

    this.particles.forEach((particle, index) => {
      particle.velocityY += particle.gravity;
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;

      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;

      if (particle.fade) {
        const elapsed = now - particle.createdAt;
        const progress = Math.min(1, elapsed / particle.lifetime);
        if (progress > 0.5) {
          particle.element.style.opacity = 1 - (progress - 0.5) * 2;
        }
      }

      if (now - particle.createdAt > particle.lifetime) {
        particlesToRemove.push(index);
      }
    });

    for (let i = particlesToRemove.length - 1; i >= 0; i--) {
      const index = particlesToRemove[i];
      this.particles[index].element.remove();
      this.particles.splice(index, 1);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Game branding
  const GAME_NAME = "SKY FURY";
  const COMPANY_NAME = "Infowise Enterprises Limited";
  const DEVELOPER = "Mupo Mubita";
  const DEVELOPER_EMAIL = "mubitamupo@outlook.com";

  // Game elements
  const startScreen = document.getElementById("start-screen");
  const instructionsScreen = document.getElementById("instructions-screen");
  const gameScreen = document.getElementById("game-screen");
  const gameOverScreen = document.getElementById("game-over");
  const winScreen = document.getElementById("win-screen");
  const startBtn = document.getElementById("start-btn");
  const instructionsBtn = document.getElementById("instructions-btn");
  const backBtn = document.getElementById("back-btn");
  const restartBtn = document.getElementById("restart-btn");
  const menuBtn = document.getElementById("menu-btn");
  const nextLevelBtn = document.getElementById("next-level-btn");
  const difficultySelect = document.getElementById("difficulty");
  const speedControl = document.getElementById("speed-control");

  // Containers
  const obstaclesContainer = document.getElementById("obstacles-container");
  const powerupsContainer = document.getElementById("powerups-container");
  const enemiesContainer = document.getElementById("enemies-container");
  const particlesContainer = document.getElementById("particles-container");
  const explosionContainer = document.getElementById("explosion-container");
  const killersContainer = document.getElementById("killers-container");

  // HUD elements
  const scoreDisplay = document.getElementById("score-display");
  const healthDisplay = document.getElementById("health-display");
  const speedDisplay = document.getElementById("speed-display");
  const levelDisplay = document.getElementById("level-display");
  const progressDisplay = document.getElementById("progress-display");
  const finalScoreDisplay = document.getElementById("final-score");
  const finalLevelDisplay = document.getElementById("final-level");
  const highScoreDisplay = document.getElementById("high-score");
  const winScoreDisplay = document.getElementById("win-score");

  // Game variables
  let score = 0;
  let highScore = localStorage.getItem("skyFuryHighScore") || 0;
  let health = 3;
  let baseSpeed = 4;
  let currentSpeed = 4;
  let level = 1;
  let gravity = 0.3;
  let isGameOver = false;
  let isPaused = false;
  let difficulty = "medium";
  let gameActive = false;
  const WIN_SCORE = 800;

  // Game objects
  let plane = null;
  let obstacles = [];
  let powerups = [];
  let enemies = [];
  let clouds = [];
  let killers = [];

  // Animation IDs
  let gameAnimationId = null;
  let obstacleTimer = null;
  let powerupTimer = null;
  let enemyTimer = null;
  let cloudTimer = null;
  let killerTimer = null;

  // Audio elements
  const engineSound = document.getElementById("engine-sound");
  const explosionSound = document.getElementById("explosion-sound");
  const powerupSound = document.getElementById("powerup-sound");
  const levelupSound = document.getElementById("levelup-sound");
  const winSound = document.getElementById("win-sound");

  // Particle systems
  const trailParticles = new ParticleSystem("particles-container");
  const explosionParticles = new ParticleSystem("explosion-container");

  // Event listeners
  startBtn?.addEventListener("click", startGame);
  instructionsBtn?.addEventListener("click", showInstructions);
  backBtn?.addEventListener("click", showStartScreen);
  restartBtn?.addEventListener("click", restartGame);
  menuBtn?.addEventListener("click", showStartScreen);
  nextLevelBtn?.addEventListener("click", nextLevel);
  difficultySelect?.addEventListener("change", updateDifficulty);
  speedControl?.addEventListener("input", updateSpeed);
  document.addEventListener("keydown", handleKeyDown);

  // Initialize
  document.title = GAME_NAME + " | " + COMPANY_NAME;
  highScoreDisplay && (highScoreDisplay.textContent = highScore);
  if (speedControl) {
    speedControl.value = currentSpeed;
  }

  // Add company branding to all screens
  addBranding();

  function addBranding() {
    const brandingElements = [
      startScreen,
      instructionsScreen,
      gameScreen,
      gameOverScreen,
      winScreen,
    ];

    brandingElements.forEach((screen) => {
      if (!screen) return;

      const existingBranding = screen.querySelector(".branding");
      if (existingBranding) return;

      const branding = document.createElement("div");
      branding.className = "branding";
      branding.style.position = "absolute";
      branding.style.bottom = "10px";
      branding.style.width = "100%";
      branding.style.textAlign = "center";
      branding.style.fontSize = "0.8rem";
      branding.style.color = "rgba(255, 255, 255, 0.6)";
      branding.style.zIndex = "1000";
      branding.innerHTML = `
          ${GAME_NAME} - Developed by ${DEVELOPER}<br>
          ${COMPANY_NAME} - ${DEVELOPER_EMAIL}
        `;
      screen.appendChild(branding);
    });
  }

  function startGame() {
    if (!gameScreen || gameActive) return;
    gameActive = true;

    showGameScreen();

    // Reset game state
    score = 0;
    health = 3;
    level = 1;
    isGameOver = false;
    isPaused = false;
    baseSpeed = 4;
    currentSpeed = baseSpeed;
    if (speedControl) speedControl.value = currentSpeed;

    // Clear game objects
    obstacles = [];
    powerups = [];
    enemies = [];
    clouds = [];
    killers = [];

    // Set difficulty
    updateDifficulty();

    // Update HUD
    updateHUD();

    // Clear containers safely
    clearContainer(obstaclesContainer);
    clearContainer(powerupsContainer);
    clearContainer(enemiesContainer);
    clearContainer(particlesContainer);
    clearContainer(explosionContainer);
    clearContainer(killersContainer);

    // Create plane
    createPlane();
    if (!plane) {
      console.error("Failed to create plane!");
      gameActive = false;
      return;
    }

    // Start game loop
    gameLoop();

    // Start timers
    startTimers();

    // Play engine sound
    playSound(engineSound, 0.3, true);
  }

  function clearContainer(container) {
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  }

  function playSound(sound, volume = 1, loop = false) {
    if (sound) {
      try {
        sound.volume = volume;
        sound.loop = loop;
        sound.currentTime = 0;
        sound.play().catch((e) => console.log("Audio play error:", e));
      } catch (e) {
        console.log("Audio error:", e);
      }
    }
  }

  function updateDifficulty() {
    if (!difficultySelect) return;

    difficulty = difficultySelect.value;

    switch (difficulty) {
      case "easy":
        gravity = 0.2;
        baseSpeed = 3;
        break;
      case "hard":
        gravity = 0.4;
        baseSpeed = 5;
        break;
      default: // medium
        gravity = 0.3;
        baseSpeed = 4;
    }
    currentSpeed = baseSpeed;
    if (speedControl) speedControl.value = currentSpeed;
    updateHUD();
  }

  function updateSpeed() {
    if (!speedControl) return;
    currentSpeed = parseInt(speedControl.value);
    updateHUD();
  }

  function startTimers() {
    // Clear existing timers
    stopTimers();

    // Obstacle generation
    const baseObstacleInterval = 2500 - level * 100;
    const obstacleInterval = Math.max(1000, baseObstacleInterval);
    obstacleTimer = setInterval(createObstacle, obstacleInterval);

    // Powerup generation
    powerupTimer = setInterval(createPowerup, 3000);

    // Enemy generation (starts at level 2)
    if (level >= 2) {
      enemyTimer = setInterval(createEnemy, 4000 - level * 100);
    }

    // Killer object generation (starts at level 3)
    if (level >= 3) {
      killerTimer = setInterval(createKiller, 5000 - level * 150);
    }

    // Cloud generation
    cloudTimer = setInterval(createCloud, 3500);
  }

  function stopTimers() {
    clearInterval(obstacleTimer);
    clearInterval(powerupTimer);
    clearInterval(enemyTimer);
    clearInterval(cloudTimer);
    clearInterval(killerTimer);
  }

  function createPlane() {
    const planeElement = document.getElementById("plane");
    if (!planeElement) {
      console.error("Plane element not found!");
      return null;
    }

    // Set game screen to full viewport
    gameScreen.style.width = "100vw";
    gameScreen.style.height = "100vh";

    const initialY = window.innerHeight / 2;
    planeElement.style.left = "100px";
    planeElement.style.top = `${initialY}px`;
    planeElement.style.display = "block";
    planeElement.style.width = "150px"; // Increased size
    planeElement.style.height = "150px"; // Increased size

    // Use plane image (place skyfury-plane.png in your root folder)
    planeElement.style.backgroundImage = 'url("plane.png")';
    planeElement.style.backgroundSize = "contain";
    planeElement.style.backgroundRepeat = "no-repeat";

    // Level-based visual enhancements
    if (level >= 5) {
      planeElement.style.filter = `
          drop-shadow(0 0 15px gold) 
          drop-shadow(0 0 8px rgba(76, 166, 255, 0.7))
          brightness(1.2)
        `;
    } else if (level >= 3) {
      planeElement.style.filter = `
          drop-shadow(0 0 10px silver)
          drop-shadow(0 0 5px rgba(76, 166, 255, 0.7))
        `;
    }

    plane = {
      element: planeElement,
      x: 100,
      y: initialY,
      width: 150, // Increased size
      height: 150, // Increased size
      velocity: 0,
      invincible: false,
      lastTrailTime: 0,
      jump: function () {
        this.velocity = -12; // Stronger jump for larger plane
        // Create jump particles
        for (let i = 0; i < 10; i++) {
          explosionParticles.createParticle(
            this.x + this.width,
            this.y + this.height / 2,
            {
              color: "#4da6ff",
              size: Math.random() * 5 + 4,
              velocityX: -2 - Math.random() * 2,
              velocityY: (Math.random() - 0.5) * 4,
              gravity: 0.1,
              lifetime: 500 + Math.random() * 400,
              fade: true,
            }
          );
        }
      },
      update: function () {
        this.velocity += gravity;
        this.velocity *= 0.93; // Slightly more damping for larger plane
        this.y += this.velocity;

        // Keep plane within screen bounds
        if (this.y < 0) {
          this.y = 0;
          this.velocity = 0;
        }

        if (this.y > window.innerHeight - this.height) {
          this.y = window.innerHeight - this.height;
          this.velocity = 0;
        }

        this.element.style.top = `${this.y}px`;

        // Rotate plane based on velocity
        let rotation = this.velocity * 1.2; // Slightly less rotation for larger plane
        rotation = Math.max(-25, Math.min(25, rotation));
        this.element.style.transform = `rotate(${rotation}deg)`;

        // Create trail particles
        const now = Date.now();
        if (now - this.lastTrailTime > 30) {
          // More frequent trails
          trailParticles.createTrail(
            this.x + 20, // Adjusted for larger plane
            this.y + this.height / 2,
            level >= 3 ? "#ff9900" : "#4da6ff"
          );
          this.lastTrailTime = now;
        }
      },
      makeInvincible: function (duration) {
        this.invincible = true;
        this.element.style.animation = "invincible 0.5s infinite";

        setTimeout(() => {
          this.invincible = false;
          this.element.style.animation = "";
        }, duration);
      },
    };

    return plane;
  }

  function createObstacle() {
    if (isGameOver || isPaused || !obstaclesContainer) return;

    // limit total obstacles on screen
    const maxObstacles = Math.min(6, Math.floor(score / 200) + 1);
    if (obstacles.length >= maxObstacles * 2) return;

    // gap size based on level
    const minGap = Math.max(150, 300 - level * 15);
    const maxGap = Math.max(200, 350 - level * 15);
    const gap = Math.random() * (maxGap - minGap) + minGap;

    const minH = 80;
    const maxH = window.innerHeight - gap - minH;
    if (maxH < minH) return;

    // pick a layout pattern at random
    const patterns = ["paired", "singleTop", "singleBottom", "staggered"];
    const layout = patterns[Math.floor(Math.random() * patterns.length)];

    // each obstacle x starts just off right edge, plus a little random jitter
    const startX = window.innerWidth + Math.random() * 100;

    // helper to build the element
    function mkObs(top, height, img) {
      return createGameElement("obstacle", {
        left: `${startX}px`,
        top: `${top}px`,
        width: "100px",
        height: `${height}px`,
        backgroundColor: "#555",
        border: "3px solid #333",
        backgroundImage: `url("${img}")`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      });
    }

    let topObs, botObs, topH, botH, topY, botY;

    switch (layout) {
      case "paired":
        // classic top+bottom at random vertical split
        topH = Math.random() * maxH + minH;
        topY = 0;
        botY = topH + gap;
        botH = window.innerHeight - botY;
        topObs = mkObs(topY, topH, "astroid1.png");
        botObs = mkObs(botY, botH, "astroid2.png");
        break;

      case "singleTop":
        // only one obstacle from top, random height
        topH = Math.random() * maxH + minH;
        topY = 0;
        topObs = mkObs(topY, topH, "astroid1.png");
        break;

      case "singleBottom":
        // only one obstacle from bottom, random height
        botH = Math.random() * maxH + minH;
        botY = window.innerHeight - botH;
        topObs = mkObs(botY, botH, "astroid2.png");
        break;

      case "staggered":
        // two obstacles, both somewhere in middle region
        topH = Math.random() * (maxH - minH) + minH;
        topY = Math.random() * (window.innerHeight - topH);
        botH = Math.random() * (maxH - minH) + minH;
        botY = Math.random() * (window.innerHeight - botH);
        // ensure they don’t overlap too closely
        if (Math.abs(topY - botY) < gap)
          botY =
            topY + gap + botH < window.innerHeight ? topY + gap : topY - gap;
        topObs = mkObs(topY, topH, "astroid1.png");
        botObs = mkObs(botY, botH, "astroid2.png");
        break;
    }

    // append whichever got created
    [topObs, botObs].forEach((obs) => {
      if (!obs) return;
      obstaclesContainer.appendChild(obs);
      // add to your obstacles array for movement & collision
      obstacles.push({
        element: obs,
        x: startX,
        y: parseFloat(obs.style.top),
        width: parseFloat(obs.style.width),
        height: parseFloat(obs.style.height),
        passed: false,
      });
    });
  }

  function createGameElement(className, styles) {
    const element = document.createElement("div");
    element.className = className;
    Object.assign(element.style, styles);
    return element;
  }

  function createPowerup() {
    if (isGameOver || isPaused || !powerupsContainer) return;

    const powerupTypes = [
      {
        type: "coin",
        weight: 60,
        color: "#ff9900",
        size: 40,
        image: "coin.png",
      }, // Larger size
      {
        type: "shield",
        weight: 25,
        color: "#4da6ff",
        size: 50,
        image: "shield.png",
      }, // Larger size
      {
        type: "health",
        weight: 15,
        color: "#4caf50",
        size: 50,
        image: "health.png",
      }, // Larger size
    ];

    const totalWeight = powerupTypes.reduce(
      (sum, type) => sum + type.weight,
      0
    );
    let random = Math.random() * totalWeight;
    let selectedType;

    for (const type of powerupTypes) {
      if (random < type.weight) {
        selectedType = type;
        break;
      }
      random -= type.weight;
    }

    const y = Math.floor(Math.random() * (window.innerHeight - 100)) + 50;
    const powerup = createGameElement("powerup", {
      left: `${window.innerWidth}px`,
      top: `${y}px`,
      width: `${selectedType.size}px`,
      height: `${selectedType.size}px`,
      backgroundColor: selectedType.color,
      borderRadius: "50%",
      border:
        selectedType.type === "coin" ? "3px solid #cc7a00" : "3px solid #fff",
      backgroundImage: `url("${selectedType.image}")`,
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    });

    powerupsContainer.appendChild(powerup);

    powerups.push({
      element: powerup,
      type: selectedType.type,
      x: window.innerWidth,
      y: y,
      width: selectedType.size,
      height: selectedType.size,
      collected: false,
    });
  }

  function createEnemy() {
    if (isGameOver || isPaused || level < 2 || !enemiesContainer) return;

    const y = Math.floor(Math.random() * (window.innerHeight - 100));
    const enemy = createGameElement("enemy", {
      left: `${window.innerWidth}px`,
      top: `${y}px`,
      width: "90px", // Larger size
      height: "90px", // Larger size
      backgroundColor: "#ff3333",
      borderRadius: "50%",
      border: "3px solid #990000",
      backgroundImage: 'url("skyfury-enemy.png")', // Place skyfury-enemy.png in root
      backgroundSize: "contain",
    });

    enemiesContainer.appendChild(enemy);

    enemies.push({
      element: enemy,
      x: window.innerWidth,
      y: y,
      width: 90,
      height: 90,
      passed: false,
      velocityY: (Math.random() - 0.5) * 3.5, // Slightly faster movement
    });
  }

  function createKiller() {
    if (
      isGameOver ||
      isPaused ||
      level < 3 ||
      !killersContainer ||
      killers.length >= 4 + Math.floor(score / 300)
    )
      return;

    const killerTypes = [
      {
        type: "spike",
        width: 60,
        height: 120,
        color: "#ff0000",
        image: "skyfury-spike.png",
        speed: 1.5,
        moveY: false,
      },
      {
        type: "blade",
        width: 80,
        height: 80,
        color: "#cc0000",
        image: "skyfury-blade.png",
        speed: 1.8,
        moveY: true,
      },
      {
        type: "laser",
        width: 20,
        height: 150,
        color: "#ff6600",
        image: "skyfury-laser.png",
        speed: 2.2,
        moveY: false,
      },
      {
        type: "mine",
        width: 70,
        height: 70,
        color: "#990000",
        image: "skyfury-mine.png",
        speed: 1.2,
        moveY: true,
      },
      {
        type: "saw",
        width: 90,
        height: 90,
        color: "#cc3300",
        image: "skyfury-saw.png",
        speed: 1.5,
        moveY: false,
      },
    ];

    const type = killerTypes[Math.floor(Math.random() * killerTypes.length)];
    const y = Math.floor(Math.random() * (window.innerHeight - type.height));

    const killer = createGameElement("killer", {
      left: `${window.innerWidth}px`,
      top: `${y}px`,
      width: `${type.width}px`,
      height: `${type.height}px`,
      backgroundColor: type.color,
      border: "2px solid #660000",
      backgroundImage: `url("${type.image}")`,
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    });

    // Add rotation animation for some killers
    if (type.type === "saw" || type.type === "blade") {
      killer.style.animation =
        "spin 1s linear infinite, dangerGlow 1s infinite alternate";
    } else if (type.type === "laser") {
      killer.style.animation =
        "laserPulse 0.3s infinite alternate, dangerGlow 0.5s infinite alternate";
    } else if (type.type === "mine") {
      killer.style.animation =
        "pulse 1s infinite alternate, dangerPulse 1s infinite alternate";
    }

    killersContainer.appendChild(killer);

    killers.push({
      element: killer,
      x: window.innerWidth,
      y: y,
      width: type.width,
      height: type.height,
      passed: false,
      speed: type.speed,
      moveY: type.moveY,
      velocityY: type.moveY ? (Math.random() - 0.5) * 2.5 : 0,
    });
  }

  function createCloud() {
    if (isGameOver || isPaused || !gameScreen) return;

    const size = Math.floor(Math.random() * 200) + 100; // Larger clouds
    const y = Math.floor(Math.random() * window.innerHeight);
    const opacity = Math.random() * 0.4 + 0.3;
    const cloud = createGameElement("cloud", {
      width: `${size}px`,
      height: `${size}px`,
      left: `${window.innerWidth}px`,
      top: `${y}px`,
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderRadius: "50%",
      filter: "blur(10px)",
      backgroundImage: 'url("skyfury-cloud.jpg")', // Place skyfury-cloud.png in root
      backgroundSize: "contain",
    });

    gameScreen.appendChild(cloud);

    clouds.push({
      element: cloud,
      x: window.innerWidth,
      y: y,
      width: size,
      height: size,
      speed: Math.random() * 2 + 1,
    });
  }

  function gameLoop() {
    if (isGameOver || isPaused || !plane) {
      gameAnimationId = requestAnimationFrame(gameLoop);
      return;
    }

    plane.update();
    updateObstacles();
    updatePowerups();
    updateEnemies();
    updateKillers();
    updateClouds();
    trailParticles.update();
    explosionParticles.update();

    checkCollisions();
    checkLevelProgress();
    checkWinCondition();

    gameAnimationId = requestAnimationFrame(gameLoop);
  }

  function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.x -= currentSpeed;
      obstacle.element.style.left = `${obstacle.x}px`;

      if (obstacle.x + obstacle.width < 0) {
        obstacle.element.remove();
        obstacles.splice(i, 1);
        continue;
      }

      if (!obstacle.passed && obstacle.x + obstacle.width < plane.x) {
        obstacle.passed = true;
        score += 0.5;
        updateHUD();

        if (Math.random() > 0.7) {
          explosionParticles.createSparkle(
            obstacle.x + obstacle.width,
            obstacle.y + obstacle.height / 2
          );
        }
      }
    }
  }

  function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
      const powerup = powerups[i];
      powerup.x -= currentSpeed * 0.8;
      powerup.element.style.left = `${powerup.x}px`;

      const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
      powerup.element.style.transform = `scale(${pulse})`;

      if (powerup.x + powerup.width < 0) {
        powerup.element.remove();
        powerups.splice(i, 1);
      }
    }
  }

  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.x -= currentSpeed * 1.2;
      enemy.y += enemy.velocityY;

      if (enemy.y < 0) {
        enemy.y = 0;
        enemy.velocityY *= -0.8;
      } else if (enemy.y > window.innerHeight - enemy.height) {
        enemy.y = window.innerHeight - enemy.height;
        enemy.velocityY *= -0.8;
      }

      enemy.element.style.left = `${enemy.x}px`;
      enemy.element.style.top = `${enemy.y}px`;

      if (enemy.x + enemy.width < 0) {
        enemy.element.remove();
        enemies.splice(i, 1);
        continue;
      }

      if (!enemy.passed && enemy.x + enemy.width < plane.x) {
        enemy.passed = true;
        score += 2;
        updateHUD();

        explosionParticles.createExplosion(
          enemy.x + enemy.width,
          enemy.y + enemy.height / 2,
          20,
          "#ff4d4d"
        );
      }
    }
  }

  function updateKillers() {
    for (let i = killers.length - 1; i >= 0; i--) {
      const killer = killers[i];
      killer.x -= currentSpeed * killer.speed;

      if (killer.moveY) {
        killer.y += killer.velocityY;
        if (killer.y < 0 || killer.y > window.innerHeight - killer.height) {
          killer.velocityY *= -1;
        }
      }

      killer.element.style.left = `${killer.x}px`;
      killer.element.style.top = `${killer.y}px`;

      if (killer.x + killer.width < 0) {
        killer.element.remove();
        killers.splice(i, 1);
        continue;
      }

      if (!killer.passed && killer.x + killer.width < plane.x) {
        killer.passed = true;
        score += 3;
        updateHUD();

        explosionParticles.createExplosion(
          killer.x + killer.width / 2,
          killer.y + killer.height / 2,
          25,
          "#ff0000",
          "star"
        );
      }
    }
  }

  function updateClouds() {
    for (let i = clouds.length - 1; i >= 0; i--) {
      const cloud = clouds[i];
      cloud.x -= cloud.speed;
      cloud.element.style.left = `${cloud.x}px`;

      if (cloud.x + cloud.width < 0) {
        cloud.element.remove();
        clouds.splice(i, 1);
      }
    }
  }

  function checkCollisions() {
    if (!plane || plane.invincible) return;

    // Check obstacle collisions
    for (const obstacle of obstacles) {
      if (checkCollision(plane, obstacle)) {
        takeDamage();
        return;
      }
    }

    // Check enemy collisions
    for (const enemy of enemies) {
      if (checkCollision(plane, enemy)) {
        takeDamage();
        return;
      }
    }

    // Check killer collisions
    for (const killer of killers) {
      if (checkCollision(plane, killer)) {
        takeDamage();
        return;
      }
    }

    // Check powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
      const powerup = powerups[i];
      if (!powerup.collected && checkCollision(plane, powerup)) {
        powerup.collected = true;
        powerup.element.remove();
        powerups.splice(i, 1);

        applyPowerup(powerup.type);

        explosionParticles.createExplosion(
          powerup.x + powerup.width / 2,
          powerup.y + powerup.height / 2,
          25,
          powerup.type === "coin"
            ? "#ffcc00"
            : powerup.type === "shield"
            ? "#4da6ff"
            : "#4caf50"
        );

        playSound(powerupSound, 0.5);
      }
    }
  }

  function checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  function applyPowerup(type) {
    switch (type) {
      case "coin":
        score += 20; // Increased coin value
        break;
      case "shield":
        plane.makeInvincible(5000); // Longer shield duration
        break;
      case "health":
        health = Math.min(5, health + 1);
        break;
    }
    updateHUD();
  }

  function takeDamage() {
    health--;
    updateHUD();

    explosionParticles.createExplosion(
      plane.x + plane.width / 2,
      plane.y + plane.height / 2,
      40,
      "#ff4d4d",
      "star"
    );

    playSound(explosionSound, 0.7);

    plane.makeInvincible(2000); // Longer invincibility after hit

    if (typeof gsap !== "undefined") {
      gsap.to(gameScreen, {
        x: 20,
        y: 20,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          gameScreen.style.transform = "translate(0, 0)";
        },
      });
    }

    if (health <= 0) {
      gameOver();
    }
  }

  function checkLevelProgress() {
    const levelThreshold = level * 1000;
    if (score >= levelThreshold) {
      levelUp();
    }
  }

  function checkWinCondition() {
    if (score >= WIN_SCORE) {
      winGame();
    }
  }

  function levelUp() {
    isPaused = true;
    level++;

    playSound(levelupSound, 0.6);

    const levelUpElement = document.getElementById("level-up");
    if (levelUpElement) {
      levelUpElement.classList.remove("hidden");
    }

    score += 500;
    updateHUD();
    stopTimers();
  }

  function nextLevel() {
    const levelUpElement = document.getElementById("level-up");
    if (levelUpElement) {
      levelUpElement.classList.add("hidden");
    }

    clearContainer(obstaclesContainer);
    clearContainer(powerupsContainer);
    clearContainer(enemiesContainer);
    clearContainer(killersContainer);

    obstacles = [];
    powerups = [];
    enemies = [];
    killers = [];

    createPlane();
    startTimers();
    isPaused = false;
  }

  function gameOver() {
    isGameOver = true;
    gameActive = false;

    cancelAnimationFrame(gameAnimationId);
    stopTimers();

    if (engineSound) engineSound.pause();
    playSound(explosionSound, 0.8);

    explosionParticles.createExplosion(
      plane.x + plane.width / 2,
      plane.y + plane.height / 2,
      80,
      "#ff4d4d",
      "star"
    );

    if (plane.element) {
      plane.element.style.display = "none";
    }

    if (finalScoreDisplay) finalScoreDisplay.textContent = Math.floor(score);
    if (finalLevelDisplay) finalLevelDisplay.textContent = level - 1;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("skyFuryHighScore", highScore);
      if (highScoreDisplay) highScoreDisplay.textContent = highScore;
    }

    setTimeout(() => {
      showGameOverScreen();
    }, 1000);
  }

  function winGame() {
    isGameOver = true;
    gameActive = false;

    cancelAnimationFrame(gameAnimationId);
    stopTimers();

    if (engineSound) engineSound.pause();
    playSound(winSound, 0.8);

    // Create massive celebration explosion
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        explosionParticles.createExplosion(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          150,
          ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"][i % 5],
          "star"
        );
      }, i * 400);
    }

    if (plane.element) {
      plane.element.style.display = "none";
    }

    if (winScoreDisplay) winScoreDisplay.textContent = Math.floor(score);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("skyFuryHighScore", highScore);
      if (highScoreDisplay) highScoreDisplay.textContent = highScore;
    }

    setTimeout(() => {
      showWinScreen();
    }, 2000);
  }

  function restartGame() {
    showGameScreen();
    startGame();
  }

  function updateHUD() {
    if (scoreDisplay) scoreDisplay.textContent = Math.floor(score);
    if (healthDisplay) healthDisplay.textContent = health;
    if (levelDisplay) levelDisplay.textContent = level;
    if (speedDisplay) {
      speedDisplay.textContent = `SPD: ${Math.floor(currentSpeed * 20)}`;
    }
    if (progressDisplay) {
      const progress = Math.min(100, Math.floor((score / WIN_SCORE) * 100));
      progressDisplay.textContent = `Progress: ${progress}%`;
      progressDisplay.style.width = `${progress}%`;
    }
  }

  function handleKeyDown(e) {
    if (["Space", " ", "ArrowUp"].includes(e.code || e.key)) {
      e.preventDefault();

      if (gameScreen.classList.contains("hidden")) {
        if (!instructionsScreen.classList.contains("hidden")) return;
        startGame();
        return;
      }

      if (
        !isGameOver &&
        !isPaused &&
        plane &&
        typeof plane.jump === "function"
      ) {
        plane.jump();
      }
    } else if (e.key === "Escape") {
      if (!gameScreen.classList.contains("hidden") && !isGameOver) {
        isPaused = !isPaused;
        if (isPaused) {
          if (engineSound) engineSound.pause();
        } else {
          if (engineSound) engineSound.play().catch((e) => console.log(e));
          gameLoop();
        }
      }
    } else if (e.key === "p" || e.key === "P") {
      // Pause with P key
      if (!gameScreen.classList.contains("hidden") && !isGameOver) {
        isPaused = !isPaused;
        if (isPaused) {
          if (engineSound) engineSound.pause();
        } else {
          if (engineSound) engineSound.play().catch((e) => console.log(e));
          gameLoop();
        }
      }
    }
  }

  // Screen navigation
  function showStartScreen() {
    startScreen?.classList.remove("hidden");
    instructionsScreen?.classList.add("hidden");
    gameScreen?.classList.add("hidden");
    gameOverScreen?.classList.add("hidden");
    winScreen?.classList.add("hidden");
    const levelUpElement = document.getElementById("level-up");
    levelUpElement?.classList.add("hidden");
  }

  function showInstructions() {
    startScreen?.classList.add("hidden");
    instructionsScreen?.classList.remove("hidden");
  }

  function showGameScreen() {
    startScreen?.classList.add("hidden");
    instructionsScreen?.classList.add("hidden");
    gameScreen?.classList.remove("hidden");
    gameOverScreen?.classList.add("hidden");
    winScreen?.classList.add("hidden");
  }

  function showGameOverScreen() {
    gameScreen?.classList.add("hidden");
    gameOverScreen?.classList.remove("hidden");
  }

  function showWinScreen() {
    gameScreen?.classList.add("hidden");
    winScreen?.classList.remove("hidden");
  }

  // Initial cloud creation
  for (let i = 0; i < 5; i++) {
    setTimeout(createCloud, i * 800);
  }
});
