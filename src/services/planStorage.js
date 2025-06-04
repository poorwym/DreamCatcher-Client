/**
 * 计划数据存储服务 - 使用localStorage进行本地存储
 */

// 存储键名
const STORAGE_KEYS = {
  RECENT_PLANS: 'photography_recent_plans',
  UPCOMING_PLANS: 'photography_upcoming_plans'
};

// 初始数据
const INITIAL_RECENT_PLANS = [
  { id: 'plan-1', name: '黄山日出', location: '黄山', date: '2023-10-15', tags: ['日出', '山景'] },
  { id: 'plan-2', name: '西湖黄昏', location: '西湖', date: '2023-10-10', tags: ['日落', '湖景'] },
  { id: 'plan-3', name: '长城星轨', location: '长城', date: '2023-09-30', tags: ['夜景', '星空'] },
];

const INITIAL_UPCOMING_PLANS = [
  { id: 'plan-4', name: '玉龙雪山', location: '玉龙雪山', date: '2023-11-05', tags: ['雪景', '山景'] },
  { id: 'plan-5', name: '张家界', location: '张家界', date: '2023-11-15', tags: ['森林', '山景'] },
];

class PlanStorage {
  /**
   * 生成唯一ID
   */
  static generateId() {
    return 'plan-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 获取最近计划
   */
  static getRecentPlans() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_PLANS);
      return stored ? JSON.parse(stored) : INITIAL_RECENT_PLANS;
    } catch (error) {
      console.error('获取最近计划失败:', error);
      return INITIAL_RECENT_PLANS;
    }
  }

  /**
   * 获取即将拍摄计划
   */
  static getUpcomingPlans() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.UPCOMING_PLANS);
      return stored ? JSON.parse(stored) : INITIAL_UPCOMING_PLANS;
    } catch (error) {
      console.error('获取即将拍摄计划失败:', error);
      return INITIAL_UPCOMING_PLANS;
    }
  }

  /**
   * 保存最近计划
   */
  static saveRecentPlans(plans) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_PLANS, JSON.stringify(plans));
      return true;
    } catch (error) {
      console.error('保存最近计划失败:', error);
      return false;
    }
  }

  /**
   * 保存即将拍摄计划
   */
  static saveUpcomingPlans(plans) {
    try {
      localStorage.setItem(STORAGE_KEYS.UPCOMING_PLANS, JSON.stringify(plans));
      return true;
    } catch (error) {
      console.error('保存即将拍摄计划失败:', error);
      return false;
    }
  }

  /**
   * 添加新计划 - 根据日期自动分类
   */
  static addNewPlan(planData) {
    try {
      // 生成ID和创建完整的计划对象
      const newPlan = {
        ...planData,
        id: this.generateId(),
        createdAt: new Date().toISOString()
      };

      // 判断是过去的计划还是未来的计划
      const planDate = new Date(planData.shootingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 重置到当天开始

      if (planDate < today) {
        // 过去的日期 - 添加到最近计划
        const recentPlans = this.getRecentPlans();
        recentPlans.unshift(newPlan); // 添加到开头
        this.saveRecentPlans(recentPlans);
      } else {
        // 今天或未来的日期 - 添加到即将拍摄
        const upcomingPlans = this.getUpcomingPlans();
        upcomingPlans.push(newPlan);
        // 按日期排序
        upcomingPlans.sort((a, b) => new Date(a.shootingDate) - new Date(b.shootingDate));
        this.saveUpcomingPlans(upcomingPlans);
      }

      console.log('✅ 计划添加成功:', newPlan);
      return newPlan;
    } catch (error) {
      console.error('❌ 添加计划失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有计划
   */
  static getAllPlans() {
    return {
      recentPlans: this.getRecentPlans(),
      upcomingPlans: this.getUpcomingPlans()
    };
  }

  /**
   * 根据ID获取计划
   */
  static getPlanById(id) {
    const allPlans = [...this.getRecentPlans(), ...this.getUpcomingPlans()];
    return allPlans.find(plan => plan.id === id);
  }

  /**
   * 删除计划
   */
  static deletePlan(id) {
    try {
      // 从最近计划中删除
      let recentPlans = this.getRecentPlans();
      const recentIndex = recentPlans.findIndex(plan => plan.id === id);
      if (recentIndex !== -1) {
        recentPlans.splice(recentIndex, 1);
        this.saveRecentPlans(recentPlans);
        return true;
      }

      // 从即将拍摄计划中删除
      let upcomingPlans = this.getUpcomingPlans();
      const upcomingIndex = upcomingPlans.findIndex(plan => plan.id === id);
      if (upcomingIndex !== -1) {
        upcomingPlans.splice(upcomingIndex, 1);
        this.saveUpcomingPlans(upcomingPlans);
        return true;
      }

      return false; // 未找到计划
    } catch (error) {
      console.error('删除计划失败:', error);
      return false;
    }
  }

  /**
   * 更新计划
   */
  static updatePlan(id, updateData) {
    try {
      // 在最近计划中查找
      let recentPlans = this.getRecentPlans();
      const recentIndex = recentPlans.findIndex(plan => plan.id === id);
      if (recentIndex !== -1) {
        recentPlans[recentIndex] = { ...recentPlans[recentIndex], ...updateData };
        this.saveRecentPlans(recentPlans);
        return recentPlans[recentIndex];
      }

      // 在即将拍摄计划中查找
      let upcomingPlans = this.getUpcomingPlans();
      const upcomingIndex = upcomingPlans.findIndex(plan => plan.id === id);
      if (upcomingIndex !== -1) {
        upcomingPlans[upcomingIndex] = { ...upcomingPlans[upcomingIndex], ...updateData };
        this.saveUpcomingPlans(upcomingPlans);
        return upcomingPlans[upcomingIndex];
      }

      return null; // 未找到计划
    } catch (error) {
      console.error('更新计划失败:', error);
      return null;
    }
  }

  /**
   * 清空所有数据
   */
  static clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENT_PLANS);
      localStorage.removeItem(STORAGE_KEYS.UPCOMING_PLANS);
      console.log('✅ 所有计划数据已清空');
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }

  /**
   * 重置为初始数据
   */
  static resetToDefault() {
    try {
      this.saveRecentPlans(INITIAL_RECENT_PLANS);
      this.saveUpcomingPlans(INITIAL_UPCOMING_PLANS);
      console.log('✅ 数据已重置为默认值');
      return true;
    } catch (error) {
      console.error('重置数据失败:', error);
      return false;
    }
  }
}

export default PlanStorage; 