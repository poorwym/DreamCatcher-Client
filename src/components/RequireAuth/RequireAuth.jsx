import React from "react";
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
    const { user, loading, token } = useAuth();
    const location = useLocation();

    // 显示加载状态 - 使用项目的宇宙主题风格
    if (loading) {
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
                    正在验证身份...
                </Typography>
            </Box>
        );
    }

    // 检查是否有token和用户信息
    if (!token || !user) {
        // 记住用户原本想访问的页面，登录成功后可回跳
        console.log("RequireAuth: Authentication check failed", {
            hasToken: !!token,
            tokenPrefix: token ? token.substring(0, 20) + "..." : "none",
            hasUser: !!user,
            user: user ? user.user_name : "none",
            currentPath: location.pathname
        });
        return (
            <Navigate 
                to="/login" 
                replace 
                state={{ 
                    from: location.pathname,
                    message: "请先登录以访问此页面"
                }} 
            />
        );
    }

    // 用户已认证，渲染受保护的内容
    return children;
}