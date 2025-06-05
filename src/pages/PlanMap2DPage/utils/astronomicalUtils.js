import SunCalc from 'suncalc';

/**
 * 计算太阳月亮位置
 * @param {Date} date - 日期时间
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {Object} 太阳或月亮位置信息
 */

export const calculateSunPosition = (date, latitude, longitude) => {
  try {
    const sunPosition = SunCalc.getPosition(date, latitude, longitude);//太阳位置
    return {
      altitude: (sunPosition.altitude * 180 / Math.PI).toFixed(1),//高度
      azimuth: ((sunPosition.azimuth * 180 / Math.PI) + 180).toFixed(1)//方位
    };
  } catch (error) {
    console.error('计算太阳位置失败:', error);
    return { altitude: 0, azimuth: 0 };
  }
};

export const calculateMoonPosition = (date, latitude, longitude) => {
  try {
    const moonPosition = SunCalc.getMoonPosition(date, latitude, longitude);//月亮位置
    return {
      altitude: (moonPosition.altitude * 180 / Math.PI).toFixed(1),//高度
      azimuth: ((moonPosition.azimuth * 180 / Math.PI) + 180).toFixed(1)//方位
    };
  } catch (error) {
    console.error('计算月亮位置失败:', error);
    return { altitude: 0, azimuth: 0 };
  }
};

/**
 * 获取完整的天文数据，包含太阳和月亮的位置、日出日落时间、月出月落时间、月相信息
 * @param {Date} date - 日期时间
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {Object} 完整的天文数据
 */
export const getAstronomicalData = (date, latitude, longitude) => {
  try {
    console.log('=== 计算天文数据 ===');
    console.log('日期时间:', date.toLocaleString());
    console.log('位置:', { latitude, longitude });
    
    const sunPos = calculateSunPosition(date, latitude, longitude);
    const moonPos = calculateMoonPosition(date, latitude, longitude);
    
    // 计算日出日落时间
    const sunTimes = SunCalc.getTimes(date, latitude, longitude);
    
    // 计算月出月落时间
    const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
    
    // 计算月相信息
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const moonPhaseNames = [
      '新月', '娥眉月', '上弦月', '盈凸月', 
      '满月', '亏凸月', '下弦月', '残月'
    ];
    const moonPhaseName = moonPhaseNames[Math.floor(moonIllumination.phase * 8)];
    
    console.log('计算结果:', {
      sunPos,
      sunrise: sunTimes.sunrise.toLocaleTimeString(),
      sunset: sunTimes.sunset.toLocaleTimeString(),
      moonrise: moonTimes.rise ? moonTimes.rise.toLocaleTimeString() : '无',
      moonset: moonTimes.set ? moonTimes.set.toLocaleTimeString() : '无',
      moonPhase: moonIllumination.phase,
      moonPhaseName: moonPhaseName
    });
    
    return {
      sunPosition: {
        altitude: sunPos.altitude,
        azimuth: sunPos.azimuth,
        sunrise: sunTimes.sunrise.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        sunset: sunTimes.sunset.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      },
      moonPosition: {
        altitude: moonPos.altitude,
        azimuth: moonPos.azimuth,
        moonrise: moonTimes.rise ? moonTimes.rise.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '无',
        moonset: moonTimes.set ? moonTimes.set.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '无',
        phase: moonIllumination.phase,//月相 
        phaseName: moonPhaseName,//月相名称
        illumination: Math.round(moonIllumination.fraction * 100)//月相亮度
      }
    };
  } catch (error) {
    console.error('计算天文数据失败:', error);
    return null;
  }
}; 