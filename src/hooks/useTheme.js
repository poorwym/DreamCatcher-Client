import { useState, useEffect } from 'react';

/**
 * 主题切换钩子函数
 * 支持白天模式(light)和黑夜模式(dark)的切换
 * 自动保存用户选择到 localStorage
 */
export default function useTheme() {
    // 从 localStorage 获取已保存的主题，默认为 dark
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('dreamcatcher-theme');
            return savedTheme || 'dark';
        }
        return 'dark';
    });

    // 初始化：设置 DOM 的 data-theme 属性
    useEffect(() => {
        const root = document.documentElement;
        
        // 移除所有主题类
        root.removeAttribute('data-theme');
        
        // 设置新主题
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
        }
        
        // 保存到 localStorage
        localStorage.setItem('dreamcatcher-theme', theme);
    }, [theme]);

    // 切换主题函数
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // 设置特定主题
    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');

    // 检查当前主题
    const isDark = theme === 'dark';
    const isLight = theme === 'light';

    return {
        theme,          // 当前主题 'dark' | 'light'
        toggleTheme,    // 切换主题函数
        setLightTheme,  // 设置为白天模式
        setDarkTheme,   // 设置为黑夜模式
        isDark,         // 是否为黑夜模式
        isLight,        // 是否为白天模式
    };
} 