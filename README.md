# 🌲 Forest Guardian

Một game 2D pixel action platformer kết hợp mô phỏng nông trại và giáo dục môi trường, được xây dựng với React và Phaser 3.

## 🎮 Mô tả Game

Trong Forest Guardian, bạn sẽ đóng vai "Forest Guardian" - người bảo vệ rừng, phiêu lưu qua các khu vực bị suy thoái, chiến đấu với quái vật ô nhiễm và trồng cây để phục hồi hệ sinh thái.

### 🌱 Tính năng chính:
- **Trồng và chăm sóc cây**: Trồng cây, tưới nước, bón phân
- **Mô phỏng môi trường**: Nhiệt độ, độ ẩm, pH đất, chất lượng không khí
- **Hệ thống Carbon**: Theo dõi CO₂ hấp thụ và Carbon Credits
- **Bản đồ 62x62 tiles**: Khám phá và phục hồi các khu vực
- **Hệ thống thời gian**: Cây trồng tăng trưởng theo thời gian thực

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống:
- Node.js (version 14 trở lên)
- npm hoặc yarn

### Các bước cài đặt:

1. **Clone hoặc tải project:**
```bash
git clone <repository-url>
cd afforestation-game
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Chạy game:**
```bash
npm start
```

4. **Mở trình duyệt:**
Truy cập `http://localhost:3000` để chơi game.

## 🎯 Cách chơi

### Điều khiển:
- **WASD** hoặc **Arrow Keys**: Di chuyển nhân vật
- **Mouse Click**: Trồng cây, tưới nước, bón phân
- **1, 2, 3**: Chuyển đổi công cụ (Plant, Water, Fertilize)
- **ESC**: Tạm dừng game

### Mục tiêu:
1. **Trồng cây** trên các ô đất (màu nâu)
2. **Tưới nước** và **bón phân** để cây tăng trưởng nhanh
3. **Thu thập Carbon Credits** khi cây trưởng thành
4. **Phục hồi sức khỏe khu vực** bằng cách hấp thụ CO₂

### Hệ thống tài nguyên:
- **Energy Orbs**: Dùng để mua hạt giống (10), tưới nước (5), bón phân (15)
- **Carbon Credits**: Thu được khi cây trưởng thành
- **CO₂ Absorbed**: Lượng CO₂ đã hấp thụ

## 🏗️ Cấu trúc Project

```
src/
├── components/          # React components
│   ├── GameScene.js     # Phaser game container
│   ├── HUD.js          # Game interface
│   └── MainMenu.js     # Main menu
├── game/               # Phaser game logic
│   ├── ForestScene.js  # Main game scene
│   ├── Player.js       # Player character
│   ├── Plant.js        # Plant system
│   ├── Environment.js  # Environmental simulation
│   ├── TileGenerator.js # Map generation
│   └── GameState.js    # Save/load system
└── App.js              # Main React app
```

## 🌍 Hệ thống Môi trường

### Các yếu tố môi trường:
- **Nhiệt độ**: Ảnh hưởng đến tốc độ tăng trưởng cây
- **Độ ẩm**: Tác động đến sức khỏe cây trồng
- **pH đất**: Ảnh hưởng đến khả năng hấp thụ dinh dưỡng
- **Chất lượng không khí**: Phản ánh mức độ ô nhiễm

### Công thức tăng trưởng:
```
GrowthIncrement = (Δt / MaxGrowthTime) × f(T, H, pH)
CarbonSequestered = CarbonRate × GrowthIncrement
```

## 🎨 Assets và Graphics

Hiện tại game sử dụng các hình khối đơn giản (colored rectangles) làm placeholder. Các sprite được tạo bằng code với màu sắc khác nhau để phân biệt:
- **Đất**: Màu nâu (#8B4513)
- **Cỏ**: Màu xanh lá (#228B22)
- **Đá**: Màu xám (#696969)
- **Cây**: Các giai đoạn từ nâu đến xanh đậm
- **Nhân vật**: Màu xanh lá (#00FF00)

## 💾 Lưu trữ

Game tự động lưu tiến độ vào localStorage của trình duyệt. Dữ liệu được lưu bao gồm:
- Carbon Credits
- Energy Orbs
- CO₂ đã hấp thụ
- Sức khỏe khu vực
- Thời gian lưu

## 🔧 Phát triển

### Thêm tính năng mới:
1. Tạo component React mới trong `src/components/`
2. Thêm logic game trong `src/game/`
3. Cập nhật `ForestScene.js` để tích hợp tính năng

### Tùy chỉnh môi trường:
Chỉnh sửa `Environment.js` để thay đổi:
- Chu kỳ nhiệt độ
- Tần suất thời tiết
- Mức độ ô nhiễm

## 📝 License

Project này được tạo cho mục đích giáo dục và demo.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request để cải thiện game.

---

**Forest Guardian** - Bảo vệ môi trường, một cây một lần! 🌱 