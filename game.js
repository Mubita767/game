class ParticleSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.particles = [];
    this.maxParticles = 100;
  }

  createParticle(x, y, options = {}) {
    if (this.particles.length >= this.maxParticles) return;

    const particle = document.createElement("div");
    particle.className = "particle";

    // Default options with better randomization
    const {
      color = "#ffffff",
      size = Math.random() * 3 + 2,
      velocityX = (Math.random() - 0.5) * 5,
      velocityY = (Math.random() - 0.5) * 5,
      lifetime = 800 + Math.random() * 400,
      gravity = 0.1,
      fade = true,
    } = options;

    // Set particle style more efficiently
    Object.assign(particle.style, {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      left: `${x}px`,
      top: `${y}px`,
      position: "absolute",
      borderRadius: "50%",
      pointerEvents: "none",
    });

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

  createExplosion(x, y, count = 30, color = "#ff4d4d") {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;

      this.createParticle(x, y, {
        color,
        size: Math.random() * 6 + 3,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        gravity: 0.2,
        lifetime: 600 + Math.random() * 300,
        fade: true,
      });
    }
  }

  createTrail(x, y, color = "#4da6ff") {
    this.createParticle(x, y, {
      color,
      size: Math.random() * 2 + 1,
      velocityX: -1 - Math.random() * 1.5,
      velocityY: (Math.random() - 0.5) * 0.8,
      gravity: -0.03,
      lifetime: 300 + Math.random() * 150,
      fade: true,
    });
  }

  createSparkle(x, y, color = "#ffcc00") {
    this.createParticle(x, y, {
      color,
      size: Math.random() * 4 + 2,
      velocityX: (Math.random() - 0.5) * 1.5,
      velocityY: (Math.random() - 0.5) * 1.5,
      gravity: 0,
      lifetime: 400 + Math.random() * 200,
      fade: true,
    });
  }

  update() {
    const now = Date.now();
    const particlesToRemove = [];

    this.particles.forEach((particle, index) => {
      // Update position
      particle.velocityY += particle.gravity;
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;

      // Update element
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;

      // Apply fade out
      if (particle.fade) {
        const elapsed = now - particle.createdAt;
        const progress = Math.min(1, elapsed / particle.lifetime);
        if (progress > 0.7) {
          particle.element.style.opacity = 1 - (progress - 0.7) * 3.33;
        }
      }

      // Check if particle should be removed
      if (now - particle.createdAt > particle.lifetime) {
        particlesToRemove.push(index);
      }
    });

    // Remove old particles in reverse order
    for (let i = particlesToRemove.length - 1; i >= 0; i--) {
      const index = particlesToRemove[i];
      this.particles[index].element.remove();
      this.particles.splice(index, 1);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Game elements
  const startScreen = document.getElementById("start-screen");
  const instructionsScreen = document.getElementById("instructions-screen");
  const gameScreen = document.getElementById("game-screen");
  const gameOverScreen = document.getElementById("game-over");
  const startBtn = document.getElementById("start-btn");
  const instructionsBtn = document.getElementById("instructions-btn");
  const backBtn = document.getElementById("back-btn");
  const restartBtn = document.getElementById("restart-btn");
  const menuBtn = document.getElementById("menu-btn");
  const nextLevelBtn = document.getElementById("next-level-btn");
  const difficultySelect = document.getElementById("difficulty");

  // Containers
  const obstaclesContainer = document.getElementById("obstacles-container");
  const powerupsContainer = document.getElementById("powerups-container");
  const enemiesContainer = document.getElementById("enemies-container");
  const particlesContainer = document.getElementById("particles-container");
  const explosionContainer = document.getElementById("explosion-container");

  // HUD elements
  const scoreDisplay = document.getElementById("score-display");
  const healthDisplay = document.getElementById("health-display");
  const speedDisplay = document.getElementById("speed-display");
  const levelDisplay = document.getElementById("level-display");
  const finalScoreDisplay = document.getElementById("final-score");
  const finalLevelDisplay = document.getElementById("final-level");
  const highScoreDisplay = document.getElementById("high-score");

  // Game variables
  let score = 0;
  let highScore = localStorage.getItem("aviatorHighScore") || 0;
  let health = 3;
  let gameSpeed = 4; // Adjusted initial speed
  let level = 1;
  let gravity = 0.3;
  let isGameOver = false;
  let isPaused = false;
  let difficulty = "medium";
  let gameActive = false;

  // Game objects
  let plane = null;
  let obstacles = [];
  let powerups = [];
  let enemies = [];
  let clouds = [];

  // Animation IDs
  let gameAnimationId = null;
  let obstacleTimer = null;
  let powerupTimer = null;
  let enemyTimer = null;
  let cloudTimer = null;

  // Audio elements
  const engineSound = document.getElementById("engine-sound");
  const explosionSound = document.getElementById("explosion-sound");
  const powerupSound = document.getElementById("powerup-sound");
  const levelupSound = document.getElementById("levelup-sound");

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
  document.addEventListener("keydown", handleKeyDown);

  // Initialize
  highScoreDisplay && (highScoreDisplay.textContent = highScore);

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
    gameSpeed = 4; // Reset to initial speed

    // Clear game objects
    obstacles = [];
    powerups = [];
    enemies = [];
    clouds = [];

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
        gameSpeed = 3;
        break;
      case "hard":
        gravity = 0.4;
        gameSpeed = 5;
        break;
      default: // medium
        gravity = 0.3;
        gameSpeed = 4;
    }
  }

  function startTimers() {
    // Clear existing timers
    stopTimers();

    // Obstacle generation - starts slower and increases with level
    const baseObstacleInterval = 2500 - level * 100;
    const obstacleInterval = Math.max(1000, baseObstacleInterval);
    obstacleTimer = setInterval(createObstacle, obstacleInterval);

    // Powerup generation
    powerupTimer = setInterval(createPowerup, 3000);

    // Enemy generation (starts at level 2)
    if (level >= 2) {
      enemyTimer = setInterval(createEnemy, 4000 - level * 100);
    }

    // Cloud generation
    cloudTimer = setInterval(createCloud, 4000);
  }

  function stopTimers() {
    clearInterval(obstacleTimer);
    clearInterval(powerupTimer);
    clearInterval(enemyTimer);
    clearInterval(cloudTimer);
  }

  function createPlane() {
    const planeElement = document.getElementById("plane");
    if (!planeElement) {
      console.error("Plane element not found!");
      return null;
    }

    const initialY = window.innerHeight / 2;
    planeElement.style.left = "100px";
    planeElement.style.top = `${initialY}px`;
    planeElement.style.display = "block";

    // Use the correct plane image
    planeElement.style.backgroundImage = 'url("aircraft-3254820_1280.png")';

    // Level-based visual enhancements
    if (level >= 5) {
      planeElement.style.filter = `
          drop-shadow(0 0 10px gold) 
          drop-shadow(0 0 5px rgba(76, 166, 255, 0.7))
          brightness(1.1)
        `;
    } else if (level >= 3) {
      planeElement.style.filter = `
          drop-shadow(0 0 7px silver)
          drop-shadow(0 0 5px rgba(76, 166, 255, 0.7))
        `;
    }

    plane = {
      element: planeElement,
      x: 100,
      y: initialY,
      width: 80,
      height: 80,
      velocity: 0,
      invincible: false,
      lastTrailTime: 0,
      jump: function () {
        this.velocity = -9; // Adjusted jump power
        // Create jump particles
        for (let i = 0; i < 5; i++) {
          explosionParticles.createParticle(
            this.x + this.width,
            this.y + this.height / 2,
            {
              color: "#4da6ff",
              size: Math.random() * 3 + 2,
              velocityX: -1 - Math.random(),
              velocityY: (Math.random() - 0.5) * 2,
              gravity: 0.1,
              lifetime: 300 + Math.random() * 200,
              fade: true,
            }
          );
        }
      },
      update: function () {
        // Apply gravity with damping for smoother movement
        this.velocity += gravity;
        this.velocity *= 0.95; // Damping factor
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

        // Update position
        this.element.style.top = `${this.y}px`;

        // Rotate plane based on velocity (less extreme)
        let rotation = this.velocity * 1.5;
        rotation = Math.max(-20, Math.min(20, rotation));
        this.element.style.transform = `rotate(${rotation}deg)`;

        // Create trail particles
        const now = Date.now();
        if (now - this.lastTrailTime > 50) {
          trailParticles.createTrail(
            this.x + 10,
            this.y + this.height / 2,
            level >= 3 ? "#ff9900" : "#4da6ff"
          );
          this.lastTrailTime = now;
        }
      },
      makeInvincible: function (duration) {
        this.invincible = true;
        this.element.style.filter = "drop-shadow(0 0 10px gold)";

        setTimeout(() => {
          this.invincible = false;
          this.element.style.filter = "";
        }, duration);
      },
    };

    return plane;
  }

  function createObstacle() {
    if (isGameOver || isPaused || !obstaclesContainer) return;

    // Fewer obstacles at level 1, increasing with level
    const maxObstacles = Math.min(3, Math.floor(level / 2) + 1);
    if (obstacles.length >= maxObstacles * 2) return;

    const minGap = 200 - level * 10;
    const maxGap = 300 - level * 10;
    const gap = Math.max(150, Math.random() * (maxGap - minGap) + minGap);
    const minHeight = 80;
    const maxHeight = window.innerHeight - gap - minHeight;

    if (maxHeight < minHeight) return;

    const height =
      Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    const topHeight = Math.floor(
      Math.random() * (window.innerHeight - gap - height)
    );

    // Create top obstacle
    const topObstacle = createGameElement("obstacle", {
      left: `${window.innerWidth}px`,
      top: "0px",
      width: "60px",
      height: `${topHeight}px`,
      backgroundColor: "#555",
      border: "2px solid #333",
    });

    // Create bottom obstacle
    const bottomObstacle = createGameElement("obstacle", {
      left: `${window.innerWidth}px`,
      top: `${topHeight + gap}px`,
      width: "60px",
      height: `${window.innerHeight - topHeight - gap}px`,
      backgroundColor: "#555",
      border: "2px solid #333",
    });

    obstaclesContainer.appendChild(topObstacle);
    obstaclesContainer.appendChild(bottomObstacle);

    obstacles.push(
      {
        element: topObstacle,
        x: window.innerWidth,
        y: 0,
        width: 60,
        height: topHeight,
        passed: false,
      },
      {
        element: bottomObstacle,
        x: window.innerWidth,
        y: topHeight + gap,
        width: 60,
        height: window.innerHeight - topHeight - gap,
        passed: false,
      }
    );
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
      { type: "coin", weight: 70, color: "#ff9900", size: 20 },
      { type: "shield", weight: 20, color: "#4da6ff", size: 25 },
      { type: "health", weight: 10, color: "#4caf50", size: 25 },
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

    const y = Math.floor(Math.random() * (window.innerHeight - 60)) + 30;
    const powerup = createGameElement("powerup", {
      left: `${window.innerWidth}px`,
      top: `${y}px`,
      width: `${selectedType.size}px`,
      height: `${selectedType.size}px`,
      backgroundColor: selectedType.color,
      borderRadius: "50%",
      border:
        selectedType.type === "coin" ? "2px solid #cc7a00" : "2px solid #fff",
    });

    // Add inner glow effect
    powerup.style.boxShadow = `0 0 10px ${selectedType.color}`;

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

    const y = Math.floor(Math.random() * (window.innerHeight - 60));
    const enemy = createGameElement("enemy", {
      left: `${window.innerWidth}px`,
      top: `${y}px`,
      width: "60px",
      height: "60px",
      backgroundColor: "#ff3333",
      borderRadius: "50%",
      border: "2px solid #990000",
    });

    // Add UFO details
    const ufoDetail = document.createElement("div");
    ufoDetail.style.position = "absolute";
    ufoDetail.style.width = "40px";
    ufoDetail.style.height = "10px";
    ufoDetail.style.backgroundColor = "#666";
    ufoDetail.style.borderRadius = "5px";
    ufoDetail.style.top = "25px";
    ufoDetail.style.left = "10px";
    enemy.appendChild(ufoDetail);

    enemiesContainer.appendChild(enemy);

    enemies.push({
      element: enemy,
      x: window.innerWidth,
      y: y,
      width: 60,
      height: 60,
      passed: false,
      velocityY: (Math.random() - 0.5) * 2,
    });
  }

  function createCloud() {
    if (isGameOver || isPaused || !gameScreen) return;

    const size = Math.floor(Math.random() * 100) + 50;
    const y = Math.floor(Math.random() * window.innerHeight);
    const cloud = createGameElement("cloud", {
      width: `${size}px`,
      height: `${size}px`,
      left: `${window.innerWidth}px`,
      top: `${y}px`,
      backgroundColor: "rgba(200, 200, 255, 0.3)",
      borderRadius: "50%",
      filter: "blur(5px)",
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

    // Update game objects
    plane.update();
    updateObstacles();
    updatePowerups();
    updateEnemies();
    updateClouds();
    trailParticles.update();
    explosionParticles.update();

    // Check game state
    checkCollisions();
    checkLevelProgress();

    // Continue game loop
    gameAnimationId = requestAnimationFrame(gameLoop);
  }

  function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.x -= gameSpeed;
      obstacle.element.style.left = `${obstacle.x}px`;

      // Remove obstacles that are off screen
      if (obstacle.x + obstacle.width < 0) {
        obstacle.element.remove();
        obstacles.splice(i, 1);
        continue;
      }

      // Check if plane passed the obstacle
      if (!obstacle.passed && obstacle.x + obstacle.width < plane.x) {
        obstacle.passed = true;
        score += 0.5;
        updateHUD();

        // Gradual difficulty increase
        gameSpeed = Math.min(10, 4 + Math.floor(score / 500) * 0.25);

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
      powerup.x -= gameSpeed * 0.8; // Slightly slower than obstacles
      powerup.element.style.left = `${powerup.x}px`;

      // Add pulsing animation to powerups
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
      enemy.x -= gameSpeed * 1.2;
      enemy.y += enemy.velocityY;

      // Boundary check with bounce
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
          10,
          "#ff4d4d"
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
          15,
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
        score += 10;
        break;
      case "shield":
        plane.makeInvincible(3000);
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
      20,
      "#ff4d4d"
    );

    playSound(explosionSound, 0.7);

    plane.makeInvincible(1000);

    if (typeof gsap !== "undefined") {
      gsap.to(gameScreen, {
        x: 10,
        y: 10,
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

    obstacles = [];
    powerups = [];
    enemies = [];

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
      50,
      "#ff4d4d"
    );

    if (plane.element) {
      plane.element.style.display = "none";
    }

    if (finalScoreDisplay) finalScoreDisplay.textContent = Math.floor(score);
    if (finalLevelDisplay) finalLevelDisplay.textContent = level - 1;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("aviatorHighScore", highScore);
      if (highScoreDisplay) highScoreDisplay.textContent = highScore;
    }

    setTimeout(() => {
      showGameOverScreen();
    }, 1000);
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
      speedDisplay.textContent = `SPD: ${Math.floor(gameSpeed * 20)}`;
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
  }

  function showGameOverScreen() {
    gameScreen?.classList.add("hidden");
    gameOverScreen?.classList.remove("hidden");
  }

  // Initial cloud creation
  for (let i = 0; i < 5; i++) {
    setTimeout(createCloud, i * 1000);
  }
});
