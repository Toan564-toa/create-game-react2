import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ForestScene } from '../game/ForestScene';
import './GameScene.css';

const GameScene = ({ gameData, updateGameData, onPause, isPaused = false }) => {
  const gameRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    if (!gameInstanceRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 992, // 62 tiles * 16px
        height: 992, // 62 tiles * 16px
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
          scene.pause();
        } else {
          scene.resume();
        }
      }
    }
  }, [gameData, updateGameData, onPause, isPaused]);

  return (
    <div className="game-scene">
      <div ref={gameRef} className="phaser-container" />
    </div>
  );
};

export default GameScene; 