# API 使用示例

本文档说明如何在 DreamCatcher 前端项目中使用 API 服务。

## API 服务层

我们在 `src/services/api.js` 中创建了统一的 API 服务层，包括：

### 1. 计划管理 API (`planAPI`)

```javascript
import { planAPI } from '../services/api';

// 获取计划列表
const plans = await planAPI.getPlans({
  user_id: 'test_user_123',
  skip: 0,
  limit: 10
});

// 获取单个计划
const plan = await planAPI.getPlan(planId);

// 创建计划
const newPlan = await planAPI.createPlan({
  name: "新计划",
  description: "描述信息",
  start_time: "2025-04-25T10:00:00Z",
  camera: {
    focal_length: 35.0,
    position: [30.2741, 120.1551, 100.0],
    rotation: [0.0, 0.0, 0.0, 1.0]
  },
  tileset_url: "https://mycdn.com/city/tileset.json",
  user_id: "test_user_123"
});

// 更新计划
const updatedPlan = await planAPI.updatePlan(planId, {
  name: "修改后的名称",
  camera: {
    position: [30.3000, 120.2000, 150.0]
  }
});

// 删除计划
await planAPI.deletePlan(planId);
```

### 2. 天文数据 API (`astronomyAPI`)

天文数据使用 [SunCalc](https://github.com/mourner/suncalc) 库进行本地计算，无需后端API支持。

```javascript
import { astronomyAPI } from '../services/api';

// 获取完整天文数据（太阳和月亮位置）
const astroData = await astronomyAPI.getAstronomyData({
  latitude: 30.2741,
  longitude: 120.1551,
  datetime: "2025-04-25T10:00:00Z"
});

// 获取太阳位置
const sunData = await astronomyAPI.getSunPosition({
  latitude: 30.2741,
  longitude: 120.1551,
  datetime: "2025-04-25T10:00:00Z"
});

// 获取月亮位置
const moonData = await astronomyAPI.getMoonPosition({
  latitude: 30.2741,
  longitude: 120.1551,
  datetime: "2025-04-25T10:00:00Z"
});

// 获取天气数据 - 使用 Visual Crossing Weather API
const weatherData = await astronomyAPI.getWeatherData({
  latitude: 30.2741,
  longitude: 120.1551,
  datetime: "2025-04-25T10:00:00Z"
});
```

### 天文数据结构

#### 太阳位置数据：

```javascript
{
  altitude: 45,           // 太阳高度角 (度)
  azimuth: 180,          // 太阳方位角 (度，北为0度)
  sunrise: "06:00",      // 日出时间
  sunset: "18:00",       // 日落时间
  goldenHour: {
    morning: "05:30",    // 晨光黄金时刻
    evening: "17:30"     // 傍晚黄金时刻
  }
}
```

#### 月亮位置数据：

```javascript
{
  altitude: 30,          // 月亮高度角 (度)
  azimuth: 90,           // 月亮方位角 (度，北为0度)
  phase: "上弦月",       // 月相名称
  moonrise: "20:00",     // 月出时间
  moonset: "08:00"       // 月落时间
}
```

### 天气数据结构

天气API返回的数据格式：

```javascript
{
  temperature: 25,          // 温度 (°C)
  feelsLike: 27,           // 体感温度 (°C)
  humidity: 65,            // 湿度 (%)
  cloudCover: 20,          // 云量 (%)
  visibility: "10km",      // 能见度
  windSpeed: 10,           // 风速 (km/h)
  windDirection: 180,      // 风向 (度)
  precipitation: 0.5,      // 降水量 (mm)
  precipitationProbability: 10,  // 降水概率 (%)
  conditions: "晴朗",      // 天气状况
  description: "天气晴朗，适合拍摄",  // 天气描述
  forecast: "晴朗",        // 天气预报
  raw: {                   // 原始数据
    current: {},           // 当前天气
    today: {},             // 今日天气
    days: [],              // 多日天气
    alerts: []             // 天气警报
  }
}
```

### 3. WebSocket 渲染 API

```javascript
import { RenderWebSocket } from '../services/api';

const renderWS = new RenderWebSocket(planId);

// 设置事件处理器
renderWS.onFrame = (frameData) => {
  console.log('收到渲染帧:', frameData);
  // 处理渲染帧数据
};

renderWS.onError = (errorMessage) => {
  console.error('渲染错误:', errorMessage);
};

renderWS.onClose = (event) => {
  console.log('连接关闭:', event);
};

// 连接并开始渲染
renderWS.connect();
renderWS.startRender();

// 停止渲染并断开连接
renderWS.stopRender();
renderWS.disconnect();
```

## SunCalc天文计算库

### 库概述

项目使用 [SunCalc](https://github.com/mourner/suncalc) 库进行天文数据的本地计算，这是一个轻量级的JavaScript库，用于计算太阳和月亮的位置。

**特性**:
- 本地计算，无需网络请求
- 高精度的天文算法
- 支持全球任意位置和时间
- 计算结果包括：
  - 太阳/月亮的高度角和方位角
  - 日出/日落时间
  - 月出/月落时间
  - 黄金时刻计算
  - 月相信息

### 计算原理

```javascript
import SunCalc from 'suncalc';

// 计算太阳位置
const sunPosition = SunCalc.getPosition(date, latitude, longitude);
const sunTimes = SunCalc.getTimes(date, latitude, longitude);

// 计算月亮位置
const moonPosition = SunCalc.getMoonPosition(date, latitude, longitude);
const moonIllumination = SunCalc.getMoonIllumination(date);
const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
```

### 测试天文数据

在开发环境中可以使用内置的测试工具：

```javascript
// 在浏览器控制台中
await window.weatherTest.astronomy();    // 测试天文数据计算
await window.weatherTest.sun();          // 测试太阳位置计算
await window.weatherTest.moon();         // 测试月亮位置计算
await window.weatherTest.testAll();      // 综合测试所有API
```

## 天气API配置

### Visual Crossing Weather API

项目使用 [Visual Crossing Weather API](https://www.visualcrossing.com/) 获取天气数据。

**配置信息**:
- API Key: `MH6U532HQG8TRFKWALAVED8J9`
- 基础URL: `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline`

**API特性**:
- 支持历史天气数据查询
- 支持天气预报
- 提供详细的天气指标
- 包含天气警报信息

### 测试天气API

在开发环境中，可以使用内置的测试工具：

```javascript
// 在浏览器控制台中
await window.weatherTest.test();

// 测试特定日期和位置的天气
await window.weatherTest.testDate(30.2741, 120.1551, '2025-04-25T10:00:00Z');
```

或者在代码中：

```javascript
import { testWeatherAPI, testWeatherForDate } from '../utils/weatherTest';

// 测试默认位置的天气
const result = await testWeatherAPI();
console.log(result);

// 测试指定位置和日期的天气
const weatherData = await testWeatherForDate(
  30.2741,  // 纬度
  120.1551, // 经度
  '2025-04-25T10:00:00Z'  // 日期时间
);
```

## 错误处理

### 1. 使用 try-catch 处理错误

```javascript
try {
  const plan = await planAPI.getPlan(planId);
  setPlanData(plan);
} catch (error) {
  console.error('获取计划失败:', error);
  message.error(`加载失败: ${error.message}`);
}
```

### 2. 天气API错误处理

```javascript
try {
  const weatherData = await astronomyAPI.getWeatherData(params);
  setWeatherData(weatherData);
} catch (error) {
  console.warn('获取天气数据失败，使用默认数据:', error);
  // 使用默认天气数据
  setWeatherData(defaultWeatherData);
}
```

### 3. 使用 ErrorDisplay 组件

```javascript
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';

// 在组件中
if (error) {
  return (
    <ErrorDisplay 
      error={error}
      title="加载数据失败"
      onReload={() => {
        setError(null);
        fetchData();
      }}
    />
  );
}
```

## 在组件中的完整示例

### PlanDetailsPage 示例

```javascript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { planAPI, astronomyAPI } from '../services/api';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';

function PlanDetailsPage() {
  const { id } = useParams();
  const [planData, setPlanData] = useState(null);
  const [astronomicalData, setAstronomicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取计划数据
        const plan = await planAPI.getPlan(id);
        setPlanData(plan);
        
        // 获取天气数据
        try {
          const weatherData = await astronomyAPI.getWeatherData({
            latitude: plan.camera.position[0],
            longitude: plan.camera.position[1],
            datetime: plan.start_time
          });
          
          // 获取天文数据（可选，有降级机制）
          let sunPosition, moonPosition;
          try {
            const astroData = await astronomyAPI.getAstronomyData({
              latitude: plan.camera.position[0],
              longitude: plan.camera.position[1],
              datetime: plan.start_time
            });
            sunPosition = astroData.sunPosition;
            moonPosition = astroData.moonPosition;
          } catch (astroError) {
            // 使用模拟天文数据
            sunPosition = mockSunData;
            moonPosition = mockMoonData;
          }
          
          setAstronomicalData({
            sunPosition,
            moonPosition,
            weather: weatherData
          });
          
        } catch (weatherError) {
          // 使用完整的模拟数据
          setAstronomicalData(mockAllData);
        }
        
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error}
        onReload={() => window.location.reload()}
      />
    );
  }

  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
}
```

## 配置说明

### API 基础 URL

在 `src/services/api.js` 中配置：

```javascript
const API_BASE_URL = '/api/v1';
const WEATHER_API_KEY = 'MH6U532HQG8TRFKWALAVED8J9';
const WEATHER_API_BASE = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
```

### 开发环境代理

在开发环境中，可以在 `package.json` 或代理配置中设置：

```json
{
  "proxy": "http://localhost:8000"
}
```

或在 Vite 配置中：

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
}
```

## 注意事项

1. **错误处理**: 始终使用 try-catch 包装 API 调用
2. **加载状态**: 在 API 调用期间显示加载指示器
3. **用户反馈**: 使用 message 组件向用户显示操作结果
4. **降级方案**: 对于非关键数据（如天文数据），提供模拟数据作为降级
5. **WebSocket 清理**: 组件卸载时记得断开 WebSocket 连接
6. **天气API限制**: Visual Crossing API 有请求频率限制，注意合理使用
7. **CORS问题**: 如果遇到跨域问题，需要配置代理或后端代理

## 测试

在开发过程中，可以使用模拟数据来测试组件：

```javascript
// 在 API 调用失败时使用的模拟数据
const mockWeatherData = {
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
``` 