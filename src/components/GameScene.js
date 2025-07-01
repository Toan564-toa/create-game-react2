import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ForestScene } from '../game/ForestScene';
import './GameScene.css';

const GameScene = ({ gameData, updateGameData, onPause, isPaused = false, onToolChange }) => {
  const gameRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    if (!gameInstanceRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 800, // Smaller viewport for better pan experience
        height: 600, // Smaller viewport for better pan experience
        backgroundColor: '#2c5530',
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: ForestScene
      };

      gameInstanceRef.current = new Phaser.Game(config);
      
      // Pass game data and callbacks to the scene
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      if (scene) {
        scene.setGameData(gameData);
        scene.setUpdateCallback(updateGameData);
        scene.setPauseCallback(onPause);
      }
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      if (scene) {
        scene.setGameData(gameData);
        scene.setUpdateCallback(updateGameData);
        scene.setPauseCallback(onPause);
        
        if (isPaused) {
          scene.scene.pause();
        } else {
          scene.scene.resume();
        }
      }
    }
  }, [gameData, updateGameData, onPause, isPaused]);

  // Hàm public để đổi tool từ bên ngoài
  const setTool = (tool) => {
    if (gameInstanceRef.current) {
      const scene = gameInstanceRef.current.scene.getScene('ForestScene');
      if (scene && scene.setTool) {
        scene.setTool(tool);
      }
    }
  };

  // Đăng ký callback đổi tool nếu có
  React.useEffect(() => {
    if (onToolChange) {
      onToolChange(setTool);
    }
  }, [onToolChange]);

  return (
    <div className="game-scene">
      <div ref={gameRef} className="phaser-container" />
      
      {/* Camera Controls Indicator */}
      <div className="camera-controls">
        <h4>🎮 Camera Controls</h4>
        <ul>
          <li>🖱️ Middle click + drag: Pan</li>
          <li>⌨️ Space + left click: Pan</li>
          <li>🖱️ Mouse wheel: Zoom</li>
          <li>⬅️➡️⬆️⬇️ Arrow keys: Move</li>
          <li>🏠 Home: Reset view</li>
        </ul>
      </div>
      
      {/* Pan Indicator */}
      <div className="pan-indicator" id="panIndicator">
        🖱️ Panning mode active
      </div>
    </div>
  );
};

export default GameScene; 