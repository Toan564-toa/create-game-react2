import React, { useState, useEffect } from 'react';
import './HUD.css';

const HUD = ({ gameData, onPause }) => {
  const [environmentData, setEnvironmentData] = useState({
    temperature: 22,
    humidity: 65,
    pH: 6.5,
    airQuality: 'Good'
  });

  const healthPercentage = (gameData.areaHealth / 100) * 100;
  
  // Listen for environment updates from game
  useEffect(() => {
    const handleEnvironmentUpdate = (event) => {
      if (event.detail && event.detail.environment) {
        setEnvironmentData(event.detail.environment);
      }
    };

    window.addEventListener('environmentUpdate', handleEnvironmentUpdate);
    return () => {
      window.removeEventListener('environmentUpdate', handleEnvironmentUpdate);
    };
  }, []);
  
  return (
    <div className="hud">
      {/* Top HUD */}
      <div className="hud-top">
        <div className="hud-section">
          <div className="hud-label">🌍 Area Health</div>
          <div className="health-bar">
            <div 
              className="health-fill" 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
          <div className="hud-value">{Math.round(gameData.areaHealth)}%</div>
        </div>
        
        <div className="hud-section">
          <div className="hud-label">🌱 CO₂ Absorbed</div>
          <div className="hud-value">{Math.round(gameData.co2Absorbed)} / {gameData.co2Target}</div>
        </div>
        
        <div className="hud-section">
          <div className="hud-label">💎 Energy Orbs</div>
          <div className="hud-value">{gameData.energyOrbs}</div>
        </div>
        
        <div className="hud-section">
          <div className="hud-label">🌲 Carbon Credits</div>
          <div className="hud-value">{gameData.carbonCredits}</div>
        </div>
      </div>
      
      {/* Bottom HUD - Tools */}
      <div className="hud-bottom">
        <div className="tool-panel">
          <div className="tool-item active">
            <div className="tool-icon">🌱</div>
            <div className="tool-label">Plant (1)</div>
          </div>
          <div className="tool-item">
            <div className="tool-icon">💧</div>
            <div className="tool-label">Water (2)</div>
          </div>
          <div className="tool-item">
            <div className="tool-icon">🌿</div>
            <div className="tool-label">Fertilize (3)</div>
          </div>
          <div className="tool-item">
            <div className="tool-icon">⚔️</div>
            <div className="tool-label">Attack</div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="action-btn" onClick={onPause}>
            ⏸️ Pause (ESC)
          </button>
        </div>
      </div>
      
      {/* Environment Panel */}
      <div className="environment-panel">
        <div className="env-title">Environment</div>
        <div className="env-stats">
          <div className="env-stat">
            <span className="env-label">🌡️ Temp:</span>
            <span className="env-value">{environmentData.temperature.toFixed(1)}°C</span>
          </div>
          <div className="env-stat">
            <span className="env-label">💧 Humidity:</span>
            <span className="env-value">{environmentData.humidity.toFixed(0)}%</span>
          </div>
          <div className="env-stat">
            <span className="env-label">🧪 pH:</span>
            <span className="env-value">{environmentData.pH.toFixed(1)}</span>
          </div>
          <div className="env-stat">
            <span className="env-label">☁️ Air Quality:</span>
            <span className="env-value">{environmentData.airQuality}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD; 