/**
 * DreamCatcher 认证API封装
 * 基于后端API文档实现的认证相关接口
 * 统一处理：token为对象格式，access_token为字符串，仅在Authorization头中使用
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * 处理API响应错误
 * @param {Response} response 
 * @returns {Promise<any>}
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
};

/**
 * 创建带有认证头的fetch请求
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @returns {function}
 */
const createAuthFetch = (token) => {
    return async (url, options = {}) => {
        const headers = { 
            'Content-Type': 'application/json',
            ...(options.headers || {}) 
        };
        
        // 从token对象中提取access_token用于Authorization头
        if (token && token.access_token) {
            headers['Authorization'] = `Bearer ${token.access_token}`;
        }

        const response = await fetch(url, { 
            ...options, 
            headers 
        });

        // 统一处理401错误
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        return response;
    };
};

// ==================== 认证相关API ====================

/**
 * 用户注册
 * @param {Object} userData 
 * @param {string} userData.user_name - 用户名 (1-50个字符)
 * @param {string} userData.email - 邮箱地址
 * @param {string} userData.password - 密码 (6-100个字符)
 * @returns {Promise<Object>}
 */
export const register = async ({ user_name, email, password }) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name, email, password }),
    });

    return handleResponse(response);
};

/**
 * 用户登录
 * @param {Object} credentials 
 * @param {string} credentials.email - 邮箱地址
 * @param {string} credentials.password - 密码
 * @returns {Promise<Object>}
 */
export const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
};

/**
 * 获取当前用户信息
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async (token) => {
    const authFetch = createAuthFetch(token);
    const response = await authFetch(`${API_BASE}/auth/me`);
    return handleResponse(response);
};

/**
 * 获取当前用户详细信息
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @returns {Promise<Object>}
 */
export const getCurrentUserDetail = async (token) => {
    const authFetch = createAuthFetch(token);
    const response = await authFetch(`${API_BASE}/auth/me/detail`);
    return handleResponse(response);
};

/**
 * 更新当前用户信息
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @param {Object} userData 
 * @param {string} [userData.user_name] - 新用户名
 * @param {string} [userData.email] - 新邮箱地址
 * @param {string} [userData.password] - 新密码
 * @returns {Promise<Object>}
 */
export const updateCurrentUser = async (token, userData) => {
    const authFetch = createAuthFetch(token);
    const response = await authFetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * 修改密码
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @param {Object} passwords 
 * @param {string} passwords.old_password - 旧密码
 * @param {string} passwords.new_password - 新密码
 * @returns {Promise<Object>}
 */
export const changePassword = async (token, { old_password, new_password }) => {
    const authFetch = createAuthFetch(token);
    const response = await authFetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ old_password, new_password }),
    });
    return handleResponse(response);
};

/**
 * 根据ID获取用户信息
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @param {string} userId - 用户UUID
 * @returns {Promise<Object>}
 */
export const getUserById = async (token, userId) => {
    const authFetch = createAuthFetch(token);
    const response = await authFetch(`${API_BASE}/auth/user/${userId}`);
    return handleResponse(response);
};

/**
 * 验证令牌
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @returns {Promise<Object>}
 */
export const verifyToken = async (token) => {
    const authFetch = createAuthFetch(token);
    const response = await authFetch(`${API_BASE}/auth/verify-token`, {
        method: 'POST',
    });
    return handleResponse(response);
};

/**
 * 创建带认证的fetch函数供其他模块使用
 * @param {Object} token - token对象 { access_token, token_type, expires_in }
 * @returns {function}
 */
export const createAuthenticatedFetch = (token) => {
    return createAuthFetch(token);
};
