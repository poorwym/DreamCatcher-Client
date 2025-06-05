/**
 * 混合计划存储服务 - 优先使用API，失败时回退到本地存储，并添加状态标识
 */
import { PlanAPIService, checkAPIConnection } from './apiService';
import PlanLocalStorage from './planStorage';

/**
 * 数据源枚举
 */
export const DATA_SOURCE = {
  API: 'api',
  LOCAL: 'local',
  UNKNOWN: 'unknown'
};

/**
 * 混合存储服务类
 */
class HybridPlanStorage {
  /**
   * 获取最近计划 - 优先API，失败时回退本地存储
   */
  static async getRecentPlans() {
    try {
      console.log('🔄 尝试从API获取最近计划...');
      const apiPlans = await PlanAPIService.getRecentPlans();
      console.log('✅ API获取成功，计划数量:', apiPlans.length);
      
      return {
        data: apiPlans,
        source: DATA_SOURCE.API,
        error: null
      };
    } catch (error) {
      console.warn('⚠️ API获取失败，回退到本地存储:', error.message);
      
      try {
        const localPlans = PlanLocalStorage.getRecentPlans();
        console.log('🔄 本地存储获取成功，计划数量:', localPlans.length);
        
        return {
          data: localPlans,
          source: DATA_SOURCE.LOCAL,
          error: error.message
        };
      } catch (localError) {
        console.error('❌ 本地存储也失败:', localError);
        return {
          data: [],
          source: DATA_SOURCE.UNKNOWN,
          error: `API和本地存储都失败: API(${error.message}) 本地(${localError.message})`
        };
      }
    }
  }

  /**
   * 获取即将拍摄计划 - 优先API，失败时回退本地存储
   */
  static async getUpcomingPlans() {
    try {
      console.log('🔄 尝试从API获取即将拍摄计划...');
      const apiPlans = await PlanAPIService.getUpcomingPlans();
      console.log('✅ API获取成功，计划数量:', apiPlans.length);
      
      return {
        data: apiPlans,
        source: DATA_SOURCE.API,
        error: null
      };
    } catch (error) {
      console.warn('⚠️ API获取失败，回退到本地存储:', error.message);
      
      try {
        const localPlans = PlanLocalStorage.getUpcomingPlans();
        console.log('🔄 本地存储获取成功，计划数量:', localPlans.length);
        
        return {
          data: localPlans,
          source: DATA_SOURCE.LOCAL,
          error: error.message
        };
      } catch (localError) {
        console.error('❌ 本地存储也失败:', localError);
        return {
          data: [],
          source: DATA_SOURCE.UNKNOWN,
          error: `API和本地存储都失败: API(${error.message}) 本地(${localError.message})`
        };
      }
    }
  }

  /**
   * 获取所有计划 - 优先API，失败时回退本地存储
   */
  static async getAllPlans() {
    try {
      console.log('🔄 尝试从API获取所有计划...');
      const [recentResult, upcomingResult] = await Promise.allSettled([
        this.getRecentPlans(),
        this.getUpcomingPlans()
      ]);

      const recentData = recentResult.status === 'fulfilled' ? recentResult.value : { data: [], source: DATA_SOURCE.UNKNOWN, error: 'Promise失败' };
      const upcomingData = upcomingResult.status === 'fulfilled' ? upcomingResult.value : { data: [], source: DATA_SOURCE.UNKNOWN, error: 'Promise失败' };

      // 判断整体数据源
      let overallSource = DATA_SOURCE.API;
      let errors = [];

      if (recentData.source === DATA_SOURCE.LOCAL || upcomingData.source === DATA_SOURCE.LOCAL) {
        overallSource = DATA_SOURCE.LOCAL;
      }
      if (recentData.source === DATA_SOURCE.UNKNOWN || upcomingData.source === DATA_SOURCE.UNKNOWN) {
        overallSource = DATA_SOURCE.UNKNOWN;
      }

      if (recentData.error) errors.push(`最近计划: ${recentData.error}`);
      if (upcomingData.error) errors.push(`即将拍摄: ${upcomingData.error}`);

      return {
        data: {
          recentPlans: recentData.data,
          upcomingPlans: upcomingData.data
        },
        source: overallSource,
        error: errors.length > 0 ? errors.join('; ') : null
      };
    } catch (error) {
      console.error('❌ 获取所有计划失败:', error);
      return {
        data: {
          recentPlans: [],
          upcomingPlans: []
        },
        source: DATA_SOURCE.UNKNOWN,
        error: error.message
      };
    }
  }

  /**
   * 根据ID获取计划 - 优先API，失败时回退本地存储
   */
  static async getPlanById(id) {
    try {
      console.log(`🔄 尝试从API获取计划 ${id}...`);
      const apiPlan = await PlanAPIService.getPlanById(id);
      console.log('✅ API获取成功');
      
      return {
        data: apiPlan,
        source: DATA_SOURCE.API,
        error: null
      };
    } catch (error) {
      console.warn(`⚠️ API获取计划 ${id} 失败，回退到本地存储:`, error.message);
      
      try {
        const localPlan = PlanLocalStorage.getPlanById(id);
        if (localPlan) {
          console.log('🔄 本地存储获取成功');
          return {
            data: localPlan,
            source: DATA_SOURCE.LOCAL,
            error: error.message
          };
        } else {
          return {
            data: null,
            source: DATA_SOURCE.LOCAL,
            error: `API失败且本地未找到计划 ${id}`
          };
        }
      } catch (localError) {
        console.error('❌ 本地存储也失败:', localError);
        return {
          data: null,
          source: DATA_SOURCE.UNKNOWN,
          error: `API和本地存储都失败: API(${error.message}) 本地(${localError.message})`
        };
      }
    }
  }

  /**
   * 添加新计划 - 优先API，失败时回退本地存储
   */
  static async addNewPlan(planData) {
    try {
      console.log('🔄 尝试通过API创建计划...');
      const apiPlan = await PlanAPIService.createPlan(planData);
      console.log('✅ API创建成功');
      
      // API成功时，同时保存到本地存储作为备份
      try {
        PlanLocalStorage.addNewPlan(apiPlan);
        console.log('📦 已同步到本地存储作为备份');
      } catch (localError) {
        console.warn('⚠️ 同步到本地存储失败，但API成功:', localError);
      }
      
      return {
        data: apiPlan,
        source: DATA_SOURCE.API,
        error: null
      };
    } catch (error) {
      console.warn('⚠️ API创建失败，回退到本地存储:', error.message);
      
      try {
        const localPlan = PlanLocalStorage.addNewPlan(planData);
        console.log('🔄 本地存储创建成功');
        
        return {
          data: localPlan,
          source: DATA_SOURCE.LOCAL,
          error: error.message
        };
      } catch (localError) {
        console.error('❌ 本地存储也失败:', localError);
        throw new Error(`API和本地存储都失败: API(${error.message}) 本地(${localError.message})`);
      }
    }
  }

  /**
   * 删除计划 - 优先API，失败时回退本地存储
   */
  static async deletePlan(id) {
    try {
      console.log(`🔄 尝试通过API删除计划 ${id}...`);
      await PlanAPIService.deletePlan(id);
      console.log('✅ API删除成功');
      
      // API成功时，同时从本地存储删除
      try {
        PlanLocalStorage.deletePlan(id);
        console.log('📦 已从本地存储同步删除');
      } catch (localError) {
        console.warn('⚠️ 本地存储删除失败，但API成功:', localError);
      }
      
      return {
        success: true,
        source: DATA_SOURCE.API,
        error: null
      };
    } catch (error) {
      console.warn(`⚠️ API删除计划 ${id} 失败，回退到本地存储:`, error.message);
      
      try {
        const localSuccess = PlanLocalStorage.deletePlan(id);
        console.log('🔄 本地存储删除结果:', localSuccess);
        
        return {
          success: localSuccess,
          source: DATA_SOURCE.LOCAL,
          error: error.message
        };
      } catch (localError) {
        console.error('❌ 本地存储也失败:', localError);
        return {
          success: false,
          source: DATA_SOURCE.UNKNOWN,
          error: `API和本地存储都失败: API(${error.message}) 本地(${localError.message})`
        };
      }
    }
  }

  /**
   * 更新计划 - 优先API，失败时回退本地存储
   */
  static async updatePlan(id, updateData) {
    try {
      console.log(`🔄 尝试通过API更新计划 ${id}...`);
      const updatedPlan = await PlanAPIService.updatePlan(id, updateData);
      console.log('✅ API更新成功');
      
      // API成功时，同时更新本地存储
      try {
        PlanLocalStorage.updatePlan(id, updatedPlan);
        console.log('📦 已同步更新到本地存储');
      } catch (localError) {
        console.warn('⚠️ 本地存储更新失败，但API成功:', localError);
      }
      
      return {
        data: updatedPlan,
        source: DATA_SOURCE.API,
        error: null
      };
    } catch (error) {
      console.warn(`⚠️ API更新计划 ${id} 失败，回退到本地存储:`, error.message);
      
      try {
        const localPlan = PlanLocalStorage.updatePlan(id, updateData);
        console.log('🔄 本地存储更新结果:', localPlan ? '成功' : '失败');
        
        return {
          data: localPlan,
          source: DATA_SOURCE.LOCAL,
          error: error.message
        };
      } catch (localError) {
        console.error('❌ 本地存储也失败:', localError);
        return {
          data: null,
          source: DATA_SOURCE.UNKNOWN,
          error: `API和本地存储都失败: API(${error.message}) 本地(${localError.message})`
        };
      }
    }
  }

  /**
   * 检查API连接状态
   */
  static async getConnectionStatus() {
    try {
      const status = await checkAPIConnection();
      return status;
    } catch (error) {
      return { connected: false, message: error.message };
    }
  }

  /**
   * 生成数据源状态消息
   */
  static getSourceStatusMessage(source, error) {
    switch (source) {
      case DATA_SOURCE.API:
        return { type: 'success', message: '✅ 数据来自API服务器' };
      case DATA_SOURCE.LOCAL:
        return { type: 'warning', message: `⚠️ API连接失败，显示本地缓存数据${error ? ` (${error})` : ''}` };
      case DATA_SOURCE.UNKNOWN:
        return { type: 'error', message: `❌ 数据获取失败${error ? ` (${error})` : ''}` };
      default:
        return { type: 'info', message: '📊 数据源未知' };
    }
  }

  /**
   * 兼容性方法 - 保持与原 API 一致但返回数据部分
   */
  static async getRecentPlansCompat() {
    const result = await this.getRecentPlans();
    return result.data;
  }

  static async getUpcomingPlansCompat() {
    const result = await this.getUpcomingPlans();
    return result.data;
  }

  static async getAllPlansCompat() {
    const result = await this.getAllPlans();
    return result.data;
  }

  static async getPlanByIdCompat(id) {
    const result = await this.getPlanById(id);
    return result.data;
  }

  static async addNewPlanCompat(planData) {
    const result = await this.addNewPlan(planData);
    return result.data;
  }

  static async deletePlanCompat(id) {
    const result = await this.deletePlan(id);
    return result.success;
  }

  static async updatePlanCompat(id, updateData) {
    const result = await this.updatePlan(id, updateData);
    return result.data;
  }
}

export default HybridPlanStorage; 