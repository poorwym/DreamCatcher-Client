# 开发指南

## 项目概述

DreamCatcher-Client 是一个前端应用，用于管理摄影拍摄计划。项目支持在后端API不可用的情况下自动降级到模拟数据，确保开发和演示的连续性。

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
```

### 2. 启动开发服务器

```bash
npm start
# 或
yarn start
```

应用将在 `http://localhost:3000` 启动。

## API 状态处理

### 自动降级机制

项目实现了智能的API状态检测和自动降级机制：

1. **后端可用**: 使用真实的后端API
2. **后端不可用**: 自动降级到模拟数据，确保功能正常运行

### 状态检测

系统会自动检测以下情况：
- 响应Content-Type为HTML而不是JSON（通常是404页面）
- 网络连接错误
- 服务器错误

### 模拟数据

在 `src/services/api.js` 中包含了完整的模拟数据：

```javascript
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
  }
  // ... 更多模拟数据
];
```

## 错误处理策略

### 1. 网络层错误处理

```javascript
try {
  const plan = await planAPI.getPlan(planId);
  setPlanData(plan);
} catch (error) {
  console.warn('使用模拟数据:', error.message);
  // 自动降级到模拟数据
}
```

### 2. UI层错误显示

使用 `ErrorDisplay` 组件处理错误：

```javascript
if (error) {
  return (
    <ErrorDisplay 
      error={error}
      title="加载数据失败"
      onReload={() => window.location.reload()}
    />
  );
}
```

## 开发环境配置

### 代理设置

如果有后端服务，可以在 `package.json` 中配置代理：

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

### 环境变量

创建 `.env.local` 文件：

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_WEATHER_API_KEY=MH6U532HQG8TRFKWALAVED8J9
```

## 后端API规范

如果要实现真实的后端，需要提供以下端点：

### 1. 计划管理API

```
GET    /api/v1/plans           # 获取计划列表
GET    /api/v1/plans/{id}      # 获取特定计划
POST   /api/v1/plans           # 创建计划
PATCH  /api/v1/plans/{id}      # 更新计划
DELETE /api/v1/plans/{id}      # 删除计划
```

### 2. 天文数据API（可选）

```
GET /api/v1/astronomy          # 获取天文数据
GET /api/v1/astronomy/sun      # 获取太阳位置
GET /api/v1/astronomy/moon     # 获取月亮位置
```

### 3. 健康检查API（推荐）

```
GET /api/v1/health             # 服务健康检查
```

## 天气API配置

项目使用 Visual Crossing Weather API：

- **API Key**: `MH6U532HQG8TRFKWALAVED8J9`
- **文档**: https://www.visualcrossing.com/resources/documentation/weather-api/

### 使用方式

```javascript
const weatherData = await astronomyAPI.getWeatherData({
  latitude: 30.2741,
  longitude: 120.1551,
  datetime: "2025-04-25T10:00:00Z"
});
```

## 调试工具

### 天气API测试

在开发环境中可以使用：

```javascript
// 在浏览器控制台
await window.weatherTest.test();
```

### API状态检查

在控制台中查看API调用状态：

```javascript
// 控制台会显示：
// "使用模拟数据: Backend not available"
// 或
// "API调用成功"
```

## 常见问题

### Q: 为什么看到 "使用模拟数据" 的警告？

A: 这是正常现象，说明后端API不可用，系统自动使用模拟数据。这不会影响功能，只是数据来源不同。

### Q: 如何启用真实的后端API？

A: 
1. 确保后端服务运行在正确的端口
2. 配置代理设置
3. 确保后端提供了正确的API端点

### Q: 模拟数据可以修改吗？

A: 可以，但只在浏览器会话期间有效。刷新页面后会恢复到初始状态。

### Q: 天气数据为什么有时显示模拟数据？

A: 可能的原因：
- Visual Crossing API配额用完
- 网络连接问题
- API Key无效

## 部署注意事项

### 生产环境

1. **环境变量**: 确保设置正确的API地址
2. **代理配置**: 生产环境可能需要不同的代理配置
3. **HTTPS**: 确保天气API在HTTPS环境下正常工作

### 静态部署

如果只进行静态部署（如GitHub Pages），应用会自动使用模拟数据，功能完全正常。

## 开发最佳实践

1. **错误处理**: 始终为API调用添加try-catch
2. **用户体验**: 显示适当的加载状态和错误信息
3. **降级策略**: 为关键功能提供备用方案
4. **日志记录**: 使用console.warn记录API状态，便于调试

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建Pull Request

确保新功能都有适当的错误处理和降级机制。 