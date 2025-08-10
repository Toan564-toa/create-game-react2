export class CarbonCreditCalculator {
    constructor() {
      // Hệ số chuyển đổi CO2 thành tín chỉ cacbon
      this.co2ToCreditRatio = 1; // 1 tấn CO2 = 1 tín chỉ cacbon
      
      // Hệ số chất lượng môi trường
      this.environmentQualityMultiplier = {
        excellent: 1.2,  // Chất lượng môi trường xuất sắc: +20%
        good: 1.0,       // Tốt: +0%
        moderate: 0.8,   // Trung bình: -20%
        poor: 0.6,       // Kém: -40%
        hazardous: 0.4   // Nguy hiểm: -60%
      };
      
      // Hệ số loại cây
      this.treeTypeMultiplier = {
        sapling: 0.3,    // Cây non: 30% hiệu quả
        young: 0.7,      // Cây trẻ: 70% hiệu quả
        mature: 1.0      // Cây trưởng thành: 100% hiệu quả
      };
    }
  
    // Tính tín chỉ cacbon dựa trên CO2 hấp thụ và chất lượng môi trường
    calculateCarbonCredits(co2Absorbed, environmentQuality, treeStats) {
      // Tính toán cơ bản
      let baseCredits = co2Absorbed * this.co2ToCreditRatio;
      
      // Áp dụng hệ số chất lượng môi trường
      const qualityMultiplier = this.environmentQualityMultiplier[environmentQuality] || 1.0;
      baseCredits *= qualityMultiplier;
      
      // Áp dụng hệ số loại cây
      const treeQualityMultiplier = this.calculateTreeQualityMultiplier(treeStats);
      baseCredits *= treeQualityMultiplier;
      
      // Làm tròn đến 2 chữ số thập phân
      return Math.round(baseCredits * 100) / 100;
    }
  
    // Tính hệ số chất lượng cây dựa trên tỷ lệ cây trưởng thành
    calculateTreeQualityMultiplier(treeStats) {
      if (!treeStats.total || treeStats.total === 0) return 0.5;
      
      const matureRatio = treeStats.mature / treeStats.total;
      
      if (matureRatio >= 0.7) return 1.2;      // 70%+ cây trưởng thành: +20%
      if (matureRatio >= 0.5) return 1.0;      // 50%+ cây trưởng thành: +0%
      if (matureRatio >= 0.3) return 0.8;      // 30%+ cây trưởng thành: -20%
      return 0.6;                               // Dưới 30%: -40%
    }
  
    // Tính toán tín chỉ cacbon theo thời gian thực
    calculateRealTimeCredits(plants, environment, timeElapsed) {
      let totalCredits = 0;
      
      plants.forEach(plant => {
        if (plant.stage === 'dead') return;
        
        // Tính CO2 hấp thụ theo thời gian
        const co2Absorbed = plant.carbonRate * (timeElapsed / 3600); // Chuyển giây thành giờ
        
        // Áp dụng các hệ số
        const qualityMultiplier = this.environmentQualityMultiplier[environment.airQuality] || 1.0;
        const treeMultiplier = this.treeTypeMultiplier[plant.stage] || 0.5;
        
        const plantCredits = co2Absorbed * qualityMultiplier * treeMultiplier;
        totalCredits += plantCredits;
      });
      
      return Math.round(totalCredits * 100) / 100;
    }
  
    // Tính toán hiệu quả đầu tư (ROI) của tín chỉ cacbon
    calculateROI(initialInvestment, carbonCredits, timeElapsed) {
      const currentValue = carbonCredits * this.getCurrentCarbonPrice();
      const roi = ((currentValue - initialInvestment) / initialInvestment) * 100;
      return Math.round(roi * 100) / 100;
    }
  
    // Giá tín chỉ cacbon hiện tại (có thể thay đổi theo thời gian)
    getCurrentCarbonPrice() {
      // Giá cơ bản: $50/tín chỉ
      const basePrice = 50;
      
      // Thêm biến động giá theo thời gian
      const timeVariation = Math.sin(Date.now() / (1000 * 60 * 60 * 24)) * 10; // Biến động theo ngày
      
      return basePrice + timeVariation;
    }
  }