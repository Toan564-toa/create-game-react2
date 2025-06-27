export class TileGenerator {
  constructor() {
    this.tileTypes = {
      dirt: {
        type: 'dirt',
        color: 0x8B4513,
        plantable: true
      },
      grass: {
        type: 'grass',
        color: 0x228B22,
        plantable: false
      },
      stone: {
        type: 'stone',
        color: 0x696969,
        plantable: false
      },
      water: {
        type: 'water',
        color: 0x4169E1,
        plantable: false
      }
    };
  }

  getTileType(x, y) {
    // Create a simple pattern for the map
    // Center area is mostly dirt for planting
    // Edges have grass and stone
    // Some water patches
    
    const centerX = 31;
    const centerY = 31;
    const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    // Use noise-like function for natural looking patterns
    const noise = this.simpleNoise(x, y);
    
    if (distanceFromCenter < 15) {
      // Center area - mostly dirt
      if (noise > 0.8) {
        return this.tileTypes.grass;
      } else if (noise > 0.6) {
        return this.tileTypes.stone;
      } else {
        return this.tileTypes.dirt;
      }
    } else if (distanceFromCenter < 25) {
      // Middle area - mix of grass and dirt
      if (noise > 0.7) {
        return this.tileTypes.grass;
      } else if (noise > 0.4) {
        return this.tileTypes.dirt;
      } else {
        return this.tileTypes.stone;
      }
    } else {
      // Outer area - mostly grass and stone
      if (noise > 0.6) {
        return this.tileTypes.grass;
      } else if (noise > 0.3) {
        return this.tileTypes.stone;
      } else {
        return this.tileTypes.dirt;
      }
    }
  }

  simpleNoise(x, y) {
    // Simple pseudo-random noise function
    const seed = x * 73856093 ^ y * 19349663;
    return (Math.sin(seed) + 1) / 2;
  }
} 