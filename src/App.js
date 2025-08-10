import React, { useState } from 'react';
import GameScene from './components/GameScene';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import { CarbonCreditCalculator } from './game/CarbonCreditCalculator';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused'
  const [gameData, setGameData] = useState(() => ({
    carbonCredits: 0,
    energyOrbs: 100,
    currentArea: 'Forest Valley',
    co2Absorbed: 0,
    co2Target: 1000,
    areaHealth: 100,
    // Thêm các trường mới
    carbonCreditsHistory: [],
    totalInvestment: 0,
    carbonPriceHistory: [],
    lastCalculationTime: Date.now()
  }));
  const [tool, setTool] = useState('plant');
  const [treeStats, setTreeStats] = useState({ total: 0, alive: 0, mature: 0 }); // ✅ thêm state cây
  const gameToolSetter = React.useRef(null);

  const startGame = () => {
    setGameState('playing');
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  const updateGameData = (newData) => {
    setGameData(prev => ({ ...prev, ...newData }));
  };

  // Khi đổi tool từ HUD, cập nhật state và gọi setTool trên GameScene
  const handleToolChange = (newTool) => {
    console.log("App: Tool changed to", newTool); // <== Thêm dòng này

    setTool(newTool);
    if (gameToolSetter.current) {
      gameToolSetter.current(newTool);
    }
  };

  const handleTreeStatsChange = (stats) => {
    setTreeStats(stats); // ✅ cập nhật số cây
  };

const calculateCarbonCredits = (plants, environment, treeStats) => {
  const calculator = new CarbonCreditCalculator();
  const currentTime = Date.now();
  const timeElapsed = (currentTime - gameData.lastCalculationTime) / 1000; // Giây
  
  // Tính tín chỉ mới
  const newCredits = calculator.calculateRealTimeCredits(plants, environment, timeElapsed);
  
  // Cập nhật game data
  const updatedData = {
    carbonCredits: gameData.carbonCredits + newCredits,
    lastCalculationTime: currentTime,
    carbonCreditsHistory: [...gameData.carbonCreditsHistory, {
      timestamp: currentTime,
      credits: newCredits,
      total: gameData.carbonCredits + newCredits
    }]
  };
  
  updateGameData(updatedData);
};

  return (
    <div className="App">
      {gameState === 'menu' && (
        <MainMenu onStartGame={startGame} />
      )}
      
      {gameState === 'playing' && (
        <div className="game-container">
          <GameScene 
            gameData={gameData}
            updateGameData={updateGameData}
            onPause={pauseGame}
            onToolChange={fn => { gameToolSetter.current = fn; }}
            onTreeStatsChange={handleTreeStatsChange} // ✅ truyền xuống GameScene
          />
          <HUD 
            gameData={gameData}
            onPause={pauseGame}
            tool={tool}
            onToolChange={handleToolChange}
            treeStats={treeStats} // ✅ truyền xuống HUD
          />
        </div>
      )}
      
      {gameState === 'paused' && (
        <div className="game-container">
          <GameScene 
            gameData={gameData}
            updateGameData={updateGameData}
            onPause={pauseGame}
            isPaused={true}
            onToolChange={fn => { gameToolSetter.current = fn; }}
            onTreeStatsChange={handleTreeStatsChange} // ✅ truyền xuống GameScene
          />
          <HUD 
            gameData={gameData}
            onPause={pauseGame}
            tool={tool}
            onToolChange={handleToolChange}
            treeStats={treeStats} // ✅ truyền xuống HUD
          />
          <div className="pause-overlay">
            <div className="pause-menu">
              <h2>Tạm dừng</h2>
              <button onClick={resumeGame}>Tiếp tục</button>
              <button onClick={returnToMenu}>Quay về menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 