const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * LLM 聊天 API 封装
 * 
 * 提供与LLM服务交互的功能：
 * - 发送聊天消息
 * - 检查服务健康状态
 */

/**
 * 发送聊天消息到LLM服务
 * @param {string} query - 用户的问题或请求
 * @param {Function} fetchWithAuth - 来自AuthProvider的认证请求函数
 * @returns {Promise<Object>} 包含LLM回复的响应对象
 */
export const sendChatMessage = async (query, fetchWithAuth) => {
    if (!query || typeof query !== 'string') {
        throw new Error('查询内容不能为空');
    }

    if (!fetchWithAuth) {
        throw new Error('需要认证函数');
    }

    try {
        const response = await fetchWithAuth(`${API_BASE}/llm/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('LLM聊天请求失败:', error);
        throw error;
    }
};

/**
 * 检查LLM服务健康状态
 * @returns {Promise<Object>} 服务状态信息
 */
export const checkLLMHealth = async () => {
    try {
            const response = await fetch(`${API_BASE}/llm/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `健康检查失败: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('LLM健康检查失败:', error);
        throw error;
    }
};

/**
 * LLM聊天消息类型定义（用于TypeScript或文档）
 * 
 * 聊天请求：
 * {
 *   query: string - 用户的问题或请求
 * }
 * 
 * 聊天响应：
 * {
 *   response: string - LLM的回复内容
 *   success: boolean - 请求是否成功
 *   message: string - 状态消息
 * }
 * 
 * 健康检查响应：
 * {
 *   status: string - 服务状态
 *   service: string - 服务名称
 *   message: string - 状态消息
 * }
 */
