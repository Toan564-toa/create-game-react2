export class Plant {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    
    // Plant properties
    this.maxGrowthTime = 60; // seconds
    this.currentGrowth = 0;
    this.carbonRate = 10; // CO2 absorbed per tick
    this.growthStage = 0; // 0: seed, 1: sprout, 2: young, 3: mature
    this.harvested = false;
    
    // Environmental factors
    this.watered = false;
    this.fertilized = false;
    this.health = 100;
    
    // Create plant sprite
    this.sprite = scene.add.rectangle(x, y, 8, 8, 0x8B4513); // Brown seed
    this.sprite.setStrokeStyle(1, 0x000000);
    
    // Growth animation
    this.growthTween = null;
  }

  grow(environment) {
    if (this.harvested) return 0;
    
    // Calculate growth factor based on environment
    const tempFactor = this.getTemperatureFactor(environment.temperature);
    const humidityFactor = this.getHumidityFactor(environment.humidity);
    const pHFactor = this.getPHFactor(environment.pH);
    
    // Base growth increment
    let growthIncrement = 1 / this.maxGrowthTime;
    
    // Apply environmental factors
    growthIncrement *= tempFactor * humidityFactor * pHFactor;
    
    // Apply care factors
    if (this.watered) growthIncrement *= 1.5;
    if (this.fertilized) growthIncrement *= 1.3;
    
    // Update growth
    this.currentGrowth += growthIncrement;
    
    // Update growth stage
    this.updateGrowthStage();
    
    // Calculate carbon absorbed
    const carbonAbsorbed = this.carbonRate * growthIncrement;
    
    return carbonAbsorbed;
  }

  updateGrowthStage() {
    const growthPercentage = this.currentGrowth / this.maxGrowthTime;
    
    if (growthPercentage >= 1.0 && this.growthStage < 3) {
      this.growthStage = 3; // Mature
      this.updateSprite();
    } else if (growthPercentage >= 0.6 && this.growthStage < 2) {
      this.growthStage = 2; // Young
      this.updateSprite();
    } else if (growthPercentage >= 0.2 && this.growthStage < 1) {
      this.growthStage = 1; // Sprout
      this.updateSprite();
    }
  }

  updateSprite() {
    // Update sprite appearance based on growth stage
    switch (this.growthStage) {
      case 0: // Seed
        this.sprite.setFillStyle(0x8B4513);
        this.sprite.setSize(8, 8);
        break;
      case 1: // Sprout
        this.sprite.setFillStyle(0x90EE90);
        this.sprite.setSize(10, 10);
        break;
      case 2: // Young
        this.sprite.setFillStyle(0x32CD32);
        this.sprite.setSize(12, 12);
        break;
      case 3: // Mature
        this.sprite.setFillStyle(0x228B22);
        this.sprite.setSize(14, 14);
        break;
    }
  }

  water() {
    this.watered = true;
    this.health = Math.min(100, this.health + 20);
    
    // Visual feedback
    const originalColor = this.sprite.fillColor;
    this.sprite.setFillStyle(0x4169E1);
    this.scene.time.delayedCall(500, () => {
      this.sprite.setFillStyle(originalColor);
    });
  }

  fertilize() {
    this.fertilized = true;
    this.health = Math.min(100, this.health + 30);
    
    // Visual feedback
    const originalColor = this.sprite.fillColor;
    this.sprite.setFillStyle(0xFFD700);
    this.scene.time.delayedCall(500, () => {
      this.sprite.setFillStyle(originalColor);
    });
  }

  harvest() {
    this.harvested = true;
    
    // Visual feedback
    this.sprite.setFillStyle(0xFFD700);
    this.scene.time.delayedCall(1000, () => {
      this.sprite.destroy();
    });
  }

  isMature() {
    return this.growthStage >= 3;
  }

  getTemperatureFactor(temperature) {
    // Optimal temperature range: 15-30°C
    if (temperature >= 15 && temperature <= 30) {
      return 1.0;
    } else if (temperature >= 10 && temperature <= 35) {
      return 0.7;
    } else {
      return 0.3;
    }
  }

  getHumidityFactor(humidity) {
    // Optimal humidity range: 40-80%
    if (humidity >= 40 && humidity <= 80) {
      return 1.0;
    } else if (humidity >= 20 && humidity <= 90) {
      return 0.8;
    } else {
      return 0.5;
    }
  }

  getPHFactor(pH) {
    // Optimal pH range: 6.0-7.5
    if (pH >= 6.0 && pH <= 7.5) {
      return 1.0;
    } else if (pH >= 5.5 && pH <= 8.0) {
      return 0.8;
    } else {
      return 0.4;
    }
  }

  update(delta) {
    // Reset care effects over time
    if (this.watered && Math.random() < 0.001) {
      this.watered = false;
    }
    
    if (this.fertilized && Math.random() < 0.0005) {
      this.fertilized = false;
    }
  }
} 