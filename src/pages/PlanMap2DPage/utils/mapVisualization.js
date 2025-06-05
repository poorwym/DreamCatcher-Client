import L from 'leaflet';
import SunCalc from 'suncalc';
import { calculateMarkerPosition } from './mapUtils';
import { 
  createSunIcon, 
  createBeautifulMoonIcon, 
  createSunriseIcon, 
  createSunsetIcon,
  createMoonriseIcon,
  createMoonsetIcon 
} from '../components/MapIcons';

/**
 * 创建太阳可视化
 * @param {Date} date - 日期
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {Object} mapRef - 地图引用
 * @param {Object} refs - 各种标记的引用对象
 */
export const createSunVisualization = (date, latitude, longitude, mapRef, refs) => {
  if (!mapRef.current) return;

  const { 
    sunPathRef, 
    sunRaysRef, 
    sunriseMarkerRef, 
    sunsetMarkerRef, 
    sunMarkerRef 
  } = refs;

  // 清除之前的太阳可视化
  if (sunPathRef.current) {
    mapRef.current.removeLayer(sunPathRef.current);
  }
  if (sunRaysRef.current) {
    mapRef.current.removeLayer(sunRaysRef.current);
  }
  if (sunriseMarkerRef.current) {
    mapRef.current.removeLayer(sunriseMarkerRef.current);
  }
  if (sunsetMarkerRef.current) {
    mapRef.current.removeLayer(sunsetMarkerRef.current);
  }

  // 计算日出日落时间和位置
  const sunTimes = SunCalc.getTimes(date, latitude, longitude);
  const sunrisePos = SunCalc.getPosition(sunTimes.sunrise, latitude, longitude);
  const sunsetPos = SunCalc.getPosition(sunTimes.sunset, latitude, longitude);

  // 计算日出日落的方位角（转换为度并调整）
  const sunriseAzimuth = (sunrisePos.azimuth * 180 / Math.PI) + 180;
  const sunsetAzimuth = (sunsetPos.azimuth * 180 / Math.PI) + 180;

  // 计算日出日落在地图上的位置
  const markDistance = 0.012; // 标记距离相机的距离
  
  // 日出位置
  const [sunriseLat, sunriseLng] = calculateMarkerPosition(
    latitude, longitude, sunriseAzimuth, markDistance, 'sunrise', mapRef
  );

  // 日落位置
  const [sunsetLat, sunsetLng] = calculateMarkerPosition(
    latitude, longitude, sunsetAzimuth, markDistance, 'sunset', mapRef
  );

  // 创建日出标记
  const sunriseIcon = createSunriseIcon();
  sunriseMarkerRef.current = L.marker([sunriseLat, sunriseLng], {
    icon: sunriseIcon,
    zIndexOffset: 900
  }).addTo(mapRef.current);

  // 创建日落标记
  const sunsetIcon = createSunsetIcon();
  sunsetMarkerRef.current = L.marker([sunsetLat, sunsetLng], {
    icon: sunsetIcon,
    zIndexOffset: 900
  }).addTo(mapRef.current);

  // 绑定日出日落信息弹窗
  const sunriseContent = `
    <div style="text-align: center; min-width: 180px;">
      <h4 style="margin: 0 0 8px 0; color: #ff6b35;">🌅 日出</h4>
      <div style="margin: 4px 0;"><strong>时间:</strong> ${sunTimes.sunrise.toLocaleTimeString()}</div>
      <div style="margin: 4px 0;"><strong>方位角:</strong> ${sunriseAzimuth.toFixed(1)}°</div>
      <div style="margin: 4px 0; font-size: 12px; color: #666;">太阳从这个方向升起</div>
    </div>
  `;

  const sunsetContent = `
    <div style="text-align: center; min-width: 180px;">
      <h4 style="margin: 0 0 8px 0; color: #ff8f00;">🌇 日落</h4>
      <div style="margin: 4px 0;"><strong>时间:</strong> ${sunTimes.sunset.toLocaleTimeString()}</div>
      <div style="margin: 4px 0;"><strong>方位角:</strong> ${sunsetAzimuth.toFixed(1)}°</div>
      <div style="margin: 4px 0; font-size: 12px; color: #666;">太阳在这个方向落下</div>
    </div>
  `;

  sunriseMarkerRef.current.bindPopup(sunriseContent, {
    offset: [0, -17],
    className: 'sunrise-popup'
  });

  sunsetMarkerRef.current.bindPopup(sunsetContent, {
    offset: [0, -17],
    className: 'sunset-popup'
  });

  // 计算全天的太阳轨迹
  const sunPath = [];
  
  // 从日出前1小时到日落后1小时，每15分钟计算一次位置
  const startTime = new Date(sunTimes.sunrise.getTime() - 60 * 60 * 1000); // 日出前1小时
  const endTime = new Date(sunTimes.sunset.getTime() + 60 * 60 * 1000);   // 日落后1小时
  
  for (let time = startTime; time <= endTime; time = new Date(time.getTime() + 15 * 60 * 1000)) {
    const sunPos = SunCalc.getPosition(time, latitude, longitude);
    const altitude = sunPos.altitude * 180 / Math.PI; // 转换为度
    const azimuth = sunPos.azimuth * 180 / Math.PI + 180; // 转换为度，调整方位角
    
    if (altitude > -18) { // 只显示民用曙光时间以上的轨迹
      // 根据方位角和高度角计算地图上的位置，使用相同的距离计算方法
      const baseDistance = Math.max(0.001, 0.01 * (90 - altitude) / 90);
      const [sunLat, sunLng] = calculateMarkerPosition(
        latitude, longitude, azimuth, baseDistance, 'sun', mapRef
      );
      
      sunPath.push([sunLat, sunLng, altitude, time]);
    }
  }

  // 创建太阳轨迹线
  if (sunPath.length > 0) {
    const pathCoords = sunPath.map(point => [point[0], point[1]]);
    
    // 创建渐变色轨迹
    const sunPathLayer = L.layerGroup();
    
    for (let i = 0; i < pathCoords.length - 1; i++) {
      const altitude1 = sunPath[i][2];
      const altitude2 = sunPath[i + 1][2];
      const avgAltitude = (altitude1 + altitude2) / 2;
      
      // 根据高度角设置颜色：低角度偏红，高角度偏黄
      let color;
      if (avgAltitude < 0) {
        color = '#4a5568'; // 夜间 - 灰色
      } else if (avgAltitude < 10) {
        color = '#ff6b6b'; // 低角度 - 红色
      } else if (avgAltitude < 30) {
        color = '#ffa726'; // 中低角度 - 橙色
      } else if (avgAltitude < 60) {
        color = '#ffd54f'; // 中高角度 - 黄色
      } else {
        color = '#fff176'; // 高角度 - 亮黄色
      }
      
      const segment = L.polyline([pathCoords[i], pathCoords[i + 1]], {
        color: color,
        weight: 3,
        opacity: 0.8
      });
      
      sunPathLayer.addLayer(segment);
    }
    
    sunPathRef.current = sunPathLayer;
    sunPathLayer.addTo(mapRef.current);
  }

  // 创建当前太阳位置和光线
  const currentSunPos = SunCalc.getPosition(date, latitude, longitude);
  const currentAltitude = currentSunPos.altitude * 180 / Math.PI;
  const currentAzimuth = currentSunPos.azimuth * 180 / Math.PI + 180;
  
  if (currentAltitude > 0) {
    // 计算当前太阳在地图上的位置
    const distance = Math.max(0.001, 0.01 * (90 - currentAltitude) / 90);
    const [sunLat, sunLng] = calculateMarkerPosition(
      latitude, longitude, currentAzimuth, distance, 'sun', mapRef
    );

    // 更新或创建太阳标记
    if (sunMarkerRef.current) {
      sunMarkerRef.current.setLatLng([sunLat, sunLng]);
    } else {
      const sunIcon = createSunIcon();

      sunMarkerRef.current = L.marker([sunLat, sunLng], {
        icon: sunIcon,
        zIndexOffset: 1000
      }).addTo(mapRef.current);
    }

    // 创建太阳光线效果
    const raysLayer = L.layerGroup();
    
    // 添加从相机到太阳的方位线
    const azimuthLine = L.polyline([[latitude, longitude], [sunLat, sunLng]], {
      color: '#ffd54f',
      weight: 2,
      opacity: 0.6,
      dashArray: '5, 10'
    });
    raysLayer.addLayer(azimuthLine);

    // 添加从相机到日出位置的指示线
    const sunriseLine = L.polyline([[latitude, longitude], [sunriseLat, sunriseLng]], {
      color: '#ff6b35',
      weight: 2,
      opacity: 0.4,
      dashArray: '3, 6'
    });
    raysLayer.addLayer(sunriseLine);

    // 添加从相机到日落位置的指示线
    const sunsetLine = L.polyline([[latitude, longitude], [sunsetLat, sunsetLng]], {
      color: '#ff8f00',
      weight: 2,
      opacity: 0.4,
      dashArray: '3, 6'
    });
    raysLayer.addLayer(sunsetLine);

    // 添加高度角弧线（模拟）
    const altitudeRadius = distance * 0.3;
    const altitudeArc = [];
    for (let angle = 0; angle <= currentAltitude; angle += 2) {
      const angleRad = angle * Math.PI / 180;
      const arcDistance = altitudeRadius * Math.cos(angleRad);
      const arcLat = latitude + arcDistance * Math.cos(currentAzimuth * Math.PI / 180);
      const arcLng = longitude + arcDistance * Math.sin(currentAzimuth * Math.PI / 180);
      altitudeArc.push([arcLat, arcLng]);
    }
    
    if (altitudeArc.length > 0) {
      const altitudeLine = L.polyline(altitudeArc, {
        color: '#ff8f00',
        weight: 3,
        opacity: 0.7
      });
      raysLayer.addLayer(altitudeLine);
    }

    // 添加方位角指示器
    const compassPoints = [
      { angle: 0, label: 'N' },
      { angle: 90, label: 'E' }, 
      { angle: 180, label: 'S' },
      { angle: 270, label: 'W' }
    ];

    compassPoints.forEach(point => {
      const pointRad = point.angle * Math.PI / 180;
      const pointDistance = 0.008;
      const pointLat = latitude + pointDistance * Math.cos(pointRad);
      const pointLng = longitude + pointDistance * Math.sin(pointRad);
      
      const compassMarker = L.divIcon({
        html: `<div style="
          background: rgba(255,255,255,0.9);
          color: #333;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          border: 1px solid #ddd;
          text-align: center;
        ">${point.label}</div>`,
        iconSize: [20, 16],
        iconAnchor: [10, 8],
        className: 'compass-marker'
      });
      
      const marker = L.marker([pointLat, pointLng], { icon: compassMarker });
      raysLayer.addLayer(marker);
    });

    sunRaysRef.current = raysLayer;
    raysLayer.addTo(mapRef.current);

    // 更新太阳位置信息弹窗
    const sunInfoContent = `
      <div style="text-align: center; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #ff8f00;">☀️ 太阳位置</h4>
        <div style="margin: 4px 0;"><strong>高度角:</strong> ${currentAltitude.toFixed(1)}°</div>
        <div style="margin: 4px 0;"><strong>方位角:</strong> ${currentAzimuth.toFixed(1)}°</div>
        <div style="margin: 4px 0;"><strong>时间:</strong> ${date.toLocaleTimeString()}</div>
      </div>
    `;
    
    sunMarkerRef.current.bindPopup(sunInfoContent, {
      offset: [0, -12],
      className: 'sun-popup'
    });
  }
};

