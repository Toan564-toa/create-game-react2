import Phaser from 'phaser';
import { TileGenerator } from './TileGenerator';
import { Player } from './Player';
import { Plant } from './Plant';
import { Environment } from './Environment';
import { GameState } from './GameState';

export class ForestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ForestScene' });
    this.gameState = new GameState();
    this.environment = new Environment();
    this.tileGenerator = new TileGenerator();
    this.player = null;
    this.plants = [];
    this.tiles = [];
    this.cursors = null;
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

  create() {
    // Create tile map
    this.createTileMap();
    
    // Create player
    this.player = new Player(this, 496, 496); // Center of 62x62 grid
    
    // Setup input
    this.setupInput();
    
    // Setup camera
    this.cameras.main.setBounds(0, 0, 992, 992);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    
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
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    
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
    // Handle player movement
    if (this.player) {
      this.player.update(this.cursors, this.wasd);
    }
    
    // Update plants
    this.plants.forEach(plant => {
      plant.update(delta);
    });
  }
} 