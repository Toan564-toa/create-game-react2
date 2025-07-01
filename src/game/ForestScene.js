import Phaser from 'phaser';
import { TileGenerator } from './TileGenerator';
import { Plant } from './Plant';
import { Environment } from './Environment';
import { GameState } from './GameState';
import TimeManager from './TimeManager';
import RandomEventManager from './RandomEvent';

export class ForestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ForestScene' });
    this.gameState = new GameState();
    this.environment = new Environment();
    this.tileGenerator = new TileGenerator();
    this.plants = [];
    this.tiles = [];
    this.gameData = {
      carbonCredits: 0,
      energyOrbs: 100,
      currentArea: 'Forest Valley',
      co2Absorbed: 0,
      co2Target: 1000,
      areaHealth: 100
    };
    this.updateCallback = null;
    this.pauseCallback = null;
    this.currentTool = 'plant';
    this.tickTime = 0;
    this.tickInterval = 1000; // 1 second per tick
    this.lastDay = TimeManager.getCurrentDay();
    this.lastEvent = null;
    this.tickCount = 0;
    
    // Camera pan variables
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.cameraStartX = 0;
    this.cameraStartY = 0;
  }

  setGameData(data) {
    this.gameData = data;
  }

  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  setPauseCallback(callback) {
    this.pauseCallback = callback;
  }

  setTool(tool) {
    this.currentTool = tool;
  }

  create() {
    // Create tile map
    this.createTileMap();
    
    // Setup input
    this.setupInput();
    
    // Setup camera with pan controls
    this.setupCamera();
    
    // Start game loop
    this.startGameLoop();
    
    // Send initial environment data
    this.sendEnvironmentData();
  }

  createTileMap() {
    // Generate 62x62 tile grid
    for (let x = 0; x < 62; x++) {
      this.tiles[x] = [];
      for (let y = 0; y < 62; y++) {
        const tileX = x * 16;
        const tileY = y * 16;
        const tileType = this.tileGenerator.getTileType(x, y);
        const tile = this.add.rectangle(tileX + 8, tileY + 8, 16, 16, tileType.color);
        tile.setStrokeStyle(1, 0x000000, 0.3);
        tile.tileData = {
          x: x,
          y: y,
          type: tileType.type,
          plant: null,
          watered: false,
          fertilized: false
        };
        this.tiles[x][y] = tile;
      }
    }
  }

  setupCamera() {
    // Set camera bounds to cover the entire map
    const mapWidth = 62 * 16; // 992px
    const mapHeight = 62 * 16; // 992px
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    
    // Center camera initially
    this.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
    
    // Enable camera pan with smooth movement
    this.cameras.main.setZoom(1);
    this.cameras.main.setBackgroundColor('#2c5530');
    
    // Add camera controls
    this.setupCameraControls();
  }

  setupCameraControls() {
    // Mouse wheel zoom with smooth transition
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.5, 2);
      
      // Smooth zoom transition
      this.tweens.add({
        targets: this.cameras.main,
        zoom: newZoom,
        duration: 200,
        ease: 'Power2'
      });
    });

    // Middle mouse button or space + drag for panning
    this.input.on('pointerdown', (pointer) => {
      if (pointer.button === 1 || (pointer.button === 0 && this.input.keyboard.addKey('SPACE').isDown)) {
        this.isPanning = true;
        this.panStartX = pointer.x;
        this.panStartY = pointer.y;
        this.cameraStartX = this.cameras.main.scrollX;
        this.cameraStartY = this.cameras.main.scrollY;
        this.input.setDefaultCursor('grabbing');
        
        // Show pan indicator
        const panIndicator = document.getElementById('panIndicator');
        if (panIndicator) {
          panIndicator.classList.add('active');
        }
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isPanning) {
        const deltaX = this.panStartX - pointer.x;
        const deltaY = this.panStartY - pointer.y;
        
        const newScrollX = this.cameraStartX + deltaX;
        const newScrollY = this.cameraStartY + deltaY;
        
        // Apply bounds checking
        const bounds = this.cameras.main.getBounds();
        const viewportWidth = this.cameras.main.width / this.cameras.main.zoom;
        const viewportHeight = this.cameras.main.height / this.cameras.main.zoom;
        
        const clampedX = Phaser.Math.Clamp(newScrollX, bounds.x, bounds.x + bounds.width - viewportWidth);
        const clampedY = Phaser.Math.Clamp(newScrollY, bounds.y, bounds.y + bounds.height - viewportHeight);
        
        this.cameras.main.setScroll(clampedX, clampedY);
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (this.isPanning) {
        this.isPanning = false;
        this.input.setDefaultCursor('default');
        
        // Hide pan indicator
        const panIndicator = document.getElementById('panIndicator');
        if (panIndicator) {
          panIndicator.classList.remove('active');
        }
      }
    });

    // Keyboard camera controls with smooth movement
    this.input.keyboard.on('keydown-ARROWLEFT', () => {
      const newScrollX = this.cameras.main.scrollX - 50;
      this.cameras.main.scrollX = Math.max(0, newScrollX);
    });
    
    this.input.keyboard.on('keydown-ARROWRIGHT', () => {
      const newScrollX = this.cameras.main.scrollX + 50;
      const maxScrollX = 992 - (this.cameras.main.width / this.cameras.main.zoom);
      this.cameras.main.scrollX = Math.min(maxScrollX, newScrollX);
    });
    
    this.input.keyboard.on('keydown-ARROWUP', () => {
      const newScrollY = this.cameras.main.scrollY - 50;
      this.cameras.main.scrollY = Math.max(0, newScrollY);
    });
    
    this.input.keyboard.on('keydown-ARROWDOWN', () => {
      const newScrollY = this.cameras.main.scrollY + 50;
      const maxScrollY = 992 - (this.cameras.main.height / this.cameras.main.zoom);
      this.cameras.main.scrollY = Math.min(maxScrollY, newScrollY);
    });

    // Reset camera position with smooth transition
    this.input.keyboard.on('keydown-HOME', () => {
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: 496 - (this.cameras.main.width / this.cameras.main.zoom) / 2,
        scrollY: 496 - (this.cameras.main.height / this.cameras.main.zoom) / 2,
        zoom: 1,
        duration: 500,
        ease: 'Power2'
      });
    });

    // Space key indicator
    this.input.keyboard.on('keydown-SPACE', () => {
      this.input.setDefaultCursor('grab');
    });

    this.input.keyboard.on('keyup-SPACE', () => {
      if (!this.isPanning) {
        this.input.setDefaultCursor('default');
      }
    });
  }

  setupInput() {
    // Mouse input for planting and interaction (only when not panning)
    this.input.on('pointerdown', (pointer) => {
      if (pointer.button === 0 && !this.input.keyboard.addKey('SPACE').isDown) {
        this.handleMouseClick(pointer);
      }
    });
    
    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.pauseCallback) this.pauseCallback();
    });
    
    this.input.keyboard.on('keydown-ONE', () => {
      this.currentTool = 'plant';
    });
    
    this.input.keyboard.on('keydown-TWO', () => {
      this.currentTool = 'water';
    });
    
    this.input.keyboard.on('keydown-THREE', () => {
      this.currentTool = 'fertilize';
    });
  }

  handleMouseClick(pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / 16);
    const tileY = Math.floor(worldPoint.y / 16);
    
    if (tileX >= 0 && tileX < 62 && tileY >= 0 && tileY < 62) {
      const tile = this.tiles[tileX][tileY];
      
      switch (this.currentTool) {
        case 'plant':
          this.plantSeed(tileX, tileY);
          break;
        case 'water':
          this.waterTile(tileX, tileY);
          break;
        case 'fertilize':
          this.fertilizeTile(tileX, tileY);
          break;
      }
    }
  }

  plantSeed(tileX, tileY) {
    const tile = this.tiles[tileX][tileY];
    
    if (tile.tileData.type === 'dirt' && !tile.tileData.plant && this.gameData.energyOrbs >= 10) {
      const plant = new Plant(this, tileX * 16 + 8, tileY * 16 + 8);
      tile.tileData.plant = plant;
      this.plants.push(plant);
      
      // Update game data
      this.updateGameData({
        energyOrbs: this.gameData.energyOrbs - 10
      });
    }
  }

  waterTile(tileX, tileY) {
    const tile = this.tiles[tileX][tileY];
    
    if (tile.tileData.plant && !tile.tileData.watered && this.gameData.energyOrbs >= 5) {
      tile.tileData.watered = true;
      tile.tileData.plant.water();
      
      this.updateGameData({
        energyOrbs: this.gameData.energyOrbs - 5
      });
    }
  }

  fertilizeTile(tileX, tileY) {
    const tile = this.tiles[tileX][tileY];
    
    if (tile.tileData.plant && !tile.tileData.fertilized && this.gameData.energyOrbs >= 15) {
      tile.tileData.fertilized = true;
      tile.tileData.plant.fertilize();
      
      this.updateGameData({
        energyOrbs: this.gameData.energyOrbs - 15
      });
    }
  }

  startGameLoop() {
    // Game tick timer
    this.time.addEvent({
      delay: this.tickInterval,
      callback: this.gameTick,
      callbackScope: this,
      loop: true
    });
  }

  gameTick() {
    if (!this.gameData) return;

    // Chỉ chuyển ngày khi tick đủ 1 ngày (ví dụ mỗi 10 tick = 1 ngày)
    if (!this.tickCount) this.tickCount = 0;
    this.tickCount++;
    if (this.tickCount >= 10) {
      this.tickCount = 0;
      TimeManager.nextDay();
      this.handleNewDay();
    }

    // Update environment
    this.environment.update();
    
    // Send environment data to HUD
    this.sendEnvironmentData();
    
    // Update all plants
    let totalCarbonAbsorbed = 0;
    this.plants.forEach(plant => {
      const carbonAbsorbed = plant.grow(this.environment);
      totalCarbonAbsorbed += carbonAbsorbed;
      
      // Check if plant is mature
      if (plant.isMature() && !plant.harvested) {
        plant.harvest();
        this.updateGameData({
          carbonCredits: this.gameData.carbonCredits + 50,
          co2Absorbed: this.gameData.co2Absorbed + plant.carbonRate
        });
      }
    });
    
    // Update game data
    if (totalCarbonAbsorbed > 0) {
      this.updateGameData({
        co2Absorbed: this.gameData.co2Absorbed + totalCarbonAbsorbed
      });
    }
    
    // Update area health based on CO2 absorption
    const healthPercentage = Math.min(100, (this.gameData.co2Absorbed / this.gameData.co2Target) * 100);
    this.updateGameData({
      areaHealth: healthPercentage
    });
  }

  handleNewDay() {
    const currentDay = TimeManager.getCurrentDay();
    // Cập nhật tuổi và trạng thái cây
    this.plants.forEach(plant => {
      plant.grow(this.environment);
    });
    // Sinh thiên tai ngẫu nhiên
    const event = RandomEventManager.getRandomEvent(currentDay);
    this.lastEvent = event;
    if (event) {
      // Áp dụng thiên tai lên cây ngẫu nhiên
      const affectedPlants = this.plants.filter(p => p.stage !== 'dead' && p.status === 'normal');
      if (affectedPlants.length > 0) {
        // 20% số cây bị ảnh hưởng
        const numAffected = Math.max(1, Math.floor(affectedPlants.length * 0.2));
        for (let i = 0; i < numAffected; i++) {
          const idx = Math.floor(Math.random() * affectedPlants.length);
          affectedPlants[idx].applyDisaster(event);
          affectedPlants.splice(idx, 1);
        }
      }
    }
    // Gửi thông báo ngày mới và sự kiện lên HUD
    window.dispatchEvent(new CustomEvent('dayEvent', {
      detail: {
        day: currentDay,
        event: event
      }
    }));
  }

  sendEnvironmentData() {
    const envData = this.environment.getEnvironmentalFactors();
    window.dispatchEvent(new CustomEvent('environmentUpdate', {
      detail: { environment: envData }
    }));
  }

  updateGameData(newData) {
    if (this.updateCallback) {
      this.updateCallback(newData);
    }
  }

  update(time, delta) {
    // Update plants
    this.plants.forEach(plant => {
      plant.update(delta);
    });
  }
} 