/**
 * API服务 - 与后端REST API通信 (Vite版本)
 */

// API基础配置 - 修复：使用 import.meta.env 替代 process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/api/v1/ws';

// 通用请求配置
const defaultHeaders = {
  'Content-Type': 'application/json',
  // 后续可添加认证头
  // 'Authorization': `Bearer ${getToken()}`
};

/**
 * 通用HTTP请求封装
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    console.log(`🌐 API请求: ${config.method || 'GET'} ${url}`);
    if (config.body) {
      console.log('📤 请求数据:', JSON.parse(config.body));
    }

    const response = await fetch(url, config);
    
    // 处理非2xx状态码
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    // 204 No Content 不返回数据
    if (response.status === 204) {
      console.log('✅ API响应: 204 No Content');
      return null;
    }

    const data = await response.json();
    console.log('✅ API响应:', data);
    return data;
    
  } catch (error) {
    console.error('❌ API请求失败:', error);
    throw error;
  }
};

/**
 * 计划数据转换 - 前端格式 -> 后端格式
 */
const transformPlanToAPI = (frontendPlan) => {
  return {
    name: frontendPlan.planName || frontendPlan.name,
    description: frontendPlan.description || '',
    start_time: frontendPlan.shootingDate ? 
      `${frontendPlan.shootingDate}T${frontendPlan.shootingTime || '00:00:00'}Z` : 
      new Date().toISOString(),
    camera: {
      focal_length: parseFloat(frontendPlan.focalLength || 50),
      position: [
        parseFloat(frontendPlan.longitude || 0),
        parseFloat(frontendPlan.latitude || 0),
        parseFloat(frontendPlan.altitude || 0)
      ],
      rotation: [0.0, 0.0, 0.0, 1.0] // 默认旋转
    },
    tileset_url: frontendPlan.tilesetUrl || '', // 可选的3D模型URL
    user_id: frontendPlan.userId || 'default_user', // 临时用户ID
    // 保留前端特有字段作为扩展数据
    frontend_data: {
      tags: frontendPlan.tags || [],
      location: frontendPlan.location || '',
      aperture: frontendPlan.aperture || '1.5'
    }
  };
};

/**
 * 计划数据转换 - 后端格式 -> 前端格式
 */
const transformPlanFromAPI = (apiPlan) => {
  const frontendData = apiPlan.frontend_data || {};
  
  return {
    id: apiPlan.id.toString(),
    name: apiPlan.name,
    planName: apiPlan.name, // 兼容字段
    description: apiPlan.description,
    shootingDate: apiPlan.start_time ? apiPlan.start_time.split('T')[0] : '',
    shootingTime: apiPlan.start_time ? 
      apiPlan.start_time.split('T')[1]?.split('Z')[0] || '' : '',
    location: frontendData.location || '未知位置',
    latitude: apiPlan.camera?.position?.[1]?.toString() || '',
    longitude: apiPlan.camera?.position?.[0]?.toString() || '',
    altitude: apiPlan.camera?.position?.[2]?.toString() || '',
    focalLength: apiPlan.camera?.focal_length?.toString() || '50',
    aperture: frontendData.aperture || '1.5',
    tags: frontendData.tags || [],
    tilesetUrl: apiPlan.tileset_url || '',
    userId: apiPlan.user_id,
    createdAt: apiPlan.created_at,
    updatedAt: apiPlan.updated_at,
    
    // 保留完整的API数据
    _apiData: apiPlan
  };
};

/**
 * 拍摄计划API服务
 */
