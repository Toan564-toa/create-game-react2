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

  preload() {
    this.load.image('Sapling', 'assetGame/Sapling.png');
    this.load.image('GrowingTree', 'assetGame/GrowingTree.png');
    this.load.image('Trees', 'assetGame/Trees.png');
    this.load.image('DeadTree', 'assetGame/DeadTree.png');
    this.load.image('TreeRoot', 'assetGame/TreeRoot.png');
    this.load.image('Rock', 'assetGame/Rock.png');
    this.load.image('Wheatfield', 'assetGame/Wheatfield.jpg');
    this.load.image('1WaterCell', 'assetGame/1WaterCell.png');
  }

  create() {
    // Luôn dùng tileSize = 16 để khớp asset
    const mapTiles = 62;
    const tileSize = 16;
    this.tileSize = tileSize;
    this.createTileMap();
    this.setupInput();
    this.startGameLoop();
    this.sendEnvironmentData();
  }

  createTileMap() {
    // Generate 62x62 tile grid với tileSize cố định 16
    const mapTiles = 62;
    const tileSize = 16;
    for (let x = 0; x < mapTiles; x++) {
      this.tiles[x] = [];
      for (let y = 0; y < mapTiles; y++) {
        const tileX = x * tileSize;
        const tileY = y * tileSize;
        const tileType = this.tileGenerator.getTileType(x, y);
        let tileSpriteKey = tileType.type === 'dirt' ? 'Wheatfield' : '1WaterCell';
        const tile = this.add.image(tileX + tileSize/2, tileY + tileSize/2, tileSpriteKey);
        tile.setDisplaySize(16, 16);
        tile.setDepth(0);
        tile.tileData = {
          x: x,
          y: y,
          type: tileType.type,
          plant: null,
          watered: false,
          fertilized: false
        };
        this.tiles[x][y] = tile;
        // Nếu là Forest (hasTree) thì tạo cây trưởng thành (Trees)
        if (tileType.type === 'dirt' && tileType.hasTree) {
          const plant = new Plant(this, tileX + tileSize/2, tileY + tileSize/2, 'trees');
          plant.stage = 'mature';
          plant.setSpriteByStage();
          tile.tileData.plant = plant;
          this.plants.push(plant);
        }
      }
    }
    // Căn giữa map trên màn hình
    const mapWidth = mapTiles * tileSize;
    const mapHeight = mapTiles * tileSize;
    const offsetX = (this.sys.game.config.width - mapWidth) / 2;
    const offsetY = (this.sys.game.config.height - mapHeight) / 2;
    this.children.list.forEach(obj => {
      if (obj instanceof Phaser.GameObjects.Image) {
        obj.x += offsetX;
        obj.y += offsetY;
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
    // Lấy vị trí chuột theo tileSize động
    const rect = this.sys.game.canvas.getBoundingClientRect();
    const mouseX = pointer.x - rect.left;
    const mouseY = pointer.y - rect.top;
    const tileSize = this.tileSize || 16;
    const mapTiles = 62;
    const mapWidth = mapTiles * tileSize;
    const mapHeight = mapTiles * tileSize;
    const offsetX = (this.sys.game.config.width - mapWidth) / 2;
    const offsetY = (this.sys.game.config.height - mapHeight) / 2;
    const tileX = Math.floor((mouseX - offsetX) / tileSize);
    const tileY = Math.floor((mouseY - offsetY) / tileSize);
    if (tileX >= 0 && tileX < mapTiles && tileY >= 0 && tileY < mapTiles) {
      const tile = this.tiles[tileX][tileY];
      // Nếu là DeadTree hoặc TreeRoot thì chặt luôn
      if (tile.tileData.plant && tile.tileData.plant.stage === 'dead') {
        // Nếu là DeadTree, chuyển thành TreeRoot
        if (tile.tileData.plant.status === 'deadtree') {
          tile.tileData.plant.setTreeRoot();
        } else if (tile.tileData.plant.status === 'treeroot') {
          // Nếu là TreeRoot, chặt lần nữa thì xóa
          tile.tileData.plant.destroy();
          tile.tileData.plant = null;
        }
        return;
      }
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
    // Chỉ cho phép trồng trên Wheatfield (dirt) trống
    if (tile.tileData.type === 'dirt' && !tile.tileData.plant && this.gameData.energyOrbs >= 10) {
      const plant = new Plant(this, tileX * this.tileSize + this.tileSize/2, tileY * this.tileSize + this.tileSize/2, 'sapling');
      tile.tileData.plant = plant;
      this.plants.push(plant);
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