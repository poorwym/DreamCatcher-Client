/**
 * 根据缩放级别计算距离系数
 * @param {Object} mapRef - Leaflet地图引用
 * @returns {number} 距离系数
 */
export const getDistanceMultiplier = (mapRef) => {
  if (!mapRef || !mapRef.current) return 1;
  const zoom = mapRef.current.getZoom();
  
  // 缩放级别越小，距离系数越大，避免标记重合
  if (zoom <= 8) return 8;      // 很远的距离
  if (zoom <= 10) return 4;     // 较远的距离
  if (zoom <= 12) return 2;     // 中等距离
  if (zoom <= 15) return 1;     // 正常距离
  return 0.5;                   // 近距离
};

/**
 * 计算标记位置，考虑缩放级别
 * @param {number} centerLat - 中心纬度
 * @param {number} centerLng - 中心经度
 * @param {number} azimuth - 方位角
 * @param {number} baseDistance - 基础距离
 * @param {string} type - 标记类型
 * @param {Object} mapRef - 地图引用（可选）
 * @returns {Array} [纬度, 经度]
 */
export const calculateMarkerPosition = (centerLat, centerLng, azimuth, baseDistance, type = 'default', mapRef = null) => {
  const distanceMultiplier = mapRef ? getDistanceMultiplier(mapRef) : 1;
  let adjustedDistance = baseDistance * distanceMultiplier;
  
  // 根据类型调整距离，避免重合
  switch(type) {
    case 'sun':
      adjustedDistance *= 1.0;  // 太阳标记保持基准距离
      break;
    case 'moon':
      adjustedDistance *= 1.3;  // 月亮标记稍远一些
      break;
    case 'sunrise':
      adjustedDistance *= 1.8;  // 日出标记更远
      break;
    case 'sunset':
      adjustedDistance *= 1.8;  // 日落标记更远
      break;
    case 'moonrise':
      adjustedDistance *= 2.0;  // 月出标记最远
      break;
    case 'moonset':
      adjustedDistance *= 2.0;  // 月落标记最远
      break;
    default:
      break;
  }
  
  const azimuthRad = azimuth * Math.PI / 180;
  const lat = centerLat + adjustedDistance * Math.cos(azimuthRad);
  const lng = centerLng + adjustedDistance * Math.sin(azimuthRad);
  
  return [lat, lng];
};

/**
 * 像素坐标转换函数
 * @param {Object} mapRef - 地图引用
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @returns {Object} {x, y} 像素坐标
 */
export const latLngToPixel = (mapRef, lat, lng) => {
  if (!mapRef || !mapRef.current) return { x: 0, y: 0 };
  const point = mapRef.current.latLngToContainerPoint([lat, lng]);
  return { x: point.x, y: point.y };
};

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}; 