class PlanAPIService {
  /**
   * 获取所有计划
   */
  static async getAllPlans(userId = 'default_user', skip = 0, limit = 100) {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        skip: skip.toString(),
        limit: limit.toString()
      });
      
      const apiPlans = await apiRequest(`/plans?${params}`);
      return apiPlans.map(transformPlanFromAPI);
    } catch (error) {
      console.error('获取计划列表失败:', error);
      throw new Error(`获取计划失败: ${error.message}`);
    }
  }

  /**
   * 根据ID获取计划
   */
  static async getPlanById(planId) {
    try {
      const apiPlan = await apiRequest(`/plans/${planId}`);
      return transformPlanFromAPI(apiPlan);
    } catch (error) {
      console.error(`获取计划${planId}失败:`, error);
      throw new Error(`获取计划失败: ${error.message}`);
    }
  }

  /**
   * 创建新计划
   */
  static async createPlan(planData) {
    try {
      const apiPlanData = transformPlanToAPI(planData);
      const createdPlan = await apiRequest('/plans', {
        method: 'POST',
        body: JSON.stringify(apiPlanData)
      });
      
      return transformPlanFromAPI(createdPlan);
    } catch (error) {
      console.error('创建计划失败:', error);
      throw new Error(`创建计划失败: ${error.message}`);
    }
  }

  /**
   * 更新计划
   */
  static async updatePlan(planId, updateData) {
    try {
      const apiUpdateData = transformPlanToAPI(updateData);
      const updatedPlan = await apiRequest(`/plans/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify(apiUpdateData)
      });
      
      return transformPlanFromAPI(updatedPlan);
    } catch (error) {
      console.error(`更新计划${planId}失败:`, error);
      throw new Error(`更新计划失败: ${error.message}`);
    }
  }

  /**
   * 删除计划
   */
  static async deletePlan(planId) {
    try {
      await apiRequest(`/plans/${planId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error(`删除计划${planId}失败:`, error);
      throw new Error(`删除计划失败: ${error.message}`);
    }
  }

  /**
   * 获取最近计划（模拟前端逻辑）
   */
  static async getRecentPlans(userId = 'default_user') {
    const allPlans = await this.getAllPlans(userId);
    const now = new Date();
    
    return allPlans
      .filter(plan => new Date(plan.shootingDate) < now)
      .sort((a, b) => new Date(b.shootingDate) - new Date(a.shootingDate));
  }

  /**
   * 获取即将拍摄计划（模拟前端逻辑）
   */
  static async getUpcomingPlans(userId = 'default_user') {
    const allPlans = await this.getAllPlans(userId);
    const now = new Date();
    
    return allPlans
      .filter(plan => new Date(plan.shootingDate) >= now)
      .sort((a, b) => new Date(a.shootingDate) - new Date(b.shootingDate));
  }
}

/**
 * WebSocket渲染服务
 */
class RenderWebSocketService {
  constructor(planId) {
    this.planId = planId;
    this.ws = null;
    this.isConnected = false;
    this.onFrame = null;
    this.onError = null;
    this.onConnect = null;
    this.onDisconnect = null;
  }

  /**
   * 连接WebSocket
   */
  connect() {
    return new Promise((resolve, reject) => {
      const wsUrl = `${WS_BASE_URL}/render/${this.planId}`;
      console.log(`🔌 连接渲染WebSocket: ${wsUrl}`);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket连接成功');
        this.isConnected = true;
        this.onConnect?.();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'frame') {
            this.onFrame?.(data);
          } else if (data.type === 'error') {
            console.error('❌ 渲染错误:', data.message);
            this.onError?.(data.message);
          }
        } catch (error) {
          console.error('❌ WebSocket消息解析失败:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket连接关闭:', event.code, event.reason);
        this.isConnected = false;
        this.onDisconnect?.(event);
        
        if (event.code === 1008) {
          reject(new Error('计划不存在'));
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket错误:', error);
        reject(error);
      };
    });
  }

  /**
   * 开始渲染
   */
  startRender() {
    if (this.isConnected) {
      this.ws.send(JSON.stringify({ action: 'start_render' }));
      console.log('🎬 开始渲染');
    }
  }

  /**
   * 停止渲染
   */
  stopRender() {
    if (this.isConnected) {
      this.ws.send(JSON.stringify({ action: 'stop_render' }));
      console.log('⏹️ 停止渲染');
    }
  }

  /**
   * 关闭连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * 设置事件监听器
   */
  setEventListeners({ onFrame, onError, onConnect, onDisconnect }) {
    this.onFrame = onFrame;
    this.onError = onError;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
  }
}

/**
 * 连接状态检查
 */
const checkAPIConnection = async () => {
  try {
    // 尝试获取计划列表来检查连接
    await apiRequest('/plans?limit=1');
    return { connected: true, message: 'API连接正常' };
  } catch (error) {
    return { connected: false, message: `API连接失败: ${error.message}` };
  }
};

/**
 * 兼容性适配器 - 保持与原有 PlanStorage 接口一致
 */
const PlanStorageAdapter = {
  /**
   * 获取最近计划
   */
  getRecentPlans: () => {
    return PlanAPIService.getRecentPlans().catch(error => {
      console.warn('API获取失败，返回空数组:', error);
      return [];
    });
  },

  /**
   * 获取即将拍摄计划
   */
  getUpcomingPlans: () => {
    return PlanAPIService.getUpcomingPlans().catch(error => {
      console.warn('API获取失败，返回空数组:', error);
      return [];
    });
  },

  /**
   * 添加新计划
   */
  addNewPlan: async (planData) => {
    try {
      return await PlanAPIService.createPlan(planData);
    } catch (error) {
      console.error('API创建失败:', error);
      throw error;
    }
  },

  /**
   * 获取所有计划
   */
  getAllPlans: async () => {
    try {
      const [recentPlans, upcomingPlans] = await Promise.all([
        PlanAPIService.getRecentPlans(),
        PlanAPIService.getUpcomingPlans()
      ]);
      
      return {
        recentPlans,
        upcomingPlans
      };
    } catch (error) {
      console.warn('API获取失败，返回空数据:', error);
      return {
        recentPlans: [],
        upcomingPlans: []
      };
    }
  },

  /**
   * 根据ID获取计划
   */
  getPlanById: (id) => {
    return PlanAPIService.getPlanById(id).catch(error => {
      console.warn(`API获取计划${id}失败:`, error);
      return null;
    });
  },

  /**
   * 删除计划
   */
  deletePlan: async (id) => {
    try {
      await PlanAPIService.deletePlan(id);
      return true;
    } catch (error) {
      console.error(`API删除计划${id}失败:`, error);
      return false;
    }
  },

  /**
   * 更新计划
   */
  updatePlan: async (id, updateData) => {
    try {
      return await PlanAPIService.updatePlan(id, updateData);
    } catch (error) {
      console.error(`API更新计划${id}失败:`, error);
      return null;
    }
  },

  /**
   * 清空所有数据 (API版本不需要实现)
   */
  clearAllData: () => {
    console.warn('API模式下不支持清空所有数据');
    return Promise.resolve(false);
  },

  /**
   * 重置为默认数据 (API版本不需要实现)
   */
  resetToDefault: () => {
    console.warn('API模式下不支持重置默认数据');
    return Promise.resolve(false);
  }
};

// 在开发模式下显示配置信息
if (import.meta.env.DEV) {
  console.log('🔧 Vite API服务配置:');
  console.log('📡 API Base URL:', API_BASE_URL);
  console.log('🔌 WebSocket URL:', WS_BASE_URL);
  console.log('🌍 环境:', import.meta.env.VITE_ENV || 'development');
}

// 导出服务
export {
  PlanAPIService,
  RenderWebSocketService,
  PlanStorageAdapter as default,
  checkAPIConnection,
  API_BASE_URL,
  WS_BASE_URL
};