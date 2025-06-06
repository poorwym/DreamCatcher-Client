import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import * as authAPI from "../api/auth.js";

/**
 * DreamCatcher 前端身份验证上下文
 *
 * - 登录 / 注册后保存 JWT 到 localStorage
 * - 挂载时自动读取并验证 token -> 获取当前用户信息
 * - 提供 fetchWithAuth 包装器，自动附带 Authorization 头
 */

const AuthContext = createContext(null);

// 导出 AuthContext 以便其他组件使用
export { AuthContext };

// 添加 useAuth 钩子
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default function AuthProvider({ children }) {
    /* ------------------------- 状态 ------------------------- */
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("dc_token"));
    const [loading, setLoading] = useState(true);

    /* ------------------------- 工具函数 ------------------------- */
    const saveToken = (t) => {
        setToken(t);
        if (t) localStorage.setItem("dc_token", t);
        else localStorage.removeItem("dc_token");
    };

    const fetchWithAuth = useCallback(
        async (url, options = {}) => {
            try {
                const authFetch = authAPI.createAuthenticatedFetch(token);
                return await authFetch(url, options);
            } catch (err) {
                // token 失效统一处理
                if (err.message === 'Unauthorized') {
                    saveToken(null);
                    setUser(null);
                }
                throw err;
            }
        },
        [token]
    );

    /* ------------------------- 初始化加载用户 ------------------------- */
    const loadUser = useCallback(async () => {
        if (!token) {
            console.log("No token found, skipping user load");
            setLoading(false);
            return;
        }

        console.log("Loading user with token:", token.substring(0, 20) + "...");
        
        try {
            const userData = await authAPI.getCurrentUser(token);
            console.log("User loaded successfully:", userData);
            setUser(userData);
        } catch (err) {
            console.error("加载用户信息失败:", err);
            console.error("Error details:", {
                message: err.message,
                status: err.status,
                token: token ? token.substring(0, 20) + "..." : "none"
            });
            
            // 清除可能无效的token
            if (err.message === 'Unauthorized' || err.message.includes('401')) {
                console.warn("Token验证失败，清除本地存储");
                saveToken(null);
                setUser(null);
            } else {
                // 对于其他错误（如网络错误），不清除token，但设置user为null
                console.warn("网络或其他错误，保留token但不设置用户:", err.message);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    /* ------------------------- 用户操作 ------------------------- */
    const register = async ({ user_name, email, password }) => {
        try {
            return await authAPI.register({ user_name, email, password });
        } catch (err) {
            throw new Error(err.message || "注册失败");
        }
    };

    const login = async ({ email, password }) => {
        try {
            const data = await authAPI.login({ email, password });
            saveToken(data.token);
            setUser(data.user);
            return data;
        } catch (err) {
            throw new Error(err.message || "登录失败");
        }
    };

    const logout = () => {
        saveToken(null);
        setUser(null);
    };

    const verifyToken = useCallback(async () => {
        if (!token) return false;
        
        try {
            await authAPI.verifyToken(token);
            return true;
        } catch (err) {
            console.error("Token验证失败:", err);
            return false;
        }
    }, [token]);

    /* ------------------------- 上下文值 ------------------------- */
    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        verifyToken,
        fetchWithAuth, // 便于业务层调用受保护接口
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