/**
 * 创建专业的月亮可视化
 * @param {Date} date - 日期
 * @param {number} latitude - 纬度  
 * @param {number} longitude - 经度
 * @param {Object} mapRef - 地图引用
 * @param {Object} refs - 各种标记的引用对象
 */
export const createMoonVisualization = (date, latitude, longitude, mapRef, refs) => {
  if (!mapRef.current) return;

  console.log('=== 创建月亮可视化 ===');

  const { moonriseMarkerRef, moonsetMarkerRef, moonRaysRef, moonMarkerRef } = refs;

  // 计算当前的月相信息
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const currentMoonPhase = moonIllumination.phase;
  
  console.log('计算的月相:', currentMoonPhase);

  // 清除之前的月亮可视化
  if (moonriseMarkerRef.current) {
    mapRef.current.removeLayer(moonriseMarkerRef.current);
  }
  if (moonsetMarkerRef.current) {
    mapRef.current.removeLayer(moonsetMarkerRef.current);
  }
  if (moonRaysRef.current) {
    mapRef.current.removeLayer(moonRaysRef.current);
  }

  // 计算月出月落时间和位置
  const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
  
  // 检查是否有有效的月出月落时间
  if (!moonTimes.rise && !moonTimes.set) {
    console.log('当天没有月出月落时间');
    return;
  }

  const markDistance = 0.010; // 月亮标记距离相机的距离

  // 创建月出标记
  if (moonTimes.rise) {
    const moonrisePos = SunCalc.getMoonPosition(moonTimes.rise, latitude, longitude);
    const moonriseAzimuth = (moonrisePos.azimuth * 180 / Math.PI) + 180;
    
    const [moonriseLat, moonriseLng] = calculateMarkerPosition(
      latitude, longitude, moonriseAzimuth, markDistance, 'moonrise', mapRef
    );

    const moonriseIcon = createMoonriseIcon();
    moonriseMarkerRef.current = L.marker([moonriseLat, moonriseLng], {
      icon: moonriseIcon,
      zIndexOffset: 800
    }).addTo(mapRef.current);

    const moonriseContent = `
      <div style="text-align: center; min-width: 180px;">
        <h4 style="margin: 0 0 8px 0; color: #9e9e9e;">🌙 月出</h4>
        <div style="margin: 4px 0;"><strong>时间:</strong> ${moonTimes.rise.toLocaleTimeString()}</div>
        <div style="margin: 4px 0;"><strong>方位角:</strong> ${moonriseAzimuth.toFixed(1)}°</div>
        <div style="margin: 4px 0; font-size: 12px; color: #666;">月亮从这个方向升起</div>
      </div>
    `;

    moonriseMarkerRef.current.bindPopup(moonriseContent, {
      offset: [0, -16],
      className: 'moonrise-popup'
    });
  }

  // 创建月落标记
  if (moonTimes.set) {
    const moonsetPos = SunCalc.getMoonPosition(moonTimes.set, latitude, longitude);
    const moonsetAzimuth = (moonsetPos.azimuth * 180 / Math.PI) + 180;
    
    const [moonsetLat, moonsetLng] = calculateMarkerPosition(
      latitude, longitude, moonsetAzimuth, markDistance, 'moonset', mapRef
    );

    const moonsetIcon = createMoonsetIcon();
    moonsetMarkerRef.current = L.marker([moonsetLat, moonsetLng], {
      icon: moonsetIcon,
      zIndexOffset: 800
    }).addTo(mapRef.current);

    const moonsetContent = `
      <div style="text-align: center; min-width: 180px;">
        <h4 style="margin: 0 0 8px 0; color: #757575;">🌚 月落</h4>
        <div style="margin: 4px 0;"><strong>时间:</strong> ${moonTimes.set.toLocaleTimeString()}</div>
        <div style="margin: 4px 0;"><strong>方位角:</strong> ${moonsetAzimuth.toFixed(1)}°</div>
        <div style="margin: 4px 0; font-size: 12px; color: #666;">月亮在这个方向落下</div>
      </div>
    `;

    moonsetMarkerRef.current.bindPopup(moonsetContent, {
      offset: [0, -16],
      className: 'moonset-popup'
    });
  }

  // 增强当前月亮位置标记
  const currentMoonPos = SunCalc.getMoonPosition(date, latitude, longitude);
  const currentMoonAltitude = currentMoonPos.altitude * 180 / Math.PI;
  const currentMoonAzimuth = currentMoonPos.azimuth * 180 / Math.PI + 180;
  
  // 计算当前月亮在地图上的位置（无论是否在地平线上）
  const distance = Math.max(0.001, 0.008 * (90 - Math.abs(currentMoonAltitude)) / 90);
  const [moonLat, moonLng] = calculateMarkerPosition(
    latitude, longitude, currentMoonAzimuth, distance, 'moon', mapRef
  );

  // 创建或更新月亮标记
  if (moonMarkerRef.current) {
    // 更新现有月亮图标
    const enhancedMoonIcon = createBeautifulMoonIcon(currentMoonPhase);
    moonMarkerRef.current.setIcon(enhancedMoonIcon);
    moonMarkerRef.current.setLatLng([moonLat, moonLng]);
  } else {
    // 创建新的月亮标记
    const enhancedMoonIcon = createBeautifulMoonIcon(currentMoonPhase);
    moonMarkerRef.current = L.marker([moonLat, moonLng], {
      icon: enhancedMoonIcon,
      zIndexOffset: 950
    }).addTo(mapRef.current);
  }

  // 创建月亮光线效果
  if (moonRaysRef.current) {
    mapRef.current.removeLayer(moonRaysRef.current);
  }
  
  const moonRaysLayer = L.layerGroup();
  
  // 添加从相机到月亮的方位线
  const moonAzimuthLine = L.polyline([[latitude, longitude], [moonLat, moonLng]], {
    color: currentMoonAltitude > 0 ? '#e0e0e0' : '#666666',
    weight: 2,
    opacity: currentMoonAltitude > 0 ? 0.5 : 0.3,
    dashArray: '4, 8'
  });
  moonRaysLayer.addLayer(moonAzimuthLine);

  // 如果有月出月落，添加指示线
  if (moonTimes.rise && moonriseMarkerRef.current) {
    const moonriseLine = L.polyline([[latitude, longitude], moonriseMarkerRef.current.getLatLng()], {
      color: '#bdbdbd',
      weight: 1.5,
      opacity: 0.3,
      dashArray: '2, 4'
    });
    moonRaysLayer.addLayer(moonriseLine);
  }

  if (moonTimes.set && moonsetMarkerRef.current) {
    const moonsetLine = L.polyline([[latitude, longitude], moonsetMarkerRef.current.getLatLng()], {
      color: '#9e9e9e',
      weight: 1.5,
      opacity: 0.3,
      dashArray: '2, 4'
    });
    moonRaysLayer.addLayer(moonsetLine);
  }

  moonRaysRef.current = moonRaysLayer;
  moonRaysLayer.addTo(mapRef.current);

  // 更新月亮位置信息弹窗
  const moonInfoContent = `
    <div style="text-align: center; min-width: 200px;">
      <h4 style="margin: 0 0 8px 0; color: #9e9e9e;">🌙 月亮位置</h4>
      <div style="margin: 4px 0;"><strong>高度角:</strong> ${currentMoonAltitude.toFixed(1)}°</div>
      <div style="margin: 4px 0;"><strong>方位角:</strong> ${currentMoonAzimuth.toFixed(1)}°</div>
      <div style="margin: 4px 0;"><strong>时间:</strong> ${date.toLocaleTimeString()}</div>
      <div style="margin: 4px 0; font-size: 12px; color: #666;">
        ${currentMoonAltitude > 0 ? '月亮在地平线上' : '月亮在地平线下'}
      </div>
    </div>
  `;
  
  moonMarkerRef.current.bindPopup(moonInfoContent, {
    offset: [0, -10],
    className: 'moon-popup'
  });
};

/**
 * 更新太阳可视化
 * @param {Date} date - 日期
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {Object} mapRef - 地图引用
 * @param {Object} refs - 各种标记的引用对象
 */
export const updateSunVisualization = (date, latitude, longitude, mapRef, refs) => {
  createSunVisualization(date, latitude, longitude, mapRef, refs);
};

/**
 * 更新月亮可视化
 * @param {Date} date - 日期
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {Object} mapRef - 地图引用
 * @param {Object} refs - 各种标记的引用对象
 */
export const updateMoonVisualization = (date, latitude, longitude, mapRef, refs) => {
  createMoonVisualization(date, latitude, longitude, mapRef, refs);
}; 