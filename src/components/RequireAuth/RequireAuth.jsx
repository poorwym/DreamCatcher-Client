import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider.jsx";
import { CircularProgress, Box, Typography } from "@mui/material";
import "../../assets/style.css";

/**
 * <RequireAuth>
 *
 * - 包裹所有受保护页面
 * - 未登录时跳转 /login，并把来源路径写入 state
 * - 加载中时显示加载指示器
 * - 验证 token 存在性和有效性
 * - 支持token验证失败的情况处理
 *
 * 用法示例：
 *   <Route
 *     path="/dashboard"
 *     element={
 *       <RequireAuth>
 *         <DashboardPage />
 *       </RequireAuth>
 *     }
 *   />
 */
export default function RequireAuth({ children }) {
    const { user, loading, token, verifyToken } = useAuth();
    const location = useLocation();
    const [tokenVerifying, setTokenVerifying] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);

    // 验证 token 有效性
    useEffect(() => {
        const checkTokenValidity = async () => {
            // 如果 AuthProvider 还在加载中，等待
            if (loading) {
                return;
            }

            // 如果没有 token 或 user，不需要验证
            if (!token || !user) {
                setTokenValid(false);
                return;
            }

            setTokenVerifying(true);
            try {
                const isValid = await verifyToken();
                console.log("Token verification result:", isValid);
                setTokenValid(isValid);
            } catch (err) {
                console.error("Token verification failed:", err);
                setTokenValid(false);
            } finally {
                setTokenVerifying(false);
            }
        };

        checkTokenValidity();
    }, [loading, token, user, verifyToken]);

    // 显示加载状态 - AuthProvider 初始化或 token 验证中
    if (loading || tokenVerifying) {
        return (
            <Box
                className="bg-primary min-h-screen flex flex-col items-center justify-center"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: 'var(--bg-primary)',
                    background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)',
                }}
            >
                <CircularProgress 
                    sx={{ 
                        color: 'var(--text-primary)',
                        marginBottom: 2,
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }} 
                    size={60}
                    thickness={4}
                />
                <Typography
                    variant="body1"
                    className="text-secondary"
                    sx={{
                        color: 'var(--text-secondary)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        letterSpacing: '0.05em',
                    }}
                >
                    {loading ? "正在验证身份..." : "正在验证令牌..."}
                </Typography>
            </Box>
        );
    }

    // 检查是否有token和用户信息，以及token的有效性
    if (!token || !user || tokenValid === false) {
        // 记住用户原本想访问的页面，登录成功后可回跳
        console.log("RequireAuth: Authentication check failed", {
            hasToken: !!token,
            tokenInfo: token ? {
                token_type: token.token_type,
                expires_in: token.expires_in,
                access_token_prefix: token.access_token ? token.access_token.substring(0, 20) + "..." : "none"
            } : "none",
            hasUser: !!user,
            user: user ? user.user_name : "none",
            tokenValid: tokenValid,
            currentPath: location.pathname
        });
        
        const redirectMessage = tokenValid === false ? 
            "登录已过期，请重新登录" : 
            "请先登录以访问此页面";
            
        return (
            <Navigate 
                to="/login" 
                replace 
                state={{ 
                    from: location.pathname,
                    message: redirectMessage
                }} 
            />
        );
    }

    // 用户已认证且token有效，渲染受保护的内容
    return children;
}