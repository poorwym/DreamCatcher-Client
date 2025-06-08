import React, { useState, useEffect } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import SunCalc from 'suncalc';
import { getAstronomicalData } from '../../../utils/astronomicalUtils.js';
import { formatUTCForDisplay } from '../../../utils/timeUtils';
import {
  createCameraIcon,
  createSunIcon,
  createBeautifulMoonIcon,
  createSunriseIcon,
  createSunsetIcon,
  createMoonriseIcon,
  createMoonsetIcon,
} from './MapIcons.js';

/**
 * AstronomicalLayer
 * -----------------
 * 展示相机、太阳、月亮及日出/日落、月出/月落方向，并用射线连接。
 * - 日出/日落方向：使用 SunCalc 在日出/日落时刻的太阳方位角动态计算
 * - 月出/月落方向：使用 SunCalc 在月出/月落时刻的月亮方位角动态计算
 * - 所有方向标记都会根据实际的天文数据准确显示
 */
function AstronomicalLayer({ lat, lon, time, zoomLevel }) {
  const [astronomicalData, setAstronomicalData] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 根据缩放等级动态计算基础距离
   * @param {number} zoomLevel - 地图缩放等级
   * @returns {number} 基础距离（度数）
   */
  const getBaseDegreeByZoom = (zoomLevel) => {
    // zoomLevel 16 为基准（0.002），zoom越大距离越小，zoom越小距离越大
    const baseZoom = 16;
    const baseDegree = 0.002;
    
    // 使用指数缩放，每级缩放距离变化约2倍
    const zoomDiff = zoomLevel - baseZoom;
    return baseDegree * Math.pow(0.7, zoomDiff);
  };

  /**
   * 根据方位角 + 距离估算地图坐标
   * @param {number} azimuthDeg - 0°=正北，顺时针递增
   * @param {number} distanceMultiplier - 距离倍数（基于基础距离）
   * @param {number} altitudeDeg - 调整距离的高度角
   * @returns {[number, number]} [lat, lon]
   */
  const calculatePosition = (
    azimuthDeg,
    distanceMultiplier = 1,
    altitudeDeg = 0,
  ) => {
    const baseDegree = getBaseDegreeByZoom(zoomLevel || 16);
    const distanceDeg = baseDegree * distanceMultiplier;
    
    const azimuthRad = (azimuthDeg * Math.PI) / 180; // 转弧度
    const altitudeFactor = 1 + Math.cos((altitudeDeg * Math.PI) / 180);
    const effectiveDistance = distanceDeg * altitudeFactor;

    const latOffset = effectiveDistance * Math.cos(azimuthRad);
    const lonOffset = effectiveDistance * Math.sin(azimuthRad);

    return [lat + latOffset, lon + lonOffset];
  };

  // ================= 计算天文数据 =================
  useEffect(() => {
    if (!lat || !lon || !time) return;

    setLoading(true);
    try {
      const date = new Date(time);
      const data = getAstronomicalData(date, lat, lon);
      setAstronomicalData(data);
      console.log('天文数据计算完成:', data);
    } catch (err) {
      console.error('计算天文数据失败:', err);
      setAstronomicalData(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, time]);

  if (loading || !astronomicalData) return null;

  const { sunPosition, moonPosition } = astronomicalData;

  // ================ 日出 / 日落方位角动态计算 =================
  const baseDate = new Date(time);
  const sunTimes = SunCalc.getTimes(baseDate, lat, lon);
  const moonTimes = SunCalc.getMoonTimes(baseDate, lat, lon);

  const calcSunAzimuthDeg = (dateObj) => {
    const pos = SunCalc.getPosition(dateObj, lat, lon);
    return ((pos.azimuth * 180) / Math.PI + 180).toFixed(1);
  };

  const calcMoonAzimuthDeg = (dateObj) => {
    const pos = SunCalc.getMoonPosition(dateObj, lat, lon);
    return ((pos.azimuth * 180) / Math.PI + 180).toFixed(1);
  };

  const sunriseAzimuth = sunTimes.sunrise ? calcSunAzimuthDeg(sunTimes.sunrise) : 90;
  const sunsetAzimuth = sunTimes.sunset ? calcSunAzimuthDeg(sunTimes.sunset) : 270;
  
  // 月出月落方位角计算
  const moonriseAzimuth = moonTimes.rise ? calcMoonAzimuthDeg(moonTimes.rise) : 90;
  const moonsetAzimuth = moonTimes.set ? calcMoonAzimuthDeg(moonTimes.set) : 270;

  // ================ 坐标 =================
  const cameraPos = [lat, lon];
  const sunPos = calculatePosition(
    parseFloat(sunPosition.azimuth),
    1.0, // 太阳位置距离倍数
    parseFloat(sunPosition.altitude),
  );
  const moonPos = calculatePosition(
    parseFloat(moonPosition.azimuth),
    0.5, // 月亮位置稍近一些
    parseFloat(moonPosition.altitude),
  );
  const sunrisePos = calculatePosition(parseFloat(sunriseAzimuth), 1.5); // 日出方向稍远
  const sunsetPos = calculatePosition(parseFloat(sunsetAzimuth), 1.5); // 日落方向稍远
  const moonrisePos = calculatePosition(parseFloat(moonriseAzimuth), 1.0); // 月出方向
  const moonsetPos = calculatePosition(parseFloat(moonsetAzimuth), 1.0); // 月落方向

  // ================ 射线路径定义 =================
  const polylines = [
    { positions: [cameraPos, sunPos], color: '#FFD54F', label: '太阳位置' },
    { positions: [cameraPos, moonPos], color: '#B0BEC5', label: '月亮位置' },
    { positions: [cameraPos, sunrisePos], color: '#FF6B35', label: '日出方向' },
    { positions: [cameraPos, sunsetPos], color: '#E64A19', label: '日落方向' },
  ];

  // 只有在有月出月落时间时才添加对应的射线
  if (moonTimes.rise) {
    polylines.push({ positions: [cameraPos, moonrisePos], color: '#90CAF9', label: '月出方向' });
  }
  if (moonTimes.set) {
    polylines.push({ positions: [cameraPos, moonsetPos], color: '#616161', label: '月落方向' });
  }

  // ==================== 渲染 ====================
  return (
    <>
      {/* 相机 */}
      <Marker position={cameraPos} icon={createCameraIcon()}>
        <Popup>
          <div className="text-center p-2">
            <h3 className="font-bold text-lg mb-2 text-blue-600">📷 相机位置</h3>
            <p className="text-sm">
              <span className="font-medium">纬度:</span> {lat.toFixed(6)}°
            </p>
            <p className="text-sm">
              <span className="font-medium">经度:</span> {lon.toFixed(6)}°
            </p>
            <p className="text-sm">
              <span className="font-medium">时间:</span>{' '}
              {formatUTCForDisplay(time).fullDateTime}
            </p>
          </div>
        </Popup>
      </Marker>

      {/* 太阳 */}
      <Marker position={sunPos} icon={createSunIcon(28)}>
        <Popup>
          <div className="text-center p-2">
            <h3 className="font-bold text-lg mb-2 text-yellow-600">☀️ 太阳</h3>
            <p className="text-sm">
              <span className="font-medium">高度角:</span> {sunPosition.altitude}°
            </p>
            <p className="text-sm">
              <span className="font-medium">方位角:</span> {sunPosition.azimuth}°
            </p>
            <hr className="my-2" />
            <p className="text-sm">
              <span className="font-medium">日出:</span> {sunPosition.sunrise}
            </p>
            <p className="text-sm">
              <span className="font-medium">日落:</span> {sunPosition.sunset}
            </p>
          </div>
        </Popup>
      </Marker>

      {/* 月亮 */}
      <Marker position={moonPos} icon={createBeautifulMoonIcon(moonPosition.phase, 28)}>
        <Popup>
          <div className="text-center p-2">
            <h3 className="font-bold text-lg mb-2 text-gray-300">🌙 月亮</h3>
            <p className="text-sm">
              <span className="font-medium">高度角:</span> {moonPosition.altitude}°
            </p>
            <p className="text-sm">
              <span className="font-medium">方位角:</span> {moonPosition.azimuth}°
            </p>
            <p className="text-sm">
              <span className="font-medium">月相:</span> {moonPosition.phaseName}
            </p>
            <p className="text-sm">
              <span className="font-medium">亮度:</span> {moonPosition.illumination}%
            </p>
            {moonPosition.moonrise !== '无' && (
              <p className="text-sm">
                <span className="font-medium">月出:</span> {moonPosition.moonrise}
              </p>
            )}
            {moonPosition.moonset !== '无' && (
              <p className="text-sm">
                <span className="font-medium">月落:</span> {moonPosition.moonset}
              </p>
            )}
          </div>
        </Popup>
      </Marker>

      {/* 日出 */}
      <Marker position={sunrisePos} icon={createSunriseIcon()}>
        <Popup>
          <div className="text-center p-2">
            <h3 className="font-bold text-lg mb-2 text-orange-500">🌅 日出方向</h3>
            <p className="text-sm">
              <span className="font-medium">时间:</span> {sunPosition.sunrise}
            </p>
            <p className="text-sm">
              <span className="font-medium">方位角:</span> {sunriseAzimuth}°
            </p>
          </div>
        </Popup>
      </Marker>

      {/* 日落 */}
      <Marker position={sunsetPos} icon={createSunsetIcon()}>
        <Popup>
          <div className="text-center p-2">
            <h3 className="font-bold text-lg mb-2 text-red-500">🌇 日落方向</h3>
            <p className="text-sm">
              <span className="font-medium">时间:</span> {sunPosition.sunset}
            </p>
            <p className="text-sm">
              <span className="font-medium">方位角:</span> {sunsetAzimuth}°
            </p>
          </div>
        </Popup>
      </Marker>

      {/* 月出 */}
      {moonTimes.rise && (
        <Marker position={moonrisePos} icon={createMoonriseIcon()}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold text-lg mb-2 text-blue-400">🌒 月出方向</h3>
              <p className="text-sm">
                <span className="font-medium">时间:</span> {moonPosition.moonrise}
              </p>
              <p className="text-sm">
                <span className="font-medium">方位角:</span> {moonriseAzimuth}°
              </p>
              <p className="text-xs text-gray-600 mt-2">
                月亮升起的方向会随月相周期变化
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* 月落 */}
      {moonTimes.set && (
        <Marker position={moonsetPos} icon={createMoonsetIcon()}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold text-lg mb-2 text-gray-500">🌘 月落方向</h3>
              <p className="text-sm">
                <span className="font-medium">时间:</span> {moonPosition.moonset}
              </p>
              <p className="text-sm">
                <span className="font-medium">方位角:</span> {moonsetAzimuth}°
              </p>
              <p className="text-xs text-gray-600 mt-2">
                月亮下落的方向会随月相周期变化
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* 射线 - 连接相机到各个天体和方向 */}
      {polylines.map((l, i) => (
        <Polyline
          key={`astro-line-${i}`}
          positions={l.positions}
          pathOptions={{ 
            color: l.color, 
            weight: 3,
            dashArray: '6 4',
            opacity: 0.8
          }}
        >
          <Popup>
            <div className="text-center p-1">
              <p className="text-sm font-medium">{l.label}</p>
              <p className="text-xs text-gray-600">从相机位置的指向射线</p>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
}

export default AstronomicalLayer;