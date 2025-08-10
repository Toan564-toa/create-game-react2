import React, { useState, useEffect } from 'react';
import './HUD.css';

const HUD = ({ gameData, onPause, tool, onToolChange, treeStats = { total: 0, alive: 0, mature: 0 } }) => {
  // Debug: Kiểm tra props
  console.log('HUD Props:', { gameData, onPause, tool, onToolChange, treeStats });
  const [environmentData, setEnvironmentData] = useState({
    temperature: 22,
    humidity: 65,
    pH: 6.5,
    airQuality: 'Good'
  });

  const [currentDay, setCurrentDay] = useState(1);
  const [disasterEvent, setDisasterEvent] = useState(null);
  const [affectedStats, setAffectedStats] = useState([]);
  const [disasterOngoing, setDisasterOngoing] = useState(false);
  const [co2Absorbed, setCo2Absorbed] = useState(1000);

  const healthPercentage = Math.min((co2Absorbed / gameData.co2Target) * 100, 100);

  // Hàm đánh giá chất lượng không khí dựa trên CO2 hấp thụ
  const getAirQualityFromCO2 = (value) => {
    if (value >= 975) return 'Xuất sắc';
    if (value >= 850) return 'Tốt';
    return 'Tệ';
  };

  // Cập nhật chỉ số môi trường khi nhận event từ game
  useEffect(() => {
    const handleEnvironmentUpdate = (event) => {
      if (event.detail?.environment) {
        setEnvironmentData((prev) => ({
          ...event.detail.environment,
          airQuality: getAirQualityFromCO2(co2Absorbed) // Không ép 'Bad' nữa
        }));
      }
    };
    window.addEventListener('environmentUpdate', handleEnvironmentUpdate);
    return () => {
      window.removeEventListener('environmentUpdate', handleEnvironmentUpdate);
    };
  }, [co2Absorbed]);

  // Cập nhật airQuality mỗi khi CO2 thay đổi
  useEffect(() => {
    setEnvironmentData((prev) => ({
      ...prev,
      airQuality: getAirQualityFromCO2(co2Absorbed)
    }));
  }, [co2Absorbed]);

  useEffect(() => {
    const handleDayEvent = (event) => {
      if (event.detail) {
        setCurrentDay(event.detail.day);
        setDisasterEvent(event.detail.event);
        if (event.detail.event) {
          setAffectedStats(['co2', 'health', 'airQuality', 'environment']);
          setDisasterOngoing(true);
        }
      }
    };
    window.addEventListener('dayEvent', handleDayEvent);
    return () => {
      window.removeEventListener('dayEvent', handleDayEvent);
    };
  }, []);

  useEffect(() => {
    const handleDisasterResolved = () => {
      setDisasterEvent(null);
      setAffectedStats([]);
      setDisasterOngoing(false);
    };
    window.addEventListener('disasterResolved', handleDisasterResolved);
    return () => {
      window.removeEventListener('disasterResolved', handleDisasterResolved);
    };
  }, []);

  // Thiên tai làm giảm chỉ số môi trường mỗi giây
  useEffect(() => {
    if (!disasterOngoing) return;
    const interval = setInterval(() => {
      setEnvironmentData((prev) => ({
        temperature: Math.max(prev.temperature - 0.2, 5),
        humidity: Math.max(prev.humidity - 1, 10),
        pH: Math.max(prev.pH - 0.05, 4.5),
        airQuality: getAirQualityFromCO2(co2Absorbed) // Luôn đánh giá lại từ CO2
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [disasterOngoing, co2Absorbed]);

  // Thiên tai làm giảm CO2 hấp thụ mỗi 10s
  useEffect(() => {
    if (!disasterOngoing) return;
    const interval = setInterval(() => {
      setCo2Absorbed((prev) => Math.max(prev - 1, 0));
    }, 10000);
    return () => clearInterval(interval);
  }, [disasterOngoing]);

  // Không có thiên tai → cập nhật CO2 từ game
  useEffect(() => {
    if (!disasterOngoing) {
      setCo2Absorbed(Math.min(gameData.co2Absorbed, 1000));
    }
  }, [gameData, disasterOngoing]);

  // ESC để pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onPause?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPause]);

  const renderAffected = (key, value, suffix = '', isPercent = false) => {
    const isAffected = affectedStats.includes(key);
    return (
      <span className={`hud-value ${isAffected ? 'affected' : ''}`}>
        {Math.round(value)}{suffix} {isAffected ? '↓' : ''}
      </span>
    );
  };

  return (
    <div className="hud">
      <div className="d-flex justify-between items-start">
        <div>
          <div className="hud-section">
            <div className="hud-label">🗓️ Năm</div>
            <div className="hud-value">{currentDay}</div>
            
          </div>
            
          <div className="hud-section">
            <div className="hud-label">🌳 Sức khỏe khu vực</div>
            <div className="health-bar">
              <div className="health-fill" style={{ width: `${healthPercentage}%` }}></div>
            </div>
            {renderAffected('health', healthPercentage, '%', true)}
          </div>

          <div className="hud-section">
            <div className="hud-label">🌱 CO₂ Hấp thụ</div>
            <div className={`hud-value ${affectedStats.includes('co2') ? 'affected' : ''}`}>
              {co2Absorbed.toFixed(0)} / 1000
              {affectedStats.includes('co2') && ' ↓'}
            </div>
          </div>

          <div className="hud-section">
            <div className="hud-label">💎 Năng lượng</div>
            <div className="hud-value">{gameData.energyOrbs}</div>
          </div>
          
          <div className="hud-section">
            <div className="hud-label">🌳 Tổng số cây sống</div>
            <div className="hud-value">
              {treeStats.alive || 0}
              <div className="tree-details">
                <small>Trưởng thành: {treeStats.mature || 0}</small>
              </div>
            </div>
          </div>


          <div className="hud-section">
            <div className="hud-label">🌲 Tín chỉ Carbon</div>
            <div className="hud-value">
              {gameData.carbonCredits.toFixed(2)}
              {/* <div className="carbon-credit-details">
                <small>Giá: ${(gameData.carbonCredits * 50).toFixed(2)}</small>
                <small>ROI: {gameData.totalInvestment > 0 ? 
                  (((gameData.carbonCredits * 50 - gameData.totalInvestment) / gameData.totalInvestment) * 100).toFixed(1) : 0}%</small>
              </div> */}
            </div>
          </div>

          {disasterEvent && (
            <div className="hud-section2 disaster-event">
              <div className="hud-label">⚠️ Thảm họa!</div>
              <div className="hud-value">
                {disasterEvent === 'storm' && 'Một cơn bão đã phá hủy một số cây!'}
                {disasterEvent === 'heatwave' && 'Một đợt nắng nóng đã đốt cháy một số cây!'}
              </div>
            </div>
          )}
        </div>

        <div className="hud-section env-section">
          <div className="env-title">Environment</div>
          <div className="env-stats">
            <div className="env-stat">
              <span className="env-label">🌡️ Nhiệt độ:</span>
              <span className={`env-value ${disasterOngoing ? 'affected' : ''}`}>
                {environmentData.temperature.toFixed(1)}°C {disasterOngoing && '↓'}
              </span>
            </div>
            <div className="env-stat">
              <span className="env-label">💧 Độ ẩm:</span>
              <span className={`env-value ${disasterOngoing ? 'affected' : ''}`}>
                {environmentData.humidity.toFixed(0)}% {disasterOngoing && '↓'}
              </span>
            </div>
            <div className="env-stat">
              <span className="env-label">🧪 Độ pH:</span>
              <span className={`env-value ${disasterOngoing ? 'affected' : ''}`}>
                {environmentData.pH.toFixed(1)} {disasterOngoing && '↓'}
              </span>
            </div>
            <div className="env-stat">
              <span className="env-label">☁️ Chất lượng không khí:</span>
              <span className={`env-value ${affectedStats.includes('airQuality') ? 'affected' : ''}`}>
                {environmentData.airQuality} {affectedStats.includes('airQuality') && '↓'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="tool-panel">
          <div 
            className={`tool-item${tool === 'plant' ? ' active' : ''}`} 
            onClick={() => {
              console.log('HUD: Clicked plant tool');  // ✅ LOG 1
              onToolChange?.('plant');
            }}
          >
            <div className="tool-icon">🌱</div>
            <div className="tool-label">Trồng cây (1)</div>
          </div>

          <div className={`tool-item${tool === 'water' ? ' active' : ''}`} onClick={() => onToolChange?.('water')}>
            <div className="tool-icon">💧</div>
            <div className="tool-label">Tưới nước (2)</div>
          </div>
          <div className={`tool-item${tool === 'fertilize' ? ' active' : ''}`} onClick={() => onToolChange?.('fertilize')}>
            <div className="tool-icon">🌿</div>
            <div className="tool-label">Bón phân (3)</div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn" onClick={onPause}>
            ⏸️ Tạm dừng (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default HUD;
