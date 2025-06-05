// 天气和天文数据API测试工具
import { astronomyAPI } from '../services/api';

// 测试天气API
export const testWeatherAPI = async () => {
  try {
    console.log('开始测试天气API...');
    
    // 使用杭州的坐标进行测试
    const testParams = {
      latitude: 30.2741,
      longitude: 120.1551,
      datetime: new Date().toISOString()
    };
    
    console.log('测试参数:', testParams);
    
    const weatherData = await astronomyAPI.getWeatherData(testParams);
    
    console.log('天气数据获取成功:', weatherData);
    
    return {
      success: true,
      data: weatherData
    };
    
  } catch (error) {
    console.error('天气API测试失败:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// 测试天文数据API
export const testAstronomyAPI = async () => {
  try {
    console.log('开始测试天文数据API...');
    
    // 使用杭州的坐标进行测试
    const testParams = {
      latitude: 30.2741,
      longitude: 120.1551,
      datetime: new Date().toISOString()
    };
    
    console.log('测试参数:', testParams);
    
    const astroData = await astronomyAPI.getAstronomyData(testParams);
    
    console.log('天文数据计算成功:', astroData);
    
    return {
      success: true,
      data: astroData
    };
    
  } catch (error) {
    console.error('天文数据API测试失败:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// 测试太阳位置API
export const testSunPositionAPI = async () => {
  try {
    console.log('开始测试太阳位置API...');
    
    const testParams = {
      latitude: 30.2741,
      longitude: 120.1551,
      datetime: new Date().toISOString()
    };
    
    console.log('测试参数:', testParams);
    
    const sunData = await astronomyAPI.getSunPosition(testParams);
    
    console.log('太阳位置计算成功:', sunData);
    
    return {
      success: true,
      data: sunData
    };
    
  } catch (error) {
    console.error('太阳位置API测试失败:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// 测试月亮位置API
export const testMoonPositionAPI = async () => {
  try {
    console.log('开始测试月亮位置API...');
    
    const testParams = {
      latitude: 30.2741,
      longitude: 120.1551,
      datetime: new Date().toISOString()
    };
    
    console.log('测试参数:', testParams);
    
    const moonData = await astronomyAPI.getMoonPosition(testParams);
    
    console.log('月亮位置计算成功:', moonData);
    
    return {
      success: true,
      data: moonData
    };
    
  } catch (error) {
    console.error('月亮位置API测试失败:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// 测试特定日期的天气
export const testWeatherForDate = async (latitude, longitude, date) => {
  try {
    console.log(`测试指定日期天气: ${date} 位置: ${latitude}, ${longitude}`);
    
    const weatherData = await astronomyAPI.getWeatherData({
      latitude,
      longitude,
      datetime: date
    });
    
    console.log('指定日期天气数据:', weatherData);
    
    return weatherData;
    
  } catch (error) {
    console.error('指定日期天气API测试失败:', error);
    throw error;
  }
};

// 测试特定日期的天文数据
export const testAstronomyForDate = async (latitude, longitude, date) => {
  try {
    console.log(`测试指定日期天文数据: ${date} 位置: ${latitude}, ${longitude}`);
    
    const astroData = await astronomyAPI.getAstronomyData({
      latitude,
      longitude,
      datetime: date
    });
    
    console.log('指定日期天文数据:', astroData);
    
    return astroData;
    
  } catch (error) {
    console.error('指定日期天文数据API测试失败:', error);
    throw error;
  }
};

// 综合测试所有API
export const testAllAPIs = async () => {
  console.log('开始综合测试所有API...');
  
  const results = {
    weather: await testWeatherAPI(),
    astronomy: await testAstronomyAPI(),
    sun: await testSunPositionAPI(),
    moon: await testMoonPositionAPI()
  };
  
  console.log('综合测试结果:', results);
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`测试完成: ${successCount}/${totalCount} 成功`);
  
  return results;
};

// 在开发环境中添加到全局window对象以便调试
if (process.env.NODE_ENV === 'development') {
  window.weatherTest = {
    test: testWeatherAPI,
    testDate: testWeatherForDate,
    astronomy: testAstronomyAPI,
    sun: testSunPositionAPI,
    moon: testMoonPositionAPI,
    testAstronomyDate: testAstronomyForDate,
    testAll: testAllAPIs
  };
  
  console.log('天气和天文数据API测试工具已加载:');
  console.log('- window.weatherTest.test() - 测试天气API');
  console.log('- window.weatherTest.astronomy() - 测试天文数据API');
  console.log('- window.weatherTest.sun() - 测试太阳位置API');
  console.log('- window.weatherTest.moon() - 测试月亮位置API');
  console.log('- window.weatherTest.testAll() - 综合测试所有API');
}

export default {
  testWeatherAPI,
  testWeatherForDate,
  testAstronomyAPI,
  testSunPositionAPI,
  testMoonPositionAPI,
  testAstronomyForDate,
  testAllAPIs
}; 