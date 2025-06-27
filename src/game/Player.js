export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.speed = 100;
    
    // Create player sprite (simple colored rectangle for now)
    this.sprite = scene.add.rectangle(x, y, 12, 12, 0x00FF00);
    this.sprite.setStrokeStyle(2, 0x000000);
    
    // Add physics body
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCollideWorldBounds(true);
    
    // Player state
    this.health = 100;
    this.maxHealth = 100;
    this.energy = 100;
    this.maxEnergy = 100;
  }

  update(cursors, wasd) {
    // Reset velocity
    this.sprite.body.setVelocity(0);
    
    // Handle movement
    let velocityX = 0;
    let velocityY = 0;
    
    // Arrow keys or WASD
    if (cursors.left.isDown || wasd.A.isDown) {
      velocityX = -this.speed;
    } else if (cursors.right.isDown || wasd.D.isDown) {
      velocityX = this.speed;
    }
    
    if (cursors.up.isDown || wasd.W.isDown) {
      velocityY = -this.speed;
    } else if (cursors.down.isDown || wasd.S.isDown) {
      velocityY = this.speed;
    }
    
    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }
    
    this.sprite.body.setVelocity(velocityX, velocityY);
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    // Visual feedback
    this.sprite.setTint(0xFF0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  useEnergy(amount) {
    this.energy = Math.max(0, this.energy - amount);
  }

  restoreEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  getPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y
    };
  }
} 