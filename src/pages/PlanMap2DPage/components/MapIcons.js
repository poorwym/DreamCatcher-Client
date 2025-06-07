import L from 'leaflet';

/**
 * 创建相机图标
 * @returns {L.DivIcon} Leaflet图标
 */
export const createCameraIcon = () => {
  return L.divIcon({
    html: `<div style="
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" 
              fill="#2c3e50" stroke="#fff" stroke-width="0.5"/>
        <circle cx="12" cy="12" r="4" fill="#34495e" stroke="#fff" stroke-width="0.5"/>
        <circle cx="12" cy="12" r="2.5" fill="#3498db"/>
        <circle cx="12" cy="12" r="1" fill="#fff" opacity="0.8"/>
        <circle cx="17" cy="8" r="1" fill="#e74c3c"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: 'camera-marker-icon'
  });
};

/**
 * 创建太阳图标
 * @param {number} size - 图标大小
 * @returns {L.DivIcon} Leaflet图标
 */
export const createSunIcon = (size = 24) => {
  const gradientId = `sunGradient_${Date.now()}_${Math.random()}`;
  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="filter: drop-shadow(0 0 8px rgba(255,193,7,0.8));">
        <!-- 太阳光芒 -->
        <g stroke="#ffd54f" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="21" y1="12" x2="19" y2="12"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="3" y1="12" x2="5" y2="12"/>
          <line x1="18.36" y1="5.64" x2="16.95" y2="7.05"/>
          <line x1="18.36" y1="18.36" x2="16.95" y2="16.95"/>
          <line x1="5.64" y1="18.36" x2="7.05" y2="16.95"/>
          <line x1="5.64" y1="5.64" x2="7.05" y2="7.05"/>
        </g>
        <!-- 渐变定义 -->
        <defs>
          <radialGradient id="${gradientId}" cx="0.3" cy="0.3">
            <stop offset="0%" stop-color="#fff176"/>
            <stop offset="70%" stop-color="#ffd54f"/>
            <stop offset="100%" stop-color="#ff8f00"/>
          </radialGradient>
        </defs>
        <!-- 太阳主体 -->
        <circle cx="12" cy="12" r="5" fill="url(#${gradientId})" stroke="#ff8f00" stroke-width="1"/>
      </svg>
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255,213,79,0.3) 0%, transparent 70%);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    className: 'sun-marker-icon'
  });
};

/**
 * 创建美观的月亮图标
 * @param {number} moonPhase - 月相值 (0-1)
 * @param {number} size - 图标大小
 * @returns {L.DivIcon} Leaflet图标
 */
export const createBeautifulMoonIcon = (moonPhase, size = 26) => {
  const phasePercent = (typeof moonPhase === 'number' && !isNaN(moonPhase)) ? moonPhase : 0.5;
  
  // 根据月相确定颜色
  let moonColor, glowColor;
  if (phasePercent < 0.25) {
    moonColor = '#a0a0a0'; // 新月/娥眉月 - 较暗
    glowColor = 'rgba(160,160,160,0.8)';
  } else if (phasePercent < 0.75) {
    moonColor = '#e8e8e8'; // 上弦月/盈凸月 - 中等
    glowColor = 'rgba(232,232,232,0.9)';
  } else {
    moonColor = '#f5f5f5'; // 满月/亏凸月 - 明亮
    glowColor = 'rgba(245,245,245,1)';
  }

  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <!-- 外层光晕 -->
      <div style="
        position: absolute;
        width: ${size + 6}px;
        height: ${size + 6}px;
        background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);
        border-radius: 50%;
        top: -3px;
        left: -3px;
        animation: moonGlow 4s ease-in-out infinite;
      "></div>
      
      <!-- 月亮主体 -->
      <div style="
        width: ${size - 4}px;
        height: ${size - 4}px;
        background: linear-gradient(135deg, ${moonColor} 0%, #c0c0c0 50%, #909090 100%);
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 
          inset -2px -2px 4px rgba(0,0,0,0.3),
          inset 2px 2px 4px rgba(255,255,255,0.7),
          0 0 8px rgba(255,255,255,0.5);
        position: relative;
        z-index: 2;
      ">
        <!-- 月亮表面纹理 -->
        <div style="
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          top: 30%;
          left: 40%;
        "></div>
        <div style="
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(0,0,0,0.15);
          border-radius: 50%;
          top: 60%;
          left: 60%;
        "></div>
        <div style="
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(0,0,0,0.1);
          border-radius: 50%;
          top: 45%;
          left: 25%;
        "></div>
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    className: 'moon-marker-beautiful'
  });
};

/**
 * 创建日出标记图标
 * @returns {L.DivIcon} Leaflet图标
 */
export const createSunriseIcon = () => {
  return L.divIcon({
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    ">
      <div style="
        background: linear-gradient(135deg, #ff6b35 0%, #ff8f00 50%, #ffd54f 100%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 15px rgba(255, 107, 53, 0.7);
        position: relative;
      "></div>
      <div style="
        background: rgba(255, 107, 53, 0.9);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        margin-top: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">日出</div>
    </div>`,
    iconSize: [40, 35],
    iconAnchor: [20, 17],
    className: 'sunrise-marker'
  });
};

/**
 * 创建日落标记图标
 * @returns {L.DivIcon} Leaflet图标
 */
export const createSunsetIcon = () => {
  return L.divIcon({
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    ">
      <div style="
        background: linear-gradient(135deg, #ff8f00 0%, #ff6b35 50%, #e74c3c 100%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 15px rgba(255, 143, 0, 0.7);
        position: relative;
      "></div>
      <div style="
        background: rgba(255, 143, 0, 0.9);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        margin-top: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">日落</div>
    </div>`,
    iconSize: [40, 35],
    iconAnchor: [20, 17],
    className: 'sunset-marker'
  });
};

/**
 * 创建月出标记图标
 * @returns {L.DivIcon} Leaflet图标
 */
export const createMoonriseIcon = () => {
  return L.divIcon({
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    ">
      <div style="
        background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 50%, #9e9e9e 100%);
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 12px rgba(224, 224, 224, 0.8);
        position: relative;
      "></div>
      <div style="
        background: rgba(158, 158, 158, 0.9);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        margin-top: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">月出</div>
    </div>`,
    iconSize: [40, 33],
    iconAnchor: [20, 16],
    className: 'moonrise-marker'
  });
};

/**
 * 创建月落标记图标
 * @returns {L.DivIcon} Leaflet图标
 */
export const createMoonsetIcon = () => {
  return L.divIcon({
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    ">
      <div style="
        background: linear-gradient(135deg, #9e9e9e 0%, #757575 50%, #616161 100%);
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 12px rgba(158, 158, 158, 0.8);
        position: relative;
      "></div>
      <div style="
        background: rgba(117, 117, 117, 0.9);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        margin-top: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">月落</div>
    </div>`,
    iconSize: [40, 33],
    iconAnchor: [20, 16],
    className: 'moonset-marker'
  });
}; 