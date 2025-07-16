export class TileGenerator {
  constructor() {
    this.tileTypes = {
      dirt: {
        type: 'dirt', // Wheatfield
        color: 0xE2C275, // màu vàng nhạt giống lúa mì
        plantable: true
      },
      water: {
        type: 'water', // 1WaterCell
        color: 0x4169E1,
        plantable: false
      }
    };
  }

  getTileType(x, y) {
    // Chỉ tạo hai loại nền: Wheatfield (dirt) ở trung tâm, water ở ngoài rìa
    const centerX = 31;
    const centerY = 31;
    const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (distanceFromCenter < 25) {
      return this.tileTypes.dirt; // Wheatfield
    } else {
      return this.tileTypes.water; // 1WaterCell
    }
  }

  simpleNoise(x, y) {
    // Simple pseudo-random noise function
    const seed = x * 73856093 ^ y * 19349663;
    return (Math.sin(seed) + 1) / 2;
  }
} 