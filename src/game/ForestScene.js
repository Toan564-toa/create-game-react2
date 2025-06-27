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
    
    // Setup camera (no follow)
    this.cameras.main.setBounds(0, 0, 992, 992);
    
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

  setupInput() {
    // Mouse input for planting and interaction
    this.input.on('pointerdown', (pointer) => {
      this.handleMouseClick(pointer);
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