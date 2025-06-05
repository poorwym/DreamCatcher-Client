// API配置
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://your-production-domain.com/api/v1',
    timeout: 15000,
  }
};

// 根据环境变量选择配置
const currentEnv = process.env.NODE_ENV || 'development';
export const apiConfig = API_CONFIG[currentEnv];

// 导出可配置的API基础URL
export const API_BASE_URL = apiConfig.baseURL;
export const API_TIMEOUT = apiConfig.timeout;

// WebSocket配置
export const WS_CONFIG = {
  development: {
    baseURL: 'ws://localhost:8000',
  },
  production: {
    baseURL: 'wss://your-production-domain.com',
  }
};

export const WS_BASE_URL = WS_CONFIG[currentEnv].baseURL;

// 错误消息映射
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNAUTHORIZED: '未授权访问，请重新登录',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '输入数据格式错误',
  SERVICE_UNAVAILABLE: '服务暂时不可用，请稍后重试',
  QUOTA_EXCEEDED: 'API调用次数已达上限',
  TIMEOUT: '请求超时，请重试'
};

export default apiConfig; 