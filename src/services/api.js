// API 服务配置
const API_BASE_URL = '/api/v1';
const WEATHER_API_KEY = 'MH6U532HQG8TRFKWALAVED8J9';
const WEATHER_API_BASE = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// 导入SunCalc库用于天文数据计算
import SunCalc from 'suncalc';
import dayjs from 'dayjs';

// 模拟数据
const mockPlans = [
  {
    "id": 1,
    "name": "黄昏下的建筑",
    "description": "捕捉夕阳照射下的城市建筑",
    "start_time": "2025-04-25T10:00:00Z",
    "camera": {
      "focal_length": 35.0,
      "position": [30.2741, 120.1551, 100.0],
      "rotation": [0.0, 0.0, 0.0, 1.0]
    },
    "tileset_url": "https://mycdn.com/city/tileset.json",
    "user_id": "test_user_123",
    "created_at": "2023-06-10T08:30:00Z",
    "updated_at": "2023-06-10T08:30:00Z"
  },
  {
    "id": 2,
    "name": "日出山景",
    "description": "拍摄日出时的山景",
    "start_time": "2025-04-26T06:00:00Z",
    "camera": {
      "focal_length": 85.0,
      "position": [36.2048, 138.2529, 1500.0],
      "rotation": [0.1, 0.0, 0.0, 0.95]
    },
    "tileset_url": "https://mycdn.com/mountain/tileset.json",
    "user_id": "test_user_123",
    "created_at": "2023-06-11T07:15:00Z",
    "updated_at": "2023-06-11T07:15:00Z"
  },
  {
    "id": 123,
    "name": "城市夜景",
    "description": "拍摄城市的夜晚景色",
    "start_time": "2025-04-27T20:00:00Z",
    "camera": {
      "focal_length": 50.0,
      "position": [31.2304, 121.4737, 200.0],
      "rotation": [0.0, 0.1, 0.0, 0.99]
    },
    "tileset_url": "https://mycdn.com/shanghai/tileset.json",
    "user_id": "test_user_123",
    "created_at": "2023-06-12T09:00:00Z",
    "updated_at": "2023-06-12T09:00:00Z"
  }
];

// HTTP 请求配置
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// 通用请求方法
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...defaultOptions,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // 检查响应是否为HTML（说明后端不可用）
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Backend not available - received HTML instead of JSON');
    }
    
    // 处理 204 No Content 响应
    if (response.status === 204) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API 请求错误 [${config.method || 'GET'}] ${url}:`, error);
    throw error;
  }
};

// Visual Crossing Weather API 请求方法
const weatherRequest = async (location, date1, date2 = null) => {
  // 构建URL
  let url = `${WEATHER_API_BASE}/${encodeURIComponent(location)}`;
  
  if (date1) {
    url += `/${date1}`;
  }
  
  if (date2) {
    url += `/${date2}`;
  }
  
  url += `?key=${WEATHER_API_KEY}&include=current,days,hours&elements=datetime,temp,feelslike,humidity,precip,precipprob,windspeed,winddir,visibility,cloudcover,conditions,description`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`天气API请求错误: ${url}`, error);
    throw error;
  }
};

// 计算太阳位置（使用SunCalc）
const calculateSunPosition = (date, latitude, longitude) => {
  console.log('计算太阳位置 - 输入参数:', { date, latitude, longitude });
  
  const sunPos = SunCalc.getPosition(date, latitude, longitude);
  
  // 转换弧度到角度
  const altitude = (sunPos.altitude * 180) / Math.PI;
  const azimuth = ((sunPos.azimuth * 180) / Math.PI + 180) % 360; // 转换为0-360度，北为0度

  // 获取日出日落时间
  const times = SunCalc.getTimes(date, latitude, longitude);
  const sunrise = dayjs(times.sunrise).format('HH:mm');
  const sunset = dayjs(times.sunset).format('HH:mm');
  
  // 计算黄金时刻
  const goldenHourMorning = dayjs(times.goldenHour).format('HH:mm');
  const goldenHourEvening = dayjs(times.goldenHourEnd).format('HH:mm');

  const result = {
    altitude,
    azimuth,
    sunrise,
    sunset,
    goldenHour: {
      morning: goldenHourMorning,
      evening: goldenHourEvening
    }
  };
  
  console.log('太阳位置计算结果:', result);
  return result;
};

// 计算月亮位置（使用SunCalc）
const calculateMoonPosition = (date, latitude, longitude) => {
  console.log('计算月亮位置 - 输入参数:', { date, latitude, longitude });
  
  const moonPos = SunCalc.getMoonPosition(date, latitude, longitude);
  const moonIllumination = SunCalc.getMoonIllumination(date);
  
  // 转换弧度到角度
  const altitude = (moonPos.altitude * 180) / Math.PI;
  const azimuth = ((moonPos.azimuth * 180) / Math.PI + 180) % 360; // 转换为0-360度，北为0度

  // 获取月相信息
  const phase = moonIllumination.phase;
  let phaseName = '';
  if (phase < 0.25) phaseName = '新月';
  else if (phase < 0.5) phaseName = '上弦月';
  else if (phase < 0.75) phaseName = '满月';
  else phaseName = '下弦月';

  // 获取月亮升起和落下时间
  const times = SunCalc.getMoonTimes(date, latitude, longitude);
  const moonrise = times.rise ? dayjs(times.rise).format('HH:mm') : '不升起';
  const moonset = times.set ? dayjs(times.set).format('HH:mm') : '不落下';

  const result = {
    altitude,
    azimuth,
    phase: phaseName,
    moonrise,
    moonset
  };
  
  console.log('月亮位置计算结果:', result);
  return result;
};

// 拍摄计划相关API
export const planAPI = {
  // 获取拍摄计划列表
  getPlans: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.user_id) searchParams.append('user_id', params.user_id);
      if (params.skip !== undefined) searchParams.append('skip', params.skip);
      if (params.limit !== undefined) searchParams.append('limit', params.limit);
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `/plans?${queryString}` : '/plans';
      
      return await apiRequest(endpoint);
    } catch (error) {
      console.warn('后端API不可用，使用模拟数据:', error.message);
      // 返回模拟数据
      const { user_id, skip = 0, limit = 100 } = params;
      let filteredPlans = mockPlans;
      
      if (user_id) {
        filteredPlans = mockPlans.filter(plan => plan.user_id === user_id);
      }
      
      return filteredPlans.slice(skip, skip + limit);
    }
  },

  // 获取指定拍摄计划
  getPlan: async (planId) => {
    try {
      return await apiRequest(`/plans/${planId}`);
    } catch (error) {
      console.warn('后端API不可用，使用模拟数据:', error.message);
      // 返回模拟数据
      const plan = mockPlans.find(p => p.id.toString() === planId.toString());
      if (!plan) {
        throw new Error('计划未找到');
      }
      return plan;
    }
  },

  // 创建拍摄计划
  createPlan: async (planData) => {
    try {
      return await apiRequest('/plans', {
        method: 'POST',
        body: JSON.stringify(planData),
      });
    } catch (error) {
      console.warn('后端API不可用，使用模拟创建:', error.message);
      // 模拟创建
      const newPlan = {
        ...planData,
        id: Math.max(...mockPlans.map(p => p.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockPlans.push(newPlan);
      return newPlan;
    }
  },

  // 更新拍摄计划
  updatePlan: async (planId, planData) => {
    try {
      return await apiRequest(`/plans/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify(planData),
      });
    } catch (error) {
      console.warn('后端API不可用，使用模拟更新:', error.message);
      // 模拟更新
      const planIndex = mockPlans.findIndex(p => p.id.toString() === planId.toString());
      if (planIndex === -1) {
        throw new Error('计划未找到');
      }
      
      mockPlans[planIndex] = {
        ...mockPlans[planIndex],
        ...planData,
        updated_at: new Date().toISOString()
      };
      
      return mockPlans[planIndex];
    }
  },

  // 删除拍摄计划
  deletePlan: async (planId) => {
    try {
      return await apiRequest(`/plans/${planId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('后端API不可用，使用模拟删除:', error.message);
      // 模拟删除
      const planIndex = mockPlans.findIndex(p => p.id.toString() === planId.toString());
      if (planIndex === -1) {
        throw new Error('计划未找到');
      }
      
      mockPlans.splice(planIndex, 1);
      return null;
    }
  },
};

// 天文数据相关API - 使用SunCalc库进行本地计算
export const astronomyAPI = {
  // 获取指定位置和时间的天文数据
  getAstronomyData: async (params) => {
    const { latitude, longitude, datetime } = params;
    
    try {
      console.log('计算天文数据 - 参数:', { latitude, longitude, datetime });
      
      const date = new Date(datetime);
      
      // 使用SunCalc计算太阳和月亮位置
      const sunPosition = calculateSunPosition(date, latitude, longitude);
      const moonPosition = calculateMoonPosition(date, latitude, longitude);
      
      return {
        sunPosition,
        moonPosition
      };
      
    } catch (error) {
      console.error('计算天文数据失败:', error);
      throw error;
    }
  },

  // 获取太阳位置数据
  getSunPosition: async (params) => {
    const { latitude, longitude, datetime } = params;
    
    try {
      console.log('计算太阳位置 - 参数:', { latitude, longitude, datetime });
      
      const date = new Date(datetime);
      return calculateSunPosition(date, latitude, longitude);
      
    } catch (error) {
      console.error('计算太阳位置失败:', error);
      throw error;
    }
  },

  // 获取月亮位置数据
  getMoonPosition: async (params) => {
    const { latitude, longitude, datetime } = params;
    
    try {
      console.log('计算月亮位置 - 参数:', { latitude, longitude, datetime });
      
      const date = new Date(datetime);
      return calculateMoonPosition(date, latitude, longitude);
      
    } catch (error) {
      console.error('计算月亮位置失败:', error);
      throw error;
    }
  },

  // 获取天气数据 - 使用 Visual Crossing Weather API
  getWeatherData: async (params) => {
    const { latitude, longitude, datetime } = params;
    
    try {
      // 构建位置字符串（经纬度格式）
      const location = `${latitude},${longitude}`;
      
      // 将datetime转换为YYYY-MM-DD格式
      const date = new Date(datetime);
      const dateString = date.toISOString().split('T')[0];
      
      // 调用Visual Crossing Weather API
      const weatherData = await weatherRequest(location, dateString);
      
      // 转换数据格式以适应现有的UI组件
      return transformWeatherData(weatherData);
      
    } catch (error) {
      console.warn('获取天气数据失败，使用模拟数据:', error);
      // 返回模拟天气数据
      return {
        temperature: 25,
        feelsLike: 27,
        humidity: 65,
        cloudCover: 20,
        visibility: "良好",
        windSpeed: 10,
        windDirection: 180,
        precipitation: 0,
        precipitationProbability: 10,
        conditions: "晴朗",
        description: "天气晴朗，适合拍摄",
        forecast: "晴朗"
      };
    }
  },
};

// 转换天气数据格式以适应现有的UI组件
const transformWeatherData = (weatherData) => {
  const currentConditions = weatherData.currentConditions || weatherData.days?.[0];
  const todayData = weatherData.days?.[0];
  
  if (!currentConditions && !todayData) {
    throw new Error('无效的天气数据格式');
  }
  
  const data = currentConditions || todayData;
  
  return {
    temperature: Math.round(data.temp || 0),
    feelsLike: Math.round(data.feelslike || data.temp || 0),
    humidity: Math.round(data.humidity || 0),
    cloudCover: Math.round(data.cloudcover || 0),
    visibility: data.visibility ? `${Math.round(data.visibility)}km` : '良好',
    windSpeed: Math.round(data.windspeed || 0),
    windDirection: Math.round(data.winddir || 0),
    precipitation: Math.round((data.precip || 0) * 10) / 10, // 保留一位小数
    precipitationProbability: Math.round(data.precipprob || 0),
    conditions: data.conditions || '未知',
    description: weatherData.description || data.description || '无描述',
    forecast: data.conditions || '晴朗',
    // 原始数据，供高级用户使用
    raw: {
      current: currentConditions,
      today: todayData,
      days: weatherData.days,
      alerts: weatherData.alerts
    }
  };
};

// WebSocket 连接管理
export class RenderWebSocket {
  constructor(planId) {
    this.planId = planId;
    this.ws = null;
    this.onFrame = null;
    this.onError = null;
    this.onClose = null;
  }

  connect() {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws/render/${this.planId}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立');
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'frame' && this.onFrame) {
          this.onFrame(data);
        } else if (data.type === 'error' && this.onError) {
          this.onError(data.message);
        }
      } catch (error) {
        console.error('WebSocket 消息解析错误:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket 连接已关闭', event.code, event.reason);
      if (this.onClose) {
        this.onClose(event);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      if (this.onError) {
        this.onError('WebSocket 连接错误');
      }
    };
  }

  startRender() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'start_render' }));
    }
  }

  stopRender() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'stop_render' }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default apiRequest; 