import React from 'react';
import './MainMenu.css';

const MainMenu = ({ onStartGame }) => {
  return (
    <div className="main-menu">
      <div className="menu-content">
        <h1 className="game-title">🌲 Forest Guardian 🌲</h1>
        <p className="game-subtitle">Protect the environment, one tree at a time</p>
        
        <div className="menu-buttons">
          <button className="menu-button primary" onClick={onStartGame}>
            🎮 Start Game
          </button>
          <button className="menu-button">
            📊 Statistics
          </button>
          <button className="menu-button">
            ⚙️ Settings
          </button>
          <button className="menu-button">
            ❓ Help
          </button>
        </div>
        
        <div className="game-info">
          <h3>How to Play:</h3>
          <ul>
            <li>🌱 Plant trees to absorb CO₂</li>
            <li>💧 Water and fertilize your plants</li>
            <li>⚔️ Fight pollution beasts</li>
            <li>🌍 Restore the ecosystem</li>
          </ul>
        </div>
        
        <div className="controls-info">
          <h3>Controls:</h3>
          <p>WASD - Move | Mouse - Plant/Interact | ESC - Pause</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu; 