import html2canvas from 'html2canvas';
import SunCalc from 'suncalc';
import { message } from 'antd';
import { calculateMarkerPosition, latLngToPixel } from './mapUtils';

/**
 * 导出地图为图片
 * @param {Object} params - 导出参数
 * @param {Object} params.mapContainerRef - 地图容器引用
 * @param {Object} params.mapRef - 地图引用  
 * @param {Object} params.planData - 计划数据
 * @param {Object} params.selectedDate - 选定日期
 * @param {Object} params.selectedTime - 选定时间
 * @param {Array} params.currentCameraPosition - 当前相机位置
 * @param {Object} params.astronomicalData - 天文数据
 * @param {boolean} params.showSunPath - 是否显示太阳轨迹
 * @param {boolean} params.showMoonPath - 是否显示月亮轨迹
 */
export const handleExport = async ({
  mapContainerRef,
  mapRef,
  planData,
  selectedDate,
  selectedTime,
  currentCameraPosition,
  astronomicalData,
  showSunPath,
  showMoonPath
}) => {
  if (!mapContainerRef.current || !mapRef.current) {
    message.error('地图未准备好，请稍后再试');
    return;
  }

  try {
    message.loading('正在生成地图图片...', 0);

    // 暂时禁用动画以便更好地捕获
    const mapContainer = mapContainerRef.current;
    const originalStyle = mapContainer.style.cssText;
    mapContainer.style.cssText += '; animation: none !important; transition: none !important;';
    
    // 等待所有瓦片和元素加载完成
    await new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkReady = () => {
        attempts++;
        
        // 检查瓦片加载
        const tiles = mapContainer.querySelectorAll('.leaflet-tile');
        const tilesLoaded = Array.from(tiles).every(tile => 
          tile.complete || tile.naturalWidth > 0
        );
        
        // 检查标记元素
        const markers = mapContainer.querySelectorAll('.leaflet-marker-icon');
        const markersReady = markers.length >= 2; // 至少应该有相机和一些天文标记
        
        // 检查SVG元素
        const svgs = mapContainer.querySelectorAll('svg');
        const svgsReady = svgs.length > 0;
        
        if ((tilesLoaded && markersReady && svgsReady) || attempts >= maxAttempts) {
          console.log(`导出准备完成 - 瓦片:${tilesLoaded}, 标记:${markersReady}, SVG:${svgsReady}, 尝试:${attempts}`);
          resolve();
        } else {
          setTimeout(checkReady, 200);
        }
      };
      
      checkReady();
    });

    // 强制重绘页面
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    // 使用更兼容的html2canvas配置
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      logging: false,
      backgroundColor: '#f5f7fa',
      width: mapContainer.offsetWidth,
      height: mapContainer.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      // 处理特殊元素
      onclone: (clonedDoc) => {
        // 在克隆文档中处理SVG和动画
        const clonedContainer = clonedDoc.querySelector(`[data-testid="map-container"]`) || 
                                clonedDoc.querySelector('.leaflet-container');
        
        if (clonedContainer) {
          // 移除动画类
          const animatedElements = clonedContainer.querySelectorAll('[class*="animation"], [style*="animation"]');
          animatedElements.forEach(el => {
            el.style.animation = 'none';
            el.style.transition = 'none';
          });
          
          // 确保SVG可见
          const svgs = clonedContainer.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.style.display = 'block';
            svg.style.visibility = 'visible';
          });
          
          // 确保标记可见
          const markers = clonedContainer.querySelectorAll('.leaflet-marker-icon');
          markers.forEach(marker => {
            marker.style.display = 'block';
            marker.style.visibility = 'visible';
          });
        }
      },
      // 忽略某些控制元素
      ignoreElements: (element) => {
        return element.classList.contains('leaflet-control-zoom') ||
               element.classList.contains('leaflet-control-layers') ||
               element.classList.contains('leaflet-control-attribution') ||
               element.classList.contains('leaflet-popup');
      }
    });

    // 恢复原始样式
    mapContainer.style.cssText = originalStyle;

    // 创建最终图片
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    
    // 绘制地图
    ctx.drawImage(canvas, 0, 0);
    
    // 手动绘制可能丢失的关键信息
    await drawMissingElements(ctx, finalCanvas.width, finalCanvas.height, {
      mapRef,
      selectedDate,
      selectedTime,
      currentCameraPosition,
      astronomicalData,
      showSunPath,
      showMoonPath
    });
    
    // 添加信息水印
    const watermarkInfo = [
      `${planData?.name || '拍摄计划'} - ${selectedDate.format('YYYY年MM月DD日')}`,
      `时间: ${selectedTime.format('HH:mm')}`,
      `位置: ${currentCameraPosition?.[0]?.toFixed(4)}, ${currentCameraPosition?.[1]?.toFixed(4)}`,
      `生成时间: ${new Date().toLocaleString()}`
    ];
    
    // 设置水印样式
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, finalCanvas.height - 90, 420, 80);
    
    ctx.fillStyle = 'white';
    ctx.font = '13px Arial, sans-serif';
    
    watermarkInfo.forEach((text, index) => {
      ctx.fillText(text, 20, finalCanvas.height - 70 + index * 18);
    });

    // 下载图片
    const image = finalCanvas.toDataURL('image/png', 0.95);
    const link = document.createElement('a');
    link.href = image;
    link.download = `DreamCatcher_${planData?.name || 'Plan'}_${selectedDate.format('YYYY-MM-DD')}_${selectedTime.format('HH-mm')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.destroy();
    message.success('地图导出成功');

  } catch (error) {
    console.error('导出失败:', error);
    message.destroy();
    message.error('导出失败，请重试');
  }
};

/**
 * 手动绘制可能丢失的元素
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 * @param {Object} params - 参数对象
 */
export const drawMissingElements = async (ctx, width, height, params) => {
  const {
    mapRef,
    selectedDate,
    selectedTime,
    currentCameraPosition,
    astronomicalData,
    showSunPath,
    showMoonPath
  } = params;

  if (!mapRef.current || !currentCameraPosition) return;

  const cameraLat = currentCameraPosition[0];
  const cameraLng = currentCameraPosition[1];

  // 获取当前时间
  const currentDateTime = selectedDate
    .hour(selectedTime.hour())
    .minute(selectedTime.minute())
    .second(selectedTime.second())
    .toDate();

  // 绘制太阳轨迹
  if (showSunPath) {
    const sunTimes = SunCalc.getTimes(currentDateTime, cameraLat, cameraLng);
    const sunPath = [];
    
    // 从日出前1小时到日落后1小时，每15分钟计算一次位置
    const startTime = new Date(sunTimes.sunrise.getTime() - 60 * 60 * 1000);
    const endTime = new Date(sunTimes.sunset.getTime() + 60 * 60 * 1000);
    
    for (let time = startTime; time <= endTime; time = new Date(time.getTime() + 15 * 60 * 1000)) {
      const sunPos = SunCalc.getPosition(time, cameraLat, cameraLng);
      const altitude = sunPos.altitude * 180 / Math.PI;
      const azimuth = sunPos.azimuth * 180 / Math.PI + 180;
      
      if (altitude > -18) { // 只显示民用曙光时间以上的轨迹
        const baseDistance = Math.max(0.001, 0.01 * (90 - altitude) / 90);
        const [sunLat, sunLng] = calculateMarkerPosition(cameraLat, cameraLng, azimuth, baseDistance, 'sun', mapRef);
        const pixel = latLngToPixel(mapRef, sunLat, sunLng);
        sunPath.push({ ...pixel, altitude, time });
      }
    }
    
    // 绘制太阳轨迹线
    if (sunPath.length > 1) {
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < sunPath.length - 1; i++) {
        const point1 = sunPath[i];
        const point2 = sunPath[i + 1];
        const avgAltitude = (point1.altitude + point2.altitude) / 2;
        
        // 根据高度角设置颜色
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
        
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
      }
    }
  }

  // 绘制方位线（从相机到各个标记的连接线）
  const cameraPixel = latLngToPixel(mapRef, cameraLat, cameraLng);
  
  // 太阳方位线
  if (showSunPath) {
    const currentSunPos = SunCalc.getPosition(currentDateTime, cameraLat, cameraLng);
    const currentAltitude = currentSunPos.altitude * 180 / Math.PI;
    const currentAzimuth = currentSunPos.azimuth * 180 / Math.PI + 180;
    
    if (currentAltitude > 0) {
      const distance = Math.max(0.001, 0.01 * (90 - currentAltitude) / 90);
      const [sunLat, sunLng] = calculateMarkerPosition(cameraLat, cameraLng, currentAzimuth, distance, 'sun', mapRef);
      const sunPixel = latLngToPixel(mapRef, sunLat, sunLng);
      
      // 绘制太阳方位线
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.moveTo(cameraPixel.x, cameraPixel.y);
      ctx.lineTo(sunPixel.x, sunPixel.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // 日出日落方位线
    const sunTimes = SunCalc.getTimes(currentDateTime, cameraLat, cameraLng);
    const sunrisePos = SunCalc.getPosition(sunTimes.sunrise, cameraLat, cameraLng);
    const sunsetPos = SunCalc.getPosition(sunTimes.sunset, cameraLat, cameraLng);
    
    const sunriseAzimuth = (sunrisePos.azimuth * 180 / Math.PI) + 180;
    const sunsetAzimuth = (sunsetPos.azimuth * 180 / Math.PI) + 180;
    
    const [sunriseLat, sunriseLng] = calculateMarkerPosition(cameraLat, cameraLng, sunriseAzimuth, 0.012, 'sunrise', mapRef);
    const [sunsetLat, sunsetLng] = calculateMarkerPosition(cameraLat, cameraLng, sunsetAzimuth, 0.012, 'sunset', mapRef);
    
    const sunrisePixel = latLngToPixel(mapRef, sunriseLat, sunriseLng);
    const sunsetPixel = latLngToPixel(mapRef, sunsetLat, sunsetLng);
    
    // 日出方位线
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.moveTo(cameraPixel.x, cameraPixel.y);
    ctx.lineTo(sunrisePixel.x, sunrisePixel.y);
    ctx.stroke();
    
    // 日落方位线
    ctx.strokeStyle = '#ff8f00';
    ctx.beginPath();
    ctx.moveTo(cameraPixel.x, cameraPixel.y);
    ctx.lineTo(sunsetPixel.x, sunsetPixel.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 月亮方位线
  if (showMoonPath) {
    const currentMoonPos = SunCalc.getMoonPosition(currentDateTime, cameraLat, cameraLng);
    const currentMoonAltitude = currentMoonPos.altitude * 180 / Math.PI;
    const currentMoonAzimuth = currentMoonPos.azimuth * 180 / Math.PI + 180;
    
    const distance = Math.max(0.001, 0.008 * (90 - Math.abs(currentMoonAltitude)) / 90);
    const [moonLat, moonLng] = calculateMarkerPosition(cameraLat, cameraLng, currentMoonAzimuth, distance, 'moon', mapRef);
    const moonPixel = latLngToPixel(mapRef, moonLat, moonLng);
    
    // 绘制月亮方位线
    ctx.strokeStyle = currentMoonAltitude > 0 ? '#e0e0e0' : '#666666';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(cameraPixel.x, cameraPixel.y);
    ctx.lineTo(moonPixel.x, moonPixel.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 月出月落方位线
    const moonTimes = SunCalc.getMoonTimes(currentDateTime, cameraLat, cameraLng);
    
    if (moonTimes.rise) {
      const moonrisePos = SunCalc.getMoonPosition(moonTimes.rise, cameraLat, cameraLng);
      const moonriseAzimuth = (moonrisePos.azimuth * 180 / Math.PI) + 180;
      const [moonriseLat, moonriseLng] = calculateMarkerPosition(cameraLat, cameraLng, moonriseAzimuth, 0.010, 'moonrise', mapRef);
      const moonrisePixel = latLngToPixel(mapRef, moonriseLat, moonriseLng);
      
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(cameraPixel.x, cameraPixel.y);
      ctx.lineTo(moonrisePixel.x, moonrisePixel.y);
      ctx.stroke();
    }
    
    if (moonTimes.set) {
      const moonsetPos = SunCalc.getMoonPosition(moonTimes.set, cameraLat, cameraLng);
      const moonsetAzimuth = (moonsetPos.azimuth * 180 / Math.PI) + 180;
      const [moonsetLat, moonsetLng] = calculateMarkerPosition(cameraLat, cameraLng, moonsetAzimuth, 0.010, 'moonset', mapRef);
      const moonsetPixel = latLngToPixel(mapRef, moonsetLat, moonsetLng);
      
      ctx.strokeStyle = '#9e9e9e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(cameraPixel.x, cameraPixel.y);
      ctx.lineTo(moonsetPixel.x, moonsetPixel.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // 绘制相机位置（确保在最上层）
  const cameraPos = latLngToPixel(mapRef, cameraLat, cameraLng);
  
  if (cameraPos.x >= 0 && cameraPos.x <= width && cameraPos.y >= 0 && cameraPos.y <= height) {
    // 绘制相机图标
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(cameraPos.x, cameraPos.y, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(cameraPos.x, cameraPos.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📷', cameraPos.x, cameraPos.y + 3);
  }

  // 绘制天文数据指示（放在左上角）
  if (astronomicalData) {
    ctx.fillStyle = 'rgba(255, 193, 7, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    const infoY = 30;
    ctx.fillText(`☀️ 日出: ${astronomicalData.sunPosition?.sunrise}`, 10, infoY);
    ctx.fillText(`🌅 日落: ${astronomicalData.sunPosition?.sunset}`, 10, infoY + 20);
    
    if (astronomicalData.moonPosition?.moonrise !== '无') {
      ctx.fillText(`🌙 月出: ${astronomicalData.moonPosition?.moonrise}`, 10, infoY + 40);
    }
    if (astronomicalData.moonPosition?.moonset !== '无') {
      ctx.fillText(`🌚 月落: ${astronomicalData.moonPosition?.moonset}`, 10, infoY + 60);
    }
  }
}; 