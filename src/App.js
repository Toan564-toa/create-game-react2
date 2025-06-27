import React, { useState } from 'react';
import GameScene from './components/GameScene';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused'
  const [gameData, setGameData] = useState({
    carbonCredits: 0,
    energyOrbs: 100,
    currentArea: 'Forest Valley',
    co2Absorbed: 0,
    co2Target: 1000,
    areaHealth: 100
  });

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
          />
          <HUD 
            gameData={gameData}
            onPause={pauseGame}
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
          />
          <HUD 
            gameData={gameData}
            onPause={pauseGame}
          />
          <div className="pause-overlay">
            <div className="pause-menu">
              <h2>Game Paused</h2>
              <button onClick={resumeGame}>Resume</button>
              <button onClick={returnToMenu}>Main Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 