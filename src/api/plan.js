const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * 拍摄计划 API 封装
 * 
 * 提供拍摄计划管理功能：
 * - 获取计划列表
 * - 获取单个计划详情
 * - 创建新计划
 * - 更新计划
 * - 删除计划
 * - 管理员功能
 */

/**
 * 获取指定拍摄计划
 * @param {string} planId - 计划UUID
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Object>} 计划详情对象
 */
export const getPlan = async (planId, fetchWithAuth) => {
    if (!planId || typeof planId !== 'string') {
        throw new Error('计划ID不能为空');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    try {
        const response = await fetchWithAuth(`${API_BASE}/plans/${planId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `获取计划失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取计划详情失败:', error);
        throw error;
    }
};

/**
 * 获取拍摄计划列表
 * @param {Object} params - 查询参数
 * @param {number} params.skip - 跳过的记录数（默认0）
 * @param {number} params.limit - 限制返回数量（默认100）
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Array>} 计划列表数组
 */
export const getPlans = async (params = {}, fetchWithAuth) => {
    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    const { skip = 0, limit = 100 } = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (skip > 0) queryParams.append('skip', skip.toString());
    if (limit !== 100) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/plans/${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetchWithAuth(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `获取计划列表失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取计划列表失败:', error);
        throw error;
    }
};

/**
 * 创建拍摄计划
 * @param {Object} planData - 计划数据
 * @param {string} planData.name - 计划名称
 * @param {string} planData.description - 计划描述
 * @param {string} planData.start_time - 开始时间（ISO 8601格式）
 * @param {Object} planData.camera - 相机配置
 * @param {number} planData.camera.focal_length - 焦距
 * @param {Array<number>} planData.camera.position - 位置 [经度, 纬度, 高度]
 * @param {Array<number>} planData.camera.rotation - 旋转 [x, y, z, w]
 * @param {string} planData.tileset_url - tileset URL
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Object>} 创建的计划对象
 */
export const createPlan = async (planData, fetchWithAuth) => {
    if (!planData || typeof planData !== 'object') {
        throw new Error('计划数据不能为空');
    }

    const { name, description, start_time, camera, tileset_url } = planData;
    
    if (!name || typeof name !== 'string') {
        throw new Error('计划名称不能为空');
    }
    
    if (!description || typeof description !== 'string') {
        throw new Error('计划描述不能为空');
    }
    
    if (!start_time || typeof start_time !== 'string') {
        throw new Error('开始时间不能为空');
    }

    if (!camera || typeof camera !== 'object') {
        throw new Error('相机配置不能为空');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    try {
        const response = await fetchWithAuth(`${API_BASE}/plans/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                description,
                start_time,
                camera,
                tileset_url,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `创建计划失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('创建计划失败:', error);
        throw error;
    }
};

/**
 * 更新拍摄计划
 * @param {string} planId - 计划UUID
 * @param {Object} planData - 更新的计划数据
 * @param {string} [planData.name] - 计划名称
 * @param {string} [planData.description] - 计划描述
 * @param {string} [planData.start_time] - 开始时间（ISO 8601格式）
 * @param {Object} [planData.camera] - 相机配置
 * @param {string} [planData.tileset_url] - tileset URL
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Object>} 更新后的计划对象
 */
export const updatePlan = async (planId, planData, fetchWithAuth) => {
    if (!planId || typeof planId !== 'string') {
        throw new Error('计划ID不能为空');
    }

    if (!planData || typeof planData !== 'object') {
        throw new Error('更新数据不能为空');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    // 过滤掉空值和undefined值
    const updateData = {};
    Object.keys(planData).forEach(key => {
        if (planData[key] !== null && planData[key] !== undefined && planData[key] !== '') {
            updateData[key] = planData[key];
        }
    });

    if (Object.keys(updateData).length === 0) {
        throw new Error('至少需要提供一个更新字段');
    }

    try {
        const response = await fetchWithAuth(`${API_BASE}/plans/${planId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `更新计划失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('更新计划失败:', error);
        throw error;
    }
};

/**
 * 删除拍摄计划
 * @param {string} planId - 计划UUID
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<boolean>} 删除成功返回true
 */
export const deletePlan = async (planId, fetchWithAuth) => {
    if (!planId || typeof planId !== 'string') {
        throw new Error('计划ID不能为空');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    try {
        const response = await fetchWithAuth(`${API_BASE}/plans/${planId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `删除计划失败: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('删除计划失败:', error);
        throw error;
    }
};

/**
 * 管理员获取所有计划
 * @param {Object} params - 查询参数
 * @param {string} [params.user_id] - 筛选特定用户的计划
 * @param {number} [params.skip] - 跳过的记录数（默认0）
 * @param {number} [params.limit] - 限制返回数量（默认100）
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Array>} 所有计划列表数组
 */
export const getAllPlansAdmin = async (params = {}, fetchWithAuth) => {
    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    const { user_id, skip = 0, limit = 100 } = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (user_id) queryParams.append('user_id', user_id);
    if (skip > 0) queryParams.append('skip', skip.toString());
    if (limit !== 100) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/plans/admin/all${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetchWithAuth(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `获取所有计划失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('管理员获取所有计划失败:', error);
        throw error;
    }
};

/**
 * 拍摄计划数据类型定义（用于TypeScript或文档）
 * 
 * 计划对象：
 * {
 *   id: string - 计划UUID
 *   user_id: string - 用户UUID
 *   name: string - 计划名称
 *   description: string - 计划描述
 *   start_time: string - 开始时间（ISO 8601格式）
 *   camera: {
 *     focal_length: number - 焦距
 *     position: [number, number, number] - 位置 [经度, 纬度, 高度]
 *     rotation: [number, number, number, number] - 旋转 [x, y, z, w]
 *   }
 *   tileset_url: string - tileset URL
 *   created_at: string - 创建时间（ISO 8601格式）
 *   updated_at: string - 更新时间（ISO 8601格式）
 * }
 * 
 * 创建计划请求：
 * {
 *   name: string - 计划名称
 *   description: string - 计划描述
 *   start_time: string - 开始时间（ISO 8601格式）
 *   camera: {
 *     focal_length: number - 焦距
 *     position: [number, number, number] - 位置 [经度, 纬度, 高度]
 *     rotation: [number, number, number, number] - 旋转 [x, y, z, w]
 *   }
 *   tileset_url: string - tileset URL
 * }
 * 
 * 更新计划请求：
 * {
 *   name?: string - 计划名称（可选）
 *   description?: string - 计划描述（可选）
 *   start_time?: string - 开始时间（可选）
 *   camera?: object - 相机配置（可选）
 *   tileset_url?: string - tileset URL（可选）
 * }
 * 
 * 查询参数：
 * {
 *   skip?: number - 跳过的记录数
 *   limit?: number - 限制返回数量
 *   user_id?: string - 用户ID（仅管理员接口）
 * }
 */